type MaterialColorValue = `${number} ${number} ${number}`

export type MaterialThemeTokens = {
  primary: MaterialColorValue
  surfaceTint: MaterialColorValue
  onPrimary: MaterialColorValue
  primaryContainer: MaterialColorValue
  onPrimaryContainer: MaterialColorValue
  secondary: MaterialColorValue
  onSecondary: MaterialColorValue
  secondaryContainer: MaterialColorValue
  onSecondaryContainer: MaterialColorValue
  tertiary: MaterialColorValue
  onTertiary: MaterialColorValue
  tertiaryContainer: MaterialColorValue
  onTertiaryContainer: MaterialColorValue
  error: MaterialColorValue
  onError: MaterialColorValue
  errorContainer: MaterialColorValue
  onErrorContainer: MaterialColorValue
  background: MaterialColorValue
  onBackground: MaterialColorValue
  surface: MaterialColorValue
  onSurface: MaterialColorValue
  surfaceVariant: MaterialColorValue
  onSurfaceVariant: MaterialColorValue
  outline: MaterialColorValue
  outlineVariant: MaterialColorValue
  shadow: MaterialColorValue
  scrim: MaterialColorValue
  inverseSurface: MaterialColorValue
  inverseOnSurface: MaterialColorValue
  inversePrimary: MaterialColorValue
  primaryFixed: MaterialColorValue
  onPrimaryFixed: MaterialColorValue
  primaryFixedDim: MaterialColorValue
  onPrimaryFixedVariant: MaterialColorValue
  secondaryFixed: MaterialColorValue
  onSecondaryFixed: MaterialColorValue
  secondaryFixedDim: MaterialColorValue
  onSecondaryFixedVariant: MaterialColorValue
  tertiaryFixed: MaterialColorValue
  onTertiaryFixed: MaterialColorValue
  tertiaryFixedDim: MaterialColorValue
  onTertiaryFixedVariant: MaterialColorValue
  surfaceDim: MaterialColorValue
  surfaceBright: MaterialColorValue
  surfaceContainerLowest: MaterialColorValue
  surfaceContainerLow: MaterialColorValue
  surfaceContainer: MaterialColorValue
  surfaceContainerHigh: MaterialColorValue
  surfaceContainerHighest: MaterialColorValue
}

export type MaterialScheme = 'light' | 'dark'

export const MATERIAL_THEME_TOKENS: Record<MaterialScheme, MaterialThemeTokens> = {
  light: {
    primary: '137 81 30',
    surfaceTint: '137 81 30',
    onPrimary: '255 255 255',
    primaryContainer: '255 220 195',
    onPrimaryContainer: '108 58 7',
    secondary: '116 89 68',
    onSecondary: '255 255 255',
    secondaryContainer: '255 220 195',
    onSecondaryContainer: '90 66 46',
    tertiary: '92 98 54',
    onTertiary: '255 255 255',
    tertiaryContainer: '225 231 176',
    onTertiaryContainer: '69 74 33',
    error: '186 26 26',
    onError: '255 255 255',
    errorContainer: '255 218 214',
    onErrorContainer: '147 0 10',
    background: '255 248 245',
    onBackground: '34 26 20',
    surface: '255 248 245',
    onSurface: '34 26 20',
    surfaceVariant: '243 223 210',
    onSurfaceVariant: '81 68 59',
    outline: '132 116 105',
    outlineVariant: '214 195 182',
    shadow: '0 0 0',
    scrim: '0 0 0',
    inverseSurface: '56 47 40',
    inverseOnSurface: '254 238 228',
    inversePrimary: '255 183 126',
    primaryFixed: '255 220 195',
    onPrimaryFixed: '47 21 0',
    primaryFixedDim: '255 183 126',
    onPrimaryFixedVariant: '108 58 7',
    secondaryFixed: '255 220 195',
    onSecondaryFixed: '42 23 7',
    secondaryFixedDim: '227 192 166',
    onSecondaryFixedVariant: '90 66 46',
    tertiaryFixed: '225 231 176',
    onTertiaryFixed: '26 30 0',
    tertiaryFixedDim: '197 203 150',
    onTertiaryFixedVariant: '69 74 33',
    surfaceDim: '231 215 206',
    surfaceBright: '255 248 245',
    surfaceContainerLowest: '255 255 255',
    surfaceContainerLow: '255 241 233',
    surfaceContainer: '251 235 225',
    surfaceContainerHigh: '245 229 219',
    surfaceContainerHighest: '239 223 214',
  },
  dark: {
    primary: '255 183 126',
    surfaceTint: '255 183 126',
    onPrimary: '77 38 0',
    primaryContainer: '108 58 7',
    onPrimaryContainer: '255 220 195',
    secondary: '227 192 166',
    onSecondary: '66 44 26',
    secondaryContainer: '90 66 46',
    onSecondaryContainer: '255 220 195',
    tertiary: '197 203 150',
    onTertiary: '46 51 12',
    tertiaryContainer: '69 74 33',
    onTertiaryContainer: '225 231 176',
    error: '255 180 171',
    onError: '105 0 5',
    errorContainer: '147 0 10',
    onErrorContainer: '255 218 214',
    background: '25 18 12',
    onBackground: '239 223 214',
    surface: '25 18 12',
    onSurface: '239 223 214',
    surfaceVariant: '81 68 59',
    onSurfaceVariant: '214 195 182',
    outline: '158 142 130',
    outlineVariant: '81 68 59',
    shadow: '0 0 0',
    scrim: '0 0 0',
    inverseSurface: '239 223 214',
    inverseOnSurface: '56 47 40',
    inversePrimary: '137 81 30',
    primaryFixed: '255 220 195',
    onPrimaryFixed: '47 21 0',
    primaryFixedDim: '255 183 126',
    onPrimaryFixedVariant: '108 58 7',
    secondaryFixed: '255 220 195',
    onSecondaryFixed: '42 23 7',
    secondaryFixedDim: '227 192 166',
    onSecondaryFixedVariant: '90 66 46',
    tertiaryFixed: '225 231 176',
    onTertiaryFixed: '26 30 0',
    tertiaryFixedDim: '197 203 150',
    onTertiaryFixedVariant: '69 74 33',
    surfaceDim: '25 18 12',
    surfaceBright: '65 55 49',
    surfaceContainerLowest: '20 13 8',
    surfaceContainerLow: '34 26 20',
    surfaceContainer: '38 30 24',
    surfaceContainerHigh: '49 40 34',
    surfaceContainerHighest: '60 51 44',
  },
}
