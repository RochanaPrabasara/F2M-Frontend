/// <reference types="vite/client" />

// extend the default Vite ImportMetaEnv interface with our variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_BASE_PATH?: string; // optional when serving from root
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
