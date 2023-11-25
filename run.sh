#!/bin/bash

BUILD_FLAG=""

# Check if --build flag is passed
for arg in "$@"; do
  if [ "$arg" == "--build" ]; then
    BUILD_FLAG="--build"
    break
  fi
done

(
  cd ./frontend
  docker-compose --project-directory . -f docker-compose.yml up
) &

(
  cd ./backend
  if nvidia-smi &> /dev/null; then
    echo "GPU detected. Running with GPU support."
    DOCKER_VOLUME_DIRECTORY=. docker-compose --project-directory . -f docker/gpu/docker-compose.yml up $BUILD_FLAG
  else
    echo "No GPU detected. Running without GPU support."
    DOCKER_VOLUME_DIRECTORY=. docker-compose --project-directory . -f docker/nogpu/docker-compose.yml up $BUILD_FLAG
  fi
)