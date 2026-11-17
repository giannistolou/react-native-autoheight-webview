import {useCallback, useEffect, useState} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AutoHeightWebViewProps, SizeUpdate} from './types';

const UNMEASURED_HEIGHT = 0;

export const useContentSize = (
  style: StyleProp<ViewStyle>,
  onSizeUpdated: AutoHeightWebViewProps['onSizeUpdated'],
) => {
  const [contentSize, setContentSize] = useState(() =>
    estimateInitialSize(style),
  );

  useEffect(() => {
    onSizeUpdated?.(contentSize);
  }, [contentSize, onSizeUpdated]);

  const updateContentSize = useCallback(({width, height}: SizeUpdate) => {
    const measuredSize = {width, height};
    if (isMeasurable(measuredSize)) {
      setContentSize((currentSize) =>
        isSameSize(currentSize, measuredSize) ? currentSize : measuredSize,
      );
    }
  }, []);

  return {contentSize, updateContentSize};
};

const estimateInitialSize = (style: StyleProp<ViewStyle>): SizeUpdate => {
  const {width, height} = StyleSheet.flatten(style) ?? {};
  return {
    width: typeof width === 'number' && width ? width : screenWidth(),
    height: typeof height === 'number' ? height : UNMEASURED_HEIGHT,
  };
};

const screenWidth = () => Dimensions.get('window').width;

const isMeasurable = ({width, height}: SizeUpdate) =>
  Boolean(width) && Boolean(height);

const isSameSize = (first: SizeUpdate, second: SizeUpdate) =>
  first.width === second.width && first.height === second.height;
