# CUDA-enabled base image
FROM nvidia/cuda:11.0-base-ubuntu20.04 as base

# Install Python
RUN apt-get update && apt-get install -y python3.9 python3-pip

# Set a directory for the app
WORKDIR /app

# Copy all the files to the container
COPY . .

# Install dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Your application's run command
CMD ["python3", "your_script.py"]
