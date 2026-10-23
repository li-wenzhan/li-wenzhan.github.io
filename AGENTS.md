# Working on this homepage

- Publish the personal website at `https://li-wenzhan.github.io/`. The MERL project
  homepage is exclusively `https://merl-project.github.io/`.
- Edit `_data/profile.json` for biography, news, publication metadata, education,
  experience, and contact information. Run `npm run build` to regenerate the
  checked-in `index.html`, `404.html`, sitemap, and deployable `dist/`.
- English is the default. Keep `_data/profile.zh.json` and `_data/i18n.json`
  synchronized, and include generated `zh/index.html` when updating content.
- Preserve verified authorship, accepted/published status, current student status,
  and contribution scopes. Never invent awards, affiliations, availability,
  Google Scholar IDs, citations, or achievements.
- Keep unfinished work at the public problem/goal level. Keep private notes,
  proposals, personal source directories, and credentials out of the repository.
- Retain the source CV's date unless the CV itself is updated. Do not silently
  relabel the existing September 2026 PDF as newly revised.
- Preserve reduced-motion support, keyboard navigation, readable contrast,
  opt-in video playback, mobile layout, and static/no-JavaScript content.
- Run `npm run build`, `git diff --check`, and browser checks appropriate to the
  changes. Avoid unrelated source or asset changes.
- Use an English commit subject `Type(module): Summary`, followed by a blank
  line and detailed English bullet points. Stage intended files only. Every
  commit must be followed by a push to the corresponding remote branch.
- Never force-push or rewrite shared history. Keep template attribution and
  the existing MIT license; font, paper, photo, and logo rights remain separate.
