#!/bin/bash

if nvidia-smi &> /dev/null; then
  echo "GPU detected. Running with GPU support."
  DOCKER_VOLUME_DIRECTORY=. docker-compose --project-directory . -f docker/gpu/docker-compose.yml up
else
  echo "No GPU detected. Running without GPU support."
  DOCKER_VOLUME_DIRECTORY=. docker-compose --project-directory . -f docker/nogpu/docker-compose.yml up
fi
