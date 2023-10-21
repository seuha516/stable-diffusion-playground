#!/bin/bash

# Install openssl
apk add --no-cache openssl

# Check if certificates already exist
if [ ! -f /etc/nginx/ssl/nginx.crt ]; then
    echo "Generating self-signed certificates..."
    openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt -days 365 -nodes -subj '/CN=localhost'
else
    echo "Certificates already exist. Skipping generation."
fi
