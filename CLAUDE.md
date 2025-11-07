# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native application built with:
- Expo SDK ~54.0.23
- React Native 0.81.5
- React 19.1.0
- TypeScript with strict mode enabled
- Expo Router 6.0 for file-based routing
- React Navigation for navigation components

The project uses Expo's new architecture (`newArchEnabled: true`) and experimental features including typed routes and React Compiler.

## Development Commands

### Starting the Development Server
```bash
npm start
# Or use expo directly:
npx expo start
```

### Platform-Specific Development
```bash
npm run android   # Start on Android emulator
npm run ios       # Start on iOS simulator
npm run web       # Start web version
```

### Code Quality
```bash
npm run lint      # Run ESLint with expo-config-expo
```

### Dependencies
```bash
npm install       # Install dependencies
```

## Architecture

### Project Structure
```
app/              # File-based routing (screens)
components/       # Reusable UI components
lib/              # Business logic, utilities, and services
```

### Routing
The app uses Expo Router with file-based routing. Routes are defined in the `app/` directory:
- `app/_layout.tsx` - Root layout component using Stack navigation
- `app/index.tsx` - Home/index screen
- File structure in `app/` directory directly maps to app routes

### Components
Reusable UI components should be placed in the `components/` directory:
- Keep components focused and composable
- Use TypeScript for props typing
- Follow React best practices and hooks patterns

### Business Logic
Business logic, utilities, and services should be organized in the `lib/` directory:
- `lib/utils/` - Helper functions and utilities
- `lib/services/` - API calls, data fetching, external integrations
- `lib/hooks/` - Custom React hooks
- `lib/types/` - Shared TypeScript types and interfaces
- `lib/constants/` - App-wide constants and configuration

### Path Aliases
TypeScript is configured with `@/*` path alias that maps to the project root:
```typescript
import { Button } from '@/components/Button';
import { formatDate } from '@/lib/utils/date';
import { useAuth } from '@/lib/hooks/useAuth';
```

### Configuration Files
- `app.json` - Expo app configuration with platform-specific settings
- `tsconfig.json` - TypeScript config extending expo/tsconfig.base with strict mode
- `eslint.config.js` - ESLint flat config using eslint-config-expo

### Platform Support
The app is configured for:
- iOS (supports tablets)
- Android (edge-to-edge enabled, adaptive icons configured)
- Web (static output)

### Key Expo Features in Use
- Expo Router for navigation
- Expo Splash Screen with custom configuration
- React Native Reanimated for animations
- React Native Gesture Handler for gestures
- Custom URL scheme: `cbc2025://`