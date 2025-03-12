/// <reference types="vite/client" />

declare module 'vite/client';

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEETS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 