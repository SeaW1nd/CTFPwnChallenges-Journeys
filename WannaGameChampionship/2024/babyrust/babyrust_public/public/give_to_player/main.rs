use std::arch::asm;
use std::io::{self, Write, Read};

use std::string::String;
use libc;
use libc_stdhandle;
static mut SIZE: i32 = 0;
fn main() {
    unsafe{
        libc::setvbuf(libc_stdhandle::stdout(), &mut 0, libc::_IONBF, 0);
        let mut s = String::new();
        asm!("nop");
        println!("Hello my old friends");
        println!("You find a secret: {:p}", &SIZE);
        println!("How much do you want to read");
        let text = [0 as libc::c_char; 200].as_mut_ptr();
        io::stdin().read_line(&mut s).expect("Failed to readline");
        SIZE = s.trim().parse().expect("Not a valid integer");
        println!("Input content");
        libc::fgets(text, SIZE, libc_stdhandle::stdin());
        println!("You didn't figure out my secret");
    }
}
