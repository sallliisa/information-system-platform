/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly GOOGLE_MAP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
