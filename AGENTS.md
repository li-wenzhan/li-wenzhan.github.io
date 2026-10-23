# Working on this homepage

- Publish the personal website at `https://li-wenzhan.github.io/`. The MERL project
  homepage is exclusively `https://merl-project.github.io/`.
- Edit `_data/profile.json` for biography, news, publication metadata, education,
  experience, and contact information. Run `npm run build` to regenerate the
  checked-in root and subpage HTML, `404.html`, sitemap, and deployable `dist/`.
- English is the default. Keep `_data/profile.zh.json` and `_data/i18n.json`
  synchronized, and include all generated English/Chinese pages when updating content.
- Use `displayName` for localized identity (李文湛 in Chinese). Keep `name` and
  publication author lists in their original English bibliographic form.
- Maintain official person/institution destinations in `_data/links.json`.
- Emphasize doctoral research at SLAI / EACV while preserving SYSU enrollment.
  Institution names and logos use English main homepages; school/lab/center
  mentions can use dedicated destinations.
- The continuous RA appointment spans CUHK-Shenzhen (Aug–Nov 2025) then SYSU
  (Dec 2025–Apr 2026), following the advisor's move. Do not restore the former
  contract-only description or announce RA completion in News.
- Preserve the author's corrected News dates in the data source. News sorts
  automatically newest first. RA end dates belong in Experience, not News.
- Honors are reserved in `_data/honors.json`. Keep the section hidden while the
  bilingual arrays are empty. Never publish sample awards.
- Group DADA's WPBP @ ICRA 2026 oral extended abstract with DADA; do not count it
  as an additional full paper. Keep the supplied acceptance email private.
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
