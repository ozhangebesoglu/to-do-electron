# Copilot Instructions - To-Do Electron App

## Project Architecture

This is an **Electron + React desktop application** for daily task management with Pomodoro timer. The app uses a unique tri-file architecture pattern:

- **main.cjs** - Main Electron process (CommonJS)
- **preload.cjs** - Secure bridge between main and renderer (CommonJS) 
- **src/renderer/** - React frontend (ESM)

Key architectural decision: **Dual module system** - Main process uses CommonJS while renderer uses ESM for modern React compatibility.

## Data Model & Migration Pattern

**Critical**: The app uses a sophisticated data migration system. Always follow this pattern when modifying data structures:

```javascript
// Data structure: workspaces -> dates -> todos[]
{
  "workspaces": {
    "default": {
      "2024-1-15": [
        {
          "title": "Task",
          "notes": [{ "type": "text|task", "text": "...", "done": false }],
          "banner": { "type": "image|video", "path": "..." } | null,
          "bannerOffset": 0,
          "completed": false,
          "priority": "low|med|high",
          "dueDate": "YYYY-MM-DD" | null,
          "tags": ["tag1", "tag2"],
          "archived": false,
          "workspace": "default"
        }
      ]
    }
  },
  "meta": { "version": 2 }
}
```

**Migration functions** in `main.cjs`:
- `migrateStructure()` - Converts legacy date-key format to workspace structure
- `migrateNotesStructure()` - Converts string notes to object format, adds missing fields

## Build System (esbuild)

The build system uses **esbuild** via `build.mjs`:

```bash
npm run dev         # Watch mode + electron
npm run build       # Production build renderer only
npm run dist        # Full production + electron-builder
```

**Key build considerations**:
- Entry point: `src/renderer/index.jsx`
- Output: `dist/renderer.js` (single bundle)
- JSX automatic runtime (React 18+)
- Chrome 118+ target for Electron compatibility

## IPC Communication Pattern

**All data operations** go through IPC handlers in `main.cjs`. Never manipulate data directly in renderer:

```javascript
// preload.cjs exposes safe API
window.api.getTodos(workspace, dateKey)
window.api.addTodo(title, banner, workspace)
window.api.updateTodo(todoIndex, patch, workspace, dateKey)
window.api.setTags(todoIndex, tags, workspace, dateKey)
window.api.setBannerOffset(todoIndex, offset, workspace, dateKey)

// Custom window controls for frameless window
window.windowControls.minimize()
window.windowControls.toggleMaximize()
window.windowControls.close()
```

## Component Architecture

**Main component**: `todo-app.jsx` (551 lines) - Monolithic by design for simplicity

**Key patterns**:
- **Custom hooks**: `usePomodoro()` for timer logic with localStorage persistence
- **Ref forwarding**: `PomodoroClock` exposes `toggle()`, `reset()` methods via ref
- **State management**: Single useState per feature, no external state library
- **Event handling**: Global keyboard shortcuts with `e.code` for cross-keyboard compatibility

**Advanced UI patterns**:
- **Banner drag-to-reposition**: Mouse event handling for vertical offset adjustment
- **Tag system**: Support for #hashtag filtering in search
- **Workspace management**: Multi-workspace support with dropdown switching
- **Custom cursor**: `TargetCursor` component with GSAP animations

## Styling System

**Single dark theme** with CSS custom properties:
- Base colors: `--bg: #050505`, `--accent: #b97723` (coffee brown)
- **Card system**: Gradient backgrounds with overlay effects (`--card-grad`, `--card-overlay`)
- **Priority colors**: Semantic color coding (low: green, med: orange, high: red)
- **Responsive**: Flexbox with breakpoints at 1100px, 1180px
- **Custom scrollbars**: Styled webkit scrollbars with dark theme

## Global Shortcuts & Event Handling

**Keyboard shortcuts** registered in both main process and renderer:

```javascript
// Main process (global)
Ctrl+Alt+N - Quick capture (focus window)

// Renderer (component-level)
Enter - Add task & enter detail
Esc - Exit detail view
Ctrl+Alt+S - Pomodoro start/pause  
Ctrl+Alt+R - Pomodoro reset
Ctrl+Alt+K - Focus title input
Ctrl+Alt+F - Focus search
Ctrl+Enter - Add note (in detail)
Alt+↑/↓ - Adjust banner offset
```

**Event patterns**:
- Use `e.code` instead of `e.key` for keyboard layout independence
- Mouse drag implementation for banner positioning with `onMouseDown`, `onMouseMove`, `onMouseUp`

## Security Model

**Strict CSP** in `index.html`:
```html
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';
```

**Electron security**:
- `contextIsolation: true` and `nodeIntegration: false`
- All APIs exposed through `preload.cjs` bridge
- File operations restricted to main process only

## Development Patterns

**File organization**:
- Keep components in `src/renderer/` 
- Main process logic in `main.cjs` (not `main.js`)
- **No TypeScript** - Pure JavaScript with JSX

**State patterns**:
- Workspace switching triggers full data reload
- Search uses `useMemo` for tag filtering with regex
- Banner offset uses direct state + immediate IPC sync

**Testing approach**: Manual testing only - no test framework configured

## Packaging & Distribution

**electron-builder** configuration for Windows:
- NSIS installer with user choice installation
- Icon: `build/icon.ico` (256x256 recommended)
- GitHub releases integration for auto-updates

## Common Gotchas

1. **Module confusion**: Main process is CommonJS, renderer is ESM
2. **Data persistence**: Always use IPC calls, never direct file operations in renderer
3. **Migration safety**: Test data structure changes with both legacy and current formats
4. **Banner offset**: Use `setBannerOffset()` for image positioning, not CSS transforms
5. **Window controls**: Frameless window requires custom implementations in preload.cjs
6. **Search regex**: Tag filters use regex extraction from search string
7. **Global shortcuts**: Different behavior between main process (global) and renderer (local)

## Key Dependencies

- **React 18+** with automatic JSX runtime
- **GSAP** for TargetCursor animations and smooth transitions
- **esbuild** for fast builds and watch mode
- **electron-builder** for distribution packaging
- **21st-extension** tools for development debugging (dev-only)

When adding features, follow the established IPC pattern and always consider data migration implications.