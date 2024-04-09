pub mod console;
pub mod error;
pub mod keylock;
pub mod fs;

pub fn append_env_var(name: &str, value: String) -> String {
  let origin = std::env::var(name);
  if let Ok(mut origin) = origin  {
    if cfg!(windows) {
      origin.push(';');
    }else{
      origin.push(':');
    }
    origin.push_str(&value);
    origin
  }else{
     value
  }
}