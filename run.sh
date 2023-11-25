#!/bin/bash

BUILD_FLAG=""

# Check if --build flag is passed
for arg in "$@"; do
  if [ "$arg" == "--build" ]; then
    BUILD_FLAG="--build"
    break
  fi
done

DOCKER_VOLUME_DIRECTORY=./frontend docker-compose --project-directory ./frontend -f frontend/docker-compose.yml up &

if nvidia-smi &> /dev/null; then
  echo "GPU detected. Running with GPU support."
  DOCKER_VOLUME_DIRECTORY=./backend docker-compose --project-directory ./backend -f backend/docker/gpu/docker-compose.yml up $BUILD_FLAG
else
  echo "No GPU detected. Running without GPU support."
  DOCKER_VOLUME_DIRECTORY=./backend docker-compose --project-directory ./backend -f backend/docker/nogpu/docker-compose.yml up $BUILD_FLAG
fi
