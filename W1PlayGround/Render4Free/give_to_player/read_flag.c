#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
int main() {
    FILE *file;
    char ch;

    file = fopen("/flag", "r");
    setuid(0);
    if (file == NULL) {
        printf("Failed to open file.\n");
        return 1;
    }

    while ((ch = fgetc(file)) != EOF) {
        putchar(ch);
    }

    fclose(file);

    return 0;
}