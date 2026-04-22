import { Platform, type TextStyle } from 'react-native'

export const mobileTextInputContentStyle: TextStyle =
  Platform.select<TextStyle>({
    android: {
      paddingTop: 0,
      paddingBottom: 0,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    default: {},
  }) ?? {}
