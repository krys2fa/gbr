## Summary

Provide a brief, user-focused summary of what this PR changes and why.

- Type: feat | fix | chore | refactor | docs | test | ci (select one; will auto-label)
- Scope: <area, e.g., auth, dashboard, prisma>
- Linked issues: Closes #

## Changes

- 
- 
- 

## Screenshots / Loom (optional)

Attach images or a short Loom when UI changes are involved.

## How to test

- Pre-reqs: env vars, seeded data, feature flags
- Steps:
  1. 
  2. 
  3. 

## Checklist

- [ ] PR title follows Conventional Commits (e.g., feat(auth): add JWT sessions)
- [ ] Small, focused PR (prefer < 300 lines of diff)
- [ ] Lint passes locally (`npm run lint`)
- [ ] Types pass (`npm run typecheck`)
- [ ] Unit tests added/updated and pass (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] DB migrations included and tested locally (if schema changed)
- [ ] Security: no secrets leaked, protected routes enforced, input validated
- [ ] Docs/README updated if behavior or setup changed
- [ ] Vercel preview verified (if enabled)

## Deployment

- [ ] No manual steps required
- [ ] Run `prisma migrate deploy` (if applicable)
- [ ] Add/update env secrets

## Notes for reviewers

Call out risky areas, trade-offs, and follow-ups.
