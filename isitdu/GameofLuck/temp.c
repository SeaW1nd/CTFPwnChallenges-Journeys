#include <math.h>
#include <stdio.h>
#include <time.h>
#include <stdlib.h>
int main() {
    clock_t time_reg = clock();
    srand(time_reg);
    int guess_num = rand() % 100;
    printf("%d\n", guess_num);
}
