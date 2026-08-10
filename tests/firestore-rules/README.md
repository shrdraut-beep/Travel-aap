# Firestore security-rules tests

Exercises `firestore.rules` against the Firestore emulator. These tests assert both
that attackers are blocked *and* that legitimate app flows still work, so run them
after any rules change.

## Requirements

- Java 11+ (the Firestore emulator is a JVM process)
- Node 18+

## Setup

```bash
cd tests/firestore-rules
npm install
```

Installed separately from the root project on purpose: `@firebase/rules-unit-testing`
pins `firebase` v11, while the app depends on v12.

## Running

Start the emulator from the repository root (`firebase-tools` is a dev dependency of
this test package, so use its binary - the root project does not install it):

```bash
./tests/firestore-rules/node_modules/.bin/firebase emulators:start --only firestore --project rules-test
```

Then, in a second terminal:

```bash
cd tests/firestore-rules
npm test
```

Expected output ends with `64 passed, 0 failed`. `PERMISSION_DENIED` lines in the
output are normal - they are the `assertFails` cases logging their denial.

## Coverage

- `users` / `metrics` - the two collections that were previously world readable and writable
- `user_profiles`, `fcm_tokens` - self-access only; tokens are never client-readable
- `trips` - owner access, cross-user denial, and create-time ownership binding
- `trips` shared `SF-*` links - the share link still reads, but no client can write
  without having been added to `memberUids` by the backend join endpoint
- `trips` passcodes - a passcode can never be written back into the (publicly readable)
  trip document, including on legacy docs that still hold one
- `memberUids` - members and non-members alike cannot grant access to anyone
- `trip_secrets` - unreadable and unwritable by every client, admins included
- `support_tickets` - reporter sees only their own; admin sees all
- admin console access via both the `admin` custom claim and the verified-email fallback
- default-deny for undeclared collections
