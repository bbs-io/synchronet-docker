# Synchronet BBS Docker Environment

This directory contains a comprehensive Docker setup for building and running Synchronet BBS. It provides a flexible build system and a production-ready runtime environment.

## Quick Start

1.  **Build a runtime image:**
    ```bash
    # Build from master branch with runtime support
    ./docker-build.sh -r
    ```

2.  **Start the container:**
    ```bash
    # Use the helper script to start a container with default settings
    ./run-runtime.sh start
    ```

3.  **Administer your BBS:**
    ```bash
    # Attach to the UMonitor (UNIX Monitor) session
    ./run-runtime.sh attach
    ```

4.  **View logs:**
    ```bash
    # Follow the container logs
    ./run-runtime.sh logs
    ```

## Building Docker Images

The `docker-build.sh` script is used to create Synchronet Docker images. It supports building from git or official tarballs.

### Build Script: `docker-build.sh`

**Usage:**
```bash
./docker-build.sh [OPTIONS]
```

**Options:**

| Short | Long           | Description                                           | Default   |
|-------|----------------|-------------------------------------------------------|-----------|
| `-t`  | `--tag`        | Git tag or 'master'                                   | `master`  |
| `-b`  | `--build-type` | Build type: `gitbuild` or `tarballs`                  | both      |
| `-r`  | `--runtime`    | Create a lightweight runtime image                    | disabled  |
| `-v`  | `--verbose`    | Enable verbose output                                 | disabled  |
| `-n`  | `--dry-run`    | Show what would be done without executing             | disabled  |
| `-h`  | `--help`       | Show the help message                                 |           |

**Examples:**

```bash
# Build all image types for the master branch
./docker-build.sh

# Build all types for a specific tag (e.g., sbbs320c)
./docker-build.sh -t sbbs320c

# Build only the gitbuild type for master and create a runtime image
./docker-build.sh -b gitbuild -r

# Perform a dry run for a specific tag with verbose output
./docker-build.sh -t sbbs320c -r -v -n
```

## Docker Compose Deployment

Synchronet supports production deployment using Docker Compose. The `docker-build.sh` script generates compose files automatically when building runtime images.

### Compose Files and Helper Script

- Compose files: `docker-compose-{TAG}-{BUILDTYPE}.yml`
- Persistent data: `./volume-synchronet-{TAG}-{BUILDTYPE}-runtime/`
- Helper script: `run-compose.sh` (recommended for managing deployments)

**Usage:**

```bash
# Build and generate compose files
./docker-build.sh -r

# Start deployment (prompts for compose file selection if multiple exist)
./run-compose.sh start

# View logs
./run-compose.sh logs

# Attach to umonitor
./run-compose.sh attach

# Stop deployment
./run-compose.sh stop
```

You can also use `docker-compose` directly:

```bash
docker-compose -f docker-compose-master-gitbuild.yml up -d
docker-compose -f docker-compose-master-gitbuild.yml logs -f
docker-compose -f docker-compose-master-gitbuild.yml down
```

**Note:** Compose files use multi-stage builds. You can deploy directly without running the build script first; Docker Compose will build all required images automatically.

## Port Mapping and Automatic Offsetting

Compose files map all standard Synchronet ports:

| Port   | Service   | Description                |
|--------|-----------|----------------------------|
| 23     | Telnet    | Main BBS terminal access   |
| 22     | SSH       | Secure shell access        |
| 80     | HTTP      | Web interface              |
| 443    | HTTPS     | Secure web interface       |
| 21     | FTP       | File transfer              |
| 25     | SMTP      | Mail server                |
| 110    | POP3      | Mail retrieval             |
| 119    | NNTP      | News server                |
| 6667   | IRC       | Chat server                |
| 1123   | WebSocket | Web terminal               |
| 11235  | WebSocket | Secure web terminal        |

**Automatic Port Offsetting:**  
When generating multiple compose files, `docker-build.sh` automatically offsets host ports to prevent conflicts. For example, the second compose file will map Telnet to port `2323`, HTTP to `8080`, etc.

## Volume Mounts

Compose files create one persistent volume per deployment:

- `./volume-synchronet-{TAG}-{BUILDTYPE}-runtime:/sbbs` — Complete Synchronet installation, configuration, data, and logs


## Monitoring and Logging

Compose files include:

- Health checks to monitor BBS processes
- Centralized logging with rotation
- Automatic restart on failure

**Health Check:**

- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 5 seconds

**Logging:**

- JSON file driver
- Maximum 10MB per file
- Keep 3 log files
- Stored in `./bbs-logs/` directory

## Troubleshooting

**Permission Issues:**

```bash
# Fix ownership of data directories
sudo chown -R 1000:1000 ./bbs-data ./bbs-logs ./bbs-run
```

**Port Conflicts:**

If ports are already in use, modify the compose file to use different host ports. The build script attempts to prevent this automatically by offsetting ports.

```yaml
ports:
  - "2323:23"  # Map telnet to port 2323 instead of 23
  - "8080:80"  # Map HTTP to port 8080 instead of 80
```

**Container Won't Start:**

Check the logs for startup issues:

```bash
docker-compose -f docker-compose-{TAG}-{BUILDTYPE}.yml logs
```

Common issues:

- Insufficient permissions on mounted volumes
- Port conflicts with other services
- Missing or corrupt configuration files

## Advanced Usage

**Multiple Deployments:**

