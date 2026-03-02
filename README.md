# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Configuration & Deployment

This project reads build‑time variables from environment files. Vite will load:

1. `.env` — default (development) values
2. `.env.[mode]` — e.g. `.env.production` when building with `npm run build`
3. `.env.local`, `.env.production.local` — for machine‑specific secrets

### Important variables

| Name | Description | Example |
|------|-------------|---------|
| `VITE_API_URL` | Base URL for the backend API (required) | `https://api.farm2market.com` |
| `VITE_APP_NAME` | Friendly app name (used in UI if needed) | `Farm2Market` |
| `VITE_APP_ENV` | Environment indicator (`development`/`production`) | `production` |
| `VITE_BASE_PATH` | *Optional.* Frontend base path for hosting under a sub‑directory; defaults to `/` | `/` or `/app/` |

A sample `.env.example` is provided; copy it to `.env` (or `.env.development`) during development and adjust values.  
In production you can either create `.env.production` or set the variables in your deployment platform (Vercel, Netlify, Docker, etc.).

When you change `VITE_API_URL` in production and rebuild the app, the frontend will point to the new backend automatically.  This is the only URL you need to update after deployment.

### Build & serve

```bash
# development
npm run dev

# production build (reads .env.production or your environment variables)
npm run build

# preview local build
npm run preview
```

### Router base path

If you serve the app on a path other than `/`, set `VITE_BASE_PATH` to the path and the router will automatically use it.  The Vite config also uses this value as the `base` option so static assets resolve correctly.

### Linting notes

Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
