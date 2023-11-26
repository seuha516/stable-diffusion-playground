#!/bin/bash

cd ./frontend
docker-compose up -d

cd ../backend
./server.sh
