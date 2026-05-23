import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const PORT = 8797;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const demoPassword = (label) => ["gcos", label].join("-");

test("GCOS API supports auth, mutations, persistence, and reset", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "gcos-api-"));
  const dataPath = join(tempDir, "state.json");
  const webDistPath = join(tempDir, "dist");
  await mkdir(join(webDistPath, "assets"), { recursive: true });
  await writeFile(join(webDistPath, "index.html"), "<!doctype html><title>GCOS Web</title><div id=\"root\"></div>");
  await writeFile(join(webDistPath, "assets", "app.css"), "body{color:#173d32}");
  let api = await startApi(dataPath, webDistPath);

  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    assert.equal(healthResponse.headers.get("access-control-allow-origin"), "https://admin.gcos.test");
    assert.equal(healthResponse.headers.get("cross-origin-opener-policy"), "same-origin");
    assert.equal(healthResponse.headers.get("cross-origin-resource-policy"), "same-origin");
    assert.equal(healthResponse.headers.get("origin-agent-cluster"), "?1");
    assert.equal(healthResponse.headers.get("x-dns-prefetch-control"), "off");
    assert.equal(healthResponse.headers.get("x-download-options"), "noopen");
    const health = await healthResponse.json();
    assert.equal(health.status, "ok");
    assert.equal(health.build.app, "rmvi-gcos");

    const deploymentBuild = await getJson("/api/deployment/build-info");
    assert.equal(deploymentBuild.app, "rmvi-gcos");
    assert.equal(deploymentBuild.runtimeTarget, "local");
    assert.equal(deploymentBuild.storageProvider, "json");

    const status = await getJson("/api/status");
    assert.equal(status.status, "ok");
    assert.equal(status.serveWeb, true);
    assert.equal(status.deployment.app, "rmvi-gcos");
    assert.equal(status.limits.maxBodyBytes, 4096);
    assert.equal(status.limits.devResetEnabled, true);
    assert.equal(status.limits.rateLimits.login.limit, 8);
    assert.equal(status.limits.rateLimits.mutations.limit, 2000);
    assert.equal(status.sessions.active, 0);
    assert.deepEqual(status.sessions.stations, []);
    assert.equal(status.counts.stations > 0, true);
    assert.equal(status.counts.tasks > 0, true);
    assert.equal(status.counts.policies > 0, true);
    assert.equal(status.counts.calendarEvents > 0, true);
    assert.equal(status.counts.liveSessions > 0, true);
    assert.equal(status.counts.personnel > 0, true);
    assert.equal(status.counts.audit > 0, true);

    const readiness = await getJson("/api/readiness");
    assert.equal(readiness.status, "ready");
    assert.equal(readiness.checks.length >= 6, true);

    const launchReadiness = await getJson("/api/launch/readiness");
    assert.equal(launchReadiness.targetDomain, "rmvi.org");
    assert.equal(launchReadiness.mvpScore >= 95, true);
    assert.equal(launchReadiness.productionScore < launchReadiness.mvpScore, true);
    assert.equal(launchReadiness.checks.some((check) => check.name === "managed-database"), true);
    assert.equal(launchReadiness.checks.some((check) => check.name === "deployment-target"), true);
    assert.equal(launchReadiness.checks.some((check) => check.name === "database-pool"), true);
    assert.equal(launchReadiness.checks.some((check) => check.name === "rate-limit-protection"), true);
    assert.equal(launchReadiness.checks.some((check) => check.name === "backup-manifest"), true);
    assert.equal(launchReadiness.checks.some((check) => check.name === "restore-drill"), true);

    const operationalMonitor = await getJson("/api/ops/monitor");
    assert.equal(operationalMonitor.service, "gcos-api");
    assert.equal(operationalMonitor.status, "attention");
    assert.equal(operationalMonitor.readiness.mvpScore >= 95, true);
    assert.equal(operationalMonitor.criticalSignals.some((signal) => signal.name === "managed-database"), true);

    const completion = await getJson("/api/project/completion");
    assert.equal(completion.project, "Remedy Movement International GCOS");
    assert.equal(completion.targetDomain, "rmvi.org");
    assert.equal(completion.status, "controlled-mvp-ready");
    assert.equal(completion.moduleScore >= 90, true);
    assert.equal(completion.releaseCommands.includes("npm run release:check"), true);
    assert.equal(completion.smokeUrls.includes("https://rmvi.org/health"), true);

    const enterpriseCompletion = await getJson("/api/enterprise/completion");
    assert.equal(enterpriseCompletion.project, "Remedy Movement International GCOS");
    assert.equal(enterpriseCompletion.tracks.length, 12);
    assert.equal(enterpriseCompletion.tracks.some((track) => track.id === "identity" && track.score >= 67), true);
    assert.equal(enterpriseCompletion.tracks.some((track) => track.id === "database-storage"), true);
    assert.equal(enterpriseCompletion.tracks.some((track) => track.id === "ai-controls"), true);
    assert.equal(enterpriseCompletion.nextActions.some((action) => action.includes("GCOS_DATABASE_URL")), true);

    const rolloutReadiness = await getJson("/api/rollout/readiness");
    assert.equal(rolloutReadiness.project, "Remedy Movement International GCOS");
    assert.equal(rolloutReadiness.tracks.length, 6);
    assert.equal(rolloutReadiness.tracks.some((track) => track.id === "deployment"), true);
    assert.equal(rolloutReadiness.tracks.some((track) => track.id === "real-data"), true);
    assert.equal(rolloutReadiness.tracks.some((track) => track.id === "live-operations"), true);
    assert.equal(rolloutReadiness.nextActions.some((action) => action.includes("GCOS_DATABASE_URL")), true);

    const deploymentPlan = await getJson("/api/launch/deployment-plan");
    assert.equal(deploymentPlan.targetDomain, "rmvi.org");
    assert.equal(deploymentPlan.requiredSecrets.some((secret) => secret.name === "GCOS_DATABASE_URL"), true);
    assert.equal(deploymentPlan.commands.includes("npm run production:check"), true);
    assert.equal(deploymentPlan.commands.includes("npm run secrets:plan"), true);
    assert.equal(deploymentPlan.commands.includes("npm run launch:verify:live"), true);
    assert.equal(deploymentPlan.smokeUrls.includes("https://rmvi.org/health"), true);

    const secretsPlan = await getJson("/api/production/secrets-plan");
    assert.equal(secretsPlan.targetDomain, "rmvi.org");
    assert.equal(secretsPlan.status, "secrets-pending");
    assert.equal(secretsPlan.entries.some((entry) => entry.name === "GCOS_DATABASE_URL" && entry.status === "needed"), true);
    assert.equal(secretsPlan.missing.includes("GCOS_DATABASE_URL"), true);
    assert.equal(secretsPlan.entries.some((entry) => entry.name === "GCOS_DATABASE_URL" && entry.nextAction.includes("managed Postgres")), true);

    const launchSignoff = await getJson("/api/launch/signoff");
    assert.equal(launchSignoff.tracks.length, 3);
    assert.equal(launchSignoff.tracks.some((track) => track.id === "usable-web-mvp" && track.score >= 90), true);
    assert.equal(launchSignoff.tracks.some((track) => track.id === "production-readiness"), true);
    assert.equal(launchSignoff.tracks.some((track) => track.id === "enterprise-deployment"), true);

    const webShell = await fetch(`${BASE_URL}/`);
    assert.equal(webShell.status, 200);
    assert.equal((await webShell.text()).includes("GCOS Web"), true);

    const webAsset = await fetch(`${BASE_URL}/assets/app.css`);
    assert.equal(webAsset.status, 200);
    assert.equal(await webAsset.text(), "body{color:#173d32}");

    const webFallback = await fetch(`${BASE_URL}/office/deep-link`);
    assert.equal(webFallback.status, 200);
    assert.equal((await webFallback.text()).includes("GCOS Web"), true);

    const login = await postJson("/api/auth/login", {
      email: "np@rmvi.org",
      password: demoPassword("national")
    });
    assert.equal(login.station.email, "np@rmvi.org");
    assert.match(login.token, /^gcos\./);
    assert.equal(Boolean(login.expiresAt), true);
    const nationalToken = login.token;

    const statusAfterLogin = await getJson("/api/status");
    assert.equal(statusAfterLogin.sessions.active, 1);
    assert.equal(statusAfterLogin.sessions.stations[0].email, "np@rmvi.org");
    assert.equal("id" in statusAfterLogin.sessions.stations[0], false);
    assert.equal(statusAfterLogin.sessions.stations[0].minutesRemaining > 0, true);
    assert.equal(statusAfterLogin.storageProvider, "json");
    assert.equal(statusAfterLogin.persistenceStatus.provider, "json");
    assert.equal(statusAfterLogin.persistenceStatus.mode, "json-file");
    assert.match(statusAfterLogin.persistenceStatus.hash, /^sha256:/);

    const persistenceStatus = await getJson("/api/persistence/status");
    assert.equal(persistenceStatus.provider, "json");
    assert.equal(persistenceStatus.mode, "json-file");
    assert.equal(persistenceStatus.backupSupport, true);
    assert.equal(persistenceStatus.migrationReady, true);
    assert.equal(persistenceStatus.records.stations > 0, true);
    assert.match(persistenceStatus.hash, /^sha256:/);

    const migrationPlan = await getJson("/api/persistence/migration-plan");
    assert.equal(migrationPlan.source.provider, "json");
    assert.equal(migrationPlan.target.schema, "gcos_core");
    assert.equal(migrationPlan.estimatedRows > 0, true);
    assert.equal(migrationPlan.collections.some((item) => item.collection === "stations" && item.targetTable === "gcos_stations"), true);

    const schemaPlan = await getJson("/api/persistence/schema-plan");
    assert.equal(schemaPlan.schema, "gcos_core");
    assert.equal(schemaPlan.dialect, "postgresql");
    assert.equal(schemaPlan.tableCount, migrationPlan.collections.length);
    assert.equal(schemaPlan.sql.includes("create schema if not exists gcos_core;"), true);
    assert.equal(schemaPlan.importOrder.includes("gcos_stations"), true);

    const importDryRun = await getJson("/api/persistence/import-dry-run");
    assert.equal(importDryRun.valid, true);
    assert.equal(importDryRun.schema, "gcos_core");
    assert.equal(importDryRun.estimatedRows, migrationPlan.estimatedRows);
    assert.equal(importDryRun.batches.some((batch) => batch.table === "gcos_stations" && batch.status === "ready"), true);

    const localLogin = await postJson("/api/auth/login", {
      email: "local_branch_017@rmvi.org",
      password: demoPassword("local")
    });
    const localToken = localLogin.token;

    const financeLogin = await postJson("/api/auth/login", {
      email: "finance@rmvi.org",
      password: demoPassword("finance")
    });
    assert.equal(financeLogin.station.email, "finance@rmvi.org");

    const auditLogin = await postJson("/api/auth/login", {
      email: "audit@rmvi.org",
      password: demoPassword("audit")
    });
    assert.equal(auditLogin.station.email, "audit@rmvi.org");

    const missionLogin = await postJson("/api/auth/login", {
      email: "mission@rmvi.org",
      password: demoPassword("mission")
    });
    assert.equal(missionLogin.station.email, "mission@rmvi.org");

    const internationalLogin = await postJson("/api/auth/login", {
      email: "international@rmvi.org",
      password: demoPassword("global")
    });
    const internationalToken = internationalLogin.token;

    const forbiddenPersistenceExport = await fetch(`${BASE_URL}/api/persistence/export`);
    assert.equal(forbiddenPersistenceExport.status, 401);

    const persistenceBackup = await postJson("/api/persistence/backup", {
      label: "automated-test"
    }, nationalToken);
    assert.equal(persistenceBackup.backup.label, "automated-test");
    assert.match(persistenceBackup.backup.hash, /^sha256:/);
    assert.equal((await readFile(persistenceBackup.backup.path, "utf8")).includes("\"label\": \"automated-test\""), true);

    const backupManifest = await getJson("/api/persistence/backup-manifest");
    assert.equal(backupManifest.status, "protected");
    assert.equal(backupManifest.total >= 1, true);
    assert.equal(backupManifest.backups.some((backup) => backup.label === "automated-test"), true);
    assert.equal(backupManifest.checks.some((check) => check.name === "hashes" && check.ok), true);

    const recordedBackupManifest = await postJson("/api/persistence/backup-manifest", {}, nationalToken);
    assert.equal(recordedBackupManifest.manifest.status, "protected");
    assert.equal(recordedBackupManifest.status.records.stations > 0, true);

    const restoreDrill = await getJson("/api/persistence/restore-drill");
    assert.equal(restoreDrill.status, "restorable");
    assert.equal(restoreDrill.valid, true);
    assert.equal(restoreDrill.backupRecords.stations, restoreDrill.liveRecords.stations);
    assert.equal(restoreDrill.recordDelta >= 0, true);
    assert.equal(restoreDrill.checks.some((check) => check.name === "hash-match" && check.ok), true);

    const recordedRestoreDrill = await postJson("/api/persistence/restore-drill", {}, nationalToken);
    assert.equal(recordedRestoreDrill.drill.status, "restorable");
    assert.equal(recordedRestoreDrill.status.records.stations > 0, true);

    const verifiedPersistence = await postJson("/api/persistence/verify", {}, nationalToken);
    assert.equal(verifiedPersistence.verified, true);
    assert.match(verifiedPersistence.status.hash, /^sha256:/);

    const persistenceExport = await getJson("/api/persistence/export", nationalToken);
    assert.equal(persistenceExport.exportedBy, "np@rmvi.org");
    assert.equal(persistenceExport.state.stations.length > 0, true);

    const migrationExport = await postJson("/api/persistence/migration-export", {
      label: "automated-migration"
    }, nationalToken);
    assert.equal(migrationExport.migration.label, "automated-migration");
    assert.match(migrationExport.migration.hash, /^sha256:/);
    assert.equal(migrationExport.migration.plan.target.schema, "gcos_core");
    assert.equal((await readFile(migrationExport.migration.path, "utf8")).includes("\"label\": \"automated-migration\""), true);

    const schemaExport = await postJson("/api/persistence/schema-export", {
      label: "automated-schema"
    }, nationalToken);
    assert.equal(schemaExport.schema.label, "automated-schema");
    assert.match(schemaExport.schema.hash, /^sha256:/);
    assert.equal(schemaExport.schema.schema.schema, "gcos_core");
    assert.equal((await readFile(schemaExport.schema.path, "utf8")).includes("create table if not exists gcos_core.gcos_stations"), true);

    const recordedImportDryRun = await postJson("/api/persistence/import-dry-run", {}, nationalToken);
    assert.equal(recordedImportDryRun.dryRun.valid, true);
    assert.equal(recordedImportDryRun.dryRun.estimatedBatches, schemaPlan.tableCount);
    assert.equal(recordedImportDryRun.status.records.stations > 0, true);

    const cutoverChecklist = await getJson("/api/persistence/cutover-checklist");
    assert.equal(cutoverChecklist.provider, "json");
    assert.equal(cutoverChecklist.status, "go-with-provider-switch");
    assert.equal(cutoverChecklist.ready, true);
    assert.deepEqual(cutoverChecklist.blockers, ["database-provider"]);

    const recordedCutoverChecklist = await postJson("/api/persistence/cutover-checklist", {}, nationalToken);
    assert.equal(recordedCutoverChecklist.checklist.ready, true);
    assert.equal(recordedCutoverChecklist.checklist.checks.some((check) => check.name === "restore-drill" && check.ok), true);
    assert.equal(recordedCutoverChecklist.checklist.requiredSwitches.some((item) => item.name === "GCOS_DATABASE_URL"), true);
    assert.equal(recordedCutoverChecklist.status.records.stations > 0, true);

    const databaseSmoke = await postJson("/api/persistence/database-smoke", {}, nationalToken);
    assert.equal(databaseSmoke.smoke.provider, "json");
    assert.equal(databaseSmoke.smoke.status, "skipped");
    assert.equal(databaseSmoke.smoke.checks.some((check) => check.name === "database-provider" && !check.ok), true);
    assert.equal(databaseSmoke.status.records.stations > 0, true);

    const recordedLaunchReadiness = await postJson("/api/launch/readiness", {}, nationalToken);
    assert.equal(recordedLaunchReadiness.launch.status, "mvp-launch-ready");
    assert.equal(recordedLaunchReadiness.launch.mvpScore >= 95, true);
    assert.equal(recordedLaunchReadiness.status.records.stations > 0, true);

    const recordedDeploymentPlan = await postJson("/api/launch/deployment-plan", {}, nationalToken);
    assert.equal(recordedDeploymentPlan.plan.requiredSecrets.some((secret) => secret.name === "GCOS_DATABASE_URL"), true);
    assert.equal(recordedDeploymentPlan.plan.commands.includes("npm run domain:check"), true);
    assert.equal(recordedDeploymentPlan.status.records.stations > 0, true);

    const recordedOperationalMonitor = await postJson("/api/ops/monitor", {}, nationalToken);
    assert.equal(recordedOperationalMonitor.monitor.service, "gcos-api");
    assert.equal(recordedOperationalMonitor.monitor.score > 0, true);
    assert.equal(recordedOperationalMonitor.status.records.stations > 0, true);

    const recordedLaunchSignoff = await postJson("/api/launch/signoff", {}, nationalToken);
    assert.equal(recordedLaunchSignoff.signoff.tracks.length, 3);
    assert.equal(recordedLaunchSignoff.signoff.overallScore > 0, true);
    assert.equal(recordedLaunchSignoff.status.records.stations > 0, true);

    const acknowledgedReadiness = await postJson("/api/readiness/web/acknowledge", {
      reason: "Automated readiness acknowledgement"
    }, nationalToken);
    assert.equal(acknowledgedReadiness.check.acknowledged, true);

    const ownedReadiness = await postJson("/api/readiness/web/owner", {
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(ownedReadiness.check.owner, "np@rmvi.org");

    const scheduledReadiness = await postJson("/api/readiness/web/recheck", {
      recheckAt: "2026-05-18T12:00:00.000Z"
    }, nationalToken);
    assert.equal(scheduledReadiness.check.recheckAt, "2026-05-18T12:00:00.000Z");

    const remediationReadiness = await postJson("/api/readiness/web/remediation", {
      assignee: "np@rmvi.org",
      priority: "High",
      due: "Today"
    }, nationalToken);
    assert.match(remediationReadiness.title, /^Remediate readiness:/);

    const forbiddenReadinessOverride = await rawPost("/api/readiness/web/override", {
      reason: "Forbidden override"
    }, localToken);
    assert.equal(forbiddenReadinessOverride.status, 403);

    const overrideReadiness = await postJson("/api/readiness/web/override", {
      reason: "Automated readiness override"
    }, internationalToken);
    assert.equal(overrideReadiness.check.override, true);

    const bulkReadiness = await postJson("/api/readiness/bulk/acknowledge", {
      names: ["persistence", "stations"],
      reason: "Automated bulk readiness acknowledgement"
    }, nationalToken);
    assert.equal(bulkReadiness.count, 2);

    const readinessDigest = await getJson("/api/readiness/digest", nationalToken);
    assert.equal(readinessDigest.total >= 6, true);
    assert.equal(readinessDigest.acknowledged >= 2, true);
    assert.equal(readinessDigest.owned >= 1, true);

    const archivedReadiness = await postJson("/api/readiness/exports/archive", {
      reason: "Automated readiness archive"
    }, nationalToken);
    assert.equal(archivedReadiness.readiness.checks.some((check) => check.name === "exports"), false);

    const securityControls = await getJson("/api/security-controls", nationalToken);
    assert.equal(securityControls.length >= 6, true);
    assert.equal(securityControls.some((control) => control.name === "RBAC"), true);

    const invalidSecurityStatus = await rawPost("/api/security-controls/RBAC/status", {
      status: "Broken"
    }, nationalToken);
    assert.equal(invalidSecurityStatus.status, 400);

    const updatedSecurityStatus = await postJson("/api/security-controls/RBAC/status", {
      status: "Warning",
      reason: "Automated status test"
    }, nationalToken);
    assert.equal(updatedSecurityStatus.control.status, "Warning");

    const ownedSecurityControl = await postJson("/api/security-controls/RBAC/owner", {
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(ownedSecurityControl.control.owner, "np@rmvi.org");

    const evidencedSecurityControl = await postJson("/api/security-controls/RBAC/evidence", {
      evidence: "Automated evidence packet"
    }, nationalToken);
    assert.equal(evidencedSecurityControl.control.evidence, "Automated evidence packet");

    const testedSecurityControl = await postJson("/api/security-controls/RBAC/test", {
      result: "Automated control test passed",
      status: "Active"
    }, nationalToken);
    assert.equal(testedSecurityControl.control.status, "Active");
    assert.equal(testedSecurityControl.control.lastTestResult, "Automated control test passed");

    const rotatedSecurityControl = await postJson("/api/security-controls/RBAC/rotate", {
      reason: "Automated rotation test"
    }, nationalToken);
    assert.equal(Boolean(rotatedSecurityControl.control.lastRotation), true);

    const exceptionSecurityControl = await postJson("/api/security-controls/RBAC/exception", {
      reason: "Automated exception test"
    }, nationalToken);
    assert.equal(exceptionSecurityControl.control.status, "Exception");

    const remediatedSecurityControl = await postJson("/api/security-controls/RBAC/remediation", {
      assignee: "np@rmvi.org",
      priority: "High",
      due: "Today"
    }, nationalToken);
    assert.match(remediatedSecurityControl.title, /^Remediate security control:/);

    const verifiedSecurityControl = await postJson("/api/security-controls/RBAC/verify", {
      result: "Automated verification test"
    }, nationalToken);
    assert.equal(verifiedSecurityControl.control.verified, true);
    assert.equal(verifiedSecurityControl.control.status, "Active");

    const bulkSecurityTest = await postJson("/api/security-controls/bulk/test", {
      names: ["RBAC", "ABAC"],
      result: "Automated bulk control test"
    }, nationalToken);
    assert.equal(bulkSecurityTest.count, 2);

    const securityDigest = await getJson("/api/security-controls/digest", nationalToken);
    assert.equal(securityDigest.total >= 6, true);
    assert.equal(securityDigest.verified >= 1, true);
    assert.equal(securityDigest.evidence >= 1, true);
    assert.equal(securityDigest.rotations >= 1, true);

    const complianceReviews = await getJson("/api/compliance-reviews", nationalToken);
    assert.equal(complianceReviews.length >= 3, true);
    assert.equal(complianceReviews.some((review) => review.id === "comp-finance-q2"), true);

    const routedCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/route", {
      reviewer: "np@rmvi.org"
    }, nationalToken);
    assert.equal(routedCompliance.review.reviewer, "np@rmvi.org");
    assert.equal(routedCompliance.review.status, "In Review");

    const evidencedCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/evidence", {
      evidence: "Automated compliance evidence"
    }, nationalToken);
    assert.equal(evidencedCompliance.review.evidence, "Automated compliance evidence");

    const invalidComplianceRisk = await rawPost("/api/compliance-reviews/comp-finance-q2/score", {
      risk: "Emergency",
      score: 99
    }, nationalToken);
    assert.equal(invalidComplianceRisk.status, 400);

    const scoredCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/score", {
      risk: "Critical",
      score: 91
    }, nationalToken);
    assert.equal(scoredCompliance.review.risk, "Critical");
    assert.equal(scoredCompliance.review.score, 91);

    const attestedCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/attest", {
      attestation: "Automated compliance attestation"
    }, nationalToken);
    assert.equal(attestedCompliance.review.attested, true);
    assert.equal(attestedCompliance.review.status, "Attested");

    const packetCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/packet", {
      packetId: "automated-packet"
    }, nationalToken);
    assert.equal(packetCompliance.review.packetId, "automated-packet");

    const exportedCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/export", {
      format: "PDF"
    }, nationalToken);
    assert.equal(exportedCompliance.review.exported, true);
    assert.equal(exportedCompliance.review.exportFormat, "PDF");

    const escalatedCompliance = await postJson("/api/compliance-reviews/comp-finance-q2/escalate", {
      risk: "Critical",
      reason: "Automated compliance escalation"
    }, nationalToken);
    assert.equal(escalatedCompliance.review.status, "Escalated");

    const bulkCompliance = await postJson("/api/compliance-reviews/bulk/review", {
      ids: ["comp-transfer-access", "comp-churchmail-archive"],
      reviewer: "np@rmvi.org"
    }, nationalToken);
    assert.equal(bulkCompliance.count, 2);

    const archivedCompliance = await postJson("/api/compliance-reviews/comp-transfer-access/archive", {
      reason: "Automated compliance archive"
    }, nationalToken);
    assert.equal(archivedCompliance.reviews.some((review) => review.id === "comp-transfer-access"), false);

    const complianceDigest = await getJson("/api/compliance-reviews/digest", nationalToken);
    assert.equal(complianceDigest.total >= 2, true);
    assert.equal(complianceDigest.attested >= 1, true);
    assert.equal(complianceDigest.packetReady >= 1, true);
    assert.equal(complianceDigest.exported >= 1, true);
    assert.equal(complianceDigest.escalated >= 1, true);

    const evidenceVault = await getJson("/api/evidence-vault", nationalToken);
    assert.equal(evidenceVault.length >= 3, true);
    assert.equal(evidenceVault.some((record) => record.id === "ev-finance-ledger"), true);

    const custodyEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/custody", {
      custody: "np@rmvi.org"
    }, nationalToken);
    assert.equal(custodyEvidence.evidence.custody, "np@rmvi.org");
    assert.equal(custodyEvidence.evidence.status, "In Review");

    const invalidEvidenceClass = await rawPost("/api/evidence-vault/ev-finance-ledger/classification", {
      classification: "Unknown"
    }, nationalToken);
    assert.equal(invalidEvidenceClass.status, 400);

    const classifiedEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/classification", {
      classification: "Legal"
    }, nationalToken);
    assert.equal(classifiedEvidence.evidence.classification, "Legal");

    const chainedEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/chain", {
      chainHash: "automated-chain-hash"
    }, nationalToken);
    assert.equal(chainedEvidence.evidence.chainHash, "automated-chain-hash");

    const retainedEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/retention", {
      retention: "Permanent",
      reviewAt: "2026-08-15T12:00:00.000Z"
    }, nationalToken);
    assert.equal(retainedEvidence.evidence.retention, "Permanent");

    const sealedEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/seal", {
      reason: "Automated evidence seal"
    }, nationalToken);
    assert.equal(sealedEvidence.evidence.sealed, true);
    assert.equal(sealedEvidence.evidence.status, "Sealed");

    const verifiedEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/verify", {
      result: "Automated evidence verification"
    }, nationalToken);
    assert.equal(verifiedEvidence.evidence.verified, true);
    assert.equal(verifiedEvidence.evidence.status, "Verified");

    const heldEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/hold", {
      reason: "Automated evidence hold"
    }, nationalToken);
    assert.equal(heldEvidence.evidence.hold, true);
    assert.equal(heldEvidence.evidence.status, "On Hold");

    const exportedEvidence = await postJson("/api/evidence-vault/ev-finance-ledger/export", {
      format: "PDF"
    }, nationalToken);
    assert.equal(exportedEvidence.evidence.exported, true);
    assert.equal(exportedEvidence.evidence.exportFormat, "PDF");

    const bulkEvidenceSeal = await postJson("/api/evidence-vault/bulk/seal", {
      ids: ["ev-transfer-session", "ev-churchmail-archive"],
      reason: "Automated bulk evidence seal"
    }, nationalToken);
    assert.equal(bulkEvidenceSeal.count, 2);

    const archivedEvidence = await postJson("/api/evidence-vault/ev-transfer-session/archive", {
      reason: "Automated evidence archive"
    }, nationalToken);
    assert.equal(archivedEvidence.vault.some((record) => record.id === "ev-transfer-session"), false);

    const evidenceDigest = await getJson("/api/evidence-vault/digest", nationalToken);
    assert.equal(evidenceDigest.total >= 2, true);
    assert.equal(evidenceDigest.sealed >= 1, true);
    assert.equal(evidenceDigest.verified >= 1, true);
    assert.equal(evidenceDigest.holds >= 1, true);
    assert.equal(evidenceDigest.exported >= 1, true);

    const statusAfterSecondLogin = await getJson("/api/status");
    assert.equal(statusAfterSecondLogin.sessions.active, 6);
    assert.equal("id" in statusAfterSecondLogin.sessions.stations[0], false);

    const publicSessionsResponse = await fetch(`${BASE_URL}/api/sessions`);
    assert.equal(publicSessionsResponse.status, 401);
    const privateSessions = await getJson("/api/sessions", nationalToken);
    assert.equal(privateSessions.active, 6);
    assert.equal(Boolean(privateSessions.stations[0].id), true);
    assert.equal(privateSessions.stations[0].id.startsWith("sid_"), true);
    assert.notEqual(privateSessions.stations[0].id, nationalToken);

    const renewedSession = await postJson("/api/sessions/renew", {}, nationalToken);
    assert.equal(renewedSession.session.email, "np@rmvi.org");
    assert.equal(renewedSession.session.status, "Renewed");
    assert.equal(renewedSession.session.id.startsWith("sid_"), true);
    assert.notEqual(renewedSession.session.id, nationalToken);

    const flaggedSession = await postJson(`/api/sessions/${renewedSession.session.id}/flag`, {
      reason: "Automated suspicious session test"
    }, nationalToken);
    assert.equal(flaggedSession.session.status, "Flagged");
    assert.equal(flaggedSession.session.flags.includes("Automated suspicious session test"), true);

    const extendedSession = await postJson(`/api/sessions/${renewedSession.session.id}/extend`, {
      minutes: 30
    }, nationalToken);
    assert.equal(extendedSession.session.status, "Extended");

    const lockedSession = await postJson(`/api/sessions/${renewedSession.session.id}/lock`, {
      reason: "Automated lock test"
    }, nationalToken);
    assert.equal(lockedSession.session.status, "Locked");

    const unlockedSession = await postJson(`/api/sessions/${renewedSession.session.id}/unlock`, {
      reason: "Automated unlock test"
    }, nationalToken);
    assert.equal(unlockedSession.session.status, "Active");

    const trustedSession = await postJson(`/api/sessions/${renewedSession.session.id}/trust`, {
      reason: "Automated trust test"
    }, nationalToken);
    assert.equal(trustedSession.session.trusted, true);

    const mfaSession = await postJson(`/api/sessions/${renewedSession.session.id}/mfa`, {
      reason: "Automated MFA test"
    }, nationalToken);
    assert.equal(mfaSession.session.mfaRequired, true);
    assert.equal(mfaSession.session.status, "MFA Required");

    const labeledSession = await postJson(`/api/sessions/${renewedSession.session.id}/device`, {
      label: "Automated workstation"
    }, nationalToken);
    assert.equal(labeledSession.session.deviceLabel, "Automated workstation");

    const notedSession = await postJson(`/api/sessions/${renewedSession.session.id}/note`, {
      note: "Automated session note"
    }, nationalToken);
    assert.equal(notedSession.session.notes.some((note) => note.includes("Automated session note")), true);

    const sessionDigest = await getJson("/api/sessions/digest", nationalToken);
    assert.equal(sessionDigest.trusted >= 1, true);
    assert.equal(sessionDigest.mfaRequired >= 1, true);
    assert.equal(sessionDigest.labeled >= 1, true);

    const localSessionIdsBeforeSpare = new Set(
      privateSessions.stations.filter((session) => session.email === "local_branch_017@rmvi.org").map((session) => session.id)
    );
    const spareLocalLogin = await postJson("/api/auth/login", {
      email: "local_branch_017@rmvi.org",
      password: demoPassword("local")
    });
    const sessionsWithSpareLocal = await getJson("/api/sessions", nationalToken);
    const spareLocalSession = sessionsWithSpareLocal.stations.find((session) => (
      session.email === spareLocalLogin.station.email && !localSessionIdsBeforeSpare.has(session.id)
    ));
    assert.equal(Boolean(spareLocalSession?.id), true);

    const revokedLocalSession = await postJson(`/api/sessions/${spareLocalSession.id}/revoke`, {}, nationalToken);
    assert.equal(revokedLocalSession.revoked, spareLocalSession.id);
    assert.equal(revokedLocalSession.sessions.active, 6);

    const bulkSessionLogin = await postJson("/api/auth/login", {
      email: "district_admin@rmvi.org",
      password: demoPassword("district")
    });
    const sessionsWithBulkLogin = await getJson("/api/sessions", nationalToken);
    const bulkSession = sessionsWithBulkLogin.stations.find((session) => session.email === bulkSessionLogin.station.email);
    assert.equal(Boolean(bulkSession?.id), true);
    const bulkRevokedSessions = await postJson("/api/sessions/bulk/revoke", {
      ids: [bulkSession.id]
    }, nationalToken);
    assert.equal(bulkRevokedSessions.revoked, 1);

    const extraLogin = await postJson("/api/auth/login", {
      email: "np@rmvi.org",
      password: demoPassword("national")
    });
    assert.match(extraLogin.token, /^gcos\./);

    const revokedStationSessions = await postJson("/api/sessions/station/revoke", {
      email: "np@rmvi.org"
    }, nationalToken);
    assert.equal(revokedStationSessions.revoked >= 1, true);

    const adminLogin = await postJson("/api/auth/login", {
      email: "admin@rmvi.org",
      password: demoPassword("admin")
    });
    assert.equal(adminLogin.station.email, "admin@rmvi.org");
    assert.equal(adminLogin.station.level, "International HQ");
    assert.equal(adminLogin.permissions.canOverride, true);

    const commandBriefing = await getJson("/api/command-center/briefing");
    assert.equal(commandBriefing.title, "Executive command briefing");
    assert.equal(commandBriefing.riskScore > 0, true);
    assert.equal(commandBriefing.priorities.length, 4);

    const archivedCommandBriefing = await postJson("/api/command-center/briefing/archive", {
      title: "Automated command briefing"
    }, nationalToken);
    assert.equal(archivedCommandBriefing.document.classification, "Command briefing");
    assert.equal(archivedCommandBriefing.briefing.title, "Automated command briefing");

    const commandDirective = await postJson("/api/command-center/directive", {
      subject: "Automated command directive",
      files: "Command packet"
    }, nationalToken);
    assert.equal(commandDirective.kind, "Directive");
    assert.equal(commandDirective.subject, "Automated command directive");

    const commandTask = await postJson("/api/command-center/task", {
      title: "Automated command task",
      assignee: "np@rmvi.org",
      priority: "High",
      due: "Today"
    }, nationalToken);
    assert.equal(commandTask.title, "Automated command task");
    assert.equal(commandTask.status, "In Progress");

    const commandEscalation = await postJson("/api/command-center/escalation", {
      item: "Automated command escalation",
      reason: "Automated command risk",
      owner: "np@rmvi.org",
      severity: "High"
    }, nationalToken);
    assert.equal(commandEscalation.source, "Control Center");
    assert.equal(commandEscalation.item, "Automated command escalation");

    const denied = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "np@rmvi.org", password: "wrong" })
    });
    assert.equal(denied.status, 401);

    const invalidLogin = await rawPost("/api/auth/login", {
      email: "not-an-email",
      password: demoPassword("national")
    });
    assert.equal(invalidLogin.status, 400);

    let throttledLoginStatus = 0;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      const throttledLogin = await rawPost("/api/auth/login", {
        email: "rate_limit_probe@rmvi.org",
        password: "wrong-password"
      });
      throttledLoginStatus = throttledLogin.status;
    }
    assert.equal(throttledLoginStatus, 429);

    const missingToken = await rawPost("/api/messages", {
      kind: "Notification",
      subject: "Missing token test",
      from: "np@rmvi.org",
      status: "Ready",
      files: "none"
    });
    assert.equal(missingToken.status, 401);

    const missingExportToken = await fetch(`${BASE_URL}/api/export`);
    assert.equal(missingExportToken.status, 401);

    const invalidMessage = await rawPost("/api/messages", {
      kind: "Memo",
      subject: "Invalid kind",
      from: "np@rmvi.org"
    }, nationalToken);
    assert.equal(invalidMessage.status, 400);

    const createdMessage = await postJson("/api/messages", {
      kind: "Notification",
      subject: "Automated API test notice",
      from: "np@rmvi.org",
      status: "Ready",
      files: "none"
    }, nationalToken);
    assert.equal(createdMessage.subject, "Automated API test notice");

    const reviewedMessage = await postJson(`/api/messages/${createdMessage.id}/status`, {
      status: "In Review"
    }, nationalToken);
    assert.equal(reviewedMessage.status, "In Review");

    const classifiedMessage = await postJson(`/api/messages/${createdMessage.id}/classify`, {
      kind: "Directive"
    }, nationalToken);
    assert.equal(classifiedMessage.kind, "Directive");

    const routedMessage = await postJson(`/api/messages/${createdMessage.id}/route`, {
      route: "National -> Regional -> Archive"
    }, nationalToken);
    assert.equal(routedMessage.route, "National -> Regional -> Archive");

    const priorityMessage = await postJson(`/api/messages/${createdMessage.id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityMessage.priority, "Critical");

    const escalatedMessage = await postJson(`/api/messages/${createdMessage.id}/escalate`, {
      reason: "Automated message escalation"
    }, nationalToken);
    assert.equal(escalatedMessage.status, "Escalated");
    assert.equal(escalatedMessage.priority, "Critical");

    const approvedMessage = await postJson(`/api/messages/${createdMessage.id}/approve`, {}, nationalToken);
    assert.equal(approvedMessage.status, "Approved");

    const archivedMessage = await postJson(`/api/messages/${createdMessage.id}/archive`, {
      reason: "Automated message archive"
    }, nationalToken);
    assert.equal(archivedMessage.archived, true);

    const watchedMessage = await postJson(`/api/messages/${createdMessage.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedMessage.watchers.includes("np@rmvi.org"), true);

    const duplicatedMessage = await postJson(`/api/messages/${createdMessage.id}/duplicate`, {
      subject: "Automated duplicated ChurchMail notice"
    }, nationalToken);
    assert.equal(duplicatedMessage.subject, "Automated duplicated ChurchMail notice");
    assert.equal(duplicatedMessage.status, "Queued");

    const bulkApprovedMessages = await postJson("/api/messages/bulk/approve", {
      ids: [duplicatedMessage.id]
    }, nationalToken);
    assert.equal(bulkApprovedMessages.count, 1);
    assert.equal(bulkApprovedMessages.updated[0].status, "Approved");

    const messageDigest = await getJson("/api/messages/digest", nationalToken);
    assert.equal(messageDigest.total > 0, true);
    assert.equal(messageDigest.approved >= 1, true);
    assert.equal(messageDigest.watched >= 1, true);

    const snapshot = await getJson("/api/export", nationalToken);
    assert.equal(snapshot.exportedBy, "np@rmvi.org");
    assert.equal(snapshot.service, "gcos-api");
    assert.equal(snapshot.counts.messages > 0, true);
    assert.equal(snapshot.state.messages.some((item) => item.subject === "Automated API test notice"), true);

    const reports = await getJson("/api/reports");
    const invalidReport = await rawPost("/api/reports", {
      owner: "National Programs",
      path: "National -> Regional"
    }, nationalToken);
    assert.equal(invalidReport.status, 400);

    const createdReport = await postJson("/api/reports", {
      name: "Automated mission finance report",
      owner: "National Programs",
      path: "National -> Regional",
      due: "Draft",
      type: "Financial",
      period: "May 2026",
      routingStage: "Drafting",
      evidenceStatus: "Evidence pending",
      templateId: "tpl-weekly-financial-report",
      preparedBy: "np@rmvi.org",
      attestation: "Automated preparer attestation",
      approvalLimit: "Treasurer and pastor sign-off",
      templateChecklist: ["Opening balance", "Weekly income"],
      reportFields: {
        "Executive summary": "Automated report field summary",
        "Weekly income": "$500"
      }
    }, nationalToken);
    assert.equal(createdReport.name, "Automated mission finance report");
    assert.equal(createdReport.state, "Ready");
    assert.equal(createdReport.type, "Financial");
    assert.equal(createdReport.period, "May 2026");
    assert.equal(createdReport.templateId, "tpl-weekly-financial-report");
    assert.equal(createdReport.preparedBy, "np@rmvi.org");
    assert.equal(createdReport.reportFields["Weekly income"], "$500");

    const detailedReport = await postJson(`/api/reports/${createdReport.id}/details`, {
      preparedBy: "finance@rmvi.org",
      attestation: "Finance desk reviewed and saved this report",
      approvalLimit: "District finance approval",
      templateChecklist: ["Opening balance", "Weekly income", "Closing balance"],
      reportFields: {
        "Executive summary": "Updated saved detail workspace",
        "Weekly income": "$750",
        "Closing balance": "$1,250"
      }
    }, nationalToken);
    assert.equal(detailedReport.preparedBy, "finance@rmvi.org");
    assert.equal(detailedReport.attestation, "Finance desk reviewed and saved this report");
    assert.equal(detailedReport.reportFields["Weekly income"], "$750");
    assert.equal(detailedReport.routingStage, "Report details updated");

    const submittedReport = await postJson(`/api/reports/${reports[0].id}/submit`, {}, nationalToken);
    assert.equal(submittedReport.state, "Approved");
    assert.equal(submittedReport.score, 100);
    assert.equal(submittedReport.routingStage, "Archived upward");
    assert.equal(submittedReport.approvedBy, "np@rmvi.org");

    const correctionReport = await postJson(`/api/reports/${reports[1].id}/correction`, {
      reason: "Supporting documents need revision"
    }, nationalToken);
    assert.equal(correctionReport.state, "Correction Requested");
    assert.equal(correctionReport.score <= 45, true);
    assert.equal(correctionReport.routingStage, "Correction cycle");
    assert.equal(correctionReport.correctionReason, "Supporting documents need revision");

    const scoredReport = await postJson(`/api/reports/${reports[1].id}/score`, {
      score: 78,
      state: "In Review"
    }, nationalToken);
    assert.equal(scoredReport.score, 78);
    assert.equal(scoredReport.state, "In Review");

    const dueReport = await postJson(`/api/reports/${reports[1].id}/due`, {
      due: "Overdue"
    }, nationalToken);
    assert.equal(dueReport.due, "Overdue");

    const ownerReport = await postJson(`/api/reports/${reports[1].id}/owner`, {
      owner: "National Reporting Desk"
    }, nationalToken);
    assert.equal(ownerReport.owner, "National Reporting Desk");

    const pathReport = await postJson(`/api/reports/${reports[1].id}/path`, {
      path: "Local -> District -> National -> Archive"
    }, nationalToken);
    assert.equal(pathReport.path, "Local -> District -> National -> Archive");
    assert.equal(pathReport.routingStage, "Route recalculated");

    const evidenceReport = await postJson(`/api/reports/${reports[1].id}/evidence`, {
      evidenceStatus: "Evidence attached"
    }, nationalToken);
    assert.equal(evidenceReport.evidenceStatus, "Evidence attached");
    assert.equal(evidenceReport.score >= 70, true);
    assert.equal(evidenceReport.routingStage, "Evidence review");

    const reviewReport = await postJson(`/api/reports/${reports[1].id}/review`, {
      note: "Automated supervisory review"
    }, nationalToken);
    assert.equal(reviewReport.state, "In Review");
    assert.equal(reviewReport.routingStage, "Supervisory review");

    const verifiedReport = await postJson(`/api/reports/${reports[1].id}/verify`, {
      state: "Approved"
    }, nationalToken);
    assert.equal(verifiedReport.verified, true);
    assert.equal(verifiedReport.state, "Approved");
    assert.equal(verifiedReport.evidenceStatus, "Evidence verified");

    const watchedReport = await postJson(`/api/reports/${reports[1].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedReport.watchers.includes("np@rmvi.org"), true);

    const duplicatedReport = await postJson(`/api/reports/${reports[1].id}/duplicate`, {
      name: "Automated duplicate report follow-up"
    }, nationalToken);
    assert.equal(duplicatedReport.name, "Automated duplicate report follow-up");
    assert.equal(duplicatedReport.state, "Ready");

    const archivedReport = await postJson(`/api/reports/${reports[1].id}/archive`, {
      reason: "Automated report archive"
    }, nationalToken);
    assert.equal(archivedReport.archived, true);

    const reportDigest = await getJson("/api/reports/digest", nationalToken);
    assert.equal(reportDigest.total > 0, true);
    assert.equal(reportDigest.verified >= 1, true);
    assert.equal(reportDigest.watched >= 1, true);
    assert.equal(reportDigest.evidenceReady >= 1, true);
    assert.equal(reportDigest.submitted >= 1, true);
    assert.equal(reportDigest.types.Financial >= 1, true);

    const packetReport = await postJson("/api/reports", {
      name: "Automated bundled governance report",
      path: "Local -> District -> National",
      owner: "Workflow Test",
      due: "Overdue",
      type: "Audit",
      period: "May 2026"
    }, nationalToken);
    const governancePacket = await postJson(`/api/reports/${packetReport.id}/packet`, {
      approvalRequest: "Automated bundled governance approval",
      route: "District -> National -> Archive",
      limit: "Delegated packet approval",
      escalate: true
    }, nationalToken);
    assert.equal(governancePacket.report.routingStage, "Governance packet assembled");
    assert.equal(governancePacket.report.evidenceStatus, "Evidence packet bundled");
    assert.equal(governancePacket.approval.linkedReport, packetReport.id);
    assert.equal(governancePacket.document.linkedReport, packetReport.id);
    assert.equal(governancePacket.document.linkedApproval, governancePacket.approval.id);
    assert.equal(governancePacket.escalation.linkedApproval, governancePacket.approval.id);

    const bulkReport = await postJson("/api/reports", {
      name: "Automated bulk workflow report",
      path: "Local -> National",
      owner: "Workflow Test",
      due: "Today"
    }, nationalToken);
    const bulkSubmittedReports = await postJson("/api/reports/bulk/submit", {
      ids: [bulkReport.id]
    }, nationalToken);
    assert.equal(bulkSubmittedReports.count, 1);
    assert.equal(bulkSubmittedReports.updated[0].state, "Approved");

    const correctionBulkReport = await postJson("/api/reports", {
      name: "Automated bulk correction report",
      path: "Local -> District",
      owner: "Workflow Test",
      due: "Overdue"
    }, nationalToken);
    const bulkCorrectedReports = await postJson("/api/reports/bulk/correction", {
      ids: [correctionBulkReport.id],
      reason: "Automated bulk correction test"
    }, nationalToken);
    assert.equal(bulkCorrectedReports.count, 1);
    assert.equal(bulkCorrectedReports.updated[0].state, "Correction Requested");

    const approvals = await getJson("/api/approvals");
    const invalidCreatedApproval = await rawPost("/api/approvals", {
      route: "National -> Regional",
      limit: "$1,200"
    }, nationalToken);
    assert.equal(invalidCreatedApproval.status, 400);

    const createdApproval = await postJson("/api/approvals", {
      request: "Automated approval creation test",
      route: "National -> Regional",
      limit: "$1,200"
    }, nationalToken);
    assert.equal(createdApproval.request, "Automated approval creation test");
    assert.equal(createdApproval.state, "Validation");

    const bulkApproval = await postJson("/api/approvals", {
      request: "Automated bulk approval test",
      route: "National -> Executive",
      limit: "$9,100"
    }, nationalToken);
    const bulkApproved = await postJson("/api/approvals/bulk/approve", {
      ids: [bulkApproval.id]
    }, nationalToken);
    assert.equal(bulkApproved.count, 1);
    assert.equal(bulkApproved.updated[0].state, "Approved");

    const bulkRejectApproval = await postJson("/api/approvals", {
      request: "Automated bulk reject test",
      route: "District -> National",
      limit: "$700"
    }, nationalToken);
    const bulkRejected = await postJson("/api/approvals/bulk/reject", {
      ids: [bulkRejectApproval.id],
      reason: "Automated bulk rejection test"
    }, nationalToken);
    assert.equal(bulkRejected.count, 1);
    assert.equal(bulkRejected.updated[0].state, "Rejected");

    const workflowDigest = await getJson("/api/workflows/digest");
    assert.equal(workflowDigest.reportsOpen >= 0, true);
    assert.equal(workflowDigest.approvalsOpen >= 0, true);

    const forbiddenApproval = await rawPost(`/api/approvals/${approvals[0].id}/approve`, {}, localToken);
    assert.equal(forbiddenApproval.status, 403);

    const approvedRequest = await postJson(`/api/approvals/${approvals[0].id}/approve`, {}, nationalToken);
    assert.equal(approvedRequest.state, "Approved");
    assert.equal(approvedRequest.signatures, "complete");

    const signedRequest = await postJson(`/api/approvals/${createdApproval.id}/sign`, {}, nationalToken);
    assert.equal(signedRequest.state, "Signature");
    assert.equal(signedRequest.signatures, "1/2");

    const routedRequest = await postJson(`/api/approvals/${createdApproval.id}/route`, {
      route: "National -> Executive Review",
      state: "Validation"
    }, nationalToken);
    assert.equal(routedRequest.route, "National -> Executive Review");
    assert.equal(routedRequest.state, "Validation");

    const limitedApproval = await postJson(`/api/approvals/${createdApproval.id}/limit`, {
      limit: "$25,000"
    }, nationalToken);
    assert.equal(limitedApproval.limit, "$25,000");

    const delegatedApproval = await postJson(`/api/approvals/${createdApproval.id}/delegate`, {
      delegate: "np@rmvi.org"
    }, nationalToken);
    assert.equal(delegatedApproval.delegate, "np@rmvi.org");
    assert.equal(delegatedApproval.state, "Delegated");

    const heldApproval = await postJson(`/api/approvals/${createdApproval.id}/hold`, {
      reason: "Automated authority review"
    }, nationalToken);
    assert.equal(heldApproval.state, "On Hold");
    assert.equal(heldApproval.holdReason, "Automated authority review");

    const releasedApproval = await postJson(`/api/approvals/${createdApproval.id}/release`, {
      state: "Validation"
    }, nationalToken);
    assert.equal(releasedApproval.state, "Validation");

    const executedApproval = await postJson(`/api/approvals/${createdApproval.id}/execute`, {
      status: "Executed"
    }, nationalToken);
    assert.equal(executedApproval.approval.executionStatus, "Executed");
    assert.equal(executedApproval.approval.executedBy, "np@rmvi.org");
    assert.equal(executedApproval.document.linkedApproval, createdApproval.id);
    assert.equal(executedApproval.document.classification, "Approval authorization");

    const watchedApproval = await postJson(`/api/approvals/${createdApproval.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedApproval.watchers.includes("np@rmvi.org"), true);

    const duplicatedApproval = await postJson(`/api/approvals/${createdApproval.id}/duplicate`, {
      request: "Automated duplicated approval follow-up"
    }, nationalToken);
    assert.equal(duplicatedApproval.request, "Automated duplicated approval follow-up");
    assert.equal(duplicatedApproval.state, "Validation");

    const archivedApproval = await postJson(`/api/approvals/${createdApproval.id}/archive`, {
      reason: "Automated approval archive"
    }, nationalToken);
    assert.equal(archivedApproval.archived, true);

    const bulkSigned = await postJson("/api/approvals/bulk/sign", {
      ids: [duplicatedApproval.id],
      signatures: "1/2"
    }, nationalToken);
    assert.equal(bulkSigned.count, 1);
    assert.equal(bulkSigned.updated[0].state, "Signature");

    const approvalDigest = await getJson("/api/approvals/digest", nationalToken);
    assert.equal(approvalDigest.total > 0, true);
    assert.equal(approvalDigest.watched >= 1, true);
    assert.equal(approvalDigest.archived >= 1, true);
    assert.equal(approvalDigest.executed >= 1, true);

    const rejectedRequest = await postJson(`/api/approvals/${approvals[1].id}/reject`, {
      reason: "Authority documentation incomplete"
    }, nationalToken);
    assert.equal(rejectedRequest.state, "Rejected");
    assert.equal(rejectedRequest.signatures, "closed");

    const tasks = await getJson("/api/tasks");
    const invalidTask = await rawPost("/api/tasks", {
      owner: "National Programs",
      assignee: "District Desk"
    }, nationalToken);
    assert.equal(invalidTask.status, 400);

    const createdTask = await postJson("/api/tasks", {
      title: "Automated task creation test",
      owner: "National Programs",
      assignee: "District Desk",
      priority: "High",
      due: "Today"
    }, nationalToken);
    assert.equal(createdTask.title, "Automated task creation test");
    assert.equal(createdTask.status, "Queued");

    const advancedTask = await postJson(`/api/tasks/${tasks[0].id}/advance`, {
      status: "Complete"
    }, nationalToken);
    assert.equal(advancedTask.status, "Complete");

    const assignedTask = await postJson(`/api/tasks/${tasks[1].id}/assignee`, {
      assignee: "np@rmvi.org"
    }, nationalToken);
    assert.equal(assignedTask.assignee, "np@rmvi.org");

    const priorityTask = await postJson(`/api/tasks/${tasks[1].id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityTask.priority, "Critical");

    const dueTask = await postJson(`/api/tasks/${tasks[1].id}/due`, {
      due: "Overdue"
    }, nationalToken);
    assert.equal(dueTask.due, "Overdue");

    const ownerTask = await postJson(`/api/tasks/${tasks[1].id}/owner`, {
      owner: "National Presidency Workstation"
    }, nationalToken);
    assert.equal(ownerTask.owner, "National Presidency Workstation");

    const blockedTask = await postJson(`/api/tasks/${tasks[1].id}/block`, {
      reason: "Awaiting supporting evidence"
    }, nationalToken);
    assert.equal(blockedTask.status, "Blocked");
    assert.equal(blockedTask.blocker, "Awaiting supporting evidence");

    const unblockedTask = await postJson(`/api/tasks/${tasks[1].id}/unblock`, {
      reason: "Evidence received"
    }, nationalToken);
    assert.equal(unblockedTask.status, "In Progress");

    const watchedTask = await postJson(`/api/tasks/${tasks[1].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedTask.watchers.includes("np@rmvi.org"), true);

    const dependentTask = await postJson(`/api/tasks/${tasks[1].id}/dependency`, {
      dependency: "Automated dependency test"
    }, nationalToken);
    assert.equal(dependentTask.dependencies.includes("Automated dependency test"), true);

    const approvalTask = await postJson(`/api/tasks/${tasks[1].id}/approval`, {
      route: "National -> Executive"
    }, nationalToken);
    assert.equal(approvalTask.approvalRequired, true);
    assert.equal(approvalTask.approvalRoute, "National -> Executive");

    const slaTask = await postJson(`/api/tasks/${tasks[1].id}/sla`, {
      sla: "12h",
      status: "Breached"
    }, nationalToken);
    assert.equal(slaTask.sla, "12h");
    assert.equal(slaTask.slaStatus, "Breached");

    const evidencedTask = await postJson(`/api/tasks/${tasks[1].id}/evidence`, {
      evidence: "Automated task evidence"
    }, nationalToken);
    assert.equal(evidencedTask.evidence, "Automated task evidence");

    const handedOffTask = await postJson(`/api/tasks/${tasks[1].id}/handoff`, {
      to: "district_admin@rmvi.org",
      note: "Automated handoff"
    }, nationalToken);
    assert.equal(handedOffTask.assignee, "district_admin@rmvi.org");

    const escalatedTask = await postJson(`/api/tasks/${tasks[1].id}/escalate`, {
      reason: "Automated task escalation",
      priority: "Critical"
    }, nationalToken);
    assert.equal(escalatedTask.escalated, true);
    assert.equal(escalatedTask.priority, "Critical");

    const commentedTask = await postJson(`/api/tasks/${tasks[1].id}/comment`, {
      comment: "Automated task comment"
    }, nationalToken);
    assert.equal(commentedTask.comments.some((comment) => comment.includes("Automated task comment")), true);

    const checkpointTask = await postJson(`/api/tasks/${tasks[1].id}/checkpoint`, {
      checkpoint: "Automated checkpoint"
    }, nationalToken);
    assert.equal(checkpointTask.checkpoints.includes("Automated checkpoint"), true);

    const scheduledTask = await postJson(`/api/tasks/${tasks[1].id}/schedule`, {
      scheduledFor: "Tomorrow",
      due: "Tomorrow"
    }, nationalToken);
    assert.equal(scheduledTask.scheduledFor, "Tomorrow");
    assert.equal(scheduledTask.due, "Tomorrow");

    const dispatchedTask = await postJson(`/api/tasks/${tasks[1].id}/dispatch`, {
      team: "Field team",
      location: "Buchanan"
    }, nationalToken);
    assert.equal(dispatchedTask.dispatchTeam, "Field team");
    assert.equal(dispatchedTask.dispatchLocation, "Buchanan");

    const timedTask = await postJson(`/api/tasks/${tasks[1].id}/time`, {
      hours: 2
    }, nationalToken);
    assert.equal(timedTask.timeHours, 2);

    const qaTask = await postJson(`/api/tasks/${tasks[1].id}/qa`, {
      status: "Passed",
      reviewer: "np@rmvi.org"
    }, nationalToken);
    assert.equal(qaTask.qaStatus, "Passed");
    assert.equal(qaTask.qaReviewer, "np@rmvi.org");

    const riskTask = await postJson(`/api/tasks/${tasks[1].id}/risk`, {
      reason: "Accepted risk"
    }, nationalToken);
    assert.equal(riskTask.riskAccepted, true);
    assert.equal(riskTask.riskReason, "Accepted risk");

    const templatedTask = await postJson(`/api/tasks/${tasks[1].id}/template`, {
      templateName: "Automated task template"
    }, nationalToken);
    assert.equal(templatedTask.templateSaved, true);
    assert.equal(templatedTask.templateName, "Automated task template");

    const reportLinkedTask = await postJson(`/api/tasks/${tasks[1].id}/report`, {
      reportId: "rep-test"
    }, nationalToken);
    assert.equal(reportLinkedTask.linkedReport, "rep-test");

    const approvalLinkedTask = await postJson(`/api/tasks/${tasks[1].id}/approval-link`, {
      approvalId: "app-test"
    }, nationalToken);
    assert.equal(approvalLinkedTask.linkedApproval, "app-test");

    const duplicatedTask = await postJson(`/api/tasks/${tasks[1].id}/duplicate`, {
      title: "Automated duplicate task follow-up"
    }, nationalToken);
    assert.equal(duplicatedTask.title, "Automated duplicate task follow-up");
    assert.equal(duplicatedTask.status, "Queued");

    const bulkCompletedTasks = await postJson("/api/tasks/bulk/complete", {
      ids: [createdTask.id]
    }, nationalToken);
    assert.equal(bulkCompletedTasks.count, 1);
    assert.equal(bulkCompletedTasks.updated[0].status, "Complete");

    const bulkEscalatedTasks = await postJson("/api/tasks/bulk/escalate", {
      ids: [duplicatedTask.id],
      reason: "Automated bulk task escalation"
    }, nationalToken);
    assert.equal(bulkEscalatedTasks.count, 1);
    assert.equal(bulkEscalatedTasks.updated[0].escalated, true);

    const bulkScheduledTasks = await postJson("/api/tasks/bulk/schedule", {
      ids: [duplicatedTask.id],
      scheduledFor: "This week"
    }, nationalToken);
    assert.equal(bulkScheduledTasks.count, 1);
    assert.equal(bulkScheduledTasks.updated[0].scheduledFor, "This week");

    const archivedTask = await postJson(`/api/tasks/${createdTask.id}/archive`, {
      reason: "Automated task archive"
    }, nationalToken);
    assert.equal(archivedTask.archived, true);
    assert.equal(archivedTask.archiveReason, "Automated task archive");

    const taskDigest = await getJson("/api/tasks/digest", nationalToken);
    assert.equal(taskDigest.total > 0, true);
    assert.equal(taskDigest.watched >= 1, true);
    assert.equal(taskDigest.escalated >= 1, true);
    assert.equal(taskDigest.dependencies >= 1, true);
    assert.equal(taskDigest.approvals >= 1, true);
    assert.equal(taskDigest.evidence >= 1, true);
    assert.equal(taskDigest.slaBreaches >= 1, true);
    assert.equal(taskDigest.scheduled >= 1, true);
    assert.equal(taskDigest.dispatched >= 1, true);
    assert.equal(taskDigest.qaPassed >= 1, true);
    assert.equal(taskDigest.riskAccepted >= 1, true);
    assert.equal(taskDigest.templates >= 1, true);
    assert.equal(taskDigest.linked >= 1, true);
    assert.equal(taskDigest.archived >= 1, true);

    const policies = await getJson("/api/policies");
    const invalidPolicy = await rawPost("/api/policies", {
      category: "Finance",
      summary: "Missing title"
    }, nationalToken);
    assert.equal(invalidPolicy.status, 400);

    const forbiddenPolicy = await rawPost("/api/policies", {
      title: "Forbidden local policy",
      category: "Local",
      summary: "Local branch should not publish global policy"
    }, localToken);
    assert.equal(forbiddenPolicy.status, 403);

    const createdPolicy = await postJson("/api/policies", {
      title: "Automated policy registry test",
      category: "Compliance",
      owner: "National Programs",
      status: "Active",
      summary: "Automated test policy for governance registry."
    }, nationalToken);
    assert.equal(createdPolicy.title, "Automated policy registry test");
    assert.equal(createdPolicy.acknowledgements, 0);

    const acknowledgedPolicy = await postJson(`/api/policies/${policies[0].id}/acknowledge`, {}, localToken);
    assert.equal(acknowledgedPolicy.acknowledgements > 0, true);

    const statusPolicy = await postJson(`/api/policies/${policies[0].id}/status`, {
      status: "Review"
    }, nationalToken);
    assert.equal(statusPolicy.status, "Review");

    const retiredPolicy = await postJson(`/api/policies/${policies[1].id}/retire`, {
      reason: "Replaced by updated transfer policy"
    }, nationalToken);
    assert.equal(retiredPolicy.status, "Retired");

    const ownerPolicy = await postJson(`/api/policies/${policies[0].id}/owner`, {
      owner: "National Policy Desk"
    }, nationalToken);
    assert.equal(ownerPolicy.owner, "National Policy Desk");

    const categoryPolicy = await postJson(`/api/policies/${policies[0].id}/category`, {
      category: "Governance"
    }, nationalToken);
    assert.equal(categoryPolicy.category, "Governance");

    const summaryPolicy = await postJson(`/api/policies/${policies[0].id}/summary`, {
      summary: "Automated updated policy summary."
    }, nationalToken);
    assert.equal(summaryPolicy.summary, "Automated updated policy summary.");

    const versionPolicy = await postJson(`/api/policies/${policies[0].id}/version`, {
      version: "v2",
      status: "Review"
    }, nationalToken);
    assert.equal(versionPolicy.version, "v2");
    assert.equal(versionPolicy.status, "Review");

    const reviewPolicy = await postJson(`/api/policies/${policies[0].id}/review`, {
      reviewBy: "2026-06-30"
    }, nationalToken);
    assert.equal(reviewPolicy.reviewBy, "2026-06-30");
    assert.equal(reviewPolicy.status, "Review");

    const watchedPolicy = await postJson(`/api/policies/${policies[0].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedPolicy.watchers.includes("np@rmvi.org"), true);

    const compliancePolicy = await postJson(`/api/policies/${policies[0].id}/compliance`, {
      status: "Compliant",
      score: 100
    }, nationalToken);
    assert.equal(compliancePolicy.complianceStatus, "Compliant");
    assert.equal(compliancePolicy.complianceScore, 100);

    const evidencePolicy = await postJson(`/api/policies/${policies[0].id}/evidence`, {
      evidence: "Automated policy evidence"
    }, nationalToken);
    assert.equal(evidencePolicy.evidence, "Automated policy evidence");

    const distributedPolicy = await postJson(`/api/policies/${policies[0].id}/distribute`, {
      audience: "All stations"
    }, nationalToken);
    assert.equal(distributedPolicy.distributedTo, "All stations");

    const exceptionPolicy = await postJson(`/api/policies/${policies[0].id}/exception`, {
      reason: "Automated exception",
      expires: "2026-06-30"
    }, nationalToken);
    assert.equal(exceptionPolicy.exceptionNote, "Automated exception");
    assert.equal(exceptionPolicy.exceptionExpires, "2026-06-30");

    const trainingPolicy = await postJson(`/api/policies/${policies[0].id}/training`, {
      audience: "Station administrators"
    }, nationalToken);
    assert.equal(trainingPolicy.trainingAssigned, true);
    assert.equal(trainingPolicy.trainingAudience, "Station administrators");

    const heldPolicy = await postJson(`/api/policies/${policies[0].id}/hold`, {
      reason: "Automated legal hold"
    }, nationalToken);
    assert.equal(heldPolicy.hold, true);
    assert.equal(heldPolicy.holdReason, "Automated legal hold");

    const taskLinkedPolicy = await postJson(`/api/policies/${policies[0].id}/task`, {
      taskId: "tsk-test"
    }, nationalToken);
    assert.equal(taskLinkedPolicy.linkedTask, "tsk-test");

    const approvalLinkedPolicy = await postJson(`/api/policies/${policies[0].id}/approval-link`, {
      approvalId: "app-test"
    }, nationalToken);
    assert.equal(approvalLinkedPolicy.linkedApproval, "app-test");

    const duplicatedPolicy = await postJson(`/api/policies/${policies[0].id}/duplicate`, {
      title: "Automated duplicate policy revision"
    }, nationalToken);
    assert.equal(duplicatedPolicy.title, "Automated duplicate policy revision");
    assert.equal(duplicatedPolicy.status, "Draft");

    const bulkActivatedPolicies = await postJson("/api/policies/bulk/activate", {
      ids: [duplicatedPolicy.id]
    }, nationalToken);
    assert.equal(bulkActivatedPolicies.count, 1);
    assert.equal(bulkActivatedPolicies.updated[0].status, "Active");

    const bulkReviewedPolicies = await postJson("/api/policies/bulk/review", {
      ids: [policies[2].id],
      reviewBy: "2026-07-15"
    }, nationalToken);
    assert.equal(bulkReviewedPolicies.count, 1);
    assert.equal(bulkReviewedPolicies.updated[0].status, "Review");
    assert.equal(bulkReviewedPolicies.updated[0].reviewBy, "2026-07-15");

    const archivedPolicy = await postJson(`/api/policies/${createdPolicy.id}/archive`, {
      reason: "Automated policy archive"
    }, nationalToken);
    assert.equal(archivedPolicy.archived, true);
    assert.equal(archivedPolicy.archiveReason, "Automated policy archive");

    const policyDigest = await getJson("/api/policies/digest", nationalToken);
    assert.equal(policyDigest.total > 0, true);
    assert.equal(policyDigest.active >= 1, true);
    assert.equal(policyDigest.watched >= 1, true);
    assert.equal(policyDigest.compliant >= 1, true);
    assert.equal(policyDigest.evidence >= 1, true);
    assert.equal(policyDigest.distributed >= 1, true);
    assert.equal(policyDigest.exceptions >= 1, true);
    assert.equal(policyDigest.training >= 1, true);
    assert.equal(policyDigest.holds >= 1, true);
    assert.equal(policyDigest.linked >= 1, true);
    assert.equal(policyDigest.archived >= 1, true);

    const calendarEvents = await getJson("/api/calendar-events");
    const invalidCalendarEvent = await rawPost("/api/calendar-events", {
      category: "Audit",
      date: "2026-05-30"
    }, nationalToken);
    assert.equal(invalidCalendarEvent.status, 400);

    const createdCalendarEvent = await postJson("/api/calendar-events", {
      title: "Automated calendar event test",
      category: "Audit",
      owner: "National Programs",
      date: "2026-05-30",
      priority: "High"
    }, nationalToken);
    assert.equal(createdCalendarEvent.title, "Automated calendar event test");
    assert.equal(createdCalendarEvent.status, "Scheduled");

    const completedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[0].id}/complete`, {}, nationalToken);
    assert.equal(completedCalendarEvent.status, "Complete");

    const datedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/date`, {
      date: "2026-06-01"
    }, nationalToken);
    assert.equal(datedCalendarEvent.date, "2026-06-01");

    const priorityCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/priority`, {
      priority: "Critical"
    }, nationalToken);
    assert.equal(priorityCalendarEvent.priority, "Critical");

    const atRiskCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/risk`, {
      reason: "Deadline requires attention"
    }, nationalToken);
    assert.equal(atRiskCalendarEvent.status, "At Risk");

    const ownerCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/owner`, {
      owner: "National Calendar Desk"
    }, nationalToken);
    assert.equal(ownerCalendarEvent.owner, "National Calendar Desk");

    const categoryCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/category`, {
      category: "Governance"
    }, nationalToken);
    assert.equal(categoryCalendarEvent.category, "Governance");

    const rescheduledCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/reschedule`, {
      date: "2026-06-07"
    }, nationalToken);
    assert.equal(rescheduledCalendarEvent.date, "2026-06-07");
    assert.equal(rescheduledCalendarEvent.status, "Scheduled");

    const watchedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedCalendarEvent.watchers.includes("np@rmvi.org"), true);

    const checkedInCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/check-in`, {
      status: "Checked in",
      by: "np@rmvi.org"
    }, nationalToken);
    assert.equal(checkedInCalendarEvent.checkInStatus, "Checked in");
    assert.equal(checkedInCalendarEvent.checkInBy, "np@rmvi.org");

    const venueCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/venue`, {
      venue: "Main governance hall"
    }, nationalToken);
    assert.equal(venueCalendarEvent.venue, "Main governance hall");

    const agendaCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/agenda`, {
      agenda: "Automated governance agenda"
    }, nationalToken);
    assert.equal(agendaCalendarEvent.agenda, "Automated governance agenda");

    const attendanceCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/attendance`, {
      count: 24
    }, nationalToken);
    assert.equal(attendanceCalendarEvent.attendance, 24);

    const reminderCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/reminder`, {
      audience: "All participants"
    }, nationalToken);
    assert.equal(reminderCalendarEvent.reminderSent, true);
    assert.equal(reminderCalendarEvent.reminderAudience, "All participants");

    const readinessCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/readiness`, {
      status: "Ready"
    }, nationalToken);
    assert.equal(readinessCalendarEvent.readiness, "Ready");

    const taskLinkedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/task`, {
      taskId: "tsk-test"
    }, nationalToken);
    assert.equal(taskLinkedCalendarEvent.linkedTask, "tsk-test");

    const reportLinkedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/report`, {
      reportId: "rep-test"
    }, nationalToken);
    assert.equal(reportLinkedCalendarEvent.linkedReport, "rep-test");

    const duplicatedCalendarEvent = await postJson(`/api/calendar-events/${calendarEvents[1].id}/duplicate`, {
      title: "Automated duplicate calendar review",
      date: "2026-06-14"
    }, nationalToken);
    assert.equal(duplicatedCalendarEvent.title, "Automated duplicate calendar review");
    assert.equal(duplicatedCalendarEvent.status, "Scheduled");

    const bulkCompletedCalendarEvents = await postJson("/api/calendar-events/bulk/complete", {
      ids: [createdCalendarEvent.id]
    }, nationalToken);
    assert.equal(bulkCompletedCalendarEvents.count, 1);
    assert.equal(bulkCompletedCalendarEvents.updated[0].status, "Complete");

    const bulkRescheduledCalendarEvents = await postJson("/api/calendar-events/bulk/reschedule", {
      ids: [duplicatedCalendarEvent.id],
      date: "2026-06-14"
    }, nationalToken);
    assert.equal(bulkRescheduledCalendarEvents.count, 1);
    assert.equal(bulkRescheduledCalendarEvents.updated[0].date, "2026-06-14");
    assert.equal(bulkRescheduledCalendarEvents.updated[0].status, "Scheduled");

    const archivedCalendarEvent = await postJson(`/api/calendar-events/${createdCalendarEvent.id}/archive`, {
      reason: "Automated calendar archive"
    }, nationalToken);
    assert.equal(archivedCalendarEvent.archived, true);
    assert.equal(archivedCalendarEvent.archiveReason, "Automated calendar archive");

    const calendarDigest = await getJson("/api/calendar-events/digest", nationalToken);
    assert.equal(calendarDigest.total > 0, true);
    assert.equal(calendarDigest.watched >= 1, true);
    assert.equal(calendarDigest.complete >= 1, true);
    assert.equal(calendarDigest.checkedIn >= 1, true);
    assert.equal(calendarDigest.venues >= 1, true);
    assert.equal(calendarDigest.agendas >= 1, true);
    assert.equal(calendarDigest.attendance >= 1, true);
    assert.equal(calendarDigest.reminders >= 1, true);
    assert.equal(calendarDigest.ready >= 1, true);
    assert.equal(calendarDigest.linked >= 1, true);
    assert.equal(calendarDigest.archived >= 1, true);

    const liveSessions = await getJson("/api/live-sessions");
    assert.equal(liveSessions.length > 0, true);

    const liveDigest = await getJson("/api/live-sessions/digest");
    assert.equal(liveDigest.total > 0, true);
    assert.equal(liveDigest.nextSession.length > 0, true);

    const invalidLiveSession = await rawPost("/api/live-sessions", {
      title: ""
    }, nationalToken);
    assert.equal(invalidLiveSession.status, 400);

    const createdLiveSession = await postJson("/api/live-sessions", {
      title: "Automated district video review",
      host: "National Presidency Workstation",
      sessionType: "Video Meeting",
      status: "Live",
      linkedRecord: "National mission activity report",
      route: "National HQ -> District HQ",
      purpose: "Test live communication workflow",
      participants: ["np@rmvi.org", "district_admin@rmvi.org"]
    }, nationalToken);
    assert.equal(createdLiveSession.title, "Automated district video review");
    assert.equal(createdLiveSession.status, "Live");
    assert.equal(createdLiveSession.participants.includes("np@rmvi.org"), true);

    const updatedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/status`, {
      status: "Priority"
    }, nationalToken);
    assert.equal(updatedLiveSession.status, "Priority");

    const liveSessionWithFile = await postJson(`/api/live-sessions/${createdLiveSession.id}/file`, {
      file: "district-review-packet.pdf"
    }, nationalToken);
    assert.equal(liveSessionWithFile.files.includes("district-review-packet.pdf"), true);

    const liveSessionWithNote = await postJson(`/api/live-sessions/${createdLiveSession.id}/note`, {
      note: "District packet reviewed during automated test"
    }, nationalToken);
    assert.equal(liveSessionWithNote.notes.includes("District packet reviewed during automated test"), true);

    const invitedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/invite`, {
      participant: "finance@rmvi.org"
    }, nationalToken);
    assert.equal(invitedLiveSession.participants.includes("finance@rmvi.org"), true);

    const checkedInLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/check-in`, {
      participant: "finance@rmvi.org"
    }, nationalToken);
    assert.equal(checkedInLiveSession.checkedInParticipants.includes("finance@rmvi.org"), true);
    assert.equal(checkedInLiveSession.attendanceCount >= 1, true);

    const chatLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/chat`, {
      message: "Automated live chat transcript entry"
    }, nationalToken);
    assert.equal(chatLiveSession.transcript[0].body, "Automated live chat transcript entry");
    assert.equal(chatLiveSession.transcript[0].author, "np@rmvi.org");

    const decisionLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/decision`, {
      decision: "Approve district follow-up after review",
      owner: "district_admin@rmvi.org",
      due: "Next meeting"
    }, nationalToken);
    assert.equal(decisionLiveSession.decisions[0].text, "Approve district follow-up after review");
    assert.equal(decisionLiveSession.decisions[0].owner, "district_admin@rmvi.org");

    const recordingLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/recording`, {
      status: "Recording"
    }, nationalToken);
    assert.equal(recordingLiveSession.recordingStatus, "Recording");
    assert.equal(Boolean(recordingLiveSession.recordingStartedAt), true);

    const transcriptLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/transcript`, {
      transcript: "Automated voice transcript for the live session.",
      status: "Transcribed"
    }, nationalToken);
    assert.equal(transcriptLiveSession.voiceTranscript, "Automated voice transcript for the live session.");
    assert.equal(transcriptLiveSession.transcriptStatus, "Transcribed");

    const agendaLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/agenda`, {
      items: ["Opening prayer", "Review district report", "Assign follow-up"]
    }, nationalToken);
    assert.equal(agendaLiveSession.agendaItems.includes("Review district report"), true);
    assert.equal(Boolean(agendaLiveSession.agendaUpdatedAt), true);

    const screenShareLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/screen-share`, {
      status: "Sharing"
    }, nationalToken);
    assert.equal(screenShareLiveSession.screenShareStatus, "Sharing");
    assert.equal(screenShareLiveSession.screenSharedBy, "np@rmvi.org");

    const sharedDocLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/share-document`, {
      name: "district-agenda.pdf",
      source: "Meeting agenda"
    }, nationalToken);
    assert.equal(sharedDocLiveSession.sharedDocuments[0].name, "district-agenda.pdf");
    assert.equal(sharedDocLiveSession.files.includes("district-agenda.pdf"), true);

    const participantRoleLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/participant-role`, {
      participant: "finance@rmvi.org",
      role: "Decision owner"
    }, nationalToken);
    assert.equal(participantRoleLiveSession.participantRoles["finance@rmvi.org"], "Decision owner");

    const moderatedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/moderate`, {
      participant: "finance@rmvi.org",
      muted: true
    }, nationalToken);
    assert.equal(moderatedLiveSession.mutedParticipants.includes("finance@rmvi.org"), true);

    const liveSessionActions = await postJson(`/api/live-sessions/${createdLiveSession.id}/action-items`, {
      assignee: "district_admin@rmvi.org",
      priority: "High",
      due: "Tomorrow"
    }, nationalToken);
    assert.equal(liveSessionActions.tasks.length >= 1, true);
    assert.equal(liveSessionActions.session.actionItems.length >= 1, true);
    assert.equal(liveSessionActions.session.extractedTaskIds.includes(liveSessionActions.tasks[0].id), true);

    const attendanceLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/attendance`, {}, nationalToken);
    assert.equal(attendanceLiveSession.attendanceLedger.length >= 1, true);
    assert.equal(attendanceLiveSession.attendanceCount >= 1, true);

    const quorumLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/quorum`, {
      required: 1
    }, nationalToken);
    assert.equal(quorumLiveSession.quorum.met, true);
    assert.equal(quorumLiveSession.quorum.checkedBy, "np@rmvi.org");

    const minutesLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/minutes`, {
      name: "Automated live session official minutes.pdf"
    }, nationalToken);
    assert.equal(minutesLiveSession.document.name, "Automated live session official minutes.pdf");
    assert.equal(minutesLiveSession.document.classification, "Official meeting minutes");
    assert.equal(minutesLiveSession.session.minutesDocumentId, minutesLiveSession.document.id);

    const pollLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/poll`, {
      question: "Approve the district review actions?",
      options: ["Approve", "Reject", "Abstain"]
    }, nationalToken);
    assert.equal(pollLiveSession.polls[0].question, "Approve the district review actions?");
    assert.equal(pollLiveSession.polls[0].votes.Approve.length, 0);

    const votedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/vote`, {
      option: "Approve"
    }, nationalToken);
    assert.equal(votedLiveSession.polls[0].votes.Approve.includes("np@rmvi.org"), true);

    const resolutionLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/resolution`, {
      title: "Resolution to accept district review actions",
      movedBy: "np@rmvi.org"
    }, nationalToken);
    assert.equal(resolutionLiveSession.resolutions[0].title, "Resolution to accept district review actions");
    assert.equal(resolutionLiveSession.resolutions[0].status, "Draft");

    const passedResolutionLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/resolution/pass`, {
      status: "Passed",
      secondedBy: "district_admin@rmvi.org",
      votesFor: 2,
      votesAgainst: 0
    }, nationalToken);
    assert.equal(passedResolutionLiveSession.resolutions[0].status, "Passed");
    assert.equal(passedResolutionLiveSession.resolutions[0].votesFor, 2);

    const dispatchedMinutes = await postJson(`/api/live-sessions/${createdLiveSession.id}/minutes/dispatch`, {
      subject: "Automated official minutes dispatch",
      route: "National HQ -> District HQ"
    }, nationalToken);
    assert.equal(dispatchedMinutes.message.subject, "Automated official minutes dispatch");
    assert.equal(dispatchedMinutes.message.kind, "Report");
    assert.equal(dispatchedMinutes.session.minutesMessageId, dispatchedMinutes.message.id);

    const resolutionApproval = await postJson(`/api/live-sessions/${createdLiveSession.id}/resolution/approval`, {
      request: "Approve district review resolution",
      route: "National HQ -> District HQ",
      limit: "Resolution authority review",
      delegate: "National Presidency Workstation"
    }, nationalToken);
    assert.equal(resolutionApproval.approval.request, "Approve district review resolution");
    assert.equal(resolutionApproval.approval.state, "Validation");
    assert.equal(resolutionApproval.session.resolutionApprovalId, resolutionApproval.approval.id);

    const signedMinutes = await postJson(`/api/live-sessions/${createdLiveSession.id}/minutes/sign`, {
      signer: "np@rmvi.org",
      role: "National Secretary",
      attestation: "I certify these minutes are accurate."
    }, nationalToken);
    assert.equal(signedMinutes.minutesSignatures[0].signer, "np@rmvi.org");
    assert.equal(signedMinutes.minutesSignatureStatus, "1 signed");

    const sealedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/seal`, {
      name: "Automated sealed live governance record.pdf",
      reason: "Automated seal test"
    }, nationalToken);
    assert.equal(sealedLiveSession.document.name, "Automated sealed live governance record.pdf");
    assert.equal(sealedLiveSession.document.classification, "Sealed live session governance record");
    assert.equal(sealedLiveSession.document.verified, true);
    assert.equal(sealedLiveSession.session.sealedDocumentId, sealedLiveSession.document.id);

    const riskReviewedSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/risk-review`, {}, nationalToken);
    assert.equal(Boolean(riskReviewedSession.riskReview), true);
    assert.equal(riskReviewedSession.riskReview.reviewedBy, "np@rmvi.org");

    const riskEscalation = await postJson(`/api/live-sessions/${createdLiveSession.id}/escalate`, {
      item: "Automated live governance risk",
      reason: "Automated risk escalation",
      severity: "High",
      owner: "National Presidency Workstation"
    }, nationalToken);
    assert.equal(riskEscalation.escalation.item, "Automated live governance risk");
    assert.equal(riskEscalation.escalation.source, "Live Comms");
    assert.equal(riskEscalation.session.riskEscalationId, riskEscalation.escalation.id);

    const connectivityLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/connectivity`, {
      status: "Weak",
      bandwidthMode: "Low bandwidth"
    }, nationalToken);
    assert.equal(connectivityLiveSession.connectivity.status, "Weak");
    assert.equal(connectivityLiveSession.connectivity.bandwidthMode, "Low bandwidth");

    const fallbackLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/fallback`, {
      channel: "ChurchMail + SMS relay",
      reason: "Low bandwidth in county office",
      bandwidthMode: "Low bandwidth"
    }, nationalToken);
    assert.equal(fallbackLiveSession.fallbackChannel.channel, "ChurchMail + SMS relay");
    assert.equal(fallbackLiveSession.connectivity.status, "Fallback");

    const continuityAlert = await postJson(`/api/live-sessions/${createdLiveSession.id}/continuity-alert`, {
      subject: "Automated continuity alert",
      route: "National HQ -> District HQ",
      priority: "High"
    }, nationalToken);
    assert.equal(continuityAlert.message.subject, "Automated continuity alert");
    assert.equal(continuityAlert.message.kind, "Notification");
    assert.equal(continuityAlert.session.continuityAlertId, continuityAlert.message.id);

    const offlineNoteLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/offline-note`, {
      note: "County office continued by offline notes",
      station: "Buchanan District Office"
    }, nationalToken);
    assert.equal(offlineNoteLiveSession.offlineNotes[0].body, "County office continued by offline notes");
    assert.equal(offlineNoteLiveSession.offlineNotes[0].station, "Buchanan District Office");

    const recoveredLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/recovery-sync`, {
      status: "Recovered",
      summary: "Offline continuity notes synchronized",
      bandwidthMode: "Standard"
    }, nationalToken);
    assert.equal(recoveredLiveSession.recoverySummary.status, "Recovered");
    assert.equal(recoveredLiveSession.connectivity.status, "Recovered");

    const aiBriefLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/ai-brief`, {
      title: "Automated AI live session brief"
    }, nationalToken);
    assert.equal(aiBriefLiveSession.document.name, "Automated AI live session brief.pdf");
    assert.equal(aiBriefLiveSession.document.classification, "AI live session brief");
    assert.equal(aiBriefLiveSession.session.aiBriefDocumentId, aiBriefLiveSession.document.id);

    const playbookLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/playbook`, {
      playbook: "District Review"
    }, nationalToken);
    assert.equal(playbookLiveSession.playbook.name, "District Review");
    assert.ok(playbookLiveSession.playbook.checklist.length >= 4);
    assert.ok(playbookLiveSession.agendaItems.length >= 4);

    const seriesLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/series`, {
      title: "Recurring district report review",
      frequency: "Weekly",
      nextRun: "2026-06-22",
      owner: "np@rmvi.org",
      priority: "High"
    }, nationalToken);
    assert.equal(seriesLiveSession.calendarEvent.title, "Recurring district report review");
    assert.equal(seriesLiveSession.calendarEvent.recurrence, "Weekly");
    assert.equal(seriesLiveSession.session.recurringSchedule.nextRun, "2026-06-22");
    assert.equal(seriesLiveSession.session.recurringCalendarEventId, seriesLiveSession.calendarEvent.id);

    const reminderLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/reminder`, {
      subject: "District review reminder",
      route: "National HQ -> District HQ",
      priority: "High",
      recipients: ["district_admin@rmvi.org", "finance@rmvi.org"]
    }, nationalToken);
    assert.equal(reminderLiveSession.message.subject, "District review reminder");
    assert.equal(reminderLiveSession.message.recipients.length, 2);
    assert.equal(reminderLiveSession.session.reminderMessageId, reminderLiveSession.message.id);

    const followUpLedgerSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/follow-up-ledger`, {
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(followUpLedgerSession.followUpLedger.owner, "np@rmvi.org");
    assert.ok(Array.isArray(followUpLedgerSession.followUpLedger.missingParticipants));
    assert.ok(["Open", "Clear"].includes(followUpLedgerSession.followUpLedger.status));

    const liveSessionSummary = await postJson(`/api/live-sessions/${createdLiveSession.id}/summary-message`, {
      subject: "Automated live session summary",
      route: "National HQ -> District HQ"
    }, nationalToken);
    assert.equal(liveSessionSummary.message.subject, "Automated live session summary");
    assert.equal(liveSessionSummary.message.kind, "Notification");
    assert.equal(liveSessionSummary.session.summaryMessageId, liveSessionSummary.message.id);

    const handoffMessage = await postJson(`/api/live-sessions/${createdLiveSession.id}/handoff`, {
      subject: "Automated live session handoff",
      route: "National HQ -> District HQ",
      priority: "High"
    }, nationalToken);
    assert.equal(handoffMessage.message.kind, "Report");
    assert.equal(handoffMessage.message.subject, "Automated live session handoff");
    assert.equal(handoffMessage.message.linkedLiveSession, createdLiveSession.id);
    assert.equal(handoffMessage.session.handoffMessageId, handoffMessage.message.id);
    assert.equal(handoffMessage.session.handoffRoute, "National HQ -> District HQ");

    const liveSessionTask = await postJson(`/api/live-sessions/${createdLiveSession.id}/follow-up-task`, {
      title: "Automated live session follow-up",
      assignee: "district_admin@rmvi.org",
      priority: "High",
      due: "Tomorrow"
    }, nationalToken);
    assert.equal(liveSessionTask.task.title, "Automated live session follow-up");
    assert.equal(liveSessionTask.task.status, "Queued");
    assert.equal(liveSessionTask.session.followUpTaskId, liveSessionTask.task.id);

    const liveSessionCalendar = await postJson(`/api/live-sessions/${createdLiveSession.id}/calendar-event`, {
      title: "Automated live session calendar event",
      date: "2026-06-15",
      priority: "High",
      agenda: "Review live session decisions"
    }, nationalToken);
    assert.equal(liveSessionCalendar.calendarEvent.title, "Automated live session calendar event");
    assert.equal(liveSessionCalendar.calendarEvent.date, "2026-06-15");
    assert.equal(liveSessionCalendar.session.calendarEventId, liveSessionCalendar.calendarEvent.id);

    const closedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/close`, {
      reason: "Automated meeting completed"
    }, nationalToken);
    assert.equal(closedLiveSession.status, "Complete");
    assert.equal(closedLiveSession.closedBy, "np@rmvi.org");
    assert.equal(closedLiveSession.closeReason, "Automated meeting completed");

    const liveSessionPacket = await postJson(`/api/live-sessions/${createdLiveSession.id}/packet`, {
      name: "Automated live session packet.pdf"
    }, nationalToken);
    assert.equal(liveSessionPacket.document.name, "Automated live session packet.pdf");
    assert.equal(liveSessionPacket.document.source, "Live Comms");
    assert.equal(liveSessionPacket.document.retainedUntil, "Permanent");
    assert.equal(liveSessionPacket.session.packetDocumentId, liveSessionPacket.document.id);

    const outcomeReport = await postJson(`/api/live-sessions/${createdLiveSession.id}/outcome-report`, {
      name: "Automated live session outcome report",
      owner: "National Presidency Workstation",
      path: "National HQ -> District HQ",
      due: "Today",
      state: "Ready",
      score: 91,
      type: "Live Comms",
      period: "Current meeting"
    }, nationalToken);
    assert.equal(outcomeReport.report.name, "Automated live session outcome report");
    assert.equal(outcomeReport.report.type, "Live Comms");
    assert.equal(outcomeReport.report.linkedLiveSession, createdLiveSession.id);
    assert.equal(outcomeReport.session.outcomeReportId, outcomeReport.report.id);
    assert.ok(outcomeReport.report.reportFields["Session title"]);

    const archivedLiveSession = await postJson(`/api/live-sessions/${createdLiveSession.id}/archive`, {
      reason: "Automated live session archive"
    }, nationalToken);
    assert.equal(archivedLiveSession.archived, true);
    assert.equal(archivedLiveSession.status, "Archived");
    assert.equal(archivedLiveSession.archiveReason, "Automated live session archive");

    const personnel = await getJson("/api/personnel");
    const invalidPerson = await rawPost("/api/personnel", {
      role: "Coordinator",
      currentStation: "District",
      assignedStation: "Area"
    }, nationalToken);
    assert.equal(invalidPerson.status, 400);

    const forbiddenPerson = await rawPost("/api/personnel", {
      name: "Forbidden Person",
      role: "Local Volunteer",
      currentStation: "Local Branch",
      assignedStation: "Area Office"
    }, localToken);
    assert.equal(forbiddenPerson.status, 403);

    const createdPerson = await postJson("/api/personnel", {
      name: "Automated personnel registry test",
      role: "District Coordinator",
      currentStation: "National Programs",
      assignedStation: "Regional Desk",
      status: "Transfer Pending"
    }, nationalToken);
    assert.equal(createdPerson.name, "Automated personnel registry test");
    assert.equal(createdPerson.status, "Transfer Pending");

    const updatedPerson = await postJson(`/api/personnel/${personnel[0].id}/status`, {
      status: "Assigned"
    }, nationalToken);
    assert.equal(updatedPerson.status, "Assigned");

    const reassignedPerson = await postJson(`/api/personnel/${personnel[0].id}/assignment`, {
      assignedStation: "Regional Review Desk",
      status: "Transfer Pending"
    }, nationalToken);
    assert.equal(reassignedPerson.assignedStation, "Regional Review Desk");
    assert.equal(reassignedPerson.status, "Transfer Pending");

    const rolePerson = await postJson(`/api/personnel/${personnel[0].id}/role`, {
      role: "Governance Liaison"
    }, nationalToken);
    assert.equal(rolePerson.role, "Governance Liaison");

    const deactivatedPerson = await postJson(`/api/personnel/${personnel[1].id}/deactivate`, {
      reason: "Automated deactivation test"
    }, nationalToken);
    assert.equal(deactivatedPerson.status, "Inactive");

    const onboardedPerson = await postJson(`/api/personnel/${createdPerson.id}/onboard`, {
      reason: "Automated onboarding test"
    }, nationalToken);
    assert.equal(onboardedPerson.status, "Onboarding");
    assert.equal(onboardedPerson.credentialStatus, "Provisioning");

    const credentialPerson = await postJson(`/api/personnel/${createdPerson.id}/credentials/reset`, {
      reason: "Automated credential reset test"
    }, nationalToken);
    assert.equal(credentialPerson.credentialStatus, "Reset required");

    const leavePerson = await postJson(`/api/personnel/${createdPerson.id}/leave`, {
      reason: "Automated leave test"
    }, nationalToken);
    assert.equal(leavePerson.status, "On Leave");

    const clearancePerson = await postJson(`/api/personnel/${createdPerson.id}/clearance`, {
      clearance: "Executive"
    }, nationalToken);
    assert.equal(clearancePerson.clearance, "Executive");

    const verifiedPerson = await postJson(`/api/personnel/${personnel[0].id}/credentials/verify`, {
      status: "Verified"
    }, nationalToken);
    assert.equal(verifiedPerson.credentialStatus, "Verified");

    const trainedPerson = await postJson(`/api/personnel/${personnel[0].id}/training`, {
      status: "Assigned",
      track: "Governance onboarding"
    }, nationalToken);
    assert.equal(trainedPerson.trainingStatus, "Assigned");
    assert.equal(trainedPerson.trainingTrack, "Governance onboarding");

    const accessPerson = await postJson(`/api/personnel/${personnel[0].id}/access`, {
      station: "Regional Review Desk",
      status: "Granted"
    }, nationalToken);
    assert.equal(accessPerson.stationAccess, "Regional Review Desk");
    assert.equal(accessPerson.accessStatus, "Granted");

    const incidentPerson = await postJson(`/api/personnel/${personnel[0].id}/incident`, {
      reason: "Automated personnel review required",
      severity: "Medium"
    }, nationalToken);
    assert.equal(incidentPerson.incidentFlag, "Automated personnel review required");
    assert.equal(incidentPerson.incidentSeverity, "Medium");

    const taskLinkedPerson = await postJson(`/api/personnel/${personnel[0].id}/task`, {
      taskId: "tsk-test"
    }, nationalToken);
    assert.equal(taskLinkedPerson.linkedTask, "tsk-test");

    const reviewedPerson = await postJson(`/api/personnel/${personnel[0].id}/review`, {
      status: "Reviewed",
      note: "Automated personnel review"
    }, nationalToken);
    assert.equal(reviewedPerson.reviewStatus, "Reviewed");
    assert.equal(reviewedPerson.reviewNote, "Automated personnel review");

    const bulkCredentialReview = await postJson("/api/personnel/bulk/credential-review", {
      ids: [createdPerson.id],
      status: "Review required"
    }, nationalToken);
    assert.equal(bulkCredentialReview.count, 1);
    assert.equal(bulkCredentialReview.updated[0].credentialStatus, "Review required");

    const archivedPerson = await postJson(`/api/personnel/${createdPerson.id}/archive`, {
      reason: "Automated personnel archive"
    }, nationalToken);
    assert.equal(archivedPerson.archived, true);
    assert.equal(archivedPerson.archiveReason, "Automated personnel archive");

    const personnelDigest = await getJson("/api/personnel/digest");
    assert.equal(personnelDigest.nextPerson.length > 0, true);
    assert.equal(personnelDigest.transferPending >= 0, true);
    assert.equal(personnelDigest.verified >= 1, true);
    assert.equal(personnelDigest.training >= 1, true);
    assert.equal(personnelDigest.accessGranted >= 1, true);
    assert.equal(personnelDigest.incidents >= 1, true);
    assert.equal(personnelDigest.linked >= 1, true);
    assert.equal(personnelDigest.reviewed >= 1, true);
    assert.equal(personnelDigest.archived >= 1, true);

    const escalation = await postJson("/api/escalations", {
      source: "Report",
      item: "Automated escalation test",
      reason: "Test workflow escalation",
      severity: "High",
      owner: "Test Office"
    }, nationalToken);
    assert.equal(escalation.status, "Open");

    const forbiddenRoute = await rawPost(`/api/escalations/${escalation.id}/route`, {}, localToken);
    assert.equal(forbiddenRoute.status, 403);

    const routedEscalation = await postJson(`/api/escalations/${escalation.id}/route`, {}, nationalToken);
    assert.equal(routedEscalation.status, "Upward");

    const ownedEscalation = await postJson(`/api/escalations/${escalation.id}/owner`, {
      owner: "National Presidency Workstation"
    }, nationalToken);
    assert.equal(ownedEscalation.owner, "National Presidency Workstation");

    const severityEscalation = await postJson(`/api/escalations/${escalation.id}/severity`, {
      severity: "Critical"
    }, nationalToken);
    assert.equal(severityEscalation.severity, "Critical");

    const triagedEscalation = await postJson(`/api/escalations/${escalation.id}/triage`, {
      owner: "National Triage Desk",
      severity: "Critical"
    }, nationalToken);
    assert.equal(triagedEscalation.owner, "National Triage Desk");
    assert.equal(triagedEscalation.status, "Open");

    const slaEscalation = await postJson(`/api/escalations/${escalation.id}/sla`, {
      sla: "4 hours"
    }, nationalToken);
    assert.equal(slaEscalation.sla, "4 hours");

    const watchedEscalation = await postJson(`/api/escalations/${escalation.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedEscalation.watchers.includes("np@rmvi.org"), true);

    const evidencedEscalation = await postJson(`/api/escalations/${escalation.id}/evidence`, {
      evidence: "Automated escalation evidence"
    }, nationalToken);
    assert.equal(evidencedEscalation.evidence, "Automated escalation evidence");

    const commentedEscalation = await postJson(`/api/escalations/${escalation.id}/comment`, {
      comment: "Automated escalation comment"
    }, nationalToken);
    assert.equal(commentedEscalation.comments.some((comment) => comment.includes("Automated escalation comment")), true);

    const notedEscalation = await postJson(`/api/escalations/${escalation.id}/resolution-note`, {
      note: "Automated resolution note"
    }, nationalToken);
    assert.equal(notedEscalation.resolutionNote, "Automated resolution note");

    const dueEscalation = await postJson(`/api/escalations/${escalation.id}/due`, {
      due: "Today"
    }, nationalToken);
    assert.equal(dueEscalation.due, "Today");

    const taskLinkedEscalation = await postJson(`/api/escalations/${escalation.id}/task`, {
      taskId: "tsk-test"
    }, nationalToken);
    assert.equal(taskLinkedEscalation.linkedTask, "tsk-test");

    const reportLinkedEscalation = await postJson(`/api/escalations/${escalation.id}/report`, {
      reportId: "rep-test"
    }, nationalToken);
    assert.equal(reportLinkedEscalation.linkedReport, "rep-test");

    const approvalLinkedEscalation = await postJson(`/api/escalations/${escalation.id}/approval-link`, {
      approvalId: "app-test"
    }, nationalToken);
    assert.equal(approvalLinkedEscalation.linkedApproval, "app-test");

    const impactEscalation = await postJson(`/api/escalations/${escalation.id}/impact`, {
      score: 90,
      summary: "High governance impact"
    }, nationalToken);
    assert.equal(impactEscalation.impactScore, 90);
    assert.equal(impactEscalation.impactSummary, "High governance impact");

    const escalationDigest = await getJson("/api/escalations/digest");
    assert.equal(escalationDigest.open >= 1, true);
    assert.equal(escalationDigest.critical >= 1, true);
    assert.equal(escalationDigest.evidence >= 1, true);
    assert.equal(escalationDigest.comments >= 1, true);
    assert.equal(escalationDigest.resolutionNotes >= 1, true);
    assert.equal(escalationDigest.due >= 1, true);
    assert.equal(escalationDigest.linked >= 1, true);
    assert.equal(escalationDigest.impact >= 1, true);

    const bulkEscalation = await postJson("/api/escalations", {
      source: "Task",
      item: "Automated bulk escalation",
      reason: "Bulk resolution test",
      severity: "Medium",
      owner: "Test Office"
    }, nationalToken);
    const bulkResolvedEscalations = await postJson("/api/escalations/bulk/resolve", {
      ids: [bulkEscalation.id],
      note: "Automated bulk resolution"
    }, nationalToken);
    assert.equal(bulkResolvedEscalations.count, 1);
    assert.equal(bulkResolvedEscalations.updated[0].status, "Resolved");

    const archivedEscalation = await postJson(`/api/escalations/${bulkEscalation.id}/archive`, {
      reason: "Automated escalation archive"
    }, nationalToken);
    assert.equal(archivedEscalation.archived, true);
    assert.equal(archivedEscalation.archiveReason, "Automated escalation archive");

    const mergedEscalation = await postJson(`/api/escalations/${escalation.id}/merge`, {
      target: "Automated primary escalation"
    }, nationalToken);
    assert.equal(mergedEscalation.status, "Merged");

    const resolvedEscalation = await postJson(`/api/escalations/${escalation.id}/resolve`, {}, nationalToken);
    assert.equal(resolvedEscalation.status, "Resolved");

    const forbiddenOffice = await rawPost("/api/offices", {
      name: "Forbidden Branch Office",
      email: "forbidden_branch@rmvi.org",
      level: "Area HQ",
      department: "Area Coordination",
      supervisor: "District HQ"
    }, localToken);
    assert.equal(forbiddenOffice.status, 403);

    const invalidOffice = await rawPost("/api/offices", {
      name: "Invalid Office",
      email: "invalid-office-email",
      level: "District HQ",
      department: "District Command",
      supervisor: "County HQ"
    }, nationalToken);
    assert.equal(invalidOffice.status, 400);

    const wrongDomainOffice = await rawPost("/api/offices", {
      name: "Wrong Domain Office",
      email: "wrong_domain@example.org",
      level: "District HQ",
      department: "District Command",
      supervisor: "County HQ"
    }, nationalToken);
    assert.equal(wrongDomainOffice.status, 400);

    const office = await postJson("/api/offices", {
      name: "Automated District Office",
      email: "automated_district@rmvi.org",
      level: "District HQ",
      department: "District Command",
      supervisor: "County HQ"
    }, nationalToken);
    assert.equal(office.email, "automated_district@rmvi.org");
    assert.equal(office.password, demoPassword("automated-district-office"));

    const suspendedOffice = await postJson(`/api/offices/${office.id}/status`, {
      status: "Suspended"
    }, nationalToken);
    assert.equal(suspendedOffice.status, "Suspended");

    const supervisedOffice = await postJson(`/api/offices/${office.id}/supervisor`, {
      supervisor: "International Headquarters"
    }, nationalToken);
    assert.equal(supervisedOffice.supervisor, "International Headquarters");

    const activatedOffice = await postJson(`/api/offices/${office.id}/activate`, {}, nationalToken);
    assert.equal(activatedOffice.status, "Active");

    const rotatedOffice = await postJson(`/api/offices/${office.id}/password/rotate`, {
      password: demoPassword("automated-rotated")
    }, nationalToken);
    assert.equal(rotatedOffice.password, demoPassword("automated-rotated"));

    const activeStationOffice = await postJson(`/api/offices/${office.id}/station/activate`, {}, nationalToken);
    assert.equal(activeStationOffice.status, "Active");

    const departmentOffice = await postJson(`/api/offices/${office.id}/department`, {
      department: "Mission Administration"
    }, nationalToken);
    assert.equal(departmentOffice.department, "Mission Administration");

    const levelOffice = await postJson(`/api/offices/${office.id}/level`, {
      level: "Area HQ"
    }, nationalToken);
    assert.equal(levelOffice.level, "Area HQ");

    const verifiedOffice = await postJson(`/api/offices/${office.id}/email/verify`, {}, nationalToken);
    assert.equal(verifiedOffice.emailVerified, true);

    const watchedOffice = await postJson(`/api/offices/${office.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedOffice.watchers.includes("np@rmvi.org"), true);

    const notedOffice = await postJson(`/api/offices/${office.id}/note`, {
      note: "Automated office note"
    }, nationalToken);
    assert.equal(notedOffice.notes.some((note) => note.includes("Automated office note")), true);

    const capacityOffice = await postJson(`/api/offices/${office.id}/capacity`, {
      capacity: 12
    }, nationalToken);
    assert.equal(capacityOffice.capacity, 12);

    const complianceOffice = await postJson(`/api/offices/${office.id}/compliance`, {
      status: "Reviewed"
    }, nationalToken);
    assert.equal(complianceOffice.complianceStatus, "Reviewed");

    const bulkOffice = await postJson("/api/offices", {
      name: "Automated Bulk Office",
      email: "automated_bulk@rmvi.org",
      level: "Area HQ",
      department: "Area Coordination",
      supervisor: "District HQ"
    }, nationalToken);

    const bulkActivatedOffices = await postJson("/api/offices/bulk/activate", {
      ids: [bulkOffice.id]
    }, nationalToken);
    assert.equal(bulkActivatedOffices.count, 1);
    assert.equal(bulkActivatedOffices.updated[0].status, "Active");

    const archivedOffice = await postJson(`/api/offices/${bulkOffice.id}/archive`, {
      reason: "Automated office archive"
    }, nationalToken);
    assert.equal(archivedOffice.archived, true);
    assert.equal(archivedOffice.archiveReason, "Automated office archive");

    const suspendedAgainOffice = await postJson(`/api/offices/${office.id}/suspend`, {
      reason: "Automated office suspension test"
    }, nationalToken);
    assert.equal(suspendedAgainOffice.status, "Suspended");

    const officeDigest = await getJson("/api/offices/digest");
    assert.equal(officeDigest.total >= 1, true);
    assert.equal(officeDigest.stationIdentities >= 1, true);
    assert.equal(officeDigest.verified >= 1, true);
    assert.equal(officeDigest.watched >= 1, true);
    assert.equal(officeDigest.noted >= 1, true);
    assert.equal(officeDigest.capacity >= 1, true);
    assert.equal(officeDigest.compliant >= 1, true);
    assert.equal(officeDigest.archived >= 1, true);

    const officeLogin = await postJson("/api/auth/login", {
      email: "automated_district@rmvi.org",
      password: demoPassword("automated-rotated")
    });
    assert.equal(officeLogin.station.email, "automated_district@rmvi.org");
    assert.equal(officeLogin.station.level, "Area HQ");

    const duplicateOffice = await fetch(`${BASE_URL}/api/offices`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${nationalToken}` },
      body: JSON.stringify({
        name: "Duplicate Office",
        email: "automated_district@rmvi.org",
        level: "District HQ",
        department: "District Command",
        supervisor: "County HQ"
      })
    });
    assert.equal(duplicateOffice.status, 409);

    const stations = await getJson("/api/stations");
    assert.equal(stations.some((station) => station.email === "automated_district@rmvi.org"), true);
    const stationId = stations[0].id;

    const authRegistry = await getJson("/api/station-auth", nationalToken);
    assert.equal(authRegistry.some((credential) => credential.email === stations[0].email), true);
    assert.equal(Object.hasOwn(authRegistry[0], "passwordHash"), false);

    const rotatedStationCredential = await postJson(`/api/stations/${stationId}/credential/rotate`, {
      password: demoPassword("station-rotated")
    }, nationalToken);
    assert.equal(rotatedStationCredential.credential.status, "Active");
    assert.equal(rotatedStationCredential.temporaryPassword, demoPassword("station-rotated"));

    const rotatedStationLogin = await postJson("/api/auth/login", {
      email: stations[0].email,
      password: demoPassword("station-rotated")
    });
    assert.equal(rotatedStationLogin.station.email, stations[0].email);

    const resetStationCredential = await postJson(`/api/stations/${stationId}/credential/reset`, {
      password: demoPassword("station-reset")
    }, nationalToken);
    assert.equal(resetStationCredential.credential.forceReset, true);

    const mfaStationCredential = await postJson(`/api/stations/${stationId}/credential/mfa`, {
      reason: "Automated MFA requirement"
    }, nationalToken);
    assert.equal(mfaStationCredential.credential.mfaRequired, true);

    const lockedStationCredential = await postJson(`/api/stations/${stationId}/credential/lock`, {
      reason: "Automated credential lock"
    }, nationalToken);
    assert.equal(lockedStationCredential.credential.status, "Locked");

    const lockedStationLogin = await rawPost("/api/auth/login", {
      email: stations[0].email,
      password: demoPassword("station-reset")
    });
    assert.equal(lockedStationLogin.status, 401);

    const unlockedStationCredential = await postJson(`/api/stations/${stationId}/credential/unlock`, {
      reason: "Automated credential unlock"
    }, nationalToken);
    assert.equal(unlockedStationCredential.credential.status, "Active");

    const authDigest = await getJson("/api/station-auth/digest", nationalToken);
    assert.equal(authDigest.total >= 4, true);
    assert.equal(authDigest.mfaRequired >= 1, true);

    const invalidStationLevel = await rawPost(`/api/stations/${stationId}/level`, {
      level: "Planetary HQ"
    }, nationalToken);
    assert.equal(invalidStationLevel.status, 400);

    const forbiddenStationLevel = await rawPost(`/api/stations/${stationId}/level`, {
      level: "Regional HQ"
    }, localToken);
    assert.equal(forbiddenStationLevel.status, 403);

    const levelStation = await postJson(`/api/stations/${stationId}/level`, {
      level: "Regional HQ"
    }, nationalToken);
    assert.equal(levelStation.level, "Regional HQ");

    const authorityStation = await postJson(`/api/stations/${stationId}/authority`, {
      authority: "Automated supervisor route"
    }, nationalToken);
    assert.equal(authorityStation.authority, "Automated supervisor route");

    const verifiedStation = await postJson(`/api/stations/${stationId}/verify`, {
      result: "Automated station verification"
    }, nationalToken);
    assert.equal(verifiedStation.verified, true);
    assert.equal(verifiedStation.status, "Verified");

    const watchedStation = await postJson(`/api/stations/${stationId}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedStation.watchers.includes("np@rmvi.org"), true);

    const suspendedStation = await postJson(`/api/stations/${stationId}/suspend`, {
      reason: "Automated station suspension"
    }, nationalToken);
    assert.equal(suspendedStation.status, "Suspended");

    const activatedStation = await postJson(`/api/stations/${stationId}/activate`, {
      reason: "Automated station activation"
    }, nationalToken);
    assert.equal(activatedStation.status, "Active");

    const mirroredStation = await postJson(`/api/stations/${stationId}/mirror`, {
      email: "automated_mirror@rmvi.org",
      title: "Automated Mirror Station"
    }, nationalToken);
    assert.equal(mirroredStation.email, "automated_mirror@rmvi.org");
    assert.equal(mirroredStation.mirrorOf, stationId);

    const wrongDomainMirror = await rawPost(`/api/stations/${stationId}/mirror`, {
      email: "automated_mirror@example.org",
      title: "Wrong Domain Mirror"
    }, nationalToken);
    assert.equal(wrongDomainMirror.status, 400);

    const bulkVerifiedStations = await postJson("/api/stations/bulk/verify", {
      ids: [stationId, mirroredStation.id]
    }, nationalToken);
    assert.equal(bulkVerifiedStations.count, 2);
    assert.equal(bulkVerifiedStations.updated.every((station) => station.verified), true);

    const hierarchyDigest = await getJson("/api/hierarchy/digest");
    assert.equal(hierarchyDigest.stations >= stations.length, true);
    assert.equal(hierarchyDigest.verified >= 2, true);
    assert.equal(hierarchyDigest.watched >= 1, true);
    assert.equal(hierarchyDigest.mirrors >= 1, true);

    const transfers = await getJson("/api/transfers");
    const forbiddenCreatedTransfer = await rawPost("/api/transfers", {
      person: "Forbidden Transfer",
      from: "Local Branch 017",
      to: "County Office"
    }, localToken);
    assert.equal(forbiddenCreatedTransfer.status, 403);

    const invalidCreatedTransfer = await rawPost("/api/transfers", {
      person: "Invalid Transfer",
      from: "National Office"
    }, nationalToken);
    assert.equal(invalidCreatedTransfer.status, 400);

    const createdTransfer = await postJson("/api/transfers", {
      person: "Automated transfer test",
      from: "National Office",
      to: "Regional Office"
    }, nationalToken);
    assert.equal(createdTransfer.person, "Automated transfer test");
    assert.equal(createdTransfer.step, "Recipient acknowledgement");

    const preparedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/prepare`, {
      note: "Automated transfer preparation"
    }, nationalToken);
    assert.equal(preparedTransfer.step, "Pre-migration checklist");

    const acknowledgedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/acknowledge`, {}, nationalToken);
    assert.equal(acknowledgedTransfer.step, "Permissions migration");
    assert.equal(acknowledgedTransfer.risk, "Acknowledgement recorded");

    const riskTransfer = await postJson(`/api/transfers/${createdTransfer.id}/risk`, {
      risk: "Supervisor review required"
    }, nationalToken);
    assert.equal(riskTransfer.risk, "Supervisor review required");

    const accessRevokedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/revoke-access`, {
      reason: "Automated revoke access test"
    }, nationalToken);
    assert.equal(accessRevokedTransfer.step, "Previous access revoked");

    const activatedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/activate-station`, {}, nationalToken);
    assert.equal(activatedTransfer.step, "New station activated");

    const verifiedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/verify`, {
      result: "Automated verification test"
    }, nationalToken);
    assert.equal(verifiedTransfer.step, "Verified");

    const letterTransfer = await postJson(`/api/transfers/${createdTransfer.id}/letter`, {
      status: "Received",
      reference: "Automated mission letter"
    }, nationalToken);
    assert.equal(letterTransfer.letterStatus, "Received");
    assert.equal(letterTransfer.letterRef, "Automated mission letter");

    const scheduledTransfer = await postJson(`/api/transfers/${createdTransfer.id}/schedule`, {
      scheduledFor: "Tomorrow"
    }, nationalToken);
    assert.equal(scheduledTransfer.scheduledFor, "Tomorrow");

    const notedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/note`, {
      note: "Automated transfer note"
    }, nationalToken);
    assert.equal(notedTransfer.notes.some((note) => note.includes("Automated transfer note")), true);

    const watchedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedTransfer.watchers.includes("np@rmvi.org"), true);

    const personnelLinkedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/personnel-link`, {
      personnelId: "per-test"
    }, nationalToken);
    assert.equal(personnelLinkedTransfer.personnelRecord, "per-test");

    const taskLinkedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/task`, {
      taskId: "tsk-test"
    }, nationalToken);
    assert.equal(taskLinkedTransfer.linkedTask, "tsk-test");

    const reportLinkedTransfer = await postJson(`/api/transfers/${createdTransfer.id}/report`, {
      reportId: "rep-test"
    }, nationalToken);
    assert.equal(reportLinkedTransfer.linkedReport, "rep-test");

    const bulkTransfer = await postJson("/api/transfers", {
      person: "Automated bulk transfer test",
      from: "County Office",
      to: "Area Office"
    }, nationalToken);
    const bulkVerifiedTransfers = await postJson("/api/transfers/bulk/verify", {
      ids: [bulkTransfer.id],
      result: "Automated bulk verification"
    }, nationalToken);
    assert.equal(bulkVerifiedTransfers.count, 1);
    assert.equal(bulkVerifiedTransfers.updated[0].step, "Verified");

    const archivedTransfer = await postJson(`/api/transfers/${bulkTransfer.id}/archive`, {
      reason: "Automated transfer archive"
    }, nationalToken);
    assert.equal(archivedTransfer.archived, true);
    assert.equal(archivedTransfer.archiveReason, "Automated transfer archive");

    const transferDigest = await getJson("/api/transfers/digest");
    assert.equal(transferDigest.total >= 1, true);
    assert.equal(transferDigest.nextTransfer.length > 0, true);
    assert.equal(transferDigest.letters >= 1, true);
    assert.equal(transferDigest.scheduled >= 1, true);
    assert.equal(transferDigest.noted >= 1, true);
    assert.equal(transferDigest.watched >= 1, true);
    assert.equal(transferDigest.linked >= 1, true);
    assert.equal(transferDigest.archived >= 1, true);

    const forbiddenTransfer = await rawPost(`/api/transfers/${transfers[0].id}/execute`, {}, localToken);
    assert.equal(forbiddenTransfer.status, 403);

    const executedTransfer = await postJson(`/api/transfers/${transfers[0].id}/execute`, {}, nationalToken);
    assert.equal(executedTransfer.step, "New station login ready");
    assert.equal(executedTransfer.risk, "Previous permissions revoked");
    const personnelAfterTransfer = await getJson("/api/personnel");
    const transferredPerson = personnelAfterTransfer.find((item) => item.name === executedTransfer.person);
    assert.equal(transferredPerson.status, "Assigned");
    assert.equal(transferredPerson.currentStation, executedTransfer.to);

    const invalidDocument = await rawPost("/api/documents", {
      name: "Missing classification.pdf",
      source: "ChurchMail",
      fileType: "PDF"
    }, nationalToken);
    assert.equal(invalidDocument.status, 400);

    const document = await postJson("/api/documents", {
      name: "Automated signed packet.pdf",
      classification: "Signed document",
      source: "ChurchMail",
      owner: "National Secretariat",
      fileType: "PDF"
    }, nationalToken);
    assert.equal(document.name, "Automated signed packet.pdf");
    assert.equal(document.status, "Archived");
    assert.match(document.storageKey, /^gcos-object-vault\//);

    const uploadedFile = await postJson("/api/files/upload", {
      name: "automated-packet.txt",
      contentType: "text/plain",
      contentBase64: Buffer.from("GCOS automated file vault test").toString("base64"),
      source: "Automated test"
    }, nationalToken);
    assert.equal(uploadedFile.name, "automated-packet.txt");
    assert.equal(uploadedFile.size, 30);
    assert.match(uploadedFile.hash, /^sha256:/);

    const linkedDocumentFile = await postJson(`/api/documents/${document.id}/file`, {
      fileId: uploadedFile.id
    }, nationalToken);
    assert.equal(linkedDocumentFile.files[0].id, uploadedFile.id);
    assert.equal(linkedDocumentFile.fileHash, uploadedFile.hash);

    const linkedEvidenceFile = await postJson("/api/evidence-vault/ev-finance-ledger/file", {
      fileId: uploadedFile.id
    }, nationalToken);
    assert.equal(linkedEvidenceFile.evidence.files[0].id, uploadedFile.id);

    const linkedReportFile = await postJson(`/api/reports/${createdReport.id}/file`, {
      fileId: uploadedFile.id
    }, nationalToken);
    assert.equal(linkedReportFile.evidenceFiles[0].id, uploadedFile.id);
    assert.equal(linkedReportFile.routingStage, "Evidence review");
    assert.equal(linkedReportFile.score >= 72, true);

    const downloadedFile = await fetch(`${BASE_URL}/api/files/${uploadedFile.id}/download`, {
      headers: { authorization: `Bearer ${nationalToken}` }
    });
    assert.equal(downloadedFile.status, 200);
    assert.equal(downloadedFile.headers.get("content-type"), "text/plain");
    assert.equal(await downloadedFile.text(), "GCOS automated file vault test");

    const objectStorageSmoke = await postJson("/api/files/object-smoke", {}, nationalToken);
    assert.equal(objectStorageSmoke.smoke.status, "passed");
    assert.equal(objectStorageSmoke.smoke.write, true);
    assert.equal(objectStorageSmoke.smoke.read, true);
    assert.equal(objectStorageSmoke.smoke.cleanup, true);
    assert.equal(objectStorageSmoke.files.provider, "filesystem");

    const classifiedDocument = await postJson(`/api/documents/${document.id}/classification`, {
      classification: "Executive packet"
    }, nationalToken);
    assert.equal(classifiedDocument.classification, "Executive packet");

    const ownedDocument = await postJson(`/api/documents/${document.id}/owner`, {
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(ownedDocument.owner, "np@rmvi.org");

    const reviewDocument = await postJson(`/api/documents/${document.id}/review`, {
      reason: "Automated review test"
    }, nationalToken);
    assert.equal(reviewDocument.status, "In Review");

    const archivedDocument = await postJson(`/api/documents/${document.id}/archive`, {
      reason: "Automated archive test"
    }, nationalToken);
    assert.equal(archivedDocument.status, "Archived");

    const sealedDocument = await postJson(`/api/documents/${document.id}/seal`, {
      reason: "Automated seal test"
    }, nationalToken);
    assert.equal(sealedDocument.status, "Sealed");

    const heldDocument = await postJson(`/api/documents/${document.id}/hold`, {
      reason: "Automated hold test"
    }, nationalToken);
    assert.equal(heldDocument.status, "Legal Hold");

    const retainedDocument = await postJson(`/api/documents/${document.id}/retention`, {
      retainedUntil: "Review in 2031"
    }, nationalToken);
    assert.equal(retainedDocument.retainedUntil, "Review in 2031");

    const duplicatedDocument = await postJson(`/api/documents/${document.id}/duplicate`, {
      name: "Automated duplicate packet.pdf",
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.equal(duplicatedDocument.name, "Automated duplicate packet.pdf");
    assert.equal(duplicatedDocument.classification, classifiedDocument.classification);

    const verifiedDocument = await postJson(`/api/documents/${document.id}/verify`, {
      note: "Automated integrity test"
    }, nationalToken);
    assert.equal(verifiedDocument.verified, true);
    assert.equal(verifiedDocument.verificationNote, "Automated integrity test");

    const custodyDocument = await postJson(`/api/documents/${document.id}/custody`, {
      custodian: "National Evidence Desk"
    }, nationalToken);
    assert.equal(custodyDocument.custodian, "National Evidence Desk");

    const chainedDocument = await postJson(`/api/documents/${document.id}/chain`, {
      chainHash: "sha256:test-document-chain"
    }, nationalToken);
    assert.equal(chainedDocument.chainHash, "sha256:test-document-chain");

    const extractedDocument = await postJson(`/api/documents/${document.id}/extract`, {
      text: "Signed packet text extraction"
    }, nationalToken);
    assert.equal(extractedDocument.extractedText, "Signed packet text extraction");

    const reportLinkedDocument = await postJson(`/api/documents/${document.id}/link-report`, {
      reportId: reports[0].id
    }, nationalToken);
    assert.equal(reportLinkedDocument.linkedReport, reports[0].id);

    const approvalLinkedDocument = await postJson(`/api/documents/${document.id}/link-approval`, {
      approvalId: approvals[0].id
    }, nationalToken);
    assert.equal(approvalLinkedDocument.linkedApproval, approvals[0].id);

    const watchedDocument = await postJson(`/api/documents/${document.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedDocument.watchers.includes("np@rmvi.org"), true);

    const exportedDocument = await postJson(`/api/documents/${document.id}/export`, {
      reason: "Automated evidence export"
    }, nationalToken);
    assert.equal(exportedDocument.exportReason, "Automated evidence export");

    const bulkSealedDocuments = await postJson("/api/documents/bulk/seal", {
      ids: [duplicatedDocument.id]
    }, nationalToken);
    assert.equal(bulkSealedDocuments.count, 1);
    assert.equal(bulkSealedDocuments.updated[0].status, "Sealed");

    const archiveManifest = await getJson("/api/archive/manifest", nationalToken);
    assert.equal(archiveManifest.total >= 1, true);
    assert.equal(archiveManifest.byStatus["Legal Hold"] >= 1, true);
    assert.equal(archiveManifest.verified >= 1, true);
    assert.equal(archiveManifest.custodyAssigned >= 1, true);
    assert.equal(archiveManifest.chainUpdated >= 1, true);
    assert.equal(archiveManifest.extracted >= 1, true);
    assert.equal(archiveManifest.linked >= 1, true);
    assert.equal(archiveManifest.watched >= 1, true);
    assert.equal(archiveManifest.exported >= 1, true);

    const auditNote = await postJson("/api/audit/note", {
      object: "Automated audit test",
      note: "Manual test note"
    }, nationalToken);
    assert.equal(auditNote.event, "AuditNote");

    const flaggedAudit = await postJson(`/api/audit/${auditNote.id}/flag`, {
      reason: "Automated flag test"
    }, nationalToken);
    assert.match(flaggedAudit.result, /^Flagged:/);

    const sealedAudit = await postJson(`/api/audit/${auditNote.id}/seal`, {
      reason: "Automated seal test"
    }, nationalToken);
    assert.equal(sealedAudit.sealed, true);
    assert.match(sealedAudit.chainHash, /^sha256:/);

    const verifiedAudit = await postJson(`/api/audit/${auditNote.id}/verify`, {
      result: "Automated integrity verified"
    }, nationalToken);
    assert.equal(verifiedAudit.verified, true);
    assert.equal(verifiedAudit.verification, "Automated integrity verified");

    const invalidAuditSeverity = await rawPost(`/api/audit/${auditNote.id}/severity`, {
      severity: "Severe"
    }, nationalToken);
    assert.equal(invalidAuditSeverity.status, 400);

    const forbiddenAuditSeverity = await rawPost(`/api/audit/${auditNote.id}/severity`, {
      severity: "Critical"
    }, localToken);
    assert.equal(forbiddenAuditSeverity.status, 403);

    const severityAudit = await postJson(`/api/audit/${auditNote.id}/severity`, {
      severity: "Critical"
    }, nationalToken);
    assert.equal(severityAudit.severity, "Critical");

    const categoryAudit = await postJson(`/api/audit/${auditNote.id}/category`, {
      category: "Security"
    }, nationalToken);
    assert.equal(categoryAudit.category, "Security");

    const reviewerAudit = await postJson(`/api/audit/${auditNote.id}/reviewer`, {
      reviewer: "np@rmvi.org"
    }, nationalToken);
    assert.equal(reviewerAudit.reviewer, "np@rmvi.org");

    const commentedAudit = await postJson(`/api/audit/${auditNote.id}/comment`, {
      comment: "Automated comment test"
    }, nationalToken);
    assert.equal(commentedAudit.comments.some((comment) => comment.includes("Automated comment test")), true);

    const investigatedAudit = await postJson(`/api/audit/${auditNote.id}/investigate`, {
      reason: "Automated investigation test"
    }, nationalToken);
    assert.equal(investigatedAudit.investigation, "Open");

    const heldAudit = await postJson(`/api/audit/${auditNote.id}/hold`, {
      reason: "Automated hold test"
    }, nationalToken);
    assert.equal(heldAudit.hold, true);

    const releasedAudit = await postJson(`/api/audit/${auditNote.id}/release-hold`, {
      reason: "Automated hold release test"
    }, nationalToken);
    assert.equal(releasedAudit.hold, false);

    const closedAudit = await postJson(`/api/audit/${auditNote.id}/close`, {
      result: "Automated investigation close test"
    }, nationalToken);
    assert.equal(closedAudit.investigation, "Closed");

    const bulkAuditFlag = await postJson("/api/audit/bulk/flag", {
      ids: [auditNote.id],
      reason: "Automated bulk flag test"
    }, nationalToken);
    assert.equal(bulkAuditFlag.count, 1);

    const bulkAuditSeal = await postJson("/api/audit/bulk/seal", {
      ids: [auditNote.id],
      reason: "Automated bulk seal test"
    }, nationalToken);
    assert.equal(bulkAuditSeal.count, 1);
    assert.equal(bulkAuditSeal.updated[0].sealed, true);

    const bulkAuditVerify = await postJson("/api/audit/bulk/verify", {
      ids: [auditNote.id],
      result: "Automated bulk verify test"
    }, nationalToken);
    assert.equal(bulkAuditVerify.count, 1);
    assert.equal(bulkAuditVerify.updated[0].verified, true);

    const auditDigest = await getJson("/api/audit/digest", nationalToken);
    assert.equal(auditDigest.total > 0, true);
    assert.equal(auditDigest.sealed >= 1, true);
    assert.equal(auditDigest.verified >= 1, true);
    assert.equal(auditDigest.critical >= 1, true);
    assert.equal(auditDigest.reviewers >= 1, true);

    const manualEvent = await postJson("/api/events", {
      object: "Automated event test",
      result: "Manual event test"
    }, nationalToken);
    assert.match(manualEvent.event, /^ManualEventRecorded:/);

    const invalidEventSeverity = await rawPost(`/api/events/${encodeURIComponent(manualEvent.event)}/severity`, {
      severity: "Emergency"
    }, nationalToken);
    assert.equal(invalidEventSeverity.status, 400);

    const acknowledgedEvent = await postJson(`/api/events/${encodeURIComponent(manualEvent.event)}/acknowledge`, {
      reason: "Automated event acknowledgement"
    }, nationalToken);
    assert.match(acknowledgedEvent.event, /^Acknowledged:/);

    const pinnedEvent = await postJson(`/api/events/${encodeURIComponent(acknowledgedEvent.event)}/pin`, {
      reason: "Automated event pin"
    }, nationalToken);
    assert.match(pinnedEvent.event, /^Pinned:/);

    const severityEvent = await postJson(`/api/events/${encodeURIComponent(pinnedEvent.event)}/severity`, {
      severity: "Critical"
    }, nationalToken);
    assert.match(severityEvent.event, /^Critical:/);

    const routedEvent = await postJson(`/api/events/${encodeURIComponent(severityEvent.event)}/route`, {
      route: "National Audit Desk"
    }, nationalToken);
    assert.match(routedEvent.event, /^Routed to National Audit Desk:/);

    const replayedEvent = await postJson(`/api/events/${encodeURIComponent(routedEvent.event)}/replay`, {
      reason: "Automated replay test"
    }, nationalToken);
    assert.match(replayedEvent.event, /^Replayed:/);

    const mutedEvent = await postJson(`/api/events/${encodeURIComponent(replayedEvent.event)}/mute`, {
      reason: "Automated mute test"
    }, nationalToken);
    assert.match(mutedEvent.event, /^Muted:/);

    const ownedEvent = await postJson(`/api/events/${encodeURIComponent(mutedEvent.event)}/owner`, {
      owner: "np@rmvi.org"
    }, nationalToken);
    assert.match(ownedEvent.event, /^Owner np@rmvi.org:/);

    const eventDigest = await getJson("/api/events/digest", nationalToken);
    assert.equal(eventDigest.total > 0, true);
    assert.equal(eventDigest.routed >= 1, true);

    const archivedEvent = await postJson(`/api/events/${encodeURIComponent(ownedEvent.event)}/archive`, {
      reason: "Automated event archive"
    }, nationalToken);
    assert.equal(archivedEvent.event, ownedEvent.event);

    const bulkEvent = await postJson("/api/events", {
      object: "Automated bulk event test",
      result: "Bulk event test"
    }, nationalToken);
    const bulkArchivedEvents = await postJson("/api/events/bulk/archive", {
      ids: [bulkEvent.event],
      reason: "Automated bulk event archive"
    }, nationalToken);
    assert.equal(bulkArchivedEvents.count, 1);

    const archivedSnapshotDocument = await postJson("/api/export/archive", {
      reason: "Automated snapshot archive test"
    }, nationalToken);
    assert.equal(archivedSnapshotDocument.classification, "Governance snapshot");
    assert.equal(archivedSnapshotDocument.source, "Audit");

    const clearedEvents = await postJson("/api/events/clear", {
      reason: "Automated event clear test"
    }, nationalToken);
    assert.equal(clearedEvents.events[0], "EventLogCleared: Event bus");

    const draft = await postJson("/api/ai-drafts", {
      kind: "Executive Summary",
      focus: "Automated workflow test"
    }, nationalToken);
    assert.equal(draft.title, "Executive Summary: Automated workflow test");
    assert.equal(draft.sourceCount > 0, true);

    const refreshedDraft = await postJson(`/api/ai-drafts/${draft.id}/refresh`, {
      focus: "Automated refreshed workflow test"
    }, nationalToken);
    assert.equal(refreshedDraft.title, "Executive Summary: Automated refreshed workflow test");
    assert.equal(refreshedDraft.sourceCount > 0, true);

    const statusDraft = await postJson(`/api/ai-drafts/${draft.id}/status`, {
      status: "Review"
    }, nationalToken);
    assert.equal(statusDraft.status, "Review");

    const sourceDraft = await postJson(`/api/ai-drafts/${draft.id}/sources`, {
      sourceNote: "Automated source binding",
      sourceCount: 99
    }, nationalToken);
    assert.equal(sourceDraft.sourceNote, "Automated source binding");
    assert.equal(sourceDraft.sourceCount >= 99, true);

    const confidenceDraft = await postJson(`/api/ai-drafts/${draft.id}/confidence`, {
      confidence: 96
    }, nationalToken);
    assert.equal(confidenceDraft.confidence, 96);

    const watchedDraft = await postJson(`/api/ai-drafts/${draft.id}/watch`, {
      watcher: "np@rmvi.org"
    }, nationalToken);
    assert.equal(watchedDraft.watchers.includes("np@rmvi.org"), true);

    const sealedDraft = await postJson(`/api/ai-drafts/${draft.id}/seal`, {}, nationalToken);
    assert.equal(sealedDraft.sealed, true);
    assert.match(sealedDraft.chainHash, /^sha256:/);

    const publishedDraft = await postJson(`/api/ai-drafts/${draft.id}/publish`, {}, nationalToken);
    assert.equal(publishedDraft.status, "Published");

    const duplicatedDraft = await postJson(`/api/ai-drafts/${draft.id}/duplicate`, {
      title: "Automated duplicate AI draft"
    }, nationalToken);
    assert.equal(duplicatedDraft.title, "Automated duplicate AI draft");
    assert.equal(duplicatedDraft.status, "Draft");

    const bulkRefreshedDrafts = await postJson("/api/ai-drafts/bulk/refresh", {
      ids: [duplicatedDraft.id],
      focus: "Automated AI bulk refresh"
    }, nationalToken);
    assert.equal(bulkRefreshedDrafts.count, 1);
    assert.equal(bulkRefreshedDrafts.updated[0].status, "Refreshed");

    const aiDraftDigest = await getJson("/api/ai-drafts/digest", nationalToken);
    assert.equal(aiDraftDigest.total > 0, true);
    assert.equal(aiDraftDigest.sealed >= 1, true);
    assert.equal(aiDraftDigest.watched >= 1, true);

    const archivedDraft = await postJson(`/api/ai-drafts/${draft.id}/archive`, {
      reason: "Automated AI archive test"
    }, nationalToken);
    assert.equal(archivedDraft.classification, "AI draft");
    assert.equal(archivedDraft.source, "AI Desk");

    const sync = await postJson("/api/offline-sync", {
      actions: [
        {
          event: "OfflineActionTest",
          object: "Cached branch report",
          result: "Queued locally"
        }
      ]
    }, localToken);
    assert.equal(sync.synced, 1);

    const persisted = JSON.parse(await readFile(dataPath, "utf8"));
    assert.equal(persisted.messages.some((item) => item.subject === "Automated API test notice"), true);
    assert.equal(persisted.messages.some((item) => item.subject === "Automated duplicated ChurchMail notice"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfflineActionTest"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionRenewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationSessionsRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionExtended"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionLocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionUnlocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionTrusted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionMfaRequired"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionDeviceLabeled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionNoteAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SessionsBulkRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessOwnerAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessRecheckScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessRemediationCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessOverrideApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessBulkAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReadinessCheckArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersistenceBackupCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersistenceVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "FileUploaded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "FileLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "FileDownloaded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlOwnerAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlEvidenceAttached"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlTested"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlRotated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlExceptionOpened"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlRemediationCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "SecurityControlsBulkTested"), true);
    assert.equal(persisted.securityControls.RBAC.owner, "np@rmvi.org");
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewRouted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceEvidenceAttached"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceRiskScored"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewAttested"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CompliancePacketPrepared"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewExported"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewEscalated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewBulkReviewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewsBulkReviewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ComplianceReviewArchived"), true);
    assert.equal(persisted.complianceReviews["comp-finance-q2"].packetId, "automated-packet");
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceCustodyAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceClassificationUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceChainUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceRetentionScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceHoldPlaced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceExported"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceBulkSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EvidenceArchived"), true);
    assert.equal(persisted.evidenceVault["ev-finance-ledger"].chainHash, "automated-chain-hash");
    assert.equal(persisted.audit.some((row) => row.event === "CommandBriefingArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandDirectiveIssued"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandTaskCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CommandEscalationOpened"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailClassified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailRouteUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailPriorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailEscalated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EmailsBulkApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportPathUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportEvidenceUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportReviewStarted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportScoreUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportDueUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportsBulkSubmitted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ReportsBulkCorrectionRequested"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalLimitUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalDelegated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalHeld"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalHoldReleased"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalsBulkSigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalSigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalRouteUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalsBulkApproved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ApprovalsBulkRejected"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftGenerated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftSourcesBound"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftConfidenceScored"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftPublished"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftsBulkRefreshed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskAdvanced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskAssigneeUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskPriorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskDueUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskBlocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskUnblocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskDependencyAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskApprovalRequested"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskSlaUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskEvidenceAttached"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskHandedOff"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskEscalated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskCommentAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskCheckpointAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskDispatched"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskTimeLogged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskQaReviewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskRiskAccepted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskTemplateSaved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskReportLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskApprovalLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TaskDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TasksBulkCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TasksBulkEscalated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TasksBulkScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyPublished"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyCategoryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicySummaryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyVersionBumped"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyReviewScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyComplianceChecked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyEvidenceBound"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyDistributed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyExceptionGranted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyTrainingAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyHoldApplied"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyTaskLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyApprovalLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PolicyDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PoliciesBulkActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PoliciesBulkReviewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarDateUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarPriorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventAtRisk"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarCategoryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventRescheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventCheckedIn"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarVenueUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarAgendaAttached"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarAttendanceLogged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarReminderSent"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarReadinessMarked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarTaskLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarReportLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventsBulkCompleted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "CalendarEventsBulkRescheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonRegistered"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonAssignmentUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonRoleUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonOnboardingStarted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonCredentialsReset"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonLeavePlaced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonClearanceUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonCredentialsVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonTrainingAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonStationAccessGranted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonIncidentFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonTaskLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonReviewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "PersonnelBulkCredentialReview"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeSupervisorUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeStatusUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeSuspended"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficePasswordRotated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeStationActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeDepartmentUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeLevelUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeEmailVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeNoteAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeCapacityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeComplianceReviewed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficeArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "OfficesBulkActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationLevelUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationAuthorityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationSuspended"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationMirrorCreated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationCredentialRotated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationCredentialResetForced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationMfaRequired"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationCredentialLocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationCredentialUnlocked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "StationsBulkVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationTriaged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationSlaUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationEvidenceAttached"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationCommentAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationResolutionNoted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationDueUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationTaskLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationReportLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationApprovalLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationImpactScored"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationsBulkResolved"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EscalationMerged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferRiskUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferPrepared"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferAccessRevoked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferStationActivated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferLetterRecorded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferScheduled"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferNoteAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferPersonnelLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferTaskLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferReportLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransfersBulkVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "TransferExecuted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentClassificationUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentOwnerUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentHoldPlaced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentRetentionUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentDuplicated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentCustodyAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentChainUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentTextExtracted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentReportLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentApprovalLinked"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentWatcherAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentExported"), true);
    assert.equal(persisted.audit.some((row) => row.event === "DocumentsBulkSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditNote"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowsBulkFlagged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditSeverityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditCategoryUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditReviewerAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditCommentAdded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditInvestigationOpened"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditInvestigationClosed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditHoldPlaced"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditHoldReleased"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowsBulkSealed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AuditRowsBulkVerified"), true);
    assert.equal(persisted.audit.some((row) => row.event === "ManualEventRecorded"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventAcknowledged"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventPinned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventSeverityUpdated"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventRouted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventReplayed"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventMuted"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventOwnerAssigned"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventsBulkArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "GovernanceSnapshotArchived"), true);
    assert.equal(persisted.audit.some((row) => row.event === "EventLogCleared"), true);
    assert.equal(persisted.audit.some((row) => row.event === "AIDraftRefreshed"), true);

    await stopApi(api);
    api = await startApi(dataPath, webDistPath);

    const messagesAfterRestart = await getJson("/api/messages");
    assert.equal(messagesAfterRestart.some((item) => item.subject === "Automated API test notice"), true);
    assert.equal(messagesAfterRestart.some((item) => item.subject === "Automated duplicated ChurchMail notice"), true);

    const reportsAfterRestart = await getJson("/api/reports");
    assert.equal(reportsAfterRestart.some((item) => item.name === "Automated mission finance report"), true);

    const approvalsAfterRestart = await getJson("/api/approvals");
    assert.equal(approvalsAfterRestart.some((item) => item.request === "Automated approval creation test"), true);

    const tasksAfterRestart = await getJson("/api/tasks");
    assert.equal(tasksAfterRestart.some((item) => item.title === "Automated task creation test"), true);
    assert.equal(tasksAfterRestart.some((item) => item.title === "Automated duplicate task follow-up"), true);

    const policiesAfterRestart = await getJson("/api/policies");
    assert.equal(policiesAfterRestart.some((item) => item.title === "Automated policy registry test"), true);
    assert.equal(policiesAfterRestart.some((item) => item.title === "Automated duplicate policy revision"), true);

    const calendarEventsAfterRestart = await getJson("/api/calendar-events");
    assert.equal(calendarEventsAfterRestart.some((item) => item.title === "Automated calendar event test"), true);
    assert.equal(calendarEventsAfterRestart.some((item) => item.title === "Automated duplicate calendar review"), true);

    const personnelAfterRestart = await getJson("/api/personnel");
    assert.equal(personnelAfterRestart[0].name, "Automated personnel registry test");

    const transfersAfterRestart = await getJson("/api/transfers");
    assert.equal(transfersAfterRestart.some((item) => item.person === "Automated transfer test"), true);

    const officesAfterRestart = await getJson("/api/offices");
    assert.equal(officesAfterRestart.some((item) => item.email === "automated_district@rmvi.org"), true);

    const documentsAfterRestart = await getJson("/api/documents");
    assert.equal(documentsAfterRestart.some((item) => item.name === "Automated signed packet.pdf"), true);
    assert.equal(documentsAfterRestart.some((item) => item.files?.some((file) => file.name === "automated-packet.txt")), true);
    assert.equal(documentsAfterRestart.some((item) => item.classification === "AI draft"), true);

    const reset = await postJson("/api/dev/reset", {});
    assert.equal(reset.messages[0].subject, "Q2 governance reporting directive");
    assert.equal(reset.tasks[0].title, "Review county finance packet");
    assert.equal(reset.policies[0].title, "Financial approval delegation policy");
    assert.equal(reset.calendarEvents[0].title, "National audit packet deadline");
    assert.equal(reset.personnel[0].name, "Rev. Daniel Moore");
    assert.equal(reset.audit[0].event, "DevReset");

    const malformedJson = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{bad-json"
    });
    assert.equal(malformedJson.status, 400);

    const oversizedBody = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "np@rmvi.org", password: "x".repeat(5000) })
    });
    assert.equal(oversizedBody.status, 413);

    await stopApi(api);
    api = await startApi(dataPath, webDistPath, {
      NODE_ENV: "production",
      GCOS_ENABLE_DEV_RESET: "0",
      GCOS_REQUIRE_API_AUTH: "1"
    });

    const disabledReset = await rawPost("/api/dev/reset", {});
    assert.equal(disabledReset.status, 401);

    const publicStatus = await getJson("/api/status");
    assert.equal(publicStatus.limits.requireApiAuth, true);
    assert.equal("sessions" in publicStatus, false);

    const protectedReadiness = await fetch(`${BASE_URL}/api/readiness`);
    assert.equal(protectedReadiness.status, 401);

    const protectedBootstrap = await fetch(`${BASE_URL}/api/bootstrap`);
    assert.equal(protectedBootstrap.status, 401);

    const publicBootstrap = await getJson("/api/bootstrap/public");
    assert.equal(Array.isArray(publicBootstrap.stations), true);

    const productionLogin = await postJson("/api/auth/login", {
      email: "mission@rmvi.org",
      password: demoPassword("mission")
    });
    const protectedReadinessWithToken = await getJson("/api/readiness", productionLogin.token);
    assert.equal(protectedReadinessWithToken.status, "ready");
  } finally {
    await stopApi(api);
    await rm(tempDir, { recursive: true, force: true });
  }
});

