#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

CONFIG_FILE="config.json"
LOCK_DIR="/tmp/smart-cpanel-deployer.lockdir"
DEBUG="${DEBUG:-1}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
WHITE='\033[0;37m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT=""
BUILD_FOLDER="dist"
ZIP_FILE_NAME="politest.zip"
FTP_HOST=""
REMOTE_USER=""
FTP_PASSWORD=""
REMOTE_PATH="."
EXTRACT_SCRIPT_URL=""
TOKEN=""
HEALTH_URL=""
BUILD_COMMAND="bun run build"

log() {
    local level="$1"
    local message="$2"
    local color="$WHITE"

    case "$level" in
        ERROR) color="$RED" ;;
        SUCCESS) color="$GREEN" ;;
        WARNING) color="$YELLOW" ;;
        INFO) color="$WHITE" ;;
    esac

    printf "${color}[%s] [%s] %s${NC}\n" "$(date +%H:%M:%S)" "$level" "$message" >&2
}

debug() {
    [[ "$DEBUG" == "1" ]] || return 0
    printf "${CYAN}[DEBUG] %s${NC}\n" "$*" >&2
}

die() {
    log ERROR "$1"
    exit 1
}

cleanup() {
    [[ -d "$LOCK_DIR" ]] && rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT
trap 'die "Unexpected error at line $LINENO"' ERR

require_cmds() {
    local cmds=(jq curl zip bun)
    for cmd in "${cmds[@]}"; do
        command -v "$cmd" >/dev/null 2>&1 || die "$cmd not installed."
    done
}

ensure_lock() {
    mkdir "$LOCK_DIR" 2>/dev/null || die "Another deployment is already running."
}

abs_path() {
    local path="$1"
    [[ -d "$path" ]] || return 1
    (cd "$path" && pwd -P)
}

save_config() {
    jq -n \
        --arg projectRoot "$PROJECT_ROOT" \
        --arg buildFolder "$BUILD_FOLDER" \
        --arg zipFileName "$ZIP_FILE_NAME" \
        --arg ftpHost "$FTP_HOST" \
        --arg remoteUser "$REMOTE_USER" \
        --arg ftpPassword "$FTP_PASSWORD" \
        --arg remotePath "$REMOTE_PATH" \
        --arg extractScriptUrl "$EXTRACT_SCRIPT_URL" \
        --arg token "$TOKEN" \
        --arg healthUrl "$HEALTH_URL" \
        --arg buildCommand "$BUILD_COMMAND" \
        '{
            ProjectRoot: $projectRoot,
            BuildFolder: $buildFolder,
            ZipFileName: $zipFileName,
            FtpHost: $ftpHost,
            RemoteUser: $remoteUser,
            FtpPassword: $ftpPassword,
            RemotePath: $remotePath,
            ExtractScriptUrl: $extractScriptUrl,
            Token: $token,
            HealthUrl: $healthUrl,
            BuildCommand: $buildCommand
        }' > "$CONFIG_FILE"
}

load_config() {
    [[ -f "$CONFIG_FILE" ]] || return 1

    PROJECT_ROOT="$(jq -r '.ProjectRoot // empty' "$CONFIG_FILE")"
    BUILD_FOLDER="$(jq -r '.BuildFolder // "dist"' "$CONFIG_FILE")"
    ZIP_FILE_NAME="$(jq -r '.ZipFileName // "politest.zip"' "$CONFIG_FILE")"
    FTP_HOST="$(jq -r '.FtpHost // empty' "$CONFIG_FILE")"
    REMOTE_USER="$(jq -r '.RemoteUser // empty' "$CONFIG_FILE")"
    FTP_PASSWORD="$(jq -r '.FtpPassword // empty' "$CONFIG_FILE")"
    REMOTE_PATH="$(jq -r '.RemotePath // "."' "$CONFIG_FILE")"
    EXTRACT_SCRIPT_URL="$(jq -r '.ExtractScriptUrl // empty' "$CONFIG_FILE")"
    TOKEN="$(jq -r '.Token // empty' "$CONFIG_FILE")"
    HEALTH_URL="$(jq -r '.HealthUrl // empty' "$CONFIG_FILE")"
    BUILD_COMMAND="$(jq -r '.BuildCommand // "bun run build"' "$CONFIG_FILE")"

    [[ -n "$PROJECT_ROOT" ]] || PROJECT_ROOT="$PWD"
    PROJECT_ROOT="$(abs_path "$PROJECT_ROOT")" || die "Project root not found: $PROJECT_ROOT"

    BUILD_FOLDER="${BUILD_FOLDER:-dist}"
    ZIP_FILE_NAME="${ZIP_FILE_NAME:-politest.zip}"
    REMOTE_PATH="${REMOTE_PATH:-.}"
    BUILD_COMMAND="${BUILD_COMMAND:-bun run build}"

    return 0
}

