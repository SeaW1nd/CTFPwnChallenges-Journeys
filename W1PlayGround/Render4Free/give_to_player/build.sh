#!/bin/bash

if [[ -z "$(which docker)" ]]
then
    echo "docker is needed, install docker please"
else
    docker build -t render4free .
    docker run -d --name render -p 3000:3000 freeexe
fi
