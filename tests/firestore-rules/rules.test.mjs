import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, addDoc,
} from 'firebase/firestore';
import fs from 'fs';

const RULES = fs.readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');

const ADMIN = 'shrd.raut@gmail.com';
const ALICE = 'alice@example.com';
const BOB = 'bob@example.com';

let testEnv;
let pass = 0, fail = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    pass++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    fail++;
    failures.push(name);
    console.log(`  FAIL  ${name}\n          ${String(e.message).split('\n')[0]}`);
  }
}

// A valid trip doc that satisfies isValidTrip()
function trip(overrides = {}) {
  return {
    id: 'trip_1', name: 'Goa Trip',
    startDate: '2026-01-01', endDate: '2026-01-05',
    ...overrides,
  };
}

testEnv = await initializeTestEnvironment({
  projectId: 'rules-test',
  firestore: { rules: RULES, host: '127.0.0.1', port: 8080 },
});

const anon = testEnv.unauthenticatedContext().firestore();
const alice = testEnv.authenticatedContext('alice_uid', { email: ALICE, email_verified: true }).firestore();
const bob = testEnv.authenticatedContext('bob_uid', { email: BOB, email_verified: true }).firestore();
const admin = testEnv.authenticatedContext('admin_uid', { email: ADMIN, email_verified: true }).firestore();
const adminUnverified = testEnv.authenticatedContext('au_uid', { email: ADMIN, email_verified: false }).firestore();
const claimAdmin = testEnv.authenticatedContext('ca_uid', { email: 'ops@x.com', email_verified: true, admin: true }).firestore();

// Seed data bypassing rules
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'users/alice_uid'), { email: ALICE, name: 'Alice' });
  await setDoc(doc(db, 'users/bob_uid'), { email: BOB });
  await setDoc(doc(db, 'user_profiles/alice_uid'), { bio: 'hi' });
  await setDoc(doc(db, 'metrics/global'), { count: 1 });
  await setDoc(doc(db, 'fcm_tokens/tok_alice'), { userId: 'alice_uid', token: 'tok_alice' });
  await setDoc(doc(db, 'trips/trip_alice'), trip({ id: 'trip_alice', userEmail: ALICE, userId: 'alice_uid' }));
  // Shared trip: passcode lives in trip_secrets, members are tracked in memberUids.
  await setDoc(doc(db, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid'] }));
  await setDoc(doc(db, 'trip_secrets/SF-ABC123'), { passcode: '1234', tripId: 'SF-ABC123' });
  // A legacy shared trip that still has a passcode field in the document.
  await setDoc(doc(db, 'trips/SF-LEGACY'), trip({ id: 'SF-LEGACY', passcode: '1234' }));
  await setDoc(doc(db, 'support_tickets/t_alice'), { userEmail: ALICE, issue: 'help', status: 'Open' });
  await setDoc(doc(db, 'test/connection'), {});
});

console.log('\n--- CRITICAL: previously world-open collections ---');
await check('anon CANNOT read any user doc', () => assertFails(getDoc(doc(anon, 'users/alice_uid'))));
await check('anon CANNOT write a user doc', () => assertFails(setDoc(doc(anon, 'users/alice_uid'), { email: 'hacked' })));
await check('bob CANNOT read alice user doc', () => assertFails(getDoc(doc(bob, 'users/alice_uid'))));
await check('bob CANNOT overwrite alice user doc', () => assertFails(setDoc(doc(bob, 'users/alice_uid'), { email: 'hacked' })));
await check('alice CAN read her own user doc', () => assertSucceeds(getDoc(doc(alice, 'users/alice_uid'))));
await check('alice CAN write her own user doc', () => assertSucceeds(setDoc(doc(alice, 'users/alice_uid'), { email: ALICE })));
await check('anon CANNOT read metrics (collection removed)', () => assertFails(getDoc(doc(anon, 'metrics/global'))));
await check('anon CANNOT write metrics', () => assertFails(setDoc(doc(anon, 'metrics/global'), { count: 999 })));
await check('alice CANNOT write metrics either', () => assertFails(setDoc(doc(alice, 'metrics/global'), { count: 999 })));

console.log('\n--- user_profiles ---');
await check('alice CAN read own profile', () => assertSucceeds(getDoc(doc(alice, 'user_profiles/alice_uid'))));
await check('alice CAN delete own profile (account deletion)', () => assertSucceeds(deleteDoc(doc(alice, 'user_profiles/alice_uid'))));
await check('bob CANNOT read alice profile', () => assertFails(getDoc(doc(bob, 'user_profiles/alice_uid'))));

console.log('\n--- fcm_tokens (write-only, never client-readable) ---');
await check('alice CAN register token for own uid', () => assertSucceeds(setDoc(doc(alice, 'fcm_tokens/tok_new'), { userId: 'alice_uid', token: 'tok_new' })));
await check('alice CANNOT register token for bob', () => assertFails(setDoc(doc(alice, 'fcm_tokens/tok_x'), { userId: 'bob_uid', token: 'tok_x' })));
await check('anon CANNOT register a token', () => assertFails(setDoc(doc(anon, 'fcm_tokens/tok_y'), { userId: 'guest', token: 'tok_y' })));
await check('alice CANNOT read her own token doc', () => assertFails(getDoc(doc(alice, 'fcm_tokens/tok_alice'))));
await check('admin CANNOT read token docs from client', () => assertFails(getDoc(doc(admin, 'fcm_tokens/tok_alice'))));

console.log('\n--- trips: owner access preserved ---');
await check('alice CAN get her own trip', () => assertSucceeds(getDoc(doc(alice, 'trips/trip_alice'))));
await check('alice CAN list her trips by userEmail', () => assertSucceeds(getDocs(query(collection(alice, 'trips'), where('userEmail', '==', ALICE)))));
await check('alice CAN create a trip owned by her', () => assertSucceeds(setDoc(doc(alice, 'trips/trip_new'), trip({ id: 'trip_new', userEmail: ALICE, userId: 'alice_uid' }))));
await check('alice CAN update her own trip', () => assertSucceeds(setDoc(doc(alice, 'trips/trip_alice'), trip({ id: 'trip_alice', userEmail: ALICE, userId: 'alice_uid', name: 'Renamed' }))));
await check('alice CAN delete her own trip', () => assertSucceeds(deleteDoc(doc(alice, 'trips/trip_new'))));
await check('bob CANNOT get alice trip', () => assertFails(getDoc(doc(bob, 'trips/trip_alice'))));
await check('bob CANNOT delete alice trip', () => assertFails(deleteDoc(doc(bob, 'trips/trip_alice'))));
await check('anon CANNOT list all trips', () => assertFails(getDocs(collection(anon, 'trips'))));

console.log('\n--- trips: create cannot impersonate (new hardening) ---');
await check('bob CANNOT create trip attributed to alice email', () => assertFails(setDoc(doc(bob, 'trips/trip_imp1'), trip({ id: 'trip_imp1', userEmail: ALICE }))));
await check('bob CANNOT create trip attributed to alice uid', () => assertFails(setDoc(doc(bob, 'trips/trip_imp2'), trip({ id: 'trip_imp2', userId: 'alice_uid' }))));
await check('trip create rejects invalid shape (no endDate)', () => assertFails(setDoc(doc(alice, 'trips/trip_bad'), { id: 'trip_bad', name: 'x', startDate: '2026-01-01' })));
await check('trip create rejects auto-id addDoc w/ placeholder owner (old FutureTripModal bug)', () => assertFails(addDoc(collection(alice, 'trips'), { name: 'x', startDate: '2026-01-01', days: 3, ownerId: 'placeholder-user-id' })));

console.log('\n--- trips: shared SF- links are readable but NOT writable by anon ---');
await check('anon CAN still get a shared SF- trip (share links keep working)', () => assertSucceeds(getDoc(doc(anon, 'trips/SF-ABC123'))));
await check('anon CANNOT update a shared trip at all (hole closed)', () => assertFails(setDoc(doc(anon, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid'], name: 'Edited' }))));
await check('anon CANNOT update by supplying the passcode', () => assertFails(setDoc(doc(anon, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', passcode: '1234', name: 'Edited' }))));
await check('anon CANNOT update legacy trip by echoing its stored passcode', () => assertFails(setDoc(doc(anon, 'trips/SF-LEGACY'), trip({ id: 'SF-LEGACY', passcode: '1234', name: 'Edited' }))));
await check('signed-in non-member CANNOT update a shared trip', () => assertFails(setDoc(doc(bob, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid'], name: 'Bob edit' }))));
await check('joined member CAN update a shared trip', () => assertSucceeds(setDoc(doc(alice, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid'], name: 'Alice edit' }))));
await check('anon CANNOT change a trip id', () => assertFails(setDoc(doc(anon, 'trips/SF-ABC123'), trip({ id: 'SF-DIFFERENT', memberUids: ['alice_uid'] }))));

console.log('\n--- trips: passcode may never be written back into the document ---');
await check('owner CANNOT write a passcode into their trip', () => assertFails(setDoc(doc(alice, 'trips/trip_alice'), trip({ id: 'trip_alice', userEmail: ALICE, userId: 'alice_uid', passcode: '1234' }))));
await check('member CANNOT reintroduce a passcode on a shared trip', () => assertFails(setDoc(doc(alice, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid'], passcode: '1234' }))));

console.log('\n--- trips: members cannot grant access to others ---');
await check('member CANNOT add another uid to memberUids', () => assertFails(setDoc(doc(alice, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid', 'bob_uid'] }))));
await check('member CANNOT drop memberUids to escape the check', () => assertFails(setDoc(doc(alice, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123' }))));
await check('non-member CANNOT add themselves to memberUids', () => assertFails(setDoc(doc(bob, 'trips/SF-ABC123'), trip({ id: 'SF-ABC123', memberUids: ['alice_uid', 'bob_uid'] }))));

console.log('\n--- trip_secrets are invisible to every client ---');
await check('anon CANNOT read a trip secret', () => assertFails(getDoc(doc(anon, 'trip_secrets/SF-ABC123'))));
await check('trip member CANNOT read a trip secret', () => assertFails(getDoc(doc(alice, 'trip_secrets/SF-ABC123'))));
await check('admin CANNOT read a trip secret from the client', () => assertFails(getDoc(doc(admin, 'trip_secrets/SF-ABC123'))));
await check('anon CANNOT write a trip secret', () => assertFails(setDoc(doc(anon, 'trip_secrets/SF-ABC123'), { passcode: '0000' })));
await check('owner CANNOT overwrite a trip secret', () => assertFails(setDoc(doc(alice, 'trip_secrets/SF-ABC123'), { passcode: '0000' })));

console.log('\n--- support_tickets ---');
await check('alice CAN read her own ticket', () => assertSucceeds(getDoc(doc(alice, 'support_tickets/t_alice'))));
await check('bob CANNOT read alice ticket', () => assertFails(getDoc(doc(bob, 'support_tickets/t_alice'))));
await check('bob CANNOT list all tickets', () => assertFails(getDocs(collection(bob, 'support_tickets'))));
await check('bob CANNOT modify alice ticket', () => assertFails(setDoc(doc(bob, 'support_tickets/t_alice'), { userEmail: ALICE, status: 'Closed' })));
await check('alice CAN file a ticket as herself', () => assertSucceeds(setDoc(doc(alice, 'support_tickets/t_new'), { userEmail: ALICE, issue: 'x' })));
await check('bob CANNOT file a ticket as alice', () => assertFails(setDoc(doc(bob, 'support_tickets/t_fake'), { userEmail: ALICE, issue: 'x' })));

console.log('\n--- admin console access ---');
await check('admin CAN list all users', () => assertSucceeds(getDocs(collection(admin, 'users'))));
await check('admin CAN list all trips (unconstrained)', () => assertSucceeds(getDocs(collection(admin, 'trips'))));
await check('admin CAN list all support tickets', () => assertSucceeds(getDocs(collection(admin, 'support_tickets'))));
await check('custom-claim admin CAN list all users', () => assertSucceeds(getDocs(collection(claimAdmin, 'users'))));
await check('UNVERIFIED admin email CANNOT list users', () => assertFails(getDocs(collection(adminUnverified, 'users'))));
await check('non-admin bob CANNOT list all users', () => assertFails(getDocs(collection(bob, 'users'))));
await check('anon CANNOT list all users', () => assertFails(getDocs(collection(anon, 'users'))));

console.log('\n--- connectivity probe ---');
await check('anon CAN read test/connection probe', () => assertSucceeds(getDoc(doc(anon, 'test/connection'))));
await check('anon CANNOT write test/connection', () => assertFails(setDoc(doc(anon, 'test/connection'), { x: 1 })));

console.log('\n--- unknown collections default-deny ---');
await check('anon CANNOT read an undeclared collection', () => assertFails(getDoc(doc(anon, 'random_stuff/x'))));
await check('alice CANNOT write an undeclared collection', () => assertFails(setDoc(doc(alice, 'random_stuff/x'), { a: 1 })));
await check('alice CANNOT read expenses (no rule declared)', () => assertFails(getDocs(collection(alice, 'expenses'))));

await testEnv.cleanup();

console.log(`\n================ ${pass} passed, ${fail} failed ================`);
if (fail) {
  console.log('FAILED:');
  failures.forEach(f => console.log('  - ' + f));
  process.exit(1);
}

