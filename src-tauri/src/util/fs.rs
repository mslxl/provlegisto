use std::path::{Path, PathBuf};

pub fn canonicalize<P: AsRef<Path>>(p: P)-> std::io::Result<PathBuf>{
    if !p.as_ref().exists() {
        std::fs::create_dir_all(&p)?;
    }
    dunce::canonicalize(p)
}