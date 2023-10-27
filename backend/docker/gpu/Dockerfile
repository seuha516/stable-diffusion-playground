# CUDA-enabled base image
FROM nvidia/cuda:12.1.0-base-ubuntu22.04 as base

# Install Python
RUN apt-get update && apt-get install -y python3.9 python3-pip

# Set a directory for the app
WORKDIR /app

# copy requirements
COPY ./requirements.txt ./requirements.txt

# Install dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

