import {Platform} from 'react-native';
import type {AutoHeightWebViewProps} from './types';

const SHARED_DEFAULT_PROPS: Partial<AutoHeightWebViewProps> = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  originWhitelist: ['*'],
};

const PLATFORM_DEFAULT_PROPS: Partial<AutoHeightWebViewProps> = Platform.select(
  {
    android: {scalesPageToFit: false},
    ios: {viewportContent: 'width=device-width'},
    default: {},
  },
);

export const applyDefaultProps = (
  props: AutoHeightWebViewProps,
): AutoHeightWebViewProps => ({
  ...SHARED_DEFAULT_PROPS,
  ...PLATFORM_DEFAULT_PROPS,
  ...withoutUndefinedValues(props),
});

const withoutUndefinedValues = <Props extends object>(props: Props) =>
  Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as Props;
