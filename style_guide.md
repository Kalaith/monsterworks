🎨 Emoji Factory Builder – CSS Style Guide
1. Overall Aesthetic

Theme: Playful minimalism — clean layouts with splashes of color inspired by emojis.

Mood: Light, cheerful, and slightly magical.

Tone: Accessible for casual players, but polished enough to communicate depth.

2. Colors

Use an emoji-inspired palette:

🌿 Primary Green (#6BCB77) – nature, growth, balance

🧱 Stone Gray (#A1A1A1) – buildings, foundations

🌟 Golden Yellow (#FFD93D) – highlights, energy, upgrades

🍎 Fruit Red (#FF6B6B) – food, urgency cues

💎 Crystal Blue (#4D96FF) – magical charm accents

🪵 Warm Brown (#A97155) – wood, earthy base

⚪ Soft White (#FDFDFD) – backgrounds, clarity

Use gradients subtly (e.g., green → lighter green) for whimsy without clutter.

3. Typography

Headers (Titles, Buttons):

"Fredoka One", sans-serif → bubbly, cartoon-like font.

Body Text (Info Panels, Tooltips):

"Nunito", sans-serif → rounded, easy to read.

Numbers (Resource Counters, Capacities):

"Roboto Mono", monospace → conveys clarity and precision.

4. UI Elements

Panels & Menus: Rounded corners (border-radius: 16px), soft drop shadows, pastel backdrops with emoji-themed header bars.

Buttons:

Rounded pill shapes (border-radius: 9999px).

Hover: gentle bounce animation (transform: scale(1.05)).

Active: squishy press effect (transform: scale(0.95)).

Icons: Always paired with emojis — e.g., 🪵 next to “Wood,” 🥖 next to “Bread.”

Progress Bars:

Thin, rounded, with emoji sparkles ✨ or resource icons inside the bar.

5. Creature Styling

Each emoji worker has a glow aura based on its type:

🐜 Ants → lime green outline

🐘 Elephants → soft gray shadow

🐰 Rabbits → pastel pink glow

🐝 Bees → honey-yellow shimmer

🦅 Eagles → sky-blue feathered shadow

CSS effect:

.creature.ant { filter: drop-shadow(0 0 6px #6BCB77); }
.creature.elephant { filter: drop-shadow(0 0 8px #A1A1A1); }
.creature.rabbit { filter: drop-shadow(0 0 6px #FFB6C1); }
.creature.bee { filter: drop-shadow(0 0 6px #FFD93D); }
.creature.eagle { filter: drop-shadow(0 0 8px #4D96FF); }

6. Animations

Hover Effects: Wiggle or bounce (playful, not distracting).

Carrying Resources: Floating resource emoji follows worker with a gentle bobbing animation.

Building Construction: Resource icons swirl into the building with sparkles ✨.

Notifications (e.g., low food): Pulsing glow on the panel border.

7. Layout

Top Bar: Resource counters with emoji icons.

Left Sidebar: Creature roster with tiny animated emoji portraits.

Right Sidebar: Building list with construction buttons.

Bottom Panel: Quick stats + event log, styled like a playful sticky note.

8. Special Whimsy

Cursor: A white glove ✋ or magic wand 🪄 when placing buildings.

Tooltips: Appear in speech bubbles, with a subtle “pop” animation.

Loading Screen: Creatures marching with “Carrying resources…” in bubbly text.

Error States: Instead of red warnings, show worried emojis 😰 carrying too much.