# CLAUDE.md - Development Reference

This file documents the development of **Jotty**, a feature-rich notes application built with Preact + Vite + Yarn.

## 🚀 Project Overview

**Jotty** is a modern, frontend-only notes application that provides a Notion-like experience but lighter and faster, with everything stored locally for privacy and offline use.

### Key Technologies
- **Frontend**: Preact 10.27.0 (React-compatible, lightweight)
- **Build Tool**: Vite 7.1.2 (fast development and optimized builds)
- **Package Manager**: Yarn 1.22.22
- **Language**: TypeScript for type safety
- **Styling**: CSS with CSS Variables for theming
- **Syntax Highlighting**: PrismJS 1.30.0
- **Testing**: Vitest 3.2.4 with @testing-library/preact
- **Storage**: LocalStorage with comprehensive error handling

## 📁 Project Structure

```
src/
├── components/          # UI Components
│   ├── NoteCard.tsx    # Note preview cards for grid view
│   ├── NoteEditor.tsx  # Main note editing interface
│   ├── NotesList.tsx   # Notes grid/list with search & actions
│   ├── CodeBlock.tsx   # Syntax-highlighted code blocks
│   ├── ColorPicker.tsx # Color customization modal
│   ├── IconPicker.tsx  # Icon selection modal
│   ├── ImageUploader.tsx # Image upload with validation
│   └── ExportImportModal.tsx # Export/import functionality
├── hooks/              # Custom Hooks
│   ├── useLocalStorage.ts # LocalStorage management with error handling
│   ├── useNotes.ts     # Notes CRUD operations
│   └── useTheme.tsx    # Theme management (light/dark)
├── utils/              # Utility Functions
│   └── helpers.ts      # Helper functions (debounce, validation, etc.)
├── tests/              # Test Files
│   ├── setup.ts        # Test environment configuration
│   ├── *.test.ts       # Unit tests for hooks and utilities
│   └── integration.test.tsx # Full workflow integration tests
├── types.ts            # TypeScript type definitions
├── index.css          # Global styles with CSS variables
├── prism-theme.css    # Custom syntax highlighting themes
└── main.tsx           # Application entry point
```

## ✅ Implemented Features

### Core Functionality
- **Notes CRUD**: Create, read, update, delete notes
- **Auto-save**: Debounced auto-save (500ms delay) with `useEffect` and `debounce`
- **Search**: Real-time search across note titles and content
- **Templates**: Plain, Code Note, and Checklist templates
- **Duplication**: Clone existing notes with "(Copy)" suffix
- **Persistence**: LocalStorage with quota management and error handling

### Code Block Support
- **Triple Backticks Detection**: ```` ``` ```` auto-converts to code blocks
- **Language Support**: JavaScript, TypeScript, Python, CSS, HTML, JSON, Bash
- **Syntax Highlighting**: PrismJS with custom light/dark themes
- **Interactive Features**: Copy to clipboard, expand/collapse, language switching
- **Smart Parsing**: Code blocks rendered separately from text content

### Theming & Customization
- **Light/Dark Theme**: System preference detection with manual toggle
- **CSS Variables**: Consistent theming across all components
- **Per-Note Colors**: Color picker with preset palette and custom hex input
- **Note Icons**: 48+ emoji icons to choose from
- **Responsive Design**: Mobile-first approach with progressive enhancement

### Media & Export/Import
- **Image Support**: Base64 encoding with 5MB size validation
- **Export Notes**: JSON export with selective note choosing
- **Import Notes**: JSON import with duplicate detection and validation
- **Error Handling**: Graceful fallbacks for storage quota and corrupted data

### Mobile & Accessibility
- **Touch-Friendly**: 44px minimum touch targets for accessibility
- **Responsive Layouts**: 1 column (mobile), 2 columns (tablet), auto-grid (desktop)
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

## 🔧 Technical Implementation Details

### Data Flow Architecture
```
App.tsx (Main State)
├── NotesList.tsx (List View)
│   ├── useNotes() hook
│   ├── NoteCard.tsx components
│   └── ExportImportModal.tsx
└── NoteEditor.tsx (Edit View)
    ├── useNotes() hook
    ├── Auto-save with debounce
    ├── CodeBlock.tsx components
    ├── ColorPicker.tsx modal
    ├── IconPicker.tsx modal
    └── ImageUploader.tsx