prompt_config() {
    clear 2>/dev/null || true
    echo
    echo "Smart cPanel Deployer"
    echo "====================="
    echo

    read -rp "Project root [${PWD}]: " PROJECT_ROOT
    read -rp "Build folder [dist]: " BUILD_FOLDER
    read -rp "Zip filename [politest.zip]: " ZIP_FILE_NAME
    read -rp "FTP host: " FTP_HOST
    read -rp "FTP username: " REMOTE_USER
    read -rsp "FTP password: " FTP_PASSWORD
    echo
    read -rp "Remote path [.] : " REMOTE_PATH
    read -rp "Extraction script URL: " EXTRACT_SCRIPT_URL
    read -rsp "Deploy token: " TOKEN
    echo
    read -rp "Health URL [optional]: " HEALTH_URL
    read -rp "Build command [bun run build]: " BUILD_COMMAND

    PROJECT_ROOT="${PROJECT_ROOT:-$PWD}"
    BUILD_FOLDER="${BUILD_FOLDER:-dist}"
    ZIP_FILE_NAME="${ZIP_FILE_NAME:-politest.zip}"
    REMOTE_PATH="${REMOTE_PATH:-.}"
    BUILD_COMMAND="${BUILD_COMMAND:-bun run build}"

    PROJECT_ROOT="$(abs_path "$PROJECT_ROOT")" || die "Project root not found: $PROJECT_ROOT"

    save_config
    log SUCCESS "Configuration saved to $CONFIG_FILE"
}

print_config() {
    echo
    log INFO "Dry run"
    echo "ProjectRoot     : $PROJECT_ROOT"
    echo "BuildFolder     : $BUILD_FOLDER"
    echo "ZipFileName     : $ZIP_FILE_NAME"
    echo "FtpHost         : $FTP_HOST"
    echo "RemoteUser      : $REMOTE_USER"
    echo "RemotePath      : $REMOTE_PATH"
    echo "ExtractScript   : $EXTRACT_SCRIPT_URL"
    echo "HealthUrl       : ${HEALTH_URL:-<empty>}"
    echo "BuildCommand    : $BUILD_COMMAND"
    echo
}

