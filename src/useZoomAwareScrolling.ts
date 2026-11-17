import {useState} from 'react';
import type {AutoHeightWebViewProps} from './types';

export const useZoomAwareScrolling = ({
  scrollEnabled,
  scrollEnabledWithZoomedin,
}: Pick<
  AutoHeightWebViewProps,
  'scrollEnabled' | 'scrollEnabledWithZoomedin'
>) => {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const isScrollingControlledByZoom =
    scrollEnabled === false && Boolean(scrollEnabledWithZoomedin);

  return {
    isScrollEnabled: isScrollingControlledByZoom ? isZoomedIn : scrollEnabled,
    updateZoomState: setIsZoomedIn,
  };
};
