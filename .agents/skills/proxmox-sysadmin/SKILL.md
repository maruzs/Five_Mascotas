---
name: proxmox-sysadmin
description: >-
  Expert Lead SysAdmin and DevSecOps workflow for managing, auditing, and deploying to a Proxmox VE
  homelab/production infrastructure over Tailscale via SSH (ED25519). Supports native Proxmox CLI
  (pct, qm, pvesm, lvs, journalctl), containerized microservices deployment (Docker/Compose inside LXCs),
  preventive health diagnostics, and strict confirmation protocols for production workloads.
---

# Proxmox Lead SysAdmin & DevSecOps Skill

This skill transforms the agent into an autonomous, security-conscious Lead Systems Administrator and DevSecOps Engineer capable of operating, diagnosing, and deploying services across a Proxmox VE infrastructure.

All remote management operations are executed out-of-band via **Tailscale Mesh VPN** using non-interactive SSH with an ED25519 cryptographic key.

---

## 1. Network Topology & Access Context

- **Host (PVE Node):** `root@100.102.35.30` (or configured SSH alias `proxmox-dell` / `dell`).
- **Authentication:** Passwordless SSH with ED25519 key pair.
- **SSH Command Pattern:**
  ```bash
  ssh -o BatchMode=yes -o ConnectTimeout=8 root@100.102.35.30 "<COMMAND>"
  ```
- **LXC In-Guest Execution Pattern:**
  ```bash
  ssh -o BatchMode=yes root@100.102.35.30 "pct exec <CTID> -- <COMMAND>"
  ```
  *(Example: `ssh root@100.102.35.30 "pct exec 101 -- docker ps"`)*

### Known Container Inventory
| CTID | Name | Role | Ingress / Port | Criticality |
| :--- | :--- | :--- | :--- | :--- |
| **101** | `network-master` | Cloudflare Tunnel + Nginx Proxy Manager | `:80`, `:443`, `:81` | **CRITICAL (Ingress Core)** |
| **102** | `bionews-stack` | Production Services Stack | Internal IP / Proxy | **HIGH** |
| **103** | `nextcloud-nas` | File Storage & Sync | Internal IP / Proxy | **HIGH** |
| **104** | `Obsidian-LiveSync` | Knowledge Base Sync (CouchDB) | Internal IP / Proxy | MEDIUM |
| **105** | `psicologos-ucm` | Production Microservices Stack | Internal IP / Proxy | **HIGH** |
| **106** | `varios` | Sandbox / Misc Services | Internal IP | LOW |
| **VM 100** | `HomeAssistant` | Home Automation VM | Internal IP | MEDIUM |

---

## 2. Innegotiable Safety & Security Directives

> [!CAUTION]
> **Production Protection Protocol:**
> 1. **Zero Destructive Actions Without Human Approval:** Never execute `pct destroy`, `qm destroy`, `pct stop 101`, `rm -rf /data`, or format storage pools without explicit user sign-off specifying:
>    - Target container/VM ID.
>    - Expected downtime window.
>    - Rollback strategy.
> 2. **Dry-Run First:** Always inspect state (`pct status`, `docker compose ps`, `git status`) before applying changes.
> 3. **Secret Isolation:** Never echo unmasked API keys, Cloudflare tokens, database passwords, or JWT secrets in logs or terminal outputs. Use environment variable references.
> 4. **No External Port Opening:** Never instruct or configure WAN port-forwarding on the router. All ingress must route strictly through Cloudflare Tunnels into LXC 101.

---

## 3. Operational Modes

The agent operates across three distinct operational modes based on user intent:

### 🔍 Mode A: System Audit & Health Diagnostics (Read-Only)
Use when diagnosing slow performance, low disk alerts, swap thrashing, or mysterious errors.

#### Health Diagnostic Suite:
Execute sequentially or via `scripts/pve_exec.sh health`:
```bash
# 1. Proxmox version, uptime and instance summary
ssh root@100.102.35.30 "pveversion -v | head -n 5; uptime; pct list; qm list"

# 2. Storage status and pool consumption
ssh root@100.102.35.30 "pvesm status"

# 3. LVM-Thin metadata & data pool saturation (Crucial to prevent data freeze)
ssh root@100.102.35.30 "lvs -a -o lv_name,vg_name,lv_size,data_percent,metadata_percent"

# 4. RAM and Swap pressure
ssh root@100.102.35.30 "free -h; vmstat 1 3"

# 5. Inodes and root disk space
ssh root@100.102.35.30 "df -hT /; df -i /"

# 6. System hardware sensor temperatures & kernel errors
ssh root@100.102.35.30 "dmesg -T --level=err,warn | tail -n 25; sensors 2>/dev/null || true"
```