```

### Key Hooks Implementation

#### useLocalStorage
- Generic hook for any localStorage operations
- Error handling for quota exceeded and corrupted data
- Automatic JSON serialization/deserialization
- Cross-tab synchronization with storage events
- Safe fallbacks when localStorage is unavailable

#### useNotes
- CRUD operations with optimistic updates
- Notes sorting by `lastEdited` timestamp
- Template system for different note types
- Import functionality with duplicate prevention
- Consistent ID generation with `generateId()`

#### useTheme
- Context-based theme management
- Automatic HTML attribute updates for CSS variables
- LocalStorage persistence of theme preference
- System preference detection on first load

### Component Patterns

#### Controlled Components
All input components are controlled with React patterns:
- `value` prop for current state
- `onChange/onInput` handlers for updates
- Immediate state updates with debounced persistence

#### Modal Components
Consistent modal pattern across ColorPicker, IconPicker, and ExportImportModal:
- Overlay click to close
- Escape key handling
- Focus management
- Mobile-responsive sizing

#### Error Boundaries
- LocalStorage error handling with user-friendly messages
- Image upload validation with file size limits
- JSON import validation with detailed error reporting
- Network-independent operation

### CSS Architecture

#### CSS Variables System
```css
[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --accent: #007bff;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --accent: #0d6efd;
  /* ... */
}
```

#### Mobile-First Responsive Design
- Base styles for mobile (max-width: 480px)
- Tablet styles (481px - 768px)
- Desktop styles (769px+)
- Touch-specific styles with `@media (pointer: coarse)`

## 🧪 Testing Strategy

### Unit Tests
- **Hooks Testing**: useLocalStorage, useNotes, helper functions
- **Component Testing**: NoteCard with user interactions
- **Utility Testing**: debounce, formatDate, validation functions
- **Mock Implementation**: localStorage, clipboard API, file reading

### Integration Tests
- **Full Workflows**: Create → Edit → Save → Delete
- **Template Testing**: Code note and checklist creation
- **Persistence Testing**: localStorage operations
- **Search Testing**: Real-time filtering functionality
- **Theme Testing**: Light/dark mode switching

### Test Setup
- **Vitest**: Fast test runner with ES modules support
- **@testing-library/preact**: Component testing utilities
- **jsdom**: Browser environment simulation
- **Mock Functions**: vi.fn() for localStorage and browser APIs

## 🚨 Key Issues Resolved

### 1. Dark Mode Note Backgrounds
**Problem**: Notes showed white background in dark mode
**Solution**: Updated CSS to use CSS variables instead of hard-coded colors
```tsx
// Before: style={{ backgroundColor: note.color }}
// After: 
style={{ 
  backgroundColor: note.color === '#ffffff' ? 'var(--bg-secondary)' : note.color 
}}
```

### 2. Empty Note Creation
**Problem**: Empty notes were created and saved immediately
**Solution**: Implemented draft note system
- Notes are only created in UI temporarily
- Saved to localStorage only when content is added
- Automatic cleanup of empty drafts when navigating away

### 3. Code Block Parsing
**Problem**: Complex parsing of triple backticks with content editing
**Solution**: Two-phase approach
- Parse ``` into structured markers `[CODE_BLOCK:language]`
- Render markers as React components with editing capabilities
- Toggle between raw text editing and rendered view