You can run multiple BBS instances by using different tags/build types. The build script generates separate compose files and data directories, and offsets ports to prevent conflicts.

```bash
# Build different versions
./docker-build.sh -t master -b gitbuild -r
./docker-build.sh -t stable -b tarballs -r

# Deploy both using the helper script (it will prompt for selection)
./run-compose.sh start  # Start the first instance
./run-compose.sh start  # Start the second instance

# Or deploy manually
docker-compose -f docker-compose-master-gitbuild.yml up -d
docker-compose -f docker-compose-stable-tarballs.yml up -d
```

## Runtime Environment

The runtime images are lightweight, production-ready containers based on Debian Bookworm Slim.

### Key Features

-   **Security**: Runs as a non-root user `sbbs` with minimal privileges.
-   **Process Management**: `supervisord` manages all services (`rsyslog`, `sbbs`, `umonitor`) with auto-restart.
-   **Logging**: Centralized logging via `rsyslog` to `/var/log/sbbs.log` (facility `local3`) and to the container's stdout.
-   **Administration**: `UMonitor` is accessible via the `run-runtime.sh attach` command.
-   **Health Checks**: A Docker health check monitors the main `sbbs` process.

### Managing Runtime Containers

The `run-runtime.sh` script simplifies container management.

**Usage:**
```bash
./run-runtime.sh {start|stop|restart|logs|attach|exec|status} [image_name]
```

**Commands:**

| Command            | Description                                                |
|--------------------|------------------------------------------------------------|
| `start`            | Start a new runtime container.                             |
| `stop`             | Stop and remove the running container.                     |
| `restart`          | Restart the container.                                     |
| `logs`             | View container logs in follow mode (`-f`).                 |
| `attach`           | Attach to the `umonitor` screen session (recommended).     |
| `exec`             | Open a `bash` shell inside the container.                  |
| `status`           | Show the container's status and port mappings.             |
| `attach-container` | Attach directly to the container's primary process (legacy). |

**Examples:**

```bash
# Start a container using the default image
./run-runtime.sh start

# Start a container with a specific image
./run-runtime.sh start synchronet-sbbs320c-gitbuild-runtime

# Attach to UMonitor
./run-runtime.sh attach

# View logs
./run-runtime.sh logs
```

### Persistent Data

For production use, it is crucial to use Docker volumes to persist your BBS data. The `run-runtime.sh` script uses `sbbs-test-ctrl`, `sbbs-test-data`, and `sbbs-test-logs` for local testing. For production, you should use more appropriately named volumes.

**Example `docker run` command for production:**

```bash
docker run -d --name sbbs-container \
  -p 23:23 \
  -p 80:80 \
  -p 22:22 \
  -v sbbs-ctrl:/sbbs/ctrl \
  -v sbbs-data:/sbbs/data \
  -v sbbs-logs:/var/log/sbbs \
  --restart=unless-stopped \
  synchronet-master-gitbuild-runtime
```

### Exposed Ports

The runtime Dockerfile exposes the following standard Synchronet ports:

-   **Telnet**: `23`
-   **SSH**: `22`, `24`
-   **Web**: `80`, `443`
-   **FTP**: `21`
-   **Email**: `25` (SMTP), `110` (POP3)
-   **News**: `119` (NNTP)
-   **Services**: `1123`, `11235`

## Administration and Troubleshooting

### BBS Configuration

-   **SCFG**: To run the main configuration tool, execute it as the `sbbs` user.
    ```bash
    docker exec -it sbbs-container su -c "/sbbs/exec/scfg" sbbs
    ```
-   **Shell Access**: To get a shell as the `sbbs` user:
    ```bash
    docker exec -it sbbs-container su - sbbs
    ```

### Service and Log Inspection

-   **Supervisor Status**: Check the status of all managed services.
    ```bash
    docker exec sbbs-container supervisorctl status
    ```
-   **Service Logs**: Tail logs for a specific service managed by `supervisorctl`.
    ```bash
    # Tail logs for the main sbbs service
    docker exec sbbs-container supervisorctl tail sbbs

    # Tail logs for umonitor
    docker exec sbbs-container supervisorctl tail umonitor
    ```
-   **Syslog**: View the Synchronet-specific syslog file directly.
    ```bash
    docker exec sbbs-container tail -f /var/log/sbbs.log
    ```

## File Overview

-   `Dockerfile.base`: Base image with build dependencies.
-   `Dockerfile.gitbuild`: Builds Synchronet from the git repository.
-   `Dockerfile.tarballs`: Builds Synchronet from official release tarballs.
-   `Dockerfile.runtime`: Creates the lightweight production-ready runtime image.
-   `docker-build.sh`: The main script for building all Docker images.
-   `run-runtime.sh`: Helper script to manage runtime containers.
-   `run-compose.sh`: Helper script to manage compose deployments.
-   `docker-compose.template.yml`: Compose file template for production deployments.
-   `supervisord.conf`: Configuration for `supervisord` process manager.
-   `rsyslog-sbbs.conf`: `rsyslog` configuration to handle Synchronet logs.
-   `logrotate-sbbs`: Log rotation configuration for `/var/log/sbbs.log`.
-   `entrypoint.sh`: Initializes the container environment (e.g., sets up `sbbs.ini` for syslog).
-   `umonitor-screen.sh`: Wrapper to run `umonitor` inside a `screen` session.
-   `attach-umonitor.sh`: Helper script to attach to the `umonitor` screen session.
