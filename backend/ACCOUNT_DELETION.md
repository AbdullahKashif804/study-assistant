# Account deletion audit and recovery

The existing cascade covered Notes, Assignments, Projects, Courses, Quizzes,
DailyTasks, ToDoTasks, and the User. It attempted attachment/profile cleanup but
did not check Cloudinary result statuses, and database deletes were sequential.
A partial failure could leave only some collections deleted. PendingSignup
records matching the account email were not cleaned up. Note AI summaries,
quizzes, and embedding chunks are embedded in Notes and disappear with them;
no separate user-owned AI collection was found. Quizzes currently have no
attachment field; the cleanup scan tolerates legacy attachment references.

## Flow and retry

The Settings form still requires typing `DELETE`. The API now validates this
confirmation and uses only `req.user._id` from verified JWT middleware.

1. A MongoDB transaction marks the account `accountDeletionPending`.
2. Middleware rejects new protected requests for that account, except the
   confirmed deletion endpoint. Sign-in remains available so an expired JWT
   does not prevent recovery through Settings.
3. Read all stored upload identifiers and delete Cloudinary resources using
   their stored resource types. Only `ok` and `not found` count as success.
   Missing identifiers or attachment resource types fail safely rather than
   silently orphaning files under an incorrectly guessed resource type.
4. A second transaction checks for changed upload references and deletes all
   seven owned collections, matching PendingSignup records using the stored
   account email, and the User together.

Cloudinary is outside the MongoDB transaction. If cleanup or the final database
transaction fails, the account remains pending, all database references remain,
and the API returns an error. Files already removed cannot be restored. Retry
through Settings, typing `DELETE` again; absent files are accepted on retries.
There is no automatic retry worker. Server logs identify cleanup failures.
For a malformed legacy attachment, an operator must repair the stored identifier
from trusted upload records before retrying; never guess a public ID or blindly
clear the pending flag. A lost success response can be checked by signing in:
the user record will be absent if the transaction committed.

## Deployment requirements and limits

MongoDB must support transactions (replica set or sharded deployment). On a
standalone server the initial transaction fails before any external resource is
deleted; no unsafe sequential fallback is used. Configure a transaction-capable
deployment before retrying. No database connection or real deletion was performed
as part of this audit.

The pending flag blocks requests authenticated after deletion starts. Requests
already past authentication, background indexing, and writes outside this API
can still be in flight. Changed upload references visible to the final transaction
are detected, but this is not a distributed barrier against late writes after
its snapshot. Quiesce the account's in-flight jobs/writes before deletion in a
multi-worker deployment. A strict guarantee against arbitrary concurrent writes
would require all write paths to participate in a shared deletion protocol;
normal CRUD handlers were intentionally not rewritten in this task.

Resources whose database references were already lost before this change cannot
be discovered by this cascade. Cloudinary delivery/CDN caches may outlive origin
deletion. No global Cloudinary sweep is performed because it could affect other
users.

## Verification

Run `node --test backend/tests/accountDeletion.test.js` from the repository root.
Tests use mocked models, transactions, JWT verification, and Cloudinary, with no
database or network connection. They cover owner scoping, complete cascade,
resource types, explicit confirmation, failure rollback, retry, changed uploads,
malformed references, unsupported transactions, and deleted/pending JWT access.

Manual integration checks still needed: disposable accounts on an isolated replica
set, real Cloudinary cleanup and retry, forced transaction failures, confirmation
and session clearing in the browser, and concurrent writes with production workers.
