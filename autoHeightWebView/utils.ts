'use strict';

import {Dimensions} from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface FileConfig {
  href: string;
  type?: string;
  rel?: string;
}

export interface GetScriptProps {
  files?: FileConfig[];
  customStyle?: string;
  customScript?: string;
  style?: string;
  viewportContent?: string;
  scalesPageToFit?: boolean;
  scrollEnabledWithZoomedin?: boolean;
}

export interface SizeData {
  height: number;
  width: number;
  previousHeight: number;
  previousWidth: number;
}

export interface ReduceDataProps extends GetScriptProps {
  source?: {
    uri?: string;
    html?: string;
    baseUrl?: string;
  };
}

export interface ReduceDataResult {
  currentSource: {
    baseUrl?: string;
    html?: string;
    uri?: string;
  };
  script?: string;
}

export interface WebViewMessage {
  topic: string;
  height?: number;
  width?: number;
  zoomedin?: boolean;
}

export interface PropsDiff {
  prevProps: Record<string, unknown>;
  nextProps: Record<string, unknown>;
}

export const TOPIC = 'rnaw';
export const TOPIC_STRING = `"${TOPIC}"`;

const CONFIG = {
  FORCE_REFRESH_DELAY: 1000,
  DOUBLE_TAP_DELAY: 400,
  CHECK_POST_MESSAGE_DELAY: 200,
  MAX_SAME_HEIGHT_CHECKS: 5,
} as const;

const screenWidth = Dimensions.get('window').width;
const WRAPPER_ID = 'rnahw-wrapper';

const bodyStyle = `
  body {
    margin: 0;
    padding: 0;
  }
`;
/**
 * Escapes CSS special characters and newlines
 * @param css - CSS string to escape
 * @returns Escaped CSS string
 */
const escapeCss = (css?: string): string => {
  if (!css) return '';
  return css.replace(/['"`]/g, '\\$&').replace(/\n/g, '\\n');
};

/**
 * Validates and sanitizes viewport content
 * @param content - Viewport meta content
 * @returns Safe viewport string
 */
const safeViewport = (content?: string): string => {
  return content || 'width=device-width, initial-scale=1.0, maximum-scale=5.0';
};

/**
 * Shallow equality check for objects
 * @param a - First object
 * @param b - Second object
 * @returns true if objects have same keys and values
 */
const shallowEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) {
    return false;
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      (a as Record<string, unknown>)[key] ===
      (b as Record<string, unknown>)[key],
  );
};

/**
 * MutationObserver script for detecting DOM changes
 */
const domMutationObserverScript = `
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(updateSize);
  var wrapper = document.getElementById('${WRAPPER_ID}');
  if (wrapper) {
    observer.observe(wrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
`;

/**
 * Generates size measurement and reporting script
 * @param scalesPageToFit - Whether page is scaled to fit
 * @returns JavaScript code snippet
 */
const updateSizeWithMessage = (scalesPageToFit: boolean): string => `
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

    if (!window.ReactNativeWebView?.postMessage) {
      checkPostMessageTimeout = setTimeout(updateSize, ${CONFIG.CHECK_POST_MESSAGE_DELAY});
      return;
    }

    clearTimeout(checkPostMessageTimeout);

    var wrapper = document.getElementById('${WRAPPER_ID}');
    if (!wrapper) return;

    var rect = wrapper.getBoundingClientRect();
    var height = rect.height + rect.top || wrapper.offsetHeight || document.documentElement.offsetHeight;
    var width = rect.width || wrapper.offsetWidth || document.documentElement.offsetWidth;

    window.ReactNativeWebView.postMessage(JSON.stringify({
      width: Math.min(width, screen.width),
      height: height * usingScale,
      topic: ${TOPIC_STRING}
    }));

    clearTimeout(forceRefreshTimeout);

    heightTheSameTimes = lastHeight === height ? heightTheSameTimes + 1 : 1;
    lastHeight = height;

    if (heightTheSameTimes <= ${CONFIG.MAX_SAME_HEIGHT_CHECKS}) {
      forceRefreshTimeout = setTimeout(
        updateSize,
        heightTheSameTimes * ${CONFIG.FORCE_REFRESH_DELAY}
      );
    }
  }
`;

/**
 * Generates viewport meta tag injection script
 * @param content - Viewport content string
 * @returns JavaScript code snippet
 */
const setViewportContent = (content?: string): string => {
  const safeContent = safeViewport(content);
  return `
    (function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute("content", "${safeContent}");
      } else {
        meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content = "${safeContent}";
        document.head.appendChild(meta);
      }
    })();
  `;
};

/**
 * Generates zoom detection script for handling pinch gestures
 */
