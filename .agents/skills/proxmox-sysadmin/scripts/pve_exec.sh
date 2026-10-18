#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# pve_exec.sh - Helper script for executing commands on Proxmox VE host & LXCs
# -----------------------------------------------------------------------------

PROXMOX_HOST="${PROXMOX_HOST:-100.102.35.30}"
SSH_USER="${SSH_USER:-root}"
SSH_OPTS="-o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new"

usage() {
    cat << 'USAGE'
Usage:
  pve_exec.sh host <command...>
      Executes a command directly on the Proxmox VE host.
      Example: pve_exec.sh host pvesm status

  pve_exec.sh lxc <ctid> <command...>
      Executes a command inside an LXC container using pct exec.
      Example: pve_exec.sh lxc 101 docker ps

  pve_exec.sh health
      Runs a standard health check on the Proxmox host (storage, RAM, CPU, services).

  pve_exec.sh prune-docker <ctid>
      Safely cleans dangling containers and images inside an LXC running Docker.
USAGE
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

MODE="$1"
shift

case "$MODE" in
    host)
        if [ $# -lt 1 ]; then
            echo "Error: Missing command for host execution." >&2
            exit 1
        fi
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "$@"
        ;;

    lxc)
        if [ $# -lt 2 ]; then
            echo "Error: Missing CTID or command. Usage: pve_exec.sh lxc <ctid> <command...>" >&2
            exit 1
        fi
        CTID="$1"
        shift
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "pct exec ${CTID} -- bash -c '$*'"
        ;;

    health)
        echo "=== [1/5] Proxmox Cluster & Node Status ==="
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "pveversion -v | head -n 5; uptime; pct list; qm list"
        echo ""
        echo "=== [2/5] Storage Pools (pvesm status) ==="
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "pvesm status"
        echo ""
        echo "=== [3/5] LVM Thin Pools Usage ==="
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "lvs -a -o lv_name,vg_name,lv_size,data_percent,metadata_percent"
        echo ""
        echo "=== [4/5] Memory & Swap ==="
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "free -h"
        echo ""
        echo "=== [5/5] Inode & Root Filesystem Usage ==="
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "df -hT /; df -i /"
        ;;

    prune-docker)
        if [ $# -lt 1 ]; then
            echo "Error: Missing CTID. Usage: pve_exec.sh prune-docker <ctid>" >&2
            exit 1
        fi
        CTID="$1"
        echo "Running Docker system prune inside CT ${CTID}..."
        ssh $SSH_OPTS "${SSH_USER}@${PROXMOX_HOST}" "pct exec ${CTID} -- docker system prune -f --volumes"
        ;;

    *)
        usage
        ;;
esac
