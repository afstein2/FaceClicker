# TASK: Build Face Clicker (Phaser Game)

## GOAL
Create a simple incremental clicker game using Phaser 3 called "Face Clicker".

The player clicks on a face to earn points (clicks). Points can be spent in a shop to purchase upgrades that increase click power and progression speed.

The game includes visual feedback, particle effects, and evolving face states.

---

## CORE GAME LOOP
1. Player clicks face → gains clicks
2. Clicks are stored as currency
3. Player buys upgrades in a store UI
4. Upgrades increase:
   - clicks per click
   - auto-click rate (optional)
5. Progression unlocks face changes
6. Reach level 5 → game complete

---

## VISUAL SYSTEM

### Face
- Center screen clickable face object
- Face has:
  - shape variations (use provided assets if available)
  - face/emotion states:
    - smile
    - grimace
    - frown
- Face changes based on:
  - total clicks
  - progression level

### Particles
- Every click triggers a particle burst
- Must use existing asset shapes or simple textures (no downloads)
- Particles should:
  - emit from face position
  - fade out quickly
  - scale down over time

---

## STORE / UI SYSTEM

Create a visible UI panel that includes upgrade buttons:

### Upgrades
- Click Power (increases clicks per click)
- Auto Click (optional passive income)
- Multiplier (increases total gain)

Each upgrade:
- costs clicks
- increases in price after each purchase
- updates UI immediately

---

## PROGRESSION SYSTEM

There are 5 levels total.

Level up conditions:
- based on total clicks earned

Each level:
- changes face emotion/style
- increases difficulty or cost scaling
- visually indicates progression

---

## ASSET RULES

- Store assets in the repos root directory
- Prefer provided project assets whenever available.

- Use ONLY URL-based assets.

- Never download, embed, or store assets locally.
- Allowed formats: PNG, SVG, JPG only.

- If an asset is missing or unusable, replace it with a valid URL-based fallback.
- All fallbacks (icons, fonts, textures, particles) must be loaded from external URLs.

Suggested sources:
- Iconify
- Game-icons.net
- Google Fonts

---

## CONSTRAINTS

- Must use Phaser 3
- Must run in browser
- No external scripts except Phaser and asset URLs
- No file system access or downloads
- Keep code modular and readable
- Use comments for major systems

---

## INPUT CONTROLS

- Mouse click only
- Clicking face = primary interaction
- UI buttons = upgrade purchases

---

## SUCCESS CRITERIA

The game is complete when:
- Clicking face increases score
- Particles appear on click
- Store allows upgrades
- Upgrades modify click power
- Face changes visually over time
- 5 levels exist and can be reached
- Game has a clear “win” state at level 5

---

## OPTIONAL CREATIVE FREEDOM

If something is missing:
- Fill in with reasonable incremental clicker mechanics
- Add polish (animations, scaling, effects)
- Improve UI clarity

---

## OUTPUT REQUIREMENT

Generate a fully working Phaser project with:
- index.html
- main.js (or equivalent)
- asset loading via URLs only
- working game loop with no placeholders