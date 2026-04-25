/// <reference types="vite/client" />

import type { EntityManagerApi } from '../lib/entity';

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCK_DATA: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __ENTITY_CONFIG__?: Record<string, unknown>;
    __ENTITY_TYPE__?: string;
    __client__?: string | number;
    __transactionMode__?: boolean;
    EntityManager?: EntityManagerApi;
  }
}
