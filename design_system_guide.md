# Monstrous Ascent - Design System Style Guide

A comprehensive design system featuring a sophisticated color palette, typography scale, and component library optimized for both light and dark themes.

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)
8. [Usage Guidelines](#usage-guidelines)

---

## Design Principles

**Sophisticated Minimalism**: Clean, professional layouts with carefully considered color usage
**Dual-Theme Ready**: Seamless experience across light and dark modes
**Accessibility First**: WCAG-compliant contrast ratios and focus management
**Game-Focused**: Optimized for resource management and strategic gameplay

---

## Color System

### Primary Palette

#### Neutrals
- **Background (Light)**: `--color-cream-50` - rgba(252, 252, 249, 1)
- **Background (Dark)**: `--color-charcoal-700` - rgba(31, 33, 33, 1)
- **Surface (Light)**: `--color-cream-100` - rgba(255, 255, 253, 1)
- **Surface (Dark)**: `--color-charcoal-800` - rgba(38, 40, 40, 1)
- **Text (Light)**: `--color-slate-900` - rgba(19, 52, 59, 1)
- **Text (Dark)**: `--color-gray-200` - rgba(245, 245, 245, 1)

#### Brand Colors
- **Primary**: `--color-teal-500` (Light) / `--color-teal-300` (Dark)
- **Primary Hover**: `--color-teal-600` (Light) / `--color-teal-400` (Dark)
- **Primary Active**: `--color-teal-700` (Light) / `--color-teal-800` (Dark)

#### Semantic Colors
- **Success**: `--color-teal-500` (Light) / `--color-teal-300` (Dark)
- **Error**: `--color-red-500` (Light) / `--color-red-400` (Dark)
- **Warning**: `--color-orange-500` (Light) / `--color-orange-400` (Dark)
- **Info**: `--color-slate-500` (Light) / `--color-gray-300` (Dark)

#### Colorful Backgrounds
Eight subtle background colors for visual hierarchy:
- `--color-bg-1` through `--color-bg-8` (blue, yellow, green, red, purple, orange, pink, cyan)
- Opacity: 0.08 (light mode) / 0.15 (dark mode)

### Usage Rules
- Use RGB versions with opacity for overlays: `rgba(var(--color-teal-500-rgb), 0.4)`
- Always reference semantic tokens, not primitive colors directly
- Test contrast ratios in both light and dark themes

---

## Typography

### Font Families
- **Primary**: `--font-family-base` - "FKGroteskNeue", "Geist", "Inter", system fonts
- **Monospace**: `--font-family-mono` - "Berkeley Mono", system monospace fonts

### Type Scale
```css
--font-size-xs: 11px
--font-size-sm: 12px
--font-size-base: 14px
--font-size-md: 14px
--font-size-lg: 16px
--font-size-xl: 18px
--font-size-2xl: 20px
--font-size-3xl: 24px
--font-size-4xl: 30px
```

### Font Weights
- **Normal**: 400
- **Medium**: 500  
- **Semibold**: 550
- **Bold**: 600

### Line Heights
- **Tight**: 1.2 (headings)
- **Normal**: 1.5 (body text)

### Letter Spacing
- **Tight**: -0.01em (headings)

---

## Spacing & Layout

### Spacing Scale
```css
--space-0: 0
--space-1: 1px
--space-2: 2px
--space-4: 4px
--space-6: 6px
--space-8: 8px
--space-10: 10px
--space-12: 12px
--space-16: 16px
--space-20: 20px
--space-24: 24px
--space-32: 32px
```

### Border Radius
```css
--radius-sm: 6px    /* Small elements */
--radius-base: 8px  /* Standard elements */
--radius-md: 10px   /* Medium elements */
--radius-lg: 12px   /* Large panels */
--radius-full: 9999px /* Pills/badges */
```

### Container Breakpoints
- **Small**: 640px
- **Medium**: 768px
- **Large**: 1024px
- **Extra Large**: 1280px

---

## Components

### Buttons

#### Primary Button
```css
.btn--primary {
  background: var(--color-primary);
  color: var(--color-btn-primary-text);
  padding: var(--space-8) var(--space-16);
  border-radius: var(--radius-base);
}
```

#### Secondary Button
```css
.btn--secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}
```

#### Button Sizes
- **Small**: `.btn--sm` - Reduced padding and smaller text
- **Large**: `.btn--lg` - Increased padding and larger text
- **Full Width**: `.btn--full-width` - Spans container width

### Form Controls

#### Input Fields
```css
.form-control {
  padding: var(--space-8) var(--space-12);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  background: var(--color-surface);
}
```

#### Select Dropdowns
Custom-styled with theme-appropriate caret icons:
- Light mode: Dark caret
- Dark mode: Light caret

### Cards

#### Basic Card
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

#### Card Sections
- `.card__header` - Top section with border
- `.card__body` - Main content area
- `.card__footer` - Bottom section with border

### Status Indicators

#### Status Badge
```css
.status {
  padding: var(--space-6) var(--space-12);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}
```

#### Status Types
- `.status--success` - Green theme
- `.status--error` - Red theme  
- `.status--warning` - Orange theme
- `.status--info` - Gray theme

---

## Game-Specific Components

### Resource Display
```css
.resource-item {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  background: var(--color-bg-1);
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-base);
}
```

### Building/Creature Items
```css
.building-item, .creature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
  background: var(--color-bg-2);
  border-radius: var(--radius-base);
  cursor: pointer;
}
```

#### States
- `.selected` - Primary color background
- `.disabled` - 50% opacity, no pointer

### Game Canvas
```css
#gameCanvas {
  border: 2px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-8);
  cursor: crosshair;
}
```

---

## Animations

### Standard Timing
```css
--duration-fast: 150ms
--duration-normal: 250ms
--ease-standard: cubic-bezier(0.16, 1, 0.3, 1)
```

### Animation Classes

#### Creature Movement
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.creature-moving {
  animation: bounce 0.6s ease-in-out infinite;
}
```

#### Resource Pickup
```css
@keyframes resource-pickup {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 0.8; }
  100% { transform: scale(0.8) rotate(0deg); opacity: 1; }
}
```

---

## Accessibility

### Focus Management
- Focus rings: `--focus-ring` - 3px ring with primary color at 40% opacity
- Focus outline: `--focus-outline` - 2px solid primary color
- All interactive elements have visible focus states

### Screen Reader Support
- `.sr-only` class for screen reader only content
- Semantic HTML structure maintained
- ARIA labels where appropriate

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio minimum)
- Interactive elements meet AAA standards (7:1 ratio)
- Theme switching maintains contrast ratios

---

## Usage Guidelines

### Theme Implementation
1. Use CSS custom properties exclusively
2. Never hardcode color values
3. Test both light and dark themes
4. Respect user's system preference with `prefers-color-scheme`
5. Support manual theme switching with `data-color-scheme` attribute

### Component Composition
1. Build complex interfaces by combining base components
2. Use utility classes for spacing and layout adjustments
3. Follow BEM methodology for custom components
4. Maintain semantic HTML structure

### Responsive Design
1. Mobile-first approach using min-width media queries
2. Use container classes for consistent max-widths
3. Game controls stack vertically on smaller screens
4. Touch-friendly targets (minimum 44px)

### Performance
1. CSS custom properties enable efficient theme switching
2. Minimal animation for 60fps performance
3. Optimized font loading with system font fallbacks
4. Shadow and gradient usage kept minimal

---

## Developer Quick Reference

### Most Common Patterns

#### Creating a Panel
```css
.my-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: var(--space-16);
  box-shadow: var(--shadow-sm);
}
```

#### Status with Opacity
```css
.my-status {
  background-color: rgba(var(--color-success-rgb), var(--status-bg-opacity));
  border: 1px solid rgba(var(--color-success-rgb), var(--status-border-opacity));
  color: var(--color-success);
}
```

#### Responsive Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Shadow System

### Available Shadows
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.02)
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)
--shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.03)
```

