<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0
Modified principles: (initial creation)
Added sections:
  - Preamble
  - Principle 1: Modularity over Monolith
  - Principle 2: Repository as Single Source of Truth
  - Principle 3: Explicit over Implicit
  - Principle 4: Incremental Modernization
  - Principle 5: Conventional Commits
  - Principle 6: Open-Source Security Hygiene
  - Governance
Templates requiring update:
  - ⚠ .specify/templates/plan-template.md (not yet created)
  - ⚠ .specify/templates/spec-template.md (not yet created)
  - ⚠ .specify/templates/tasks-template.md (not yet created)
Deferred TODOs: none
-->

# .oOo. Project Constitution

**Project:** .oOo. (alswl's dotfiles)
**Ratification Date:** 2026-03-22
**Last Amended Date:** 2026-03-22
**Constitution Version:** 1.0.0

## Preamble

.oOo. is an open-source personal dotfiles repository managing Linux and macOS system configuration. It serves as the single source of truth for shell, editor, window manager, and utility tool configurations across multiple platforms. This constitution defines the non-negotiable principles governing all contributions and changes.

---

## Principle 1: Modularity over Monolith

Configuration MUST be organized in layered, composable units rather than monolithic files.

- Shell configuration MUST use `.zshrc.etc.d/` drop-in pattern for feature-specific extensions.
- Platform-specific configuration MUST reside in dedicated directories (`mac/`, `linux/`), not guarded by inline conditionals in shared files.
- New tool configurations SHOULD follow XDG Base Directory specification (`.config/<tool>/`) when the tool supports it.
- Each script in `local/bin/` MUST serve a single, well-defined purpose.

**Rationale:** Modularity enables selective activation, simplifies debugging, and allows platform-specific configuration without polluting shared files.

---

## Principle 2: Repository as Single Source of Truth

The repository MUST be the authoritative source for all managed configuration. The home directory is a consumer via symbolic links.

- Configuration files MUST be symlinked from the repository into `$HOME`, never copied.
- The repository MUST NOT depend on state outside of itself (except system packages explicitly documented).
- Files that require per-machine customization MUST use a layering mechanism (e.g., `.zshrc.etc.d/my-secrets.zshrc` gitignored) rather than direct edits to tracked files.

**Rationale:** Symlink strategy ensures changes propagate instantly, version history is preserved, and multi-machine setups stay synchronized.

---

## Principle 3: Explicit over Implicit

All decisions, deprecations, and platform accommodations MUST be clearly documented in-place.

- Deprecated tools or configurations MUST be marked with `# deprecated, use <replacement>` in both README and source.
- OS-detection blocks MUST use explicit `$OSTYPE` checks with clear branch comments.
- Scripts MUST validate required dependencies at startup and print actionable install instructions on failure.
- File naming conventions with special meaning (e.g., `_` prefix for symlink-translated paths) MUST be documented.

**Rationale:** A dotfiles repo is revisited infrequently; explicit documentation prevents confusion months or years later.

---

## Principle 4: Incremental Modernization

Evolution MUST be gradual — old configurations are deprecated, not deleted — ensuring rollback capability.

- When replacing a tool, the old configuration MUST be retained with a deprecation marker for at least one major version cycle.
- Migration paths MUST be documented (old tool → new tool) in README or inline comments.
- New conventions (e.g., XDG compliance) SHOULD be adopted for new tools; existing tools MAY be migrated when convenient, not mandated.

**Rationale:** Dotfiles support daily workflow; abrupt removal of configurations risks breaking a working environment without warning.

---

## Principle 5: Conventional Commits

All commits MUST follow the Conventional Commits specification to maintain a parseable, meaningful Git history.

- Commit format: `type(scope): description` where scope is optional.
- Allowed types: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`, `ci`.
- Commit messages MUST be in English and in lowercase imperative mood.
- Each commit SHOULD be atomic — one logical change per commit.

**Rationale:** Consistent commit history enables automated changelog generation and makes it easy to trace when and why a configuration changed.

---

## Principle 6: Open-Source Security Hygiene

This repository is public. All content MUST be safe for open-source publication.

- Secrets (API keys, tokens, passwords, private hostnames) MUST NEVER be committed to the repository.
- Machine-specific sensitive configuration MUST use gitignored files (e.g., `.zshrc.etc.d/my-secrets.zshrc`).
- Scripts that interact with external APIs MUST accept credentials via environment variables or external config files, never hardcoded.
- Before committing, contributors MUST verify no sensitive data is included in the changeset.
- `.gitignore` MUST be maintained to exclude known secret-bearing file patterns.

**Rationale:** As a public repository, any committed secret is immediately exposed. The cost of a leaked credential far exceeds the inconvenience of external secret management.

---

## Governance

### Amendment Procedure

1. Propose changes via a commit with type `docs:` modifying this file.
2. Update `Constitution Version` following semantic versioning:
   - **MAJOR:** Removal or incompatible redefinition of a principle.
   - **MINOR:** Addition of new principles or substantial expansion of existing guidance.
   - **PATCH:** Clarification, wording fixes, or non-semantic adjustments.
3. Update `Last Amended Date` to the date of the change.
4. Propagate changes to dependent templates (plan, spec, tasks) in the same commit or a follow-up commit within the same PR.

### Compliance Review

- All code changes SHOULD be reviewed against these principles before merging.
- The constitution SHOULD be reviewed annually or when a significant new tool/platform is adopted.
