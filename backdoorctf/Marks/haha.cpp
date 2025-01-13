#include <cstdlib>
#include <iostream>
using namespace std;

int main() {
    string input;
    const char * command = input.c_str();
    cout << "Please input your command" << '\n';
    cin >> input;
    system(command);
    return 0;
}