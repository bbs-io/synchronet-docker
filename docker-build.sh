#!/bin/bash
set -euo pipefail

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default values
DEFAULT_TAG="master"
DEFAULT_BASE_IMAGE="synchronet-base"

# Initialize variables
TAG="$DEFAULT_TAG"
BUILDTYPE=""
RUNTIME_FLAG=false
COMPOSE_ONLY=false
VERBOSE=false
DRY_RUN=false

# Usage function
usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Build Synchronet Docker images with optional runtime containers and docker-compose files.

OPTIONS:
    -t, --tag TAG           Git tag or 'master' (default: $DEFAULT_TAG)
    -b, --build-type TYPE   Specific build type: 'gitbuild' or 'tarballs' (default: both)
    -r, --runtime           Create runtime images and docker-compose files
    -c, --compose-only      Generate docker-compose files only (no building)
    -v, --verbose           Enable verbose output
    -n, --dry-run           Show what would be done without executing
    -h, --help              Show this help message

EXAMPLES:
    $SCRIPT_NAME                                    # Build all types for master
    $SCRIPT_NAME -t sbbs320c                        # Build all types for tag sbbs320c
    $SCRIPT_NAME -t master -b gitbuild              # Build only gitbuild for master
    $SCRIPT_NAME -t master -b gitbuild -r           # Build gitbuild, runtime, and compose for master
    $SCRIPT_NAME -t master -r                       # Build all types, runtime, and compose for master
    $SCRIPT_NAME -t master -c                       # Generate compose files only (no building)
    $SCRIPT_NAME -v -n -t master -r                 # Dry run with verbose output

GENERATED FILES (with -r option):
    synchronet-{TAG}-{BUILDTYPE}-runtime            # Runtime Docker image
    docker-compose-{TAG}-{BUILDTYPE}.yml            # Production deployment compose file
    ./volume-synchronet-{TAG}-{BUILDTYPE}-runtime/  # Persistent data and logs directory

DEPLOYMENT:
    # Deploy with docker-compose (will build runtime if needed)
    docker-compose -f docker-compose-{TAG}-{BUILDTYPE}.yml up -d
    
    # View logs
    docker-compose -f docker-compose-{TAG}-{BUILDTYPE}.yml logs -f
    
    # Stop deployment
    docker-compose -f docker-compose-{TAG}-{BUILDTYPE}.yml down

EOF
}

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >&2
}

log_verbose() {
    if [[ "$VERBOSE" == true ]]; then
        log "VERBOSE: $*"
    fi
}

log_error() {
    log "ERROR: $*" >&2
}

log_success() {
    log "SUCCESS: $*"
}

# Validate build type
validate_build_type() {
    local build_type="$1"
    case "$build_type" in
        gitbuild|tarballs)
            return 0
            ;;
        *)
            log_error "Invalid build type: '$build_type'. Must be 'gitbuild' or 'tarballs'"
            return 1
            ;;
    esac
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--tag)
                TAG="$2"
                shift 2
                ;;
            -b|--build-type)
                if ! validate_build_type "$2"; then
                    exit 1
                fi
                BUILDTYPE="$2"
                shift 2
                ;;
            -r|--runtime)
                RUNTIME_FLAG=true
                shift
                ;;
            -c|--compose-only)
                COMPOSE_ONLY=true
                RUNTIME_FLAG=true  # Compose needs runtime context
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -n|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                log_error "Unexpected argument: $1"
                usage
                exit 1
                ;;
        esac
    done
}

# Execute docker command with dry-run support
execute_docker() {
    local cmd=("$@")
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY-RUN: ${cmd[*]}"
        return 0
    else
        log_verbose "Executing: ${cmd[*]}"
        "${cmd[@]}"
    fi
}

# Build base image
build_base_image() {
    local base_image="$DEFAULT_BASE_IMAGE"
    
    log "Building base image: $base_image"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY-RUN: docker build --progress plain -f Dockerfile.base -t $base_image ."
        return 0
    fi
    
    if ! execute_docker docker build --progress plain -f Dockerfile.base -t "$base_image" .; then
        log_error "Failed to build base image: $base_image"
        return 1
    fi
    
    log_success "Built base image: $base_image"
}

