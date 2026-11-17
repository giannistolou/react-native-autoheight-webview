import type {StyleProp, ViewStyle} from 'react-native';
import type {WebView, WebViewProps} from 'react-native-webview';

export type {WebViewMessageEvent} from 'react-native-webview';

export type WebViewSource = WebViewProps['source'];
export type WebViewInstance = WebView<object>;

export interface StylesFile {
  href: string;
  type: string;
  rel: string;
}

export interface SizeUpdate {
  width: number;
  height: number;
}

export interface AutoHeightWebViewProps extends WebViewProps {
  /** Called whenever the measured content width or height changes. */
  onSizeUpdated?: (size: SizeUpdate) => void;
  /** Stylesheets or other `<link>` resources appended to the page head. */
  files?: StylesFile[];
  style?: StyleProp<ViewStyle>;
  /** JavaScript injected before the auto-height script runs. */
  customScript?: string;
  /** CSS appended to the page head. */
  customStyle?: string;
  /** Content of the viewport meta tag. Defaults to `width=device-width` on iOS. */
  viewportContent?: string;
  /** Defaults to `false` on Android. */
  scalesPageToFit?: boolean;
  /** When `scrollEnabled` is `false`, enables scrolling only while the page is zoomed in (iOS). */
  scrollEnabledWithZoomedin?: boolean;
}

export type InjectedScriptOptions = Pick<
  AutoHeightWebViewProps,
  | 'files'
  | 'customScript'
  | 'customStyle'
  | 'viewportContent'
  | 'scalesPageToFit'
  | 'scrollEnabledWithZoomedin'
>;
