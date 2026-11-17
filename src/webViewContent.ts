import {buildInjectedScript} from './injectedScript/buildInjectedScript';
import type {InjectedScriptOptions, WebViewSource} from './types';

interface WebViewContent {
  source: WebViewSource;
  injectedJavaScript?: string;
}

interface HtmlSource {
  html: string;
  baseUrl?: string;
}

export const buildWebViewContent = (
  source: WebViewSource,
  scriptOptions: InjectedScriptOptions,
): WebViewContent => {
  const script = buildInjectedScript(scriptOptions);
  if (isHtmlSource(source)) {
    return {
      source: {baseUrl: source.baseUrl, html: embedScript(source.html, script)},
    };
  }
  return {source, injectedJavaScript: script};
};

const isHtmlSource = (source: WebViewSource): source is HtmlSource =>
  typeof source === 'object' &&
  source !== null &&
  'html' in source &&
  Boolean(source.html);

const embedScript = (html: string, script: string) => `
  ${html}
  <script>
  ${isolatedFromGlobalScope(script)}
  </script>
`;

const isolatedFromGlobalScope = (script: string) => `(function () {
  ${script}
})();`;
