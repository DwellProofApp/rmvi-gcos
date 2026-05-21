# RMVI GCOS Pre-AWS Internal Audit

Run this before connecting AWS or moving production data.

```bash
npm run preaws:check
npm run internal:audit
npm test
npm run build
npm run release:check
```

The internal audit verifies:

- Every GCOS page is registered in navigation.
- Every page has a section profile and render branch.
- Every major page component exists.
- The shared design system covers page shells, report workspaces, admin board, and mobile breakpoints.
- Security headers and protected production data behavior are present.
- Deployment scripts exist for production, storage, runtime smoke, and live launch verification.

The audit writes JSON and Markdown reports into `launch-reports/`. Those files are environment-specific evidence and are not committed.
