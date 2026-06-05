# GCOS Final Product Launch Plan

This plan turns the final 1-10 launch recommendations into repeatable checks. Use it before every public release and after any provider change.

## 1. Lock Permissions And Rules

Firestore and Firebase Storage should stay server-only. Browser clients must use the GCOS API, authenticated sessions, and API permission checks.

Run:

```bash
npm run runtime:smoke
npm run product:smoke
```

Pass condition:

- Anonymous requests cannot read protected APIs.
- Admin users can access command workflows.
- Lower-level station users cannot create offices or perform admin-only actions.

## 2. Complete Account Approval And Activation

The admin board must approve, verify, activate, suspend, rotate, and reset station accounts through the office and station APIs.

Run:

```bash
GCOS_PRODUCT_SMOKE_MUTATE=1 npm run product:smoke
```

Pass condition:

- Admin login works.
- First-wave station logins work.
- Role restrictions are enforced.
- Account lifecycle routes remain available.

## 3. Complete Report Submission End To End

The report flow must support draft, detail save, submit upward, verify, build packet, and archive.

Run:

```bash
GCOS_PRODUCT_SMOKE_MUTATE=1 npm run product:smoke
```

Pass condition:

- A report can be created.
- Report details can be stored.
- Report can be submitted, verified, packeted, and archived.

## 4. Complete ChurchMail Delivery And Records

ChurchMail must support internal routing, approval, archive, and live email delivery through Resend when production email is enabled.

Run without sending email:

```bash
npm run product:smoke
```

Run with a live delivery test:

```bash
GCOS_PRODUCT_SMOKE_EMAIL_TEST=1 \
GCOS_PRODUCT_SMOKE_EMAIL_TO=admin@rmvi.org \
npm run product:smoke
```

Pass condition:

- Email activation reports live or local log mode.
- Resend delivery test passes in production.
- ChurchMail record can be sent, routed, approved, and archived in mutating mode.

## 5. Run Role-Based QA Across Station Accounts

Verify every first-wave station can sign in and sees only the correct workstation tools.

Default test accounts:

- `admin@rmvi.org`
- `finance@rmvi.org`
- `audit@rmvi.org`
- `mission@rmvi.org`
- `np@rmvi.org`
- `local_branch_017@rmvi.org`

Run:

```bash
npm run product:smoke
```

For live production, pass the real secure passwords through environment variables:

```bash
GCOS_PRODUCT_SMOKE_URL=https://rmvi.org \
GCOS_SMOKE_EMAIL=admin@rmvi.org \
GCOS_SMOKE_PASSWORD='<admin-password>' \
GCOS_FINANCE_SMOKE_PASSWORD='<finance-password>' \
GCOS_AUDIT_SMOKE_PASSWORD='<audit-password>' \
GCOS_MISSION_SMOKE_PASSWORD='<mission-password>' \
GCOS_NATIONAL_SMOKE_PASSWORD='<national-password>' \
GCOS_LOCAL_SMOKE_PASSWORD='<local-password>' \
npm run product:smoke
```

## 6. Run Backup And Restore Drill

Before final launch, create backup evidence, review provider export/restore evidence, and record the managed restore attestation.

Run:

```bash
npm run restore:managed
npm run restore:evidence
```

After the managed Firebase/Firestore export or restore test is reviewed:

```bash
GCOS_RESTORE_DRILL_ATTESTATION=MANAGED_RESTORE_CONFIRMED \
GCOS_RESTORE_DRILL_REFERENCE='<provider-export-or-restore-reference>' \
GCOS_RESTORE_DRILL_EVIDENCE='Firestore export restored, record counts reviewed, and launch administrator approved evidence.' \
npm run restore:managed:attest
```

Pass condition:

- Backup manifest exists.
- Restore drill is attested.
- Provider reference is recorded.

## 7. Polish The Most Important Screens

The only required polish before launch is clarity on the high-use workflows:

- Admin sign-in
- User sign-in
- ChurchMail
- Reports
- Approvals
- Account Settings
- Audit

Pass condition:

- No hidden text.
- No blocked scrolling.
- Primary action visible.
- Secondary actions grouped.

## 8. Publish Final Build

Run the full release gate:

```bash
npm run launch:verify:firebase
```

Then deploy:

```bash
npm run firebase:deploy
```

Pass condition:

- Build passes.
- Tests pass.
- Runtime smoke passes.
- Hosting and domain checks pass.
- Deployment alignment passes.

## 9. Onboard First Real Users

Prepare first-wave users from the rollout board, verify their accounts, and schedule training.

Run:

```bash
GCOS_ROLLOUT_FINISH_MUTATE=1 npm run rollout:finish
```

After training is completed and reviewed, certify the first wave:

```bash
GCOS_ROLLOUT_FINISH_MUTATE=1 \
GCOS_ROLLOUT_CERTIFY_COMPLETED=1 \
npm run rollout:finish
```

Then record live signoff:

```bash
npm run launch:signoff:live
```

Pass condition:

- First-wave users are approved.
- Training status is recorded.
- Launch packet is archived.

## 10. Monitor Errors And Usage During Week One

Use the operations monitor and product smoke every day during the first week.

Run:

```bash
npm run product:smoke
npm run rollout:finish
npm run launch:verify:live
```

Pass condition:

- Operations monitor remains healthy.
- No protected API failures.
- Email remains live.
- Backup and restore controls remain recorded.

## Recommended Final Sequence

```bash
npm run build
npm test
npm run product:smoke
GCOS_PRODUCT_SMOKE_MUTATE=1 npm run product:smoke
GCOS_ROLLOUT_FINISH_MUTATE=1 npm run rollout:finish
npm run restore:managed
npm run restore:managed:attest
npm run launch:verify:firebase
npm run firebase:deploy
```

Reports are written to `launch-reports/`.
