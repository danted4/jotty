# Jotty - Feature Rich Notes App

A modern, feature-rich notes application built with Preact + Vite, featuring local storage persistence, code blocks, themes, and mobile-friendly design.

## ✨ Features

### 📝 Core Functionality
- **Create, edit, delete, and duplicate notes**
- **Auto-save with 500ms debounced typing**
- **Local storage persistence** - all data stays on your device
- **Search functionality** across note titles and content
- **Note templates**: Plain, Code, and Checklist notes

### 💻 Code Support
- **Triple backticks detection** - type ``` to create code blocks
- **Syntax highlighting** with PrismJS support for:
  - JavaScript, TypeScript, Python, CSS, HTML, JSON, Bash
- **Code block management** with language selection
- **Copy to clipboard** functionality
- **Expandable/collapsible** code blocks

### 🎨 Theming & Customization
- **Light/Dark theme toggle** with system preference detection
- **Per-note color customization** with preset palette and custom color picker
- **Note icons** - choose from 48+ emoji icons
- **Responsive design** - optimized for desktop, tablet, and mobile

### 🖼️ Media Support
- **Image upload** with base64 encoding
- **Size validation** (5MB limit) with graceful error handling
- **LocalStorage quota management**

### 📱 Mobile-First Design
- **Touch-friendly interface** with 44px minimum touch targets
- **Responsive layouts** for all screen sizes
- **Mobile-optimized** typography and spacing
- **Gesture support** and proper touch interactions

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Preview production build
yarn preview
```

## 🎯 Key Features Implemented

### ✅ Requirements Completed
- [x] Preact + Vite + Yarn setup
- [x] LocalStorage persistence with error handling
- [x] Notes CRUD operations (create, edit, delete, duplicate)
- [x] Auto-save with debounced typing (500ms)
- [x] Code blocks with triple backticks detection
- [x] Syntax highlighting (PrismJS)
- [x] Light/dark theme toggle
- [x] Per-note color customization
- [x] Note icons and templates
- [x] Image support with size validation
- [x] Mobile and tablet optimized layouts
- [x] Comprehensive error handling
- [x] Unit and integration tests

The application is now complete and running on http://localhost:5173/

## 📄 License

MIT License