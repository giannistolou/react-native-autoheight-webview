import React, {forwardRef, memo} from 'react';
import {StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  AutoHeightMessageType,
  parseAutoHeightMessage,
} from './autoHeightProtocol';
import {applyDefaultProps} from './defaultProps';
import {haveEquivalentProps} from './propsEquality';
import type {
  AutoHeightWebViewProps,
  WebViewInstance,
  WebViewMessageEvent,
} from './types';
import {useContentSize} from './useContentSize';
import {useZoomAwareScrolling} from './useZoomAwareScrolling';
import {buildWebViewContent} from './webViewContent';

const AutoHeightWebView = memo(
  forwardRef<WebViewInstance, AutoHeightWebViewProps>(
    function AutoHeightWebViewRenderer(props, ref) {
      const {
        onSizeUpdated,
        files,
        customScript,
        customStyle,
        viewportContent,
        scrollEnabledWithZoomedin,
        ...webViewProps
      } = applyDefaultProps(props);
      const {style, source, onMessage, scrollEnabled, scalesPageToFit} =
        webViewProps;

      const {contentSize, updateContentSize} = useContentSize(
        style,
        onSizeUpdated,
      );
      const {isScrollEnabled, updateZoomState} = useZoomAwareScrolling({
        scrollEnabled,
        scrollEnabledWithZoomedin,
      });

      const handleMessage = (event: WebViewMessageEvent) => {
        const message = parseAutoHeightMessage(event.nativeEvent.data);
        if (!message) {
          onMessage?.(event);
        } else if (message.type === AutoHeightMessageType.contentSize) {
          updateContentSize(message);
        } else {
          updateZoomState(message.isZoomedIn);
        }
      };

      const content = buildWebViewContent(source, {
        files,
        customScript,
        customStyle,
        viewportContent,
        scalesPageToFit,
        scrollEnabledWithZoomedin,
      });

      return (
        <WebView
          {...webViewProps}
          ref={ref}
          source={content.source}
          injectedJavaScript={content.injectedJavaScript}
          onMessage={handleMessage}
          scrollEnabled={isScrollEnabled}
          style={[styles.transparentBackground, contentSize, style]}
        />
      );
    },
  ),
  haveEquivalentProps,
);

const styles = StyleSheet.create({
  transparentBackground: {
    backgroundColor: 'transparent',
  },
});

export default AutoHeightWebView;
