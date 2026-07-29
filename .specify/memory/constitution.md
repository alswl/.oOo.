<!--
SYNC IMPACT REPORT
==================
Version: 2.0.0 → 1.0.0 (version reset per maintainer request)
Principles (4):
  1. Open-Source Security Hygiene (HIGHEST PRIORITY, supreme)
  2. Modularity over Monolith
  3. Repository as Single Source of Truth
  4. Documented, Reversible Evolution
Removed sections:
  - Governance (Principle Precedence, Amendment Procedure, Compliance Review)
    removed per maintainer request; security-supremacy statement retained inside Principle 1
Added sections: none
Templates requiring update:
  - ✅ .specify/templates/plan-template.md (aligned — dynamic Constitution Check gate)
  - ✅ .specify/templates/spec-template.md (aligned — no principle-specific sections required)
  - ✅ .specify/templates/tasks-template.md (aligned — no principle-specific task types required)
Deferred TODOs: none
-->

# .oOo. Project Constitution

**Project:** .oOo. (alswl's dotfiles)
**Ratification Date:** 2026-03-22
**Last Amended Date:** 2026-07-29
**Constitution Version:** 1.0.0

## Preamble

.oOo. is an open-source personal dotfiles repository managing Linux and macOS system configuration. It serves as the single source of truth for shell, editor, window manager, and utility tool configurations across multiple platforms. This constitution defines the non-negotiable principles governing all contributions and changes.

---

## Principle 1: Open-Source Security Hygiene (HIGHEST PRIORITY)

This repository is public. All content MUST be safe for open-source publication. This principle is supreme: in any conflict with another principle, security MUST prevail.

- Secrets (API keys, tokens, passwords, private hostnames) MUST NEVER be committed to the repository.
- Machine-specific sensitive configuration MUST use gitignored files (e.g., `.zshrc.etc.d/my-secrets.zshrc`).
- Scripts that interact with external APIs MUST accept credentials via environment variables or external config files, never hardcoded.
- Before committing, contributors MUST verify no sensitive data is included in the changeset.
- `.gitignore` MUST be maintained to exclude known secret-bearing file patterns.

**Rationale:** As a public repository, any committed secret is immediately exposed. The cost of a leaked credential far exceeds the inconvenience of external secret management — which is why security overrides every other consideration.

---

## Principle 2: Modularity over Monolith

Configuration MUST be organized in layered, composable units rather than monolithic files.

- Shell configuration MUST use `.zshrc.etc.d/` drop-in pattern for feature-specific extensions.
- Platform-specific configuration MUST reside in dedicated directories (`mac/`, `linux/`), not guarded by inline conditionals in shared files.
- New tool configurations SHOULD follow XDG Base Directory specification (`.config/<tool>/`) when the tool supports it.
- Each script in `local/bin/` MUST serve a single, well-defined purpose.

**Rationale:** Modularity enables selective activation, simplifies debugging, and allows platform-specific configuration without polluting shared files.

---

## Principle 3: Repository as Single Source of Truth

The repository MUST be the authoritative source for all managed configuration. The home directory is a consumer via symbolic links.

- Configuration files MUST be symlinked from the repository into `$HOME`, never copied.
- The repository MUST NOT depend on state outside of itself (except system packages explicitly documented).
- Files that require per-machine customization MUST use a layering mechanism (e.g., `.zshrc.etc.d/my-secrets.zshrc` gitignored) rather than direct edits to tracked files.

---

## Principle 4: Documented, Reversible Evolution

Configuration MUST evolve gradually and legibly — changes documented in-place, old configurations deprecated rather than deleted, preserving rollback capability.

- Deprecated tools or configurations MUST be marked with `# deprecated, use <replacement>` in both README and source, and retained for at least one major version cycle.
- Migration paths (old tool → new tool) MUST be documented in README or inline comments.
- Platform accommodations (e.g., `$OSTYPE` branches) MUST use explicit checks with clear branch comments.
- New conventions (e.g., XDG compliance) SHOULD be adopted for new tools; existing tools MAY be migrated when convenient, not mandated.

**Rationale:** A dotfiles repo is revisited infrequently and supports daily workflow; in-place documentation prevents future confusion, and deprecating rather than deleting avoids breaking a working environment without warning.
