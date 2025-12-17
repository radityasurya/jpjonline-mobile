import { Platform, StatusBar } from 'react-native';

// Uniform padding top for all pages to avoid status bar overlap
export const HEADER_PADDING_TOP = Platform.select({
  ios: 60,
  android: (StatusBar.currentHeight || 0) + 20,
  default: 60,
});

export const LAYOUT_CONSTANTS = {
  headerPaddingTop: HEADER_PADDING_TOP,
  headerPaddingBottom: 20,
  contentPadding: 20,
};