# Determine build arguments
get_build_types() {
    if [[ -n "$BUILDTYPE" ]]; then
        echo "$BUILDTYPE"
    else
        echo "gitbuild tarballs"
    fi
}

# Build single image
build_image() {
    local build_type="$1"
    local image_name="synchronet-${TAG}-${build_type}"
    
    log "Building $image_name using Dockerfile.$build_type"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY-RUN: docker build -f Dockerfile.$build_type --build-arg TAG=$TAG -t $image_name ."
        return 0
    fi
    
    if execute_docker docker build -f "Dockerfile.$build_type" --build-arg TAG="$TAG" -t "$image_name" .; then
        log_success "Built: $image_name"
        return 0
    else
        log_error "Failed to build: $image_name"
        return 1
    fi
}

# Build runtime image
build_runtime_image() {
    local base_image="$1"
    local build_type="$2"
    local runtime_image="${base_image}-runtime"
    
    log "Building runtime image: $runtime_image"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "DRY-RUN: docker build -f Dockerfile.runtime --build-arg BUILD_IMAGE=$base_image --build-arg TAG=$TAG --build-arg BUILDTYPE=$build_type -t $runtime_image ."
        log "DRY-RUN: Generate docker-compose-${TAG}-${build_type}.yml from docker-compose.template.yml"
        return 0
    fi
    
    if execute_docker docker build -f Dockerfile.runtime --build-arg BUILD_IMAGE="$base_image" --build-arg TAG="$TAG" --build-arg BUILDTYPE="$build_type" -t "$runtime_image" .; then
        log_success "Built runtime: $runtime_image"
        
        # Generate docker-compose file for this runtime image
        generate_compose_file "$runtime_image" "$build_type"
        
        return 0
    else
        log_error "Failed to build runtime: $runtime_image"
        return 1
    fi
}

# Generate docker-compose file from template
generate_compose_file() {
    local runtime_image="$1"
    local build_type="$2"
    local compose_file="docker-compose-${TAG}-${build_type}.yml"
    local template_file="docker-compose.template.yml"
    
    if [[ ! -f "$template_file" ]]; then
        log_error "Docker compose template not found: $template_file"
        return 1
    fi
    
    log "Generating docker-compose file: $compose_file"
    
    if [[ "$DRY_RUN" == true ]]; then
        # Count existing files for dry run reporting
        local existing_count
        existing_count=$(find . -maxdepth 1 -name "docker-compose-*.yml" -type f | wc -l)
        local port_offset=$existing_count
        
        log "DRY-RUN: Generate $compose_file from $template_file"
        if [[ $port_offset -gt 0 ]]; then
            log "DRY-RUN: Would apply port offset of $port_offset (found $existing_count existing compose files)"
            log "DRY-RUN: Example: Port 80 would become $((80 + (port_offset * 100))), Port 23 would become $((23 + (port_offset * 100)))"
        fi
        return 0
    fi
    
    # Count existing docker-compose files to determine port offset
    local existing_count
    existing_count=$(find . -maxdepth 1 -name "docker-compose-*.yml" -type f | wc -l)
    local port_offset=$existing_count
    
    if [[ $port_offset -gt 0 ]]; then
        log "Found $existing_count existing compose file(s), applying port offset of $port_offset"
    fi
    
    # Function to calculate new port based on offset
    calculate_port() {
        local original_port="$1"
        local offset="$2"
        local new_port
        
        # Always modify the hundreds place (add offset * 100)
        # This provides headroom for 100 docker stacks
        new_port=$((original_port + (offset * 100)))
        
        echo "$new_port"
    }
    
    # Create a temporary file with port adjustments
    local temp_file=$(mktemp)
    
    # Use sed to replace template variables first
    sed -e "s/{{TAG}}/$TAG/g" \
        -e "s/{{BUILDTYPE}}/$build_type/g" \
        "$template_file" > "$temp_file"
    
    # Apply port offset if needed
    if [[ $port_offset -gt 0 ]]; then
        # Extract all port mappings and adjust them
        while IFS= read -r line; do
            if [[ $line =~ ^[[:space:]]*-[[:space:]]*\"([0-9]+):([0-9]+)\".*$ ]]; then
                local host_port="${BASH_REMATCH[1]}"
                local container_port="${BASH_REMATCH[2]}"
                local new_host_port=$(calculate_port "$host_port" "$port_offset")
                local new_line=$(echo "$line" | sed "s/\"${host_port}:${container_port}\"/\"${new_host_port}:${container_port}\"/")
                echo "$new_line"
            else
                echo "$line"
            fi
        done < "$temp_file" > "$compose_file"
        rm "$temp_file"
    else
        mv "$temp_file" "$compose_file"
    fi
    
    if [[ $? -eq 0 ]]; then
        log_success "Generated compose file: $compose_file"
        
        # Create data directories mentioned in compose file
        local volume_dir="volume-synchronet-${TAG}-${build_type}-runtime"
        if [[ ! -d "$volume_dir" ]]; then
            mkdir -p "$volume_dir"
            log_verbose "Created volume directory: $volume_dir"
        fi
        
        return 0
    else
        log_error "Failed to generate compose file: $compose_file"
        return 1
    fi
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code $exit_code at line $1"
    exit $exit_code
}

# Set up error handling
trap 'handle_error $LINENO' ERR

# Check prerequisites
check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running or not accessible"
        exit 1
    fi
    
    # Check for required Dockerfiles
    local required_files=("Dockerfile.base")
    
    # Add build-type specific Dockerfiles if specified
    if [[ -n "$BUILDTYPE" ]]; then
        required_files+=("Dockerfile.$BUILDTYPE")
    else
        required_files+=("Dockerfile.gitbuild" "Dockerfile.tarballs")
    fi
    
    # Add runtime Dockerfile and compose template if needed
    if [[ "$RUNTIME_FLAG" == true ]]; then
        required_files+=("Dockerfile.runtime" "docker-compose.template.yml")
    fi
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file not found: $file"
            exit 1
        fi
    done
    
    log_verbose "Prerequisites check passed"
}

# Run main function
main() {
    parse_args "$@"
    check_prerequisites
    
    # Handle compose-only mode
    if [[ "$COMPOSE_ONLY" == true ]]; then
        log "Generating docker-compose files only (no building)"
        log_verbose "Configuration: TAG=$TAG, BUILDTYPE=$BUILDTYPE, COMPOSE_ONLY=$COMPOSE_ONLY"
        
        # Change to script directory
        cd "$SCRIPT_DIR" || {
            log_error "Failed to change to script directory: $SCRIPT_DIR"
            exit 1
        }
        
        # Get build types and generate compose files
        local build_types
        read -ra build_types <<< "$(get_build_types)"
        
        local -a compose_files=()
        for build_type in "${build_types[@]}"; do
            if generate_compose_file "synchronet-${TAG}-${build_type}-runtime" "$build_type"; then
                compose_files+=("docker-compose-${TAG}-${build_type}.yml")
                log_success "Generated: docker-compose-${TAG}-${build_type}.yml"
            else
                log_error "Failed to generate compose file for $build_type"
                exit 1
            fi
        done
        
        echo ""
        log "=== COMPOSE FILES GENERATED ==="
        for compose_file in "${compose_files[@]}"; do
            log "  ✓ $compose_file"
        done
        echo ""
        log "To deploy (will build images automatically if not already created):"
        for compose_file in "${compose_files[@]}"; do
            log "  docker-compose -f $compose_file up -d"
        done
        echo ""
        log "or use our tool run-compose.sh"
        return 0
    fi
    
    log "Starting Synchronet Docker build process"
    log_verbose "Configuration: TAG=$TAG, BUILDTYPE=$BUILDTYPE, RUNTIME=$RUNTIME_FLAG, DRY_RUN=$DRY_RUN"
    
    # Change to script directory
    cd "$SCRIPT_DIR" || {
        log_error "Failed to change to script directory: $SCRIPT_DIR"
        exit 1
    }
    
    # Arrays to track build results
    local -a successful_builds=()
    local -a failed_builds=()
    local -a runtime_builds=()
    local -a compose_files=()
    
    # Build base image first
    if ! build_base_image; then
        log_error "Failed to build base image. Exiting."
        exit 1
    fi
    
    # Get build types
    local build_types
    read -ra build_types <<< "$(get_build_types)"
    
    # Build each type
    for build_type in "${build_types[@]}"; do
        local image_name="synchronet-${TAG}-${build_type}"
        
        if build_image "$build_type"; then
            successful_builds+=("$image_name")
            
            # Build runtime image if requested
            if [[ "$RUNTIME_FLAG" == true ]]; then
                local runtime_image="${image_name}-runtime"
                if build_runtime_image "$image_name" "$build_type"; then
                    runtime_builds+=("$runtime_image")
                    compose_files+=("docker-compose-${TAG}-${build_type}.yml")
                else
                    failed_builds+=("$runtime_image")
                fi
            fi
        else
            failed_builds+=("$image_name")
        fi
        
        echo "---"
    done

    # Report final results
    echo ""
    log "=== BUILD SUMMARY ==="
    
    if [[ ${#successful_builds[@]} -gt 0 ]]; then
        log "Successfully built and tagged:"
        for image in "${successful_builds[@]}"; do
            log "  ✓ $image"
        done
    fi
    
    if [[ ${#runtime_builds[@]} -gt 0 ]]; then
        log "Successfully built runtime images:"
        for image in "${runtime_builds[@]}"; do
            log "  ✓ $image"
        done
    fi
    
    if [[ ${#failed_builds[@]} -gt 0 ]]; then
        log "Failed to build:"
        for image in "${failed_builds[@]}"; do
            log "  ✗ $image"
        done
        echo ""
        local total_attempts=$((${#build_types[@]} + ${#runtime_builds[@]}))
        log_error "Build completed with ${#failed_builds[@]} failure(s) out of $total_attempts total builds."
        exit 1
    else
        local total_successful=$((${#successful_builds[@]} + ${#runtime_builds[@]}))
        echo ""
        log_success "All $total_successful builds completed successfully!"
        
        if [[ ${#runtime_builds[@]} -gt 0 ]]; then
            echo ""
            log "=== RUNTIME USAGE ==="
            log "To run a runtime container:"
            for image in "${runtime_builds[@]}"; do
                log "  docker run -d --name sbbs-container -p 23:23 -p 80:80 $image"
            done
            echo ""
            log "To attach to umonitor:"
            log "  docker attach sbbs-container"
            echo ""
            log "To view logs:"
            log "  docker logs -f sbbs-container"
            echo ""
            log "Or use the helper script:"
            log "  ./run-runtime.sh start $image"
            echo ""
            
            if [[ ${#compose_files[@]} -gt 0 ]]; then
                log "=== DOCKER COMPOSE DEPLOYMENT ==="
                log "Generated docker-compose files for production deployment:"
                for compose_file in "${compose_files[@]}"; do
                    log "  ✓ $compose_file"
                done
                echo ""
                log "To deploy with docker-compose:"
                for compose_file in "${compose_files[@]}"; do
                    log "  docker-compose -f $compose_file up -d"
                done
                echo ""
                log "Docker Compose will automatically:"
                log "  • Build the complete image chain (base → build → runtime)"
                log "  • Create persistent volume in ./volume-synchronet-{TAG}-{BUILDTYPE}-runtime/"
                log "  • Map all Synchronet ports (telnet, web, mail, etc.)"
                log "  • Provide automatic restart and health monitoring"
                log "  • Enable centralized logging"
                echo ""
                log "To stop the deployment:"
                for compose_file in "${compose_files[@]}"; do
                    log "  docker-compose -f $compose_file down"
                done
            fi
        fi
    fi
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
