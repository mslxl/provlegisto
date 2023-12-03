use std::{
    path::{Path, PathBuf},
    process::Stdio,
};

use crate::{ipc::rt::compiler::CompileLint, util::console};

use super::compiler::{CompileResult, Compiler, CompilerOptions};
use anyhow::{Ok, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use tokio::{fs, process::Command};

#[derive(Debug, Serialize, Deserialize)]
pub struct InterpreterStore {
    pub interpreter: String,
    pub script: String,
    pub args: Vec<String>,
}

// It just record its compiler into a config file, not compile it
// it always success
pub struct Interpreter {
    ext: String,
}
impl Interpreter {
    pub fn with_ext(ext: String) -> Self {
        Self { ext }
    }
}

#[async_trait]
impl Compiler for Interpreter {
    async fn compile(
        &self,
        source: String,
        compiler_options: CompilerOptions,
        working_path: PathBuf,
    ) -> Result<CompileResult> {
        let source_file = working_path.join(format!("source.{}", self.ext));
        let config_file = working_path.join(format!("source.{}.toml", self.ext));
        let compiler = if let Some(compiler) = compiler_options.path {
            compiler
        } else {
            return Ok(CompileResult::Error {
                data: vec![CompileLint {
                    position: Some((0, 0)),
                    ty: Some(String::from("Error")),
                    description: String::from("An compiler or interpreter must be specificed"),
                }],
            });
        };
        let compiler_args = compiler_options.args.unwrap_or(vec![]);
        let config_content = toml::to_string(&InterpreterStore {
            interpreter: compiler,
            script: source_file.to_str().unwrap().to_owned(),
            args: compiler_args,
        })
        .unwrap();
        fs::write(&source_file, source).await?;
        fs::write(&config_file, config_content).await?;
        Ok(CompileResult::Success {
            data: config_file.to_str().unwrap().to_owned(),
        })
    }
}

pub async fn build_command_from_config<P: AsRef<Path>>(
    config_file: P,
) -> Result<std::process::Command> {
    let config = tokio::fs::read_to_string(config_file).await?;
    let config = toml::from_str::<InterpreterStore>(&config)?;
    let mut cmd = std::process::Command::new(&config.interpreter);
    cmd.args(&config.args);
    cmd.arg(config.script);
    Ok(cmd)
}
