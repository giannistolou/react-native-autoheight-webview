import {
  AUTO_HEIGHT_MESSAGE_TOPIC,
  AutoHeightMessageType,
} from '../autoHeightProtocol';
import {toScriptLiteral} from './toScriptLiteral';

export const sizeReporterScript = (scalesPageToFit: boolean) => `
  var pageScale = ${toScriptLiteral(scalesPageToFit)} ? screen.width / window.innerWidth : 1;
  var isPinching = false;
  var isZoomedIn = false;
  var lastReportedHeight = 0;
  var unchangedHeightReports = 0;
  var MAX_UNCHANGED_HEIGHT_REPORTS = 5;
  var RECHECK_DELAY_STEP_MS = 1000;
  var NATIVE_BRIDGE_POLL_INTERVAL_MS = 200;
  var heightRecheckTimeout;
  var nativeBridgePollTimeout;

  function isNativeBridgeReady() {
    return window.hasOwnProperty('ReactNativeWebView') &&
      window.ReactNativeWebView.hasOwnProperty('postMessage');
  }

  function postToNative(message) {
    message.topic = ${toScriptLiteral(AUTO_HEIGHT_MESSAGE_TOPIC)};
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  function measureContentSize() {
    var bounds = contentWrapper.getBoundingClientRect();
    return {
      width: bounds.width || contentWrapper.offsetWidth || document.documentElement.offsetWidth,
      height: (bounds.height + bounds.top) || contentWrapper.offsetHeight || document.documentElement.offsetHeight
    };
  }

  function scheduleRecheckForLateLoadingContent(height) {
    clearTimeout(heightRecheckTimeout);
    unchangedHeightReports = height === lastReportedHeight ? unchangedHeightReports + 1 : 1;
    lastReportedHeight = height;
    if (unchangedHeightReports <= MAX_UNCHANGED_HEIGHT_REPORTS) {
      heightRecheckTimeout = setTimeout(updateSize, unchangedHeightReports * RECHECK_DELAY_STEP_MS);
    }
  }

  function isMeasurementPaused() {
    return isZoomedIn || isPinching || Boolean(document.fullscreenElement);
  }

  function updateSize() {
    if (isMeasurementPaused()) {
      return;
    }
    if (!isNativeBridgeReady()) {
      nativeBridgePollTimeout = setTimeout(updateSize, NATIVE_BRIDGE_POLL_INTERVAL_MS);
      return;
    }
    clearTimeout(nativeBridgePollTimeout);
    var contentSize = measureContentSize();
    postToNative({
      type: ${toScriptLiteral(AutoHeightMessageType.contentSize)},
      width: Math.min(contentSize.width, screen.width),
      height: contentSize.height * pageScale
    });
    scheduleRecheckForLateLoadingContent(contentSize.height);
  }
`;