### 4. Mobile Touch Optimization
**Problem**: Small touch targets and poor mobile experience
**Solution**: 
- 44px minimum touch targets for accessibility
- Touch-specific CSS with `@media (pointer: coarse)`
- Mobile-first responsive design approach
- Proper viewport meta tags and touch-action CSS

## 🔄 Data Flow Examples

### Note Creation Flow
1. User clicks "New Note" → `handleCreateNote()`
2. Creates draft note object with template data
3. Passes to `NoteEditor` with `isNewNote=true`
4. User types content → `handleContentChange()`
5. Debounced save checks if content exists
6. If content exists → `createNote()` → localStorage
7. If user exits without content → note discarded

### Auto-Save Flow
1. User types in editor → `handleContentChange()`
2. `debounce(debouncedSave, 500)` delays execution
3. `debouncedSave` calls `updateNote()` with changes
4. `updateNote()` updates notes array and localStorage
5. UI re-renders with latest data

### Export/Import Flow
1. User clicks export → `ExportImportModal` opens
2. User selects notes → checkboxes update `selectedNotes` Set
3. User clicks export → JSON.stringify + Blob + download
4. Import: File input → FileReader → JSON.parse → validation → `importNotes()`

## 🎯 Performance Optimizations

### LocalStorage Management
- Debounced writes to prevent excessive localStorage operations
- JSON compression with minimal whitespace
- Error handling for quota exceeded with user feedback
- Lazy loading of images with size validation

### React/Preact Optimizations
- Controlled components with minimal re-renders
- Debounced search to prevent excessive filtering
- Memoized calculations in helper functions
- Strategic use of `useEffect` dependencies

### CSS Performance
- CSS variables for theme switching (no JS re-renders)
- Hardware-accelerated transforms for animations
- Efficient selectors and minimal specificity
- Mobile-first approach reduces CSS overhead

## 📋 Commands Reference

```bash
# Development
yarn dev              # Start dev server
yarn build           # Production build
yarn preview         # Preview production build

# Testing
yarn test            # Run tests in watch mode
yarn test --run      # Run tests once
yarn test:ui         # Run tests with UI

# Linting (if configured)
yarn lint            # Check code style
yarn typecheck       # TypeScript checking
```

## 🔮 Future Enhancement Ideas

### Features
- **Markdown Support**: Rich text editor with markdown shortcuts
- **Tags System**: Categorize notes with tags and filtering
- **Full-Text Search**: Advanced search with highlighting
- **Nested Notes**: Folder structure for organization
- **Collaborative Features**: Share notes via URLs (optional)
- **Plugins System**: Extensible architecture for custom features

### Technical Improvements
- **Virtual Scrolling**: For large note collections
- **Service Worker**: Offline support and caching
- **IndexedDB**: More efficient storage for large datasets
- **Web Components**: Reusable components beyond Preact
- **PWA Features**: Installable app with app manifest

### UX Enhancements
- **Drag & Drop**: Reorder notes and add files
- **Keyboard Shortcuts**: Power user features
- **Note Linking**: Wiki-style note connections
- **Advanced Templates**: More sophisticated note templates
- **Custom Themes**: User-created color schemes

## 💡 Development Best Practices Demonstrated

### TypeScript Usage
- Strict type checking with interfaces and unions
- Generic hooks for reusability (`useLocalStorage<T>`)
- Proper event typing for DOM interactions
- Component prop interfaces for clear contracts

### React/Preact Patterns
- Custom hooks for stateful logic separation
- Context providers for global state (theme)
- Controlled components with proper state management
- Effect cleanup and dependency arrays

### Error Handling
- Try-catch blocks for all localStorage operations
- User-friendly error messages
- Graceful degradation when features unavailable
- Input validation and sanitization

### Code Organization
- Feature-based component organization
- Separation of concerns (hooks, utils, components)
- Consistent naming conventions
- Comprehensive documentation and comments

This documentation serves as a complete reference for understanding and maintaining the Jotty notes application.