### Usage
- `shadow-xs`: Subtle depth for cards
- `shadow-sm`: Standard card elevation
- `shadow-md`: Hover states
- `shadow-lg`: Modals and tooltips
- `shadow-inset-sm`: Pressed button states

---

## Utility Classes

### Display
- `.flex` - display: flex
- `.flex-col` - flex-direction: column
- `.block` - display: block
- `.hidden` - display: none

### Alignment
- `.items-center` - align-items: center
- `.justify-center` - justify-content: center
- `.justify-between` - justify-content: space-between

### Spacing
- `.gap-4` through `.gap-16` - Gap utilities
- `.m-0`, `.mt-8`, `.mb-8`, `.mx-8`, `.my-8` - Margin utilities
- `.p-0`, `.py-8`, `.px-8`, `.py-16`, `.px-16` - Padding utilities

---

## Game-Specific Patterns

### Resource Counter
```html
<div class="resource-item">
  <span class="resource-icon">🪵</span>
  <span class="resource-amount">150</span>
</div>
```

### Building Selection
```html
<div class="building-item" data-building="lumber-mill">
  <div class="building-icon">🏭</div>
  <div class="building-name">Lumber Mill</div>
  <div class="building-cost">50 🪵</div>
</div>
```

### Status Indicator
```html
<span class="status status--success">
  <span class="status-icon">✅</span>
  Active
</span>
```

### Info Panel
```html
<div class="info-panel">
  <h4>Building Details</h4>
  <div class="info-stats">
    <div>
      <span class="stat-label">Health:</span>
      <span>100/100</span>
    </div>
    <div>
      <span class="stat-label">Production:</span>
      <span>5/min</span>
    </div>
  </div>
</div>
```

---

## Implementation Checklist

### For New Components
- [ ] Use semantic CSS custom properties
- [ ] Test in both light and dark themes
- [ ] Ensure proper focus states
- [ ] Add hover animations with standard timing
- [ ] Include responsive breakpoints if needed
- [ ] Use consistent spacing scale
- [ ] Follow BEM naming convention

### For Theme Support
- [ ] Define both light and dark color variants
- [ ] Test contrast ratios
- [ ] Ensure RGB versions exist for opacity usage
- [ ] Support both `prefers-color-scheme` and `data-color-scheme`
- [ ] Verify SVG icons work in both themes

### For Accessibility
- [ ] Keyboard navigation support
- [ ] Screen reader friendly markup
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] ARIA labels where needed