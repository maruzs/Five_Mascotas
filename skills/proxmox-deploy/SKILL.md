---
name: proxmox-deploy
description: 'Deployment and networking workflow for applications targeting the Proxmox homelab and production cluster. Enforces ingress topology via network-master (LXC 101), Nginx Proxy Manager configuration, Cloudflare Tunnels (zero router port-forwarding), Tailscale out-of-band management, and LXC/Docker compose container standards.'
---

# Proxmox Homelab & Cluster Deployment Skill

This skill guides any AI agent in packaging, configuring, and preparing applications to be deployed within the user's Proxmox VE infrastructure.

## 1. Network & Infrastructure Context

The target environment follows a strict zero-port-forwarding ingress model:
- **Host:** Proxmox VE (`dell` at `192.168.1.50`, expanding to multi-node cluster).
- **Ingress Controller:** LXC 101 (`network-master` at `192.168.1.51`).
  - **Cloudflare Tunnel (`cloudflared`):** Routes traffic from the edge (e.g. `*.epistia.cl`) to internal services with zero exposed ports.
  - **Nginx Proxy Manager (`npm-app` Docker container):** Manages internal routing, SSL termination, and proxy headers.
- **Internal Network:** `192.168.1.0/24`. Workload instances (LXCs and VMs) have static IPs (e.g., Nexo at `192.168.1.58`).
- **Management:** Out-of-band secure administration via **Tailscale Mesh VPN** (`100.x.x.x`).

For complete architecture details, inspect [`PROXMOX_INFRASTRUCTURE.md`](../../PROXMOX_INFRASTRUCTURE.md).

---

## 2. When to Activate This Skill

Activate when:
- The user asks to "prepare this project for deployment", "deploy to Proxmox", "setup docker-compose for my server", or "configure proxy/domain for this app".
- Creating production environment variables, Docker Compose files, or reverse proxy hosts for new projects.

---

## 3. Mandatory Deployment Deliverables

Whenever this skill is triggered for a project, the agent must generate:

### A. Production `docker-compose.prod.yml`
Optimized for running inside a Proxmox LXC container (Debian/Alpine):
- Explicit container names and restart policies (`restart: unless-stopped`).
- Persistent volumes mapped to host mounts or local paths.
- Bind only to specific local ports (e.g., `ports: ["3000:3000"]`).
- Healthchecks defined for web and database services.
- Resource limits (CPU/Memory) to avoid container starvations.

### B. Nginx Proxy Host Configuration
Generate a ready-to-use configuration file for Nginx Proxy Manager (`<subdomain>.conf`):
```nginx
server {
  set $forward_scheme http;
  set $server         "<CONTAINER_LOCAL_IP>";
  set $port           <CONTAINER_PORT>;

  listen 80;
  server_name <subdomain>.epistia.cl;

  access_log /data/logs/proxy-host-<app>_access.log proxy;
  error_log /data/logs/proxy-host-<app>_error.log warn;

  client_max_body_size 50M;

  location / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_http_version 1.1;

    proxy_pass http://<CONTAINER_LOCAL_IP>:<CONTAINER_PORT>;

    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Scheme $scheme;
    proxy_set_header X-Forwarded-Proto  $scheme;
    proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP          $remote_addr;
  }
}
```
Include instructions to place it in `network-master:~/network-stack/data/nginx/proxy_host/` and run `docker exec -it npm-app nginx -s reload`.

### C. Cloudflare Tunnel Ingress Entry
Provide the exact public hostname mapping for Cloudflare Zero Trust:
- **Public hostname:** `<subdomain>.epistia.cl`
- **Service:** `HTTP://192.168.1.51:80` (pointing to `network-master`).

### D. Production Environment Matrix (`.env.production.example`)
Document all required production environment variables:
- `NODE_ENV=production`
- `PORT=<CONTAINER_PORT>`
- `NEXT_PUBLIC_APP_URL=https://<subdomain>.epistia.cl`
- Database connections pointing to internal IPs or isolated networks.

---

## 4. Operational Guardrails

- **Zero Port Forwarding:** Never suggest opening ports 80/443 on the residential router.
- **Internal Security:** Services communicating between containers should use internal IPs (`192.168.1.x`) rather than hairpinning through the public Cloudflare tunnel.
- **WebSocket Compatibility:** Always include `Upgrade $http_upgrade` and `Connection $http_connection` in reverse proxy templates.
