#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main() {
    int return_open = open("readflag",0,0);
    char* c = (char*)calloc(100, sizeof(char));
    int sz = read(return_open,c,100);
    printf("read %d bytes\n", sz);
    printf("result: %s\n", c);

}