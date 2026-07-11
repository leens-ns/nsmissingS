# nsmissingS security notes

## What changed

- `nsmissingS.html` now queries only `lost_items` whose `status` is `stored`.
- `nsibmistchr.html` no longer treats every `@nsworld.net` account as a teacher.
- `admin.html` provides a dedicated admin screen for account management, operating status, manuals, and security checks.
- Teacher access is controlled by the Firestore `authorized_users` collection.
- `leens@nsworld.net` is the bootstrap administrator account.
- Administrators can add or disable allowed teacher accounts from the teacher page.
- `firestore.rules` contains the matching Firestore access rules.
- UI updates load the free Paperlogy WOFF2 files through jsDelivr with system fallbacks and do not add a paid font/API dependency.

## Free operation guardrails

- Keep the Firebase project on the Spark/free plan or keep billing disabled.
- Avoid adding scheduled background jobs that repeatedly read Firestore.
- Admin statistics load only when a user clicks the button, reducing unnecessary reads.
- No paid API, paid font CDN, or paid hosting dependency was added.
- If free quota is exceeded with billing disabled, Firebase should limit service instead of charging.

## Image storage and billing audit

- Current image uploads do not use Firebase Storage. `nsibmistchr.html` uploads resized images to ImgBB and stores only the returned `imageUrl` string in Firestore.
- The Firebase `storageBucket` value is present in config, but the app does not load the Firebase Storage SDK or call Firebase Storage upload APIs.
- Firestore cost exposure from images is therefore limited to normal document reads/writes/deletes for `lost_items`, not image bytes.
- Images are validated before upload. Only JPG, PNG, and WebP files up to 10MB are accepted.
- Images are resized in the browser to a maximum side length of 600px and JPEG quality 0.7 before upload, which lowers network usage and third-party storage size.
- ImgBB uploads now use a 90-day expiration. Firestore stores the public `imageUrl` and the expected `imageExpiresAt` timestamp.
- Deleting a Firestore lost-item document does not directly delete the original ImgBB image. The 90-day expiration reduces long-term retention, but immediate removal is still not guaranteed by the app.
- The ImgBB API key is embedded in client-side HTML, so anyone who can view the page source can reuse it. This is not a Firebase billing risk, but it can cause ImgBB quota abuse, account suspension, or unexpected dependency problems.
- Do not move images to Firebase Storage unless the Firebase project is confirmed to remain on Spark/free plan with billing disabled and file-size/type rules are deployed. Firebase Storage on Blaze can bill for storage, downloads, and operations after free quotas.

## Required deployment order

1. Deploy `firestore.rules` to the Firebase project.
2. Open `nsibmistchr.html` as `leens@nsworld.net`.
3. Add allowed teacher accounts from the "허용 교직원 관리" panel.
4. Deploy the updated `nsmissingS.html`, `nsibmistchr.html`, and `admin.html`.

## Recommended next admin features

- Export filtered lost-item records to CSV for monthly checks.
- Add an audit log collection for create, edit, found, discard, delete, and account changes.
- Add a dashboard showing items close to discard date and recently returned items.
- Replace hard delete with soft delete so accidental deletions can be restored.
- If image retention must be fully controlled by the school, consider a Firebase Storage migration only after confirming billing is disabled or strict no-cost guardrails are in place.
