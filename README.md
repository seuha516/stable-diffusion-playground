# Stable Diffusion Playground

SNU 창의적통합설계1 (2023 Fall), Team H

## How to run

```
# Run project by execute 'server.sh' file.
./run.sh

# Then, you can start project by enter 'http://localhost:3000' in your browser.
```
This project was developed to run in a docker environment, and both frontend and backend can be activated at once by running the `run.sh` file.

However, due to nature of the models we use, inference request may not run properly if you use a specific OS or lack resources assigned to the docker.

If services in `backend` container are not running properly in docker, you can try the following methods.
- Check the CRLF/LF format of three sh files `run.sh`, `backend/server.sh`, and `backend/generate-certs.sh`.
- Manually start or restart `flask` or `proxyserver` service.
