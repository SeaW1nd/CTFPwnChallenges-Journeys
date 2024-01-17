#!/bin/zsh
x=1
while [ $x -le 50 ]
do
	python3 exploit.py
	#echo "haha"
	x=$(( $x+1 ))
done
