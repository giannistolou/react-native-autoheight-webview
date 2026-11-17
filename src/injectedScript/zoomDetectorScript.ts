import {AutoHeightMessageType} from '../autoHeightProtocol';
import {toScriptLiteral} from './toScriptLiteral';

export const zoomDetectorScript = `
  var DOUBLE_TAP_MAX_INTERVAL_MS = 600;
  var DOUBLE_TAP_ZOOM_SETTLE_DELAY_MS = 400;
  var PINCH_TOUCH_COUNT = 2;
  var lastTapTimestamp = 0;
  var lastGestureScale = 1.0;

  function reportZoomChange() {
    var isZoomedInNow = (screen.width / window.innerWidth) > pageScale;
    if (isZoomedInNow !== isZoomedIn) {
      postToNative({
        type: ${toScriptLiteral(AutoHeightMessageType.zoomState)},
        isZoomedIn: isZoomedInNow
      });
    }
    isZoomedIn = isZoomedInNow;
  }

  function isDoubleTap(tapTimestamp) {
    var sinceLastTap = tapTimestamp - lastTapTimestamp;
    return sinceLastTap > 0 && sinceLastTap < DOUBLE_TAP_MAX_INTERVAL_MS;
  }

  window.addEventListener('touchstart', function (event) {
    if (event.touches.length === PINCH_TOUCH_COUNT) {
      isPinching = true;
    }
  });

  window.addEventListener('touchend', function (event) {
    isPinching = false;
    if (event.scale !== lastGestureScale) {
      reportZoomChange();
    }
    lastGestureScale = event.scale;

    var tapTimestamp = Date.now();
    if (isDoubleTap(tapTimestamp)) {
      setTimeout(reportZoomChange, DOUBLE_TAP_ZOOM_SETTLE_DELAY_MS);
    }
    lastTapTimestamp = tapTimestamp;
  });
`;
