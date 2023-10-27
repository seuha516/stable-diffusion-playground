FROM python:3.9

# set a directory for the app
WORKDIR /app

# copy requirements
COPY ./requirements.txt ./requirements.txt

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt
