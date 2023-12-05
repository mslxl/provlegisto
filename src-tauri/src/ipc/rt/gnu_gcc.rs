use std::{collections::HashMap, path::PathBuf, process::Stdio};

use crate::{
    ipc::rt::compiler::CompileLint,
    util::{append_env_var, console},
};

use super::{
    compiler::{CompileResult, Compiler, CompilerOptions},
    runner::CompileDataStore,
};
use anyhow::{Ok, Result};
use async_trait::async_trait;
use fancy_regex::{Regex, RegexBuilder};
use once_cell::sync::Lazy;
use tokio::{fs, process::Command};

pub struct GNUGccCompiler;

static PATTERN_MATCH_GCCERROR: Lazy<Regex> = Lazy::new(|| {
    RegexBuilder::new(
        r#"(?=.*(?:error|warning|line).*).*?(?<file>\w+\.\w+).*?(?<line>\d+):(?<pos>\d+).+error: (?<msg>.*)"#,
    ).build().unwrap()
});

#[async_trait]
impl Compiler for GNUGccCompiler {
    async fn compile(
        &self,
        source: String,
        compiler_options: CompilerOptions,
        working_path: PathBuf,
    ) -> Result<CompileResult> {
        let source_file = working_path.join("source.cpp");
        fs::write(&source_file, source).await?;

        // init compiler, including set PATH var on windows
        let compiler = compiler_options.path.unwrap_or(String::from("g++"));
        let compiler = PathBuf::from(&compiler);
        let path_var = if cfg!(windows) {
            let compiler_dir = compiler.parent().unwrap();
            let path_var = append_env_var("PATH", compiler_dir.to_str().unwrap().to_owned());
            Some(path_var)
        } else {
            None
        };
        let mut cmd = std::process::Command::new(&compiler);
        if let Some(path_var) = &path_var {
            cmd.env("PATH", path_var);
        }
        // hiden console on windows
        console::hide_new_console(&mut cmd);
        let mut cmd = Command::from(cmd);
        // construct compiler arguments
        let mut args: Vec<String> = compiler_options.args.unwrap_or_else(|| Vec::new());
        let source_file_path = dunce::canonicalize(&source_file)?
            .to_str()
            .unwrap()
            .to_owned();
        let mut target_file_path = dunce::canonicalize(working_path)
            .unwrap()
            .to_str()
            .unwrap()
            .to_owned();
        target_file_path.push_str("/target");

        args.push(source_file_path.clone());
        args.push(String::from("-o"));
        args.push(target_file_path.clone());

        // prepare gain output
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());
        cmd.args(&args);
        let proc = cmd.spawn()?;
        let output = proc.wait_with_output().await?;

        if output.status.success() {
            if cfg!(windows) {
                target_file_path.push_str(".exe");
            }
            let store = CompileDataStore {
                compile: compiler.to_str().unwrap().to_owned(),
                compile_args: args,
                source: source_file_path,
                required_env_running: path_var
                    .map(|v| HashMap::from_iter(vec![(String::from("PATH"), v)].into_iter())),
            };
            store.save(&target_file_path).await?;
            Ok(CompileResult::Success {
                data: target_file_path,
            })
        } else {
            let stdout = String::from_utf8(output.stdout)?;
            let stderr = String::from_utf8(output.stderr)?;

            let mut lints = Vec::new();
            for matches in PATTERN_MATCH_GCCERROR.captures_iter(&stderr) {
                let matches = matches.unwrap();
                println!("{:?}", matches);
                lints.push(CompileLint {
                    position: Some((
                        matches
                            .name("line")
                            .unwrap()
                            .as_str()
                            .trim()
                            .parse()
                            .unwrap(),
                        matches
                            .name("pos")
                            .unwrap()
                            .as_str()
                            .trim()
                            .parse()
                            .unwrap(),
                    )),
                    ty: Some(String::from("error")),
                    description: matches.name("msg").unwrap().as_str().trim().to_owned(),
                });
            }
            log::info!("g++ error with stdout: {}", stdout);
            log::info!("g++ error with stderr: {}", stderr);
            Ok(CompileResult::Error { data: lints })
        }
    }
}
