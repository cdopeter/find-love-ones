# Screenshot Placeholders

This directory contains screenshots of the HopeNet application for documentation purposes.

## Current Screenshots

> **Note**: Currently, placeholder files exist. Actual screenshots need to be added by running the application and capturing screenshots.

### Homepage
**File**: `homepage.png` (placeholder: `homepage.png.placeholder`)
- Main landing page
- Features overview
- Call-to-action buttons

### Dashboard
**File**: `dashboard.png` (placeholder: `dashboard.png.placeholder`)
- Responder dashboard view
- Interactive map showing missing persons by parish
- Data table with filtering options

### To Be Added

The following screenshots should be added once the application is running:

### Request Form
**File**: `request-form.png`
- Missing person submission form
- Form validation examples

### Map View
**File**: `map-view.png`
- Detailed map view
- Parish boundaries
- Marker clustering

## Adding Screenshots

To add screenshots to the documentation:

1. Take a screenshot of the application feature
2. Name it descriptively (e.g., `dashboard.png`, `search-results.png`)
3. Save it in this directory
4. Reference it in the README: `![Description](./docs/screenshots/filename.png)`

## Screenshot Guidelines

- **Format**: PNG for UI screenshots, JPEG for photos
- **Size**: Keep under 500KB (optimize if needed)
- **Resolution**: At least 1280x720 for desktop views
- **Mobile**: 375x667 or similar for mobile screenshots
- **Content**: Blur or remove any sensitive personal information

## Generating Screenshots

You can use the following tools:
- **Browser DevTools**: Built-in screenshot feature (F12 → ⌘+Shift+P → "Capture screenshot")
- **macOS**: ⌘+Shift+4 (select area) or ⌘+Shift+3 (full screen)
- **Windows**: Windows+Shift+S
- **Playwright**: `await page.screenshot({ path: 'screenshot.png' })`

## Optimization

Optimize screenshots before committing:
```bash
# Using ImageMagick
convert screenshot.png -quality 85 -resize 1280x screenshot-optimized.png

# Using pngquant
pngquant --quality=65-80 screenshot.png
```
