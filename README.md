# Caching Fetch Project

## Overview

This project contains:

- A simple web app with server-side rendering.
- A custom caching fetch library (implemented).
- A mock server using MSW.
- A minimal framework for client/server rendering.

## Setup

```bash
    npm install
    npm start
```

Then open http://localhost:3000

## Project Structure

```text
    /application              # UI application
    /caching-fetch-library    # Caching fetch logic
    /framework                # SSR framework
```

## Configuration

### ESLint, Prettier

Configured for consistent code style.

Run:

```bash
    npm run lint
    npm run format
```

### Typechecking

```bash
    npm run typecheck
```

### Testing
- Added unit tests for the useCachingFetch hook and related functions (preloadCachingFetch, serializeCache, initializeCache).
- Tests cover core scenarios, including cache behavior and data validation.

Run:
```bash
    npm run test
```

## What’s missing / not yet implemented

- Integration tests to verify end-to-end functionality across components and server.
- UI tests to validate visual behavior of components.
- CI/CD setup for automated testing and deployment.
- Pre-commit hooks (husky, lint-staged) to enforce code quality before commits.
- Cache persistence in localStorage or other client storage mechanisms is not yet implemented.

