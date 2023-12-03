use serde::{Deserialize, Serialize};

pub mod rt;
pub mod cmd;
pub mod lsp;
pub mod setup;

#[derive(Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub enum LanguageMode {
    CXX,
    PY,
}