function startApi(dataPath, webDistPath, extraEnv = {}) {
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      GCOS_API_PORT: String(PORT),
      GCOS_DEPLOYMENT_TARGET: "local",
      GCOS_AUTH_PROVIDER: "local",
      GCOS_FIREBASE_WEB_API_KEY: "",
      GCOS_AUTH_FALLBACK_LOCAL: "1",
      GCOS_EMAIL_PROVIDER: "log",
      GCOS_STORAGE_PROVIDER: "json",
      GCOS_OBJECT_STORAGE_PROVIDER: "filesystem",
      GCOS_OBJECT_VAULT_PATH: join(dirname(dataPath), "object-vault"),
      GCOS_R2_ACCOUNT_ID: "",
      GCOS_R2_BUCKET: "",
      GCOS_R2_ACCESS_KEY_ID: "",
      GCOS_R2_SECRET_ACCESS_KEY: "",
      GCOS_DATABASE_URL: "",
      DATABASE_URL: "",
      GCOS_DATA_PATH: dataPath,
      GCOS_SERVE_WEB: "1",
      GCOS_WEB_DIST_PATH: webDistPath,
      GCOS_ALLOWED_ORIGIN: "https://admin.gcos.test",
      GCOS_MAX_BODY_BYTES: "4096",
      GCOS_LOGIN_RATE_LIMIT: "8",
      GCOS_LOGIN_RATE_WINDOW_MS: "300000",
      GCOS_MUTATION_RATE_LIMIT: "2000",
      GCOS_MUTATION_RATE_WINDOW_MS: "60000",
      GCOS_ENABLE_DEV_RESET: "1",
      ...extraEnv
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`API did not start. Output:\n${output}`));
    }, 5000);

    child.stdout.on("data", () => {
      if (output.includes(`http://127.0.0.1:${PORT}`)) {
        clearTimeout(timeout);
        resolve(child);
      }
    });

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code !== null && code !== 0) reject(new Error(`API exited with ${code}. Output:\n${output}`));
    });
  });
}

function stopApi(child) {
  if (!child || child.killed) return Promise.resolve();
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
    child.kill();
    setTimeout(resolve, 1000);
  });
}

async function getJson(path, token = "") {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  });
  assert.equal(response.ok, true, `${path} returned ${response.status}`);
  return response.json();
}

async function postJson(path, body, token = "") {
  const response = await rawPost(path, body, token);
  assert.equal(response.ok, true, `${path} returned ${response.status}`);
  return response.json();
}

function rawPost(path, body, token = "") {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}