show_loading() {
    local message="${1:-Processing...}"
    local duration="${2:-2}"
    local frames=('|' '/' '-' '\')
    local end=$((SECONDS + duration))
    local i=0

    while [ "$SECONDS" -lt "$end" ]; do
        printf "\r${CYAN}%s %s${NC}" "$message" "${frames[$((i % ${#frames[@]}))]}"
        sleep 0.1
        ((i++))
    done
    printf "\n"
}

build_dir_path() {
    if [[ "$BUILD_FOLDER" = /* ]]; then
        printf '%s\n' "$BUILD_FOLDER"
    else
        printf '%s/%s\n' "$PROJECT_ROOT" "$BUILD_FOLDER"
    fi
}

zip_path() {
    if [[ "$ZIP_FILE_NAME" = /* ]]; then
        printf '%s\n' "$ZIP_FILE_NAME"
    else
        printf '%s/%s\n' "$PROJECT_ROOT" "$ZIP_FILE_NAME"
    fi
}

create_archive() {
    local build_dir zip_file
    build_dir="$(build_dir_path)"
    zip_file="$(zip_path)"

    [[ "$build_dir" != "$PROJECT_ROOT" ]] || die "Build folder cannot be the same as project root."

    log INFO "Preparing build..."
    debug "PROJECT_ROOT=$PROJECT_ROOT"
    debug "BUILD_FOLDER=$BUILD_FOLDER"
    debug "BUILD_DIR=$build_dir"
    debug "ZIP_FILE=$zip_file"

    rm -rf "$build_dir"
    rm -f "$zip_file"

    log INFO "Running build..."
    (cd "$PROJECT_ROOT" && bash -lc "$BUILD_COMMAND")

    [[ -d "$build_dir" ]] || die "Build folder not found after build: $build_dir"
    [[ -n "$(find "$build_dir" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]] || die "Build folder is empty: $build_dir"

    for attempt in 1 2 3; do
        log INFO "Creating archive (attempt $attempt/3)..."
        if (cd "$build_dir" && zip -rq "$zip_file" .); then
            log SUCCESS "Archive created: $zip_file"
            return 0
        fi
        log WARNING "Archive attempt $attempt failed."
        [[ "$attempt" -lt 3 ]] && sleep 2
    done

    return 1
}

upload_to_ftp() {
    local zip_file remote_file ftp_url
    zip_file="$(zip_path)"
    [[ -f "$zip_file" ]] || die "ZIP file not found: $zip_file"

    if [[ "$REMOTE_PATH" == "." || -z "$REMOTE_PATH" ]]; then
        remote_file="$ZIP_FILE_NAME"
    else
        remote_file="${REMOTE_PATH%/}/$ZIP_FILE_NAME"
    fi

    ftp_url="ftp://$FTP_HOST/$remote_file"

    log INFO "Uploading with progress bar..."
    debug "FTP_URL=$ftp_url"
    debug "FTP_USER=$REMOTE_USER"

    curl \
        --ftp-create-dirs \
        --progress-bar \
        --user "$REMOTE_USER:$FTP_PASSWORD" \
        -T "$zip_file" \
        "$ftp_url"

    log SUCCESS "FTP upload completed."
}

remote_request() {
    local action="$1"
    shift || true

    [[ -n "$EXTRACT_SCRIPT_URL" ]] || die "ExtractScriptUrl is empty."
    [[ -n "$TOKEN" ]] || die "Token is empty."

    local body_file err_file http_code body err curl_args
    body_file="$(mktemp)"
    err_file="$(mktemp)"

    curl_args=(
        --location
        --silent
        --show-error
        --max-time 120
        --request GET
        --get
        --data-urlencode "action=$action"
        --data-urlencode "token=$TOKEN"
    )

    while (($#)); do
        curl_args+=(--data-urlencode "$1")
        shift
    done

    debug "REQUEST_URL=$EXTRACT_SCRIPT_URL"
    debug "REQUEST_ACTION=$action"

    http_code="$(curl "${curl_args[@]}" "$EXTRACT_SCRIPT_URL" -o "$body_file" -w '%{http_code}' 2>"$err_file" || true)"
    body="$(cat "$body_file" 2>/dev/null || true)"
    err="$(cat "$err_file" 2>/dev/null || true)"

    rm -f "$body_file" "$err_file"

    body="${body//$'\r'/}"

    debug "HTTP_CODE=${http_code:-000}"
    debug "RESPONSE_BODY=[$body]"
    [[ -n "$err" ]] && debug "CURL_STDERR=[$err]"

    [[ "$http_code" =~ ^2[0-9][0-9]$ ]] || return 1
    printf '%s' "$body"
}

remote_backup() {
    log INFO "Requesting remote backup..."
    local resp
    resp="$(remote_request backup)" || return 1
    log INFO "Server response: $resp"
    [[ "$resp" == BACKUP_SUCCESS:* ]]
}

remote_extract() {
    log INFO "Requesting remote extract..."
    local resp
    resp="$(remote_request extract "file=$ZIP_FILE_NAME")" || return 1
    log INFO "Server response: $resp"
    [[ "$resp" == "SUCCESS" ]]
}

remote_cleanup() {
    log INFO "Requesting remote cleanup..."
    local resp
    resp="$(remote_request cleanup "file=$ZIP_FILE_NAME")" || {
        log WARNING "Cleanup request failed."
        return 1
    }
    log INFO "Server response: $resp"
    true
}

remote_restore() {
    log WARNING "Requesting rollback..."
    local resp
    resp="$(remote_request restore)" || return 1
    log INFO "Server response: $resp"
    [[ "$resp" == RESTORE_SUCCESS:* ]]
}

health_check() {
    [[ -n "$HEALTH_URL" ]] || {
        log INFO "Health URL empty, skipping health check."
        return 0
    }

    log INFO "Running health check..."
    debug "HEALTH_URL=$HEALTH_URL"

    curl --silent --show-error --fail --max-time 20 "$HEALTH_URL" >/dev/null
    log SUCCESS "Health check passed."
}

deploy_once() {
    local start end duration
    start="$(date +%s)"

    create_archive
    upload_to_ftp

    remote_backup || {
        log ERROR "Remote backup failed."
        return 1
    }

    remote_extract || {
        log ERROR "Remote extract failed."
        remote_restore || log ERROR "Rollback also failed."
        return 1
    }

    if ! health_check; then
        log ERROR "Health check failed."
        remote_restore || log ERROR "Rollback also failed."
        return 1
    fi

    remote_cleanup || true

    end="$(date +%s)"
    duration="$((end - start))"

    echo
    log SUCCESS "Deployment completed successfully."
    log INFO "Duration: ${duration}s"
    log INFO "Archive: $ZIP_FILE_NAME"
    echo
}

rollback_only() {
    remote_restore || die "Rollback failed."
    health_check || true
    log SUCCESS "Rollback finished."
}

watch_mode() {
    command -v inotifywait >/dev/null 2>&1 || die "inotifywait is required for --watch."

    log INFO "Watching for file changes..."
    debug "WATCH_ROOT=$PROJECT_ROOT"

    while true; do
        inotifywait -r -e close_write,create,move,delete \
            --exclude '(^|/)(node_modules|dist|\.git|\.deploy-backups)($|/)' \
            "$PROJECT_ROOT" >/dev/null 2>&1 || true

        log INFO "Change detected, deploying..."
        deploy_once || log ERROR "Deploy failed in watch mode."
    done
}

main() {
    ensure_lock
    require_cmds

    local auto_mode=false
    local watch=false
    local dry_run=false
    local rollback=false

    while (($#)); do
        case "$1" in
            --auto) auto_mode=true ;;
            --watch) watch=true ;;
            --dry-run) dry_run=true ;;
            --rollback) rollback=true ;;
            *) die "Unknown argument: $1" ;;
        esac
        shift
    done

    if ! load_config; then
        if $auto_mode; then
            die "config.json not found. Run without --auto first."
        fi
        prompt_config
        load_config
    fi

    [[ -d "$PROJECT_ROOT" ]] || die "Project root not found: $PROJECT_ROOT"

    if $dry_run; then
        print_config
        exit 0
    fi

    if $rollback; then
        rollback_only
        exit 0
    fi

    if $watch; then
        watch_mode
        exit 0
    fi

    deploy_once
}

main "$@"