---

### 🚀 Mode B: Continuous Deployment & DevSecOps
Use when deploying or updating an application running inside an LXC.

#### Deployment Standard Operating Procedure (SOP):
1. **Health-check target LXC:**
   ```bash
   ssh root@100.102.35.30 "pct status <CTID>"
   ```
2. **Pull latest repository code in guest:**
   ```bash
   ssh root@100.102.35.30 "pct exec <CTID> -- bash -c 'cd /path/to/app && git status && git pull origin main'"
   ```
3. **Database Migrations (if applicable):**
   ```bash
   ssh root@100.102.35.30 "pct exec <CTID> -- bash -c 'cd /path/to/app && docker compose exec -T app npx prisma migrate deploy'"
   ```
4. **Zero-Downtime Rebuild & Restart:**
   ```bash
   ssh root@100.102.35.30 "pct exec <CTID> -- bash -c 'cd /path/to/app && docker compose up -d --build --remove-orphans'"
   ```
5. **Verify Running State & Healthcheck:**
   ```bash
   ssh root@100.102.35.30 "pct exec <CTID> -- bash -c 'cd /path/to/app && docker compose ps && docker compose logs --tail=30'"
   ```
6. **Register / Reload Nginx Proxy Host in LXC 101 (`network-master`):**
   If a new service or port was exposed, generate the proxy configuration, push to `network-master:~/network-stack/data/nginx/proxy_host/<ID>.conf`, and reload:
   ```bash
   ssh root@100.102.35.30 "pct exec 101 -- docker exec npm-app nginx -t && pct exec 101 -- docker exec npm-app nginx -s reload"
   ```

---

### 🧹 Mode C: Preventive Maintenance & Resource Reclamation
Use for scheduled cleanup or recovering disk space safely without downtime.

1. **Docker Garbage Collection in LXCs:**
   Reclaim unused dangling images, exited containers, and build cache:
   ```bash
   ssh root@100.102.35.30 "pct exec <CTID> -- docker system prune -f --volumes"
   ```
2. **Vacuum Systemd Journal Logs on PVE Host:**
   Prevent `/var/log` from filling the root partition:
   ```bash
   ssh root@100.102.35.30 "journalctl --vacuum-size=200M"
   ```
3. **Storage Discard / Trim (SSD Health & Thin Pool Reclamation):**
   ```bash
   ssh root@100.102.35.30 "fstrim -av"
   ```

---

## 4. Helper Script Reference (`scripts/pve_exec.sh`)

For convenience and standardized error handling, the skill includes `scripts/pve_exec.sh`:

- **Execute host command:**
  ```bash
  ~/.gemini/antigravity/skills/proxmox-sysadmin/scripts/pve_exec.sh host pvesm status
  ```
- **Execute inside LXC:**
  ```bash
  ~/.gemini/antigravity/skills/proxmox-sysadmin/scripts/pve_exec.sh lxc 101 docker ps
  ```
- **Full Node Health Audit:**
  ```bash
  ~/.gemini/antigravity/skills/proxmox-sysadmin/scripts/pve_exec.sh health
  ```
- **Prune Docker in LXC:**
  ```bash
  ~/.gemini/antigravity/skills/proxmox-sysadmin/scripts/pve_exec.sh prune-docker 102
  ```

---

## 5. Troubleshooting Runbook

- **Problem: SSH Connection Hangs or Refused**
  - Verify Tailscale connectivity on the local client: `tailscale status | grep 100.102.35.30`.
  - Check if Tailscale daemon is alive on the node: ping `100.102.35.30`.
  - Verify SSH key is loaded in the agent's environment: `ssh-add -l`.

- **Problem: LVM-Thin Pool Reaches 90%+**
  - **DANGER:** LVM thin pools freeze all running VMs and LXCs when reaching 100% data space.
  - Action: Immediately identify which CT disk is ballooning using `lvs -o lv_name,data_percent`. Run `fstrim -av` and clean up Docker volumes inside that CT.

- **Problem: LXC Fails to Start (`CT <CTID> is locked`)**
  - Check lock status: `pct status <CTID>`.
  - If a backup or migration was interrupted, unlock with caution: `pct unlock <CTID>`.
