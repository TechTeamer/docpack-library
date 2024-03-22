
# Docker Environment Setup Guide

This guide provides an overview of the essential commands required to set up and manage your Docker environment, based on the provided `docker-compose.yml` configuration:

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      target: production-stage
    ports:
      - "80:80"
    env_file: 
      - ./.env
    environment:
      - PORT=80
    volumes:
      - .:/app
```

## Installing Docker

Ensure Docker is installed on your machine. Visit the [official Docker documentation](https://docs.docker.com/get-docker/) for detailed installation guides.

## Building a Docker Image

To build a Docker image from a Dockerfile, run:

```bash
docker build -t my-image-name:tag .
```

- `my-image-name`: Your Docker image's name.
- `tag`: Your image's tag (e.g., `latest`, `v1.0`). Defaults to `latest`.
- `.`: The build context (current directory).

## Running a Docker Container with Docker Compose

To run your application with Docker Compose:

```bash
docker-compose up
```

Use `-d` for detached mode. This command starts the `app` service, mapping port 80 of the container to port 80 of the host, as specified in your `docker-compose.yml`.

## Environment Variables

The `.env` file's variables are loaded and used when the container starts, as specified under `env_file`. Additionally, `environment` directly sets the `PORT=80` variable in the container.

## Managing Containers with Docker Compose

- **Viewing Running Containers**:

  ```bash
  docker-compose ps
  ```

- **Stopping Services**:

  ```bash
  docker-compose down
  ```

- **Rebuilding Services after Changes**:

  ```bash
  docker-compose up --build
  ```

This rebuilds the image and restarts the containers based on changes to the Dockerfile or `docker-compose.yml`.

## Volumes

The volume `.:/app` mounts the current directory to `/app` in the container, useful for development when you want changes to be reflected in real-time inside the container.

This guide covers the basics to get started with Docker and Docker Compose, tailored to the specific `docker-compose.yml` setup provided. For more detailed information, refer to the [official Docker documentation](https://docs.docker.com/) and [Docker Compose documentation](https://docs.docker.com/compose/).