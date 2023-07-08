trait VirtualFileSystem {
    fn is_remote(&self) -> bool;
    fn list_file_id(&self) -> Vec<i32>;
    fn get_file_name(&self, id: i32) -> String;
    fn get_file_title(&self, id: i32) -> String;
    fn read_file(&self, id: i32)-> Vec<u8>;
}
