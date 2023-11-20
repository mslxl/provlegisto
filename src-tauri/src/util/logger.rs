use log::Level;

pub struct SimpleLogger;
impl log::Log for SimpleLogger {
    fn enabled(&self, metadata: &log::Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &log::Record) {
        if self.enabled(record.metadata()) {
            println!("[{}] - {}", record.level(), record.args());
        }
    }

    fn flush(&self) {}
}
