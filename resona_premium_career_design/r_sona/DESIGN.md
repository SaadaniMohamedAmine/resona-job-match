---
name: Résona
colors:
  surface: '#15130e'
  surface-dim: '#15130e'
  surface-bright: '#3c3933'
  surface-container-lowest: '#100e09'
  surface-container-low: '#1e1b16'
  surface-container: '#221f1a'
  surface-container-high: '#2c2a24'
  surface-container-highest: '#37342f'
  on-surface: '#e8e2d9'
  on-surface-variant: '#d0c5b4'
  inverse-surface: '#e8e2d9'
  inverse-on-surface: '#33302a'
  outline: '#999080'
  outline-variant: '#4d4639'
  surface-tint: '#e4c278'
  primary: '#e6c479'
  on-primary: '#3f2e00'
  primary-container: '#c9a961'
  on-primary-container: '#533d00'
  inverse-primary: '#745b1b'
  secondary: '#cbc6bc'
  on-secondary: '#33302a'
  secondary-container: '#4c4942'
  on-secondary-container: '#bdb8ae'
  tertiary: '#b9c6fb'
  on-tertiary: '#202e59'
  tertiary-container: '#9eabde'
  on-tertiary-container: '#313f6b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9b'
  primary-fixed-dim: '#e4c278'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4302'
  secondary-fixed: '#e8e2d8'
  secondary-fixed-dim: '#cbc6bc'
  on-secondary-fixed: '#1d1b15'
  on-secondary-fixed-variant: '#49463f'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b8c5f9'
  on-tertiary-fixed: '#091843'
  on-tertiary-fixed-variant: '#384571'
  background: '#15130e'
  on-background: '#e8e2d9'
  surface-variant: '#37342f'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is anchored in a philosophy of **Precise Minimalism**. It serves as a "reassuring expert," evoking a sense of senior-level authority and factual clarity. The visual language avoids the "magical" tropes of AI—no glows, no nebulous gradients, and no organic blurs. Instead, it utilizes a technical, structured aesthetic that prioritizes content over container.

The experience should feel quiet and confident. By employing generous negative space and a restricted palette, the UI directs the user’s focus entirely to their career data and the platform's analytical insights. The aesthetic is "High-Utility Luxury," akin to a premium architectural blueprint or a precision-engineered instrument.

## Colors
The palette is dominated by deep, warm neutrals to differentiate from the sterile blues typical of SaaS. 

- **Graphite (#16140F):** The primary background color, providing a deep, non-black canvas that feels more sophisticated and less aggressive.
- **Elevated Surface (#1E1C16):** Used for cards, modals, and section headers to create subtle depth through tonal shifts rather than shadows.
- **Champagne Gold (#C9A961):** The sole accent color, reserved for high-intent actions, progress indicators, and active states. It should be used sparingly to maintain its impact.
- **Muted Gold (#B8AD98):** Used for secondary text and labels to maintain a low-contrast hierarchy that reduces cognitive load.

In light mode, the system flips to an **Off-white (#F7F5F2)** base. The Champagne Gold remains the accent, but text shifts to Graphite for maximum legibility.

## Typography
Typography is the primary driver of the brand's personality. 
- **Space Grotesk** (Headlines) provides a technical, slightly futuristic edge. Headlines should use tight tracking and sentence case. 
- **IBM Plex Sans** (Body/Labels) provides a grounded, industrial-yet-humanist feel that ensures high readability for dense resume analysis.

**Hierarchy Rules:**
- Large display type should be used sparingly for impact.
- Labels use uppercase with tracking to denote metadata and small details.
- All body text maintains a generous line height (1.6) to ensure the analysis feels approachable and easy to scan.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** for desktop and a **single-column fluid layout** for mobile. 

The rhythm is based on an **8px base unit**. Restraint is key: use 64px or 80px gaps between major sections to mimic the airy feel of a premium physical publication. 

**Responsive Behavior:**
- **Desktop (1280px+):** Max width container, centered, 64px margins.
- **Tablet (768px - 1279px):** 32px margins, 16px gutters.
- **Mobile (< 767px):** 20px margins. Headlines scale down significantly to prevent awkward wrapping.

## Elevation & Depth
Depth is created through **1px hairline borders** and tonal separation. Shadows are strictly prohibited.

- **Level 0 (Background):** Graphite (#16140F).
- **Level 1 (Cards/Surface):** Elevated Surface (#1E1C16). Borders are `1px solid #2A2822` (a slightly lighter graphite variant).
- **Interactions:** Hover states on interactive elements should either slightly brighten the border color or change the background tone by 2-3%, avoiding any "lift" or shadow effects.

## Shapes
The shape language combines geometric precision with enough softness to feel modern.
- **Cards/Containers:** 16px radius.
- **Inputs/Buttons/Controls:** 8px radius.
- **Icons:** Use 1.5px stroke weight. Avoid filled icons unless used as a primary indicator (e.g., a "check-circle" for a completed task).

## Components

### ScoreRing
The ScoreRing is the primary visual feedback for resume strength. It is a circular stroke with a 2px width. The background "track" is the Elevated Surface color, and the active "arc" is Champagne Gold. The score value (e.g., 85) sits in the center in Space Grotesk Bold.

### CTAs
- **Primary:** Solid Champagne Gold (#C9A961) with Graphite (#16140F) text. No hover shadow; instead, use a 10% opacity black overlay on hover.
- **Secondary:** Transparent background with a 1px Champagne Gold border.

### Tags / Badges
Compact chips used for skills or keywords. Use an 8px radius, a 1px border (#2A2822), and 12px IBM Plex Sans Medium text. Include a 1.5px stroke icon on the left (e.g., a "plus" or "check") to indicate actionability.

### Input Fields
Strictly minimalist. Transparent background with a 1px border (#2A2822). On focus, the border changes to Champagne Gold. No drop shadows. Placeholder text should be Muted Gold (#B8AD98).

### Step Indicator
A horizontal line spanning the top of the container. Inactive steps are 1px thick and Muted Gold; the current step is 3px thick and Champagne Gold. Text labels sit below the line in 12px uppercase IBM Plex Sans.

### Status Indicators
Do not use color (red/green/yellow) for status. 
- **Success:** Icon `check-circle` + text "Matches requirements."
- **Alert:** Icon `alert-circle` + text "Missing keyword."
- Both use the Muted Gold or Champagne text color to maintain palette integrity.