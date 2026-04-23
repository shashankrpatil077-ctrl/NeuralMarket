---
name: Aetheris Auction Protocol
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0d0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#c6252b'
  on-tertiary-container: '#ffdfdc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  hero-title:
    fontFamily: Orbitron
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  heading-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  heading-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  counter-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.0'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-page: 64px
  card-padding: 32px
  depth-gap: 40px
---

## Brand & Style

The design system is engineered to evoke a sense of high-stakes, cinematic immersion within a hyper-technological autonomous environment. The brand personality is enigmatic, elite, and mathematically precise, targeting a sophisticated user base accustomed to high-frequency AI-driven trading.

The visual style is a rigorous application of **Glassmorphism** combined with **Futuristic 3D Environments**. Every interface element exists within a 3D coordinate space, discarding flat surfaces in favor of depth and perspective. The UI is not a layer on top of a background, but a series of holographic projections floating above a dark perspective grid, punctuated by volumetric light and atmospheric particles to create a visceral sense of presence and "infinite" digital space.

## Colors

This design system utilizes a deep-space palette to maximize the impact of luminous accents. The background is a near-black void that allows the primary purple and secondary cyan accents to pierce through as neon light sources.

- **Primary Accent (#7C3AED):** Used for active states, primary actions, and primary "orbiting" rings.
- **Secondary Accent (#06B6D4):** Reserved for technical data, secondary navigational elements, and complementary light rays.
- **Surface (#14141F):** Applied to semi-transparent glass cards at 60-80% opacity.
- **Alert/Live (#EF4444):** Specifically for "LIVE" status indicators and critical countdowns.
- **Typography (#E5E5E5):** High-readability light gray to maintain contrast against dark, blurred backgrounds.

## Typography

The typography strategy leverages three distinct typefaces to separate narrative, utility, and data.

- **Orbitron:** Used exclusively for high-level hero titles and primary auction titles to establish the futuristic theme.
- **Inter:** The workhorse for all standard headings and body copy, ensuring legibility amidst complex visual effects.
- **JetBrains Mono:** Used for all quantitative data, timestamps, currency values, and counters. This font conveys the "autonomous AI" nature of the system, suggesting real-time terminal outputs.

All text should have a subtle text-shadow when appearing over glass surfaces to maintain high contrast.

## Layout & Spacing

This design system employs a **Perspective Grid Layout**. While content follows a standard 12-column structure for horizontal alignment, it also adheres to a Z-axis spacing rhythm.

- **Floor Grid:** A visible perspective grid in the background uses 40px squares, tapering toward a horizon line.
- **Z-Axis Stacking:** Elements are layered with significant vertical separation (depth gaps).
- **Margins:** Generous page margins (64px) ensure that the floating luminous particles and volumetric light rays have "air" to breathe around the central UI components.
- **Padding:** Cards use a spacious 32px internal padding to reinforce the premium, cinematic feel.

## Elevation & Depth

Elevation is the core differentiator of this design system. We do not use traditional drop shadows.

1.  **Backdrop Blur:** All cards and overlays must use `backdrop-filter: blur(20px)`.
2.  **Inner Borders:** A 1px solid white border with 8% opacity is applied to the interior edge of all glass surfaces to catch light.
3.  **Neon Glows:** External shadows are replaced by "Neon Glows." These are ultra-diffused outer glows (`box-shadow`) matching the primary (#7C3AED) or secondary (#06B6D4) accents, with a spread of 20-40px and low opacity (15-25%).
4.  **Chromatic Aberration:** Glass edges should feature a 1px offset "RGB split" effect to simulate high-end optical lensing.
5.  **Orbital Elements:** Key assets (like featured NFTs or AI avatars) are surrounded by rotating, non-concentric accent rings that sit on different Z-planes.

## Shapes

The design system utilizes **Soft (0.25rem - 0.75rem)** corner radii. This maintains a technical, "machine-milled" aesthetic that avoids the friendliness of high-radius pill shapes while remaining more sophisticated than sharp 90-degree angles.

- **Standard Cards:** 0.5rem (8px) corner radius.
- **Action Buttons:** 0.25rem (4px) for a precise, tactical feel.
- **Data Tags:** 0.25rem (4px) to keep them tight and functional.

## Components

- **Buttons:** Non-flat. Use a subtle gradient transition and a 1px inner border. Hover states trigger an intensified neon glow and a slight Z-axis scale (forward movement).
- **Glass Cards:** Semi-transparent #14141F. Must include the 1px 8% white inner border and chromatic aberration on the edges.
- **LIVE Badges:** These feature a pulsing red (#EF4444) dot and a horizontal scanline animation that periodically scrolls across the badge surface.
- **Input Fields:** Darker, more opaque version of the card style. On focus, the inner border changes to Primary Purple with a localized glow.
- **Orbiting Rings:** Vector rings surrounding key items. These should rotate at varying slow speeds and have a 'hairline' 0.5px thickness.
- **Monospace Counters:** Real-time updating numbers using JetBrains Mono, featuring a "flicker" animation when values change.
- **Progress Bars:** Use a dual-layered approach: a dim background track and a glowing, cyan neon foreground bar with a trailing gradient.