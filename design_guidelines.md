# Cyberpunk Neon Hub Design Guidelines

## Design Approach
**Reference-Based Approach:** Cyberpunk/Futuristic Neon aesthetic inspired by high-tech console interfaces, neon-lit sci-fi environments, and terminal-style applications.

## Core Design Principles
1. **Dark Futurism:** Deep, immersive dark environment with strategic neon accents
2. **Terminal Authenticity:** Console/command-line inspired interface elements
3. **Glowing Emphasis:** Neon glow effects as primary visual hierarchy tool
4. **Grid Foundation:** Digital grid/circuit patterns establishing tech atmosphere

---

## Typography
- **Primary Font Family:** Monospace font (e.g., 'Courier New', 'Fira Code', 'JetBrains Mono', or 'Space Mono')
- **Hierarchy:**
  - Hero/Headers: Bold, larger monospace (32-48px)
  - Card Titles: Medium weight (20-24px)
  - Body Text: Regular (14-16px)
  - Console/Chat Text: Regular monospace (14px)
  - Code/Technical: Smaller monospace with letter-spacing (12-13px)

---

## Layout System
**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16 (e.g., p-4, m-8, gap-6)

### Main Layout Structure
- **No Sidebar:** Eliminate traditional sidebar navigation entirely
- **Central Card Grid:** Responsive grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Container:** Max-width of 1400px with centered alignment
- **Vertical Rhythm:** py-16 for main sections, py-8 for card interiors

### Card-Based Feature Hub
- Feature cards arranged in centered, responsive grid
- Each card represents a distinct feature (Chat, Khedive, Doctor, etc.)
- Cards float on dark background with generous spacing (gap-8)

---

## Visual Treatment

### Background
- **Primary Background:** Deep dark (#0D0B2E)
- **Pattern Overlay:** Subtle digital grid or circuit board pattern (opacity 10-15%)
- **Pattern Style:** Fine lines creating tech/circuit aesthetic without overwhelming content

### Neon Glow System
**Primary Accent Colors:**
- Electric Blue: #00F0FF, #0FF, #4DFFFF
- Magenta/Pink: #FF006E, #FF0080, #FF1493

**Glow Implementation:**
- Cards: Strong box-shadow with 3-4 layer glow in accent colors
- Base state: Medium glow intensity (blur 15-20px, spread 2-4px)
- Hover state: Intensified glow (blur 25-35px, spread 4-6px) with subtle scale transform
- Active elements: Pulsing glow animation (optional subtle pulse)

### Card Design Specifications
- **Base Style:** Dark semi-transparent background (rgba(20, 18, 60, 0.6))
- **Border:** 1-2px solid with accent color (50% opacity)
- **Glow:** Multi-layer box-shadow creating neon outline effect
- **Corner Style:** Slightly rounded (border-radius: 8-12px)
- **Padding:** p-8 for content interior
- **Hover Transform:** scale(1.03) with smooth transition

---

## Component Library

### Navigation
- **Top Bar Only:** Horizontal navigation bar (no sidebar)
- **Style:** Dark background with subtle border-bottom glow
- **Links:** Monospace text with hover glow effect

### Feature Cards (Hub)
- Icon/Symbol at top (neon colored)
- Card title in bold monospace
- Brief description text
- Glowing border and shadow
- Click/tap to navigate to feature

### Chat Interface (Console Style)
- **Container:** Dark background resembling terminal window
- **Input Area:** 
  - Monospace input field with neon border glow
  - Prompt indicator (> or $) before input
  - File upload button with icon
- **Message Bubbles:**
  - User messages: Right-aligned, Electric Blue glow
  - AI responses: Left-aligned, Magenta glow
  - Terminal-style formatting with monospace text
  - Subtle dark background per message
- **Chat Header:** Console-style title bar with window controls aesthetic

### Buttons
- **Primary:** Neon border (2px), semi-transparent dark fill, glow effect
- **Hover:** Intensified glow, slight background brightness increase
- **Text:** Monospace, uppercase for emphasis
- **Padding:** px-8 py-3

### Form Inputs
- Dark background with neon border
- Monospace placeholder text
- Focus state: Intensified border glow
- Consistent with console aesthetic

---

## Images
**No Hero Images Required** - This is a terminal/console-style application where the cyberpunk aesthetic is achieved through the neon glow effects, grid patterns, and card-based layout rather than photographic imagery.

Feature cards may include:
- Small cyberpunk-style icons (circuit patterns, neon symbols)
- Abstract tech illustrations
- Glowing geometric shapes

---

## Animation Guidelines
**Minimal and purposeful animations only:**
- Card hover glow intensification (0.3s ease)
- Subtle scale on card hover (transform: scale(1.03))
- Message bubble fade-in when chat updates
- Input border glow pulse on focus

**Avoid:** Excessive scroll animations, complex transitions, or distracting motion effects

---

## Accessibility
- Maintain sufficient contrast between neon text/elements and dark background
- Ensure glow effects don't rely solely on color (use border + shadow)
- Provide clear focus indicators with enhanced glow
- Monospace fonts remain readable at specified sizes
- All interactive elements have clear hover/active states