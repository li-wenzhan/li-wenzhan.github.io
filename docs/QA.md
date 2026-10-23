# Verification

Checked on October 23, 2026.

## Content and build

- `npm run build` verifies both language editions, 38 local resource references,
  unique HTML IDs, JavaScript syntax, font formats, PDFs, and publication metadata.
- Publication titles and author order were checked against supplied camera-ready
  papers. Equal-contribution markers follow their explicit author notes.
- The CV remains the supplied three-page September 2026 document. Paper files
  and portrait are copied without content changes.
- Template demo biographies, sample institutions, publications, posts, and photos
  are absent from the published site. Source materials and private notes are not
  included in the deployment artifact.

## Browser checks

- English at `/`, Chinese at `/zh/`, and reciprocal language navigation preserving
  the reading section.
- Both editions at 1440, 768, 390, and 320 px, with no horizontal overflow.
- Four / three / one publication filters and accessible result announcements.
- Expandable contribution statements, citation dialogs, copy actions, Escape
  dismissal, and return of keyboard focus to the trigger.
- Light/dark switching and persisted theme preference.
- Mobile menu opening, link navigation, outside click, and Escape handling.
- Real 1280×720 robot-video decoding; no autoplay; playback pauses off screen.
- All inline images load, and no application JavaScript errors occur.
- Reduced-motion behavior removes the orbit traveler and smooth scrolling.
- Desktop, mobile, and Chinese dark-theme screenshots visually inspected.

## Delivery

GitHub Actions builds only the public static files into `dist/` and deploys them
to Pages. The original personal repository history and template attribution are
preserved; publication does not require force-pushing.
