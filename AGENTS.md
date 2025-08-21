# AGENTS.md - Development Guidelines for Jotty

## Commands
- `yarn dev` - Start development server
- `yarn build` - Production build  
- `yarn test` - Run tests in watch mode
- `yarn test --run` - Run tests once
- `yarn test --run src/tests/specific.test.ts` - Run single test file
- `yarn test:ui` - Run tests with UI

## Code Style
- **Language**: TypeScript with strict typing
- **Framework**: Preact (React-compatible syntax)
- **Imports**: Named imports from relative paths (`../types`, `../utils/helpers`)
- **Components**: PascalCase function components with explicit interfaces
- **Props**: Destructured with TypeScript interfaces (e.g., `{ note, onSelect }: NoteCardProps`)
- **Hooks**: Custom hooks prefixed with `use` and generic types (`useLocalStorage<T>`)
- **Types**: Interfaces in `types.ts`, union types for templates/themes
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Event Handlers**: `handle` prefix (e.g., `handleDelete`, `handleDuplicate`)
- **Error Handling**: Try-catch for localStorage operations, user-friendly messages
- **CSS**: CSS variables for theming, mobile-first responsive design
- **Testing**: Vitest with @testing-library/preact, mock localStorage/browser APIs