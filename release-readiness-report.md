# Release Readiness Report

**Generated against:** uncommitted working-tree changes vs. `v1.0 release` commit  
**Verdict:** 🟡 **CONDITIONALLY SHIP-READY** *(no blockers — minor suggestions remain)*

---

## Summary

Both blockers from the previous report have been resolved. The field rename (`userId` → `id`) has been reverted, the new deactivate route is fully documented in `api-spec.md`, and its two tests pass. All 6 tests pass cleanly.

One **non-blocking observation** was surfaced by the breaking-change agent: after a deactivate call, subsequent `GET /users` and `GET /users/:id` responses will include an undocumented `active` field because the mutation is stored on the in-memory object. This is a schema-scope gap in the spec, not a code defect, and does not block release — but should be tracked.

The one **pre-existing gap** (`POST /users` has no tests) is carried forward from v1.0 and is not a regression introduced by this change set.

---

## Blocking Issues

*None.* All previously identified blockers are resolved.

---

## Suggestions

### 1. Document `active` field on GET responses (low urgency)

After `POST /users/:id/deactivate` is called, both `GET /users` and `GET /users/:id` return the user record with an `active: false` field that is not described in those endpoints' response schemas in `api-spec.md`. Consumers reading those endpoints will see an undocumented field.

**Recommended fix:** Add an optional `active` field entry to the `GET /users` and `GET /users/:id` field tables in `api-spec.md`, noting it is only present after a deactivation.

### 2. Add tests for `POST /users` (pre-existing gap)

`POST /users` has no test coverage — neither the happy path (201 + user object) nor the validation error path (400 when `name`/`email` missing). This gap predates the current changes but means the creation flow has no regression safety net in CI.

**Recommended fix:** Add a `describe('POST /users')` block to `tests/users.test.js` with at least a happy-path and a 400-validation test.

---

## Risk Assessment

| Change | Risk | Justification |
|--------|------|---------------|
| `GET /users/:id` field rename — **reverted** | 🟢 Low | Response is back to `{ id, name, email }`, spec and test agree, no consumer impact |
| `POST /users/:id/deactivate` — new route | 🟢 Low | Fully documented in `api-spec.md`; happy-path and 404 tests both pass |
| `POST /users` — no test coverage | 🟡 Medium | Pre-existing gap from v1.0, not a new regression; creation logic is untested in CI |

**Overall Release Risk: 🟢 Low — all documented changes are spec-compliant with passing tests; remaining gaps are pre-existing and non-blocking.**

---

## Changelog

*(Changes since `v1.0 release` commit — uncommitted)*

### Features
- `POST /users/:id/deactivate` — new route that marks a user inactive by setting `active: false` on their in-memory record. Returns the updated user object `{ id, name, email, active }`. Documented in `api-spec.md`. Covered by 2 new Jest tests.

### Fixes
- `GET /users/:id` — field rename (`id` → `userId`) introduced in pre-release was **reverted**. Response shape is unchanged from v1.0: `{ id, name, email }`.

### Breaking Changes
- None.
