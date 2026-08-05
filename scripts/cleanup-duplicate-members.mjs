/**
 * cleanup-duplicate-members.mjs
 *
 * One-time maintenance script: scans every trip document in Firestore and
 * merges duplicate Member entries (same name, different id) that were
 * created by the pre-fix bug. Safe to re-run — it's idempotent.
 *
 * WHAT IT DOES PER TRIP:
 *   1. Groups members by trimmed/lowercased name.
 *   2. Keeps the member with the EARLIEST id (oldest / first-created wins)
 *      as the "canonical" member.
 *   3. Re-points every expense.paidBy, expense.splitWith, and deposit.memberId
 *      that referenced a duplicate id to the canonical id.
 *   4. Merges totalDeposited from the duplicate(s) into the canonical member.
 *   5. Removes the duplicate member objects from trip.members.
 *   6. Writes the trip back only if something actually changed.
 *
 * HOW TO RUN:
 *   1. npm install firebase-admin
 *   2. Download a Firebase service account key (Firebase Console ->
 *      Project Settings -> Service Accounts -> Generate new private key)
 *      and save it as serviceAccountKey.json next to this script.
 *   3. Dry run first (recommended):
 *        node scripts/cleanup-duplicate-members.mjs --dry-run
 *   4. Apply for real:
 *        node scripts/cleanup-duplicate-members.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import admin from 'firebase-admin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

const serviceAccount = JSON.parse(
  readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function mergeTrip(trip) {
  const members = Array.isArray(trip.members) ? trip.members : [];
  if (members.length < 2) return null;

  // Group members by normalized name
  const groups = new Map();
  for (const m of members) {
    if (!m || !m.id) continue;
    const key = normalizeName(m.name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }

  const idRemap = new Map(); // duplicateId -> canonicalId
  const canonicalMembers = [];
  let hasDuplicates = false;

  for (const [, group] of groups) {
    if (group.length === 1) {
      canonicalMembers.push(group[0]);
      continue;
    }
    hasDuplicates = true;
    // Pick canonical = the one whose id sorts first (oldest, since ids are
    // "m" + Date.now() + i or the admin's userId). Prefer a non-"m..."-style
    // id (real user id) over generated "mXXXX" ids if present.
    const sorted = [...group].sort((a, b) => {
      const aIsUserId = !String(a.id).startsWith('m');
      const bIsUserId = !String(b.id).startsWith('m');
      if (aIsUserId !== bIsUserId) return aIsUserId ? -1 : 1;
      return String(a.id).localeCompare(String(b.id));
    });
    const canonical = { ...sorted[0] };
    canonical.totalDeposited = group.reduce((sum, m) => sum + (Number(m.totalDeposited) || 0), 0);

    for (const dup of sorted.slice(1)) {
      idRemap.set(dup.id, canonical.id);
    }
    canonicalMembers.push(canonical);
  }

  if (!hasDuplicates) return null;

  // Re-point expenses
  const expenses = (trip.expenses || []).map((exp) => {
    const paidBy = idRemap.get(exp.paidBy) || exp.paidBy;
    const splitWith = Array.isArray(exp.splitWith)
      ? Array.from(new Set(exp.splitWith.map((id) => idRemap.get(id) || id)))
      : exp.splitWith;
    return { ...exp, paidBy, splitWith };
  });

  // Re-point deposits
  const deposits = (trip.deposits || []).map((dep) => ({
    ...dep,
    memberId: idRemap.get(dep.memberId) || dep.memberId,
  }));

  // Re-point adminId if it happened to be a duplicate
  const adminId = idRemap.get(trip.adminId) || trip.adminId;

  return {
    ...trip,
    members: canonicalMembers,
    expenses,
    deposits,
    adminId,
    _mergedDuplicateIds: Array.from(idRemap.keys()),
  };
}

async function main() {
  console.log(DRY_RUN ? 'Running in DRY-RUN mode (no writes)...' : 'Running LIVE (will write changes)...');
  const snapshot = await db.collection('trips').get();
  console.log(`Scanned ${snapshot.size} trips.`);

  let fixedCount = 0;
  for (const docSnap of snapshot.docs) {
    const trip = docSnap.data();
    const merged = mergeTrip(trip);
    if (!merged) continue;

    fixedCount++;
    console.log(`\nTrip "${trip.name}" (${docSnap.id}):`);
    console.log(`  Removed duplicate member ids: ${merged._mergedDuplicateIds.join(', ')}`);
    console.log(`  Members before: ${trip.members.length} -> after: ${merged.members.length}`);

    if (!DRY_RUN) {
      const { _mergedDuplicateIds, ...toWrite } = merged;
      await docSnap.ref.set(toWrite, { merge: false });
      console.log('  ✔ Saved.');
    }
  }

  console.log(`\nDone. ${fixedCount} trip(s) had duplicates ${DRY_RUN ? 'found' : 'fixed'}.`);
  if (DRY_RUN && fixedCount > 0) {
    console.log('Re-run without --dry-run to apply these changes.');
  }
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
