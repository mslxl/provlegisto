use serde::{Deserialize, Serialize};

pub mod cmd;
pub mod lsp;
pub mod rt;
pub mod ws;

#[derive(Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub enum LanguageMode {
    CXX,
    PY,
}
