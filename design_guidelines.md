# FastNet MTN Data Platform - Design Guidelines

## Design Approach

**System-Based with Brand Identity**: Utilizing Material Design principles adapted for MTN Ghana's brand identity, creating a fast, trustworthy e-commerce experience that balances visual appeal with functional efficiency.

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- MTN Yellow: 48 100% 51% (brand primary, CTAs, highlights)
- MTN Blue: 211 100% 50% (interactive elements, links, admin primary)
- Deep Charcoal: 0 0% 20% (headers, dark sections, text)

**Supporting Colors:**
- Success Green: 142 71% 45% (order confirmations, positive states)
- Alert Red: 0 84% 60% (delete actions, errors)
- Neutral Gray: 0 0% 96% (backgrounds, subtle divisions)
- White: 0 0% 100% (cards, primary background)

**Dark Mode** (if needed later): Invert with yellow accents on dark backgrounds

### B. Typography

**Font Stack**: System fonts via -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif

**Hierarchy:**
- Hero/Logo: 2.5-3rem, font-weight 900, tight letter-spacing
- Section Headers: 1.75-2rem, font-weight 700
- Card Titles: 1.5-1.8rem, font-weight 700
- Body Text: 1rem-1.1rem, font-weight 400-500
- Small Print: 0.8-0.85rem, font-weight 400

### C. Layout System

**Spacing Units**: Consistent use of 4, 8, 12, 16, 20, 24, 32, 40px increments
- Card padding: 20-24px
- Section gaps: 20-32px
- Button padding: 12-16px vertical, 24-32px horizontal
- Page margins: 16-20px mobile, 32-40px desktop

**Container Widths:**
- Customer Pages: max-width 800px (current, maintains focus)
- Admin Dashboard: max-width 1280px (wider for data tables)
- Forms: max-width 600px (optimal input width)

**Grid Systems:**
- Package Cards: 3-4 columns desktop, 2 columns tablet, 1 column mobile (160px min card width)
- Admin Tables: Full-width responsive with horizontal scroll on mobile

### D. Component Library

**Customer Interface Components:**

*Package Cards*
- White background with subtle shadow (0 4px 12px rgba(0,0,0,0.1))
- 10px border radius for modern feel
- 2px blue border on selection with 4px blue glow
- Hover: -3px translateY, enhanced shadow
- Checkmark indicator (top-right, 1.5em, blue)
- Price badge: Yellow text on dark charcoal background, rounded

*Action Buttons*
- Primary: Full-width, yellow background, dark text, 8px radius, 15px padding
- Disabled state: Light gray (#ccc) with reduced opacity
- Hover: Lighter yellow (#ffda47), -1px translateY

*Checkout Forms*
- Clean input fields: 1px light gray border, 6px radius, 12px padding
- Summary box: White card with 5px left blue border, shadow
- Labels: 600 font-weight, 8px bottom margin

**Admin Dashboard Components:**

*Navigation Sidebar*
- Dark charcoal background (matching header)
- 240px width desktop, collapsible on mobile
- Active state: Yellow left border (4px), lighter background
- Icons: 20px with 12px right margin before text

*Data Tables*
- Striped rows for readability (alternating white/light gray)
- Hover: Light blue background tint
- Header: Bold text, slight background color
- Action buttons in rows: Small icon buttons (edit: blue, delete: red)
- Mobile: Card-style layout stacking table data

*Stats Cards*
- White background, shadow, 8px radius
- Large number display (2.5rem, bold) in MTN blue
- Icon in top-right corner (24px, yellow)
- 4-column grid on desktop, 2 on tablet, 1 on mobile

*Modal Dialogs*
- Centered overlay with backdrop blur
- White card with 12px radius, 32px padding
- Header with close button (top-right X)
- Form inputs consistent with main checkout
- Action buttons at bottom (Cancel: gray outline, Confirm: yellow primary)

*Real-time Status Indicators*
- Small colored dots (8px) next to order status
- Pending: Yellow, Processing: Blue, Completed: Green, Failed: Red
- Optional pulse animation for pending orders

### E. Page Layouts

**Customer Flow (3 Views):**

1. *Package Selection (Home)*
   - Centered container (800px max)
   - Header: Dark background, logo centered, slogan below
   - Grid of package cards below (responsive)
   - Sticky "Continue to Checkout" button at bottom

2. *Checkout*
   - Summary box at top (selected package highlight)
   - Two-column form on desktop: Phone Number | Email Address
   - Single column on mobile
   - Large yellow payment button
   - Small disclaimer text below (0.8rem, gray)

3. *Order Confirmation*
   - Success icon/animation (green checkmark, 64px)
   - Order details in clean list format
   - Transaction reference (monospace font, highlighted background)
   - "Make Another Purchase" button

**Admin Dashboard (4 Main Sections):**

1. *Dashboard Overview*
   - 4 stats cards at top (Total Orders, Revenue, Pending, Completed)
   - Recent orders table (5-10 latest)
   - Quick action buttons (Add Package, View All Orders)

2. *Orders Management*
   - Filter bar at top (Status, Date Range, Search)
   - Full data table with sortable columns
   - Actions column with edit/delete icon buttons
   - Pagination at bottom

3. *Package Management*
   - Add New Package button (prominent, yellow, top-right)
   - Package cards in grid (similar to customer view)
   - Edit/Delete icons on hover overlay
   - Edit modal: Form with Data Amount, Price, Status (Active/Inactive)

4. *Settings/Login*
   - Simple centered login form (600px max width)
   - Remember me checkbox
   - Clean input fields matching brand

### F. Imagery

**No Hero Images Required** - This is a utility/transaction-focused platform where speed and clarity trump visual storytelling.

**Icons Only:**
- Checkmarks for selection states
- Status indicators (small colored dots)
- Navigation icons in admin sidebar (20px, simple line icons)
- Success/error icons on confirmation pages (64px)

**Logo/Branding:**
- Text-based "FastNet" logo with yellow "Net" portion
- Slogan underneath in lighter text
- No image assets needed - keeps page fast

### G. Interaction Patterns

**Customer Interactions:**
- Single-click package selection with immediate visual feedback
- Smooth transitions between views (no jarring page reloads)
- Button states: Default → Hover → Active with subtle transforms
- Loading states on payment: Spinner inside button, disabled state

**Admin Interactions:**
- Inline editing where possible (click to edit, save/cancel)
- Confirmation modals for destructive actions (delete)
- Toast notifications for success/error feedback (top-right, 4s duration)
- Real-time order updates without page refresh (polling or websocket)

**Responsive Behavior:**
- Mobile: Hamburger menu for admin nav, stacked layouts
- Tablet: 2-column grids maintained where possible
- Desktop: Full multi-column layouts, sidebar navigation

### H. Animation Guidelines

**Minimal but Purposeful:**
- Card hover: 200ms ease transform and shadow
- Button interactions: 100-150ms ease
- Modal/overlay appearance: 200ms fade + scale
- Success confirmations: Single bounce or checkmark draw (500ms max)
- **NO** continuous animations, carousels, or distracting effects

### I. Accessibility & Performance

- Maintain 4.5:1 contrast ratio minimum
- Focus states: 2px blue outline offset by 2px
- Form validation: Clear error messages below inputs in red
- Loading states clearly communicated
- No animations that could cause motion sickness
- Fast page loads: inline critical CSS, defer scripts

## Brand Personality

**Fast, Trustworthy, Efficient** - The design should feel like instant gratification. Users should feel confident that their purchase will be processed immediately and correctly. The admin should feel powerful and in control with clear data visualization and quick actions.