# Design critique: arvindymsma.solutions portfolio

**Stage:** refinement → launch. **Audience:** recruiters, hiring managers and SMB clients in Cebu / PH.
**Reviewed:** desktop 1366 px and mobile 390 px, before and after changes.

## Overall impression

The "daily time record" concept is a genuinely memorable hook for someone who builds HR/attendance software:
the time-card, the red "Clocked in" stamp and "Still clocked in" status tie the visual identity to the work.
The biggest issue was not design at all — the site didn't load. After that: a few collisions, a mobile nav that
ran off-screen, and content that tells what was built but rarely what it achieved.

## Usability

| Finding | Severity | Fix applied / recommendation |
|---|---|---|
| Blank page on GitHub Pages (base path, broken build, Jekyll workflow) | 🔴 Critical | Fixed — see ADR-001 |
| Mobile nav: 5 links + name overflowed at 390 px; "Contact" touched the edge, would clip at 360 px | 🔴 Critical | Name on its own line, links in a swipeable row with a fade hint; 44 px tap targets |
| "Print / Save as PDF" button on card.html never appeared (`display:none` was never overridden) | 🟡 Moderate | Rebuilt card page with a toolbar: back to portfolio, save contact, print |
| Business card URL truncated to "adymsma-works.github.i…" | 🟡 Moderate | URL wraps at "/" instead of truncating |
| Phone number only on the card, not in Contact | 🟡 Moderate | Contact now lists email, phone, LinkedIn, GitHub, company, .vcf with labels |
| Experience listed oldest-first | 🟡 Moderate | Newest first, current role highlighted |
| No active-section indicator in the sticky nav | 🟢 Minor | Scroll-spy underline (`aria-current`) |
| No 404 page | 🟢 Minor | Themed 404 ("Not clocked in here.") |

## Visual hierarchy

- **What draws the eye first:** the headline — correct. With the real Big Shoulders font (now self-hosted, so it
  always loads) it sets in 5 lines instead of 7, which pulls the CTAs ~150 px higher on a laptop screen.
- **Reading flow:** eyebrow (role · city) → headline → one-sentence lead → Resume / Email → time card. Added the
  eyebrow so role and location are readable in the first second.
- **Emphasis:** the "Clocked in" stamp covered the "Daily time record" title. Moved to the bottom-right beside the
  clock, where it reads as a punch on the card instead of a smudge over the header.

## Consistency

| Element | Issue | Fix |
|---|---|---|
| Palette | Two palettes in conflict (old sage/red vs. MSMA navy/lime); `theme-color` and favicon from the old one | Unified on MSMA navy + lime, red stamp kept as the signature accent |
| Radius | 2 px everywhere, 14 px on bizcard, 20 px on printable card | 4 px system token; business card keeps its larger radius on purpose (it's an object) |
| Business card | Two hand-maintained copies (React + static HTML) that had already drifted | One `BizCard` component, scales with container-query units |
| Tech lists | Comma strings in Stack, sentence in Work | Chips in both places |
| Separators | Mix of ", " and "|" in meta lines | "·" throughout |

## Accessibility (WCAG 2.1 AA)

- **Contrast:** all text pairs pass. Ink on paper 13.4:1; muted text darkened `#48607F → #43597A` (6.3:1);
  stamp red `#C8321E → #C22F1C` (5.0:1 on paper); lime on navy 7.6:1. Lime on paper is 1.75:1 and is never used for text.
- **Touch targets:** buttons 48 px min-height, nav links ~44 px, full-width CTAs on phones.
- **Screen readers:** clock and stamp stay `aria-hidden` (a ticking clock would be noise); decorative icons hidden;
  QR has descriptive alt text; skip link focuses `<main>`.
- **Motion:** stamp animation and smooth scroll disabled under `prefers-reduced-motion`.

## What works well

- A concept that is specific to the person — nobody else's portfolio looks like a DTR card.
- Restraint: ruled lists instead of a wall of cards; one featured project given real depth.
- The "How it fits together" layer diagram is a quick, honest architecture signal for technical readers.

## Priority recommendations (content — needs Arvin's input)

1. **Add outcomes to the HRIS feature.** One or two numbers do more than six features: employees onboarded, sites
   using biometric attendance, hours of manual timekeeping removed per payroll cycle.
2. **Add a screenshot or short clip of the HRIS** (blur any employee data). The page is 100 % text; one real
   interface image would be the strongest proof on it. Drop it in `public/` and reference it in `Work.jsx`.
3. **Link other projects** to a repo, demo or case study where you can; add one line on *your* contribution
   (e.g. "built the policy-issuance module") rather than what the system does.
4. **Fix the resume URL** — it prints `arvindymsma.solutions`, which doesn't resolve yet.
