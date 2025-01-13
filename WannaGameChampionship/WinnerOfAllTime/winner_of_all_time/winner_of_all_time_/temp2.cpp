#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <unistd.h>
#include <iostream>
using namespace std;
int main() {
    unsigned int v3 = time(0);
    int64_t v4 = v3;
    srand(v3);
    int64_t requirement = rand() % 10;
    cout << requirement << '\n';
    return 0;
}