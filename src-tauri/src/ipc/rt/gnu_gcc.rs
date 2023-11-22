use std::{path::PathBuf, process::Stdio};

use crate::{ipc::rt::compiler::CompileLint, util::console};

use super::compiler::{CompileResult, Compiler, CompilerOptions};
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
        let compiler = compiler_options.path.unwrap_or(String::from("g++"));
        let mut cmd = std::process::Command::new(compiler);
        console::hide_new_console(&mut cmd);
        let mut cmd = Command::from(cmd);
        let mut args = compiler_options.args.unwrap_or_else(|| Vec::new());
        let source_file_path = dunce::canonicalize(source_file)?
            .to_str()
            .unwrap()
            .to_owned();
        let mut target_file_path = dunce::canonicalize(working_path)
            .unwrap()
            .to_str()
            .unwrap()
            .to_owned();
        target_file_path.push_str("/target");

        args.push(source_file_path);
        args.push(String::from("-o"));
        args.push(target_file_path.clone());

        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());
        cmd.args(args);
        let proc = cmd.spawn()?;
        let output = proc.wait_with_output().await?;

        if output.status.success() {
            if cfg!(windows) {
                target_file_path.push_str(".exe");
            }
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
