export type MobileAppMode = 'EARLY_DEVELOPMENT' | 'PRODUCTION'

export const mobileConfig = {
  mode: (process.env.EXPO_PUBLIC_APP_MODE as MobileAppMode | undefined) ?? 'EARLY_DEVELOPMENT',
  server: {
    development: 'https://iso-adhi.pttas.net/api/',
    production: 'https://api-staging.danantara.id',
  },
}

function ensureTrailingSlash(url: string) {
  return url.endsWith('/') ? url : `${url}/`
}

export function resolveAPIBaseURL() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return ensureTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL)
  }
  return ensureTrailingSlash(mobileConfig.mode === 'PRODUCTION' ? mobileConfig.server.production : mobileConfig.server.development)
}
