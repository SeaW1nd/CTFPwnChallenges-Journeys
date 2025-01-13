#include <cstdlib>
#include <iostream>
using namespace std;
int main() {
	int *p;
	p = (int*)malloc(20);
	free(p);
	return 0;
}
