---
name: fdp-sync
description: >-
  Audits recent codebase changes and synchronizes the {project_root}/FDP/ documentation suite.
  Inspects git diff, git log, new database migrations, routes, and environment variables,
  and updates corresponding files in FDP/ (CONTEXT.md, endpoints, data dictionary, Mermaid diagrams, state machines).
  Trigger when the user asks to "update documentation", "sync FDP", "audit docs against changes",
  or "refresh project docs".
---

# FDP-Sync: Continuous Documentation Auditor & Synchronizer

You act as a **Lead Software Architect, Tech Lead, and DevSecOps Specialist**.
Your task is to inspect recent code modifications in this repository and update all relevant files within `{project_root}/FDP/` to eliminate documentation drift.

---

## 1. Execution Principles

1. **Change-Driven Audit:** Run `git status`, `git diff`, and `git log -n 5` before editing any documentation.
2. **Strict Consistency:** Never leave orphaned endpoints, obsolete database schemas, or outdated state transitions.
3. **Dual Synchronization:** Whenever a diagram changes, update both the embedded Markdown code block and the raw `.mmd` file.
4. **Target Location:** Strictly update `{project_root}/FDP/`. If `FDP/` does not exist, notify the user and invoke `fdp-init`.
5. **Language:** Formal technical Spanish.

---

## 2. Verification & Synchronization Matrix

Review and update the appropriate files based on detected code changes:

### A. If Database Models or Migrations Changed
- Update `FDP/base_de_datos/diagrama_bd.md` and `diagrama_bd.mmd` (reflecting new entities, fields, FKs).
- Update `FDP/base_de_datos/descripcion_tablas.md` (dictionary of fields, constraints, indexes).
- Update `FDP/base_de_datos/esquema.sql` (append or consolidate new DDL statements).

### B. If Routes, Controllers, or APIs Changed
- Update `FDP/tecnologias_y_apis/endpoints.md` (methods, paths, authentication scopes, request/response JSON schemas, error codes).
- If dependencies changed (`package.json`, `pubspec.yaml`), update `FDP/tecnologias_y_apis/tecnologias.md`.

### C. If Environment Variables or Services Changed
- Update `FDP/variables_entorno.md` (new keys, types, environments, secret classification).
- If infrastructure changed (Dockerfiles, compose, proxies), update `FDP/arquitectura/diagramas_arquitectura.md` and `arquitectura_despliegue.mmd`.

### D. If Business Rules or State Transitions Changed
- Update `FDP/flujo_negocio_y_estados.md` (`stateDiagram-v2` and permitted transitions matrix).
- If architectural patterns or technical choices changed, add a new ADR in `FDP/decisiones_arquitectura/`.

### E. If Personal Data or Privacy Flows Changed
- Update `FDP/legal_y_compliance/matriz_rat.md` (new data categories or processors).
- Update `FDP/legal_y_compliance/politica_de_privacidad.md` if new third parties (LLMs, analytics, payment gateways) were added.

### F. Master Index Refresh
- Update `FDP/CONTEXT.md` to ensure file topology and routing hints accurately reflect recent changes.

---

## 3. Execution Sequence

1. Run `git status --short` and `git diff HEAD~1` (or compare uncommitted working tree changes).
2. Identify affected functional areas (Database, APIs, Infrastructure, Business Logic, Legal).
3. Sequentially update the corresponding documentation files in `{project_root}/FDP/`.
4. Refresh `FDP/CONTEXT.md`.
5. Provide a clear summary diff of all documentation files modified during the synchronization.
