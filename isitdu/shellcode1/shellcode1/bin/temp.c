#include <sys/uio.h>
#include <unistd.h>
#include <stdio.h>


int main() {
    struct iovec iov[0];
    int fd = 1;
    iov[0].iov_base = "Hello, World";
    iov[0].iov_len = 10;

    writev(1, iov, 1);
}