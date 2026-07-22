# Replit Cleanup Design

## Summary

This change removes Replit-specific project wiring from the Mindful Journal workspace while preserving the documented local-development workflow. The cleanup is intentionally aggressive about Replit-branded files and packages, but behavior-safe for the current local pnpm/macOS workflow.

## Goals

- Remove tracked Replit-only files, artifact configs, package dependencies, and Vite plugin wiring.
- Keep the workspace runnable for local development after the cleanup.
- Preserve the existing supply-chain protection in `pnpm-workspace.yaml`, especially `minimumReleaseAge: 1440`.
- Remove Replit-specific dependency allowlists and platform overrides that no longer match the local workflow.

## Non-goals

- Do not change application features or UI behavior beyond removing Replit-specific development overlays and comments.
- Do not weaken workspace security settings.
- Do not migrate deleted documentation into a new doc during this cleanup; `replit.md` is removed under the approved aggressive scope.
- Do not rely on `.local/` as part of the git change set. It is already ignored and may be removed locally as follow-up housekeeping, but that is not required for the tracked cleanup.

## Approved cleanup scope

### Delete tracked files and directories

- `.replit`
- `.replitignore`
- `replit.md`
- `scripts/post-merge.sh`
- `artifacts/api-server/.replit-artifact/`
- `artifacts/journal-app/.replit-artifact/`
- `artifacts/mockup-sandbox/.replit-artifact/`

`scripts/post-merge.sh` is included because current evidence shows `.replit` is its only caller.

### Remove Replit packages and workspace entries

- Remove `@replit/connectors-sdk` from the root `package.json`.
- Remove `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`, and `@replit/vite-plugin-runtime-error-modal` from `artifacts/journal-app/package.json`.
- Remove `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-runtime-error-modal` from `artifacts/mockup-sandbox/package.json`.
- Remove the matching `catalog` entries from `pnpm-workspace.yaml`.
- Remove Replit-specific `minimumReleaseAgeExclude` entries from `pnpm-workspace.yaml`, including `@replit/*` and `stripe-replit-sync`.

### Remove Replit-specific build and dev wiring

- In `artifacts/journal-app/vite.config.ts`:
  - remove the `runtime-error-modal` import and usage
  - remove the `REPL_ID`-gated dynamic imports for cartographer and dev-banner
- In `artifacts/mockup-sandbox/vite.config.ts`:
  - remove the `runtime-error-modal` import and usage
  - remove the `REPL_ID`-gated dynamic import for cartographer

### Remove Replit-specific workspace overrides that no longer fit local development

- Keep `minimumReleaseAge: 1440` unchanged.
- Remove the Replit-specific platform exclusion entries from `pnpm-workspace.yaml` under `overrides:`.
- Preserve unrelated override lines that are still serving dependency or security purposes, including the explicit `@esbuild-kit/esm-loader` and `esbuild` version override entries at the end of the file.

The justification is direct: the workspace is being maintained locally on macOS, and the Replit-era platform exclusion entries block darwin binaries that local tools may need. The cleanup should remove only those host-environment exclusions, not unrelated security or dependency-pinning overrides.

### Clean up source comments and references

- Remove obsolete `@replit` comments from `artifacts/journal-app/src/components/ui/badge.tsx`.
- Update tracked docs that reference `replit.md` so the repository does not point at a deleted file. The current known reference is in `README.md`.

## Files expected to change

### Deleted

- `.replit`
- `.replitignore`
- `replit.md`
- `scripts/post-merge.sh`
- `artifacts/api-server/.replit-artifact/artifact.toml`
- `artifacts/journal-app/.replit-artifact/artifact.toml`
- `artifacts/mockup-sandbox/.replit-artifact/artifact.toml`

If the `.replit-artifact/` directories contain only those files, the directories disappear with the file deletions.

### Edited

- `package.json`
- `pnpm-workspace.yaml`
- `artifacts/journal-app/package.json`
- `artifacts/mockup-sandbox/package.json`
- `artifacts/journal-app/vite.config.ts`
- `artifacts/mockup-sandbox/vite.config.ts`
- `artifacts/journal-app/src/components/ui/badge.tsx`
- `README.md`

## Verification plan

After implementation, verify the cleanup through the existing local workflow:

1. Refresh dependencies and lockfile state as needed for the removed packages.
2. Run diagnostics on every touched TypeScript file.
3. Run workspace validation focused on the affected packages:
   - relevant typechecks
   - relevant builds for `artifacts/journal-app`, `artifacts/mockup-sandbox`, and the workspace entrypoints they depend on
4. Confirm the repository no longer contains tracked Replit-only config, plugin wiring, or stale documentation references.

## Risks and mitigations

- **Risk: deleting a still-useful helper script.**
  - Mitigation: the current design only deletes `scripts/post-merge.sh` because no non-Replit caller has been found.
- **Risk: local builds fail after package removal.**
  - Mitigation: verify by reinstalling dependencies and running package-level checks immediately after the cleanup.
- **Risk: broken docs links after removing `replit.md`.**
  - Mitigation: update `README.md` in the same change.
- **Risk: security regression from workspace cleanup.**
  - Mitigation: explicitly preserve `minimumReleaseAge: 1440` and avoid touching the general security policy outside Replit-specific allowlist entries.

## Success criteria

The cleanup is complete when all approved files and references are removed, the workspace no longer depends on Replit-specific packages or Vite plugin hooks, documentation no longer references removed files, and the local verification checks pass without reintroducing weaker security defaults.
