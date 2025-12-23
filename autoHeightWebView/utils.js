'use strict';

import {Dimensions} from 'react-native';

export const TOPIC = 'rnaw';
export const TOPIC_STRING = `"${TOPIC}"`;

const CONFIG = {
  FORCE_REFRESH_DELAY: 1000,
  DOUBLE_TAP_DELAY: 400,
  CHECK_POST_MESSAGE_DELAY: 200,
  MAX_SAME_HEIGHT_CHECKS: 5,
};

const escapeCss = (css) =>
  css?.replace(/['"`]/g, '\\$&').replace(/\n/g, '\\n') || '';

const domMutationObserveScript = `
  var MutationObserver =
    window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(updateSize);
  observer.observe(wrapper, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

`;

const updateSizeWithMessage = (element, scalesPageToFit) =>
  `
  var usingScale = ${scalesPageToFit} ? screen.width / window.innerWidth : 1;
  var scaling = false;
  var zoomedin = false;
  var lastHeight = 0;
  var heightTheSameTimes = 0;
  var forceRefreshTimeout;
  var checkPostMessageTimeout;

  function updateSize() {
    if (zoomedin || scaling || document.fullscreenElement) {
      return;
    }
    if (
      !window.hasOwnProperty('ReactNativeWebView') || 
      !window.ReactNativeWebView.hasOwnProperty('postMessage')
    ) {
      checkPostMessageTimeout = setTimeout(updateSize, ${CONFIG.CHECK_POST_MESSAGE_DELAY});
      return;
    }

    clearTimeout(checkPostMessageTimeout);
    var result = ${element}.getBoundingClientRect()
    var height = result.height + result.top;
    if(!height) {
      height = ${element}.offsetHeight || document.documentElement.offsetHeight
    }
    var width = result.width;
    if(!width) {
      width = ${element}.offsetWidth || document.documentElement.offsetWidth
    }


    window.ReactNativeWebView.postMessage(JSON.stringify({ width: Math.min(width, screen.width), height: height * usingScale, topic: ${TOPIC_STRING} }));

    // Make additional height checks (required to fix issues wit twitter embeds)
    clearTimeout(forceRefreshTimeout);

    if (lastHeight !== height) {
      heightTheSameTimes = 1;
    } else {
      heightTheSameTimes++;
    }

    lastHeight = height;

    if (heightTheSameTimes <= ${CONFIG.MAX_SAME_HEIGHT_CHECKS}) {
      forceRefreshTimeout = setTimeout(
        updateSize,
        heightTheSameTimes * ${CONFIG.FORCE_REFRESH_DELAY}
      );
    }
  }
  `;

const setViewportContent = (content) => {
  if (!content) {
    return '';
  }
  return `
    var meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", "${content}");
    document.getElementsByTagName("head")[0].appendChild(meta);
  `;
};

const detectZoomChanged = `
  var latestTapStamp = 0;
  var lastScale = 1.0;
  var zoomedinTimeOut;
  
  function detectZoomChanged() {
    var tempZoomedin = (screen.width / window.innerWidth) > usingScale;
    tempZoomedin !== zoomedin && window.ReactNativeWebView.postMessage(JSON.stringify({ zoomedin: tempZoomedin, topic: ${TOPIC_STRING} }));
    zoomedin = tempZoomedin;
  }
  window.addEventListener('touchstart', event => {
    if (event.touches.length === 2) {
      scaling = true;
    }
  })
  window.addEventListener('touchend', event => {
    if(scaling) {
      scaling = false;
    }

    var tempScale = event.scale; 
    tempScale !== lastScale && detectZoomChanged();
    lastScale = tempScale;
    var timeSince = new Date().getTime() - latestTapStamp;

    // double tap   
    if(timeSince < 600 && timeSince > 0) {
      zoomedinTimeOut = setTimeout(() => {
        clearTimeout(zoomedinTimeOut);
        detectZoomChanged();
      }, ${CONFIG.DOUBLE_TAP_DELAY});
    }

    latestTapStamp = new Date().getTime();
  });
`;

const getBaseScript = ({
  viewportContent,
  scalesPageToFit,
  scrollEnabledWithZoomedin,
}) =>
  `
  ;
  var wrapper = document.getElementById("rnahw-wrapper");
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'rnahw-wrapper';
    while (document.body.firstChild instanceof Node) {
      wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
  }
  ${updateSizeWithMessage('wrapper', scalesPageToFit)}
  window.addEventListener('load', updateSize);
  window.addEventListener('resize', updateSize);
  ${domMutationObserveScript}
  ${setViewportContent(viewportContent)}
  ${scrollEnabledWithZoomedin ? detectZoomChanged : ''}
  updateSize();
  `;

const appendFilesToHead = ({files, script}) =>
  files.reduceRight((combinedScript, file) => {
    const {rel, type, href} = file;
    return `
      var link  = document.createElement('link');
      link.rel  = '${rel}';
      link.type = '${type}';
      link.href = '${href}';
      document.head.appendChild(link);
      ${combinedScript}
    `;
  }, script);

const screenWidth = Dimensions.get('window').width;

const bodyStyle = `
  body {
    margin: 0;
    padding: 0;
  }
`;

const appendStylesToHead = ({style, script}) => {
  const currentStyles = style ? bodyStyle + style : bodyStyle;
  // Escape any single quotes or newlines in the CSS with .replace()
  const escaped = escapeCss(currentStyles);
  return `
    var styleElement = document.createElement('style');
    styleElement.innerHTML = '${escaped}';
    document.head.appendChild(styleElement);
    ${script}
  `;
};

const getInjectedSource = ({html, script}) => `
  ${html}
  <script>
  // prevents code collisions with global scope
  (function() {
    ${script}
  })();
  </script>
`;

const getScript = ({
  files,
  customStyle,
  customScript,
  style,
  viewportContent,
  scalesPageToFit,
  scrollEnabledWithZoomedin,
}) => {
  let script = getBaseScript({
    viewportContent,
    scalesPageToFit,
    scrollEnabledWithZoomedin,
  });
  script =
    files && files.length > 0 ? appendFilesToHead({files, script}) : script;
  script = appendStylesToHead({style: customStyle, script});
  customScript && (script = customScript + script);
  return script;
};

export const isSizeChanged = ({
  height,
  previousHeight,
  width,
  previousWidth,
}) => {
  if (!height || !width) {
    return;
  }
  return height !== previousHeight || width !== previousWidth;
};

export const reduceData = (props) => {
  const {source} = props;
  const script = getScript(props);
  const {html, baseUrl} = source;
  if (html) {
    return {
      currentSource: {baseUrl, html: getInjectedSource({html, script})},
    };
  } else {
    return {
      currentSource: source,
      script,
    };
  }
};

export const shouldUpdate = ({prevProps, nextProps}) => {
  if (!(prevProps && nextProps)) {
    return true;
  }
  for (const prop in nextProps) {
    if (nextProps[prop] !== prevProps[prop]) {
      if (
        typeof nextProps[prop] === 'object' &&
        typeof prevProps[prop] === 'object'
      ) {
        if (
          shouldUpdate({
            prevProps: prevProps[prop],
            nextProps: nextProps[prop],
          })
        ) {
          return true;
        }
      } else {
        return true;
      }
    }
  }
  return false;
};