const detectZoomChangedScript = `
  var latestTapStamp = 0;
  var lastScale = 1.0;
  var zoomedinTimeOut;

  function detectZoomChanged() {
    var tempZoomedin = screen.width / window.innerWidth > usingScale;
    if (tempZoomedin !== zoomedin) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        zoomedin: tempZoomedin,
        topic: ${TOPIC_STRING}
      }));
      zoomedin = tempZoomedin;
    }
  }

  window.addEventListener('touchstart', function(event) {
    if (event.touches && event.touches.length === 2) {
      scaling = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', function(event) {
    if (scaling) scaling = false;

    if (event.scale && event.scale !== lastScale) {
      detectZoomChanged();
      lastScale = event.scale;
    }

    var timeSince = Date.now() - latestTapStamp;
    if (timeSince < 600 && timeSince > 0) {
      zoomedinTimeOut = setTimeout(function() {
        clearTimeout(zoomedinTimeOut);
        detectZoomChanged();
      }, ${CONFIG.DOUBLE_TAP_DELAY});
    }
    latestTapStamp = Date.now();
  }, { passive: true });
`;

/**
 * Generates base script with wrapper setup and event listeners
 */
const getBaseScript = ({
  viewportContent,
  scalesPageToFit = false,
  scrollEnabledWithZoomedin = false,
}: GetScriptProps): string => `
  (function() {
    var wrapper = document.getElementById("${WRAPPER_ID}");
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = '${WRAPPER_ID}';
      while (document.body.firstChild) {
        wrapper.appendChild(document.body.firstChild);
      }
      document.body.appendChild(wrapper);
    }

    ${updateSizeWithMessage(scalesPageToFit)}

    ['load', 'resize', 'orientationchange'].forEach(function(evt) {
      window.addEventListener(evt, updateSize);
    });

    ${domMutationObserverScript}

    ${setViewportContent(viewportContent)}

    ${scrollEnabledWithZoomedin ? detectZoomChangedScript : ''}

    window.addEventListener('beforeunload', function() {
      if (observer) observer.disconnect();
    });

    updateSize();
  })();
`;

/**
 * Appends external files (stylesheets, scripts) to document head
 */
const appendFilesToHead = (files: FileConfig[], script: string): string =>
  files.reduceRight(
    (acc, {rel = 'stylesheet', type = 'text/css', href}) =>
      `
    (function() {
      var link = document.createElement('link');
      link.rel = '${rel}';
      link.type = '${type}';
      link.href = '${href}';
      document.head.appendChild(link);
    })();
    ${acc}
  `,
    script,
  );

/**
 * Appends inline styles to document head
 */
const appendStylesToHead = (customStyle?: string, script?: string): string => {
  const allStyles = customStyle ? bodyStyle + customStyle : bodyStyle;
  const escaped = escapeCss(allStyles);

  return `
    (function() {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '${escaped}';
      document.head.appendChild(style);
    })();
    ${script || ''}
  `;
};

/**
 * Generates complete injected JavaScript with HTML wrapper
 */
export const getInjectedSource = (html: string, script: string): string => `
  ${html}
  <script>
    ${script}
  </script>
`;

/**
 * Builds complete injection script from configuration
 */
export const getScript = ({
  files,
  customStyle,
  customScript,
  style,
  viewportContent,
  scalesPageToFit = false,
  scrollEnabledWithZoomedin = false,
}: GetScriptProps): string => {
  let script = getBaseScript({
    viewportContent,
    scalesPageToFit,
    scrollEnabledWithZoomedin,
  });

  if (files && files.length > 0) {
    script = appendFilesToHead(files, script);
  }

  script = appendStylesToHead(customStyle || style, script);

  if (customScript) {
    script = customScript + '\n' + script;
  }

  return script;
};

/**
 * Extracts width from style object or returns screen width
 */
export const getWidth = (style?: Record<string, unknown>): number => {
  return (style?.width as number) || screenWidth;
};

/**
 * Checks if size has changed
 */
export const isSizeChanged = ({
  height,
  previousHeight,
  width,
  previousWidth,
}: SizeData): boolean => {
  return !!(
    height &&
    width &&
    (height !== previousHeight || width !== previousWidth)
  );
};

/**
 * Reduces props to WebView source and injection script
 */
export const reduceData = (props: ReduceDataProps): ReduceDataResult => {
  const {source} = props;
  const script = getScript(props);
  const {html, baseUrl} = source || {};

  if (html) {
    return {
      currentSource: {
        baseUrl,
        html: getInjectedSource(html, script),
      },
    };
  }

  return {
    currentSource: source || {},
    script,
  };
};

/**
 * Determines if component should update
 * Uses shallow equality for performance
 */
export const shouldUpdate = ({prevProps, nextProps}: PropsDiff): boolean => {
  if (!prevProps || !nextProps) {
    return true;
  }

  return Object.keys(nextProps).some((key) => {
    const prev = prevProps[key];
    const next = nextProps[key];

    if (next === prev) {
      return false;
    }

    if (typeof next === 'object' && typeof prev === 'object') {
      return !shallowEqual(next, prev);
    }

    return true;
  });
};
