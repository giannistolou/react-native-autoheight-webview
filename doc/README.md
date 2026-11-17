# How react-native-autoheight-webview works

## In short

- **What:** a React Native `WebView` that resizes itself to fit its content, so you can place web content inline in a screen without guessing a height.
- **How:** it injects a small script into the page. The script measures the content and posts the size back to the app, and the component re-renders at that height.
- **Tech stack:** TypeScript, React 19 hooks, `react-native-webview`. Compiled with `tsc` to CommonJS in `lib/`.
- **Entry point:** [`src/index.ts`](../src/index.ts) re-exports the [`AutoHeightWebView`](../src/AutoHeightWebView.tsx) component and the public types.
- **Build / check:** `yarn build`, `yarn typecheck`, `yarn lint`. There is no automated test suite.

## Main parts

| Part                                                          | Runs in | Responsibility                                                                            |
| ------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| [`AutoHeightWebView.tsx`](../src/AutoHeightWebView.tsx)       | App     | The component: wires the hooks, the injected script and the `WebView` together            |
| [`useContentSize.ts`](../src/useContentSize.ts)               | App     | Holds the measured size and calls `onSizeUpdated`                                         |
| [`useZoomAwareScrolling.ts`](../src/useZoomAwareScrolling.ts) | App     | Turns scrolling on only while the page is zoomed in                                       |
| [`autoHeightProtocol.ts`](../src/autoHeightProtocol.ts)       | Both    | Defines the messages the page sends to the app                                            |
| [`webViewContent.ts`](../src/webViewContent.ts)               | App     | Puts the script into the page: embedded in the HTML, or as `injectedJavaScript` for a URL |
| [`injectedScript/`](../src/injectedScript)                    | Page    | The JavaScript that measures the content and watches for zoom                             |

## Directory map

```
src/
├── index.ts                  public exports
├── AutoHeightWebView.tsx     the component
├── types.ts                  public prop and size types
├── defaultProps.ts           shared and per-platform defaults
├── propsEquality.ts          deep props comparison used by React.memo
├── useContentSize.ts         size state and onSizeUpdated
├── useZoomAwareScrolling.ts  scroll-while-zoomed behavior
├── autoHeightProtocol.ts     page → app message format
├── webViewContent.ts         adds the script to an HTML or URL source
└── injectedScript/           code that runs inside the web page
    ├── buildInjectedScript.ts   puts the pieces together in order
    ├── headElementsScript.ts    viewport meta, <link> files, <style>
    ├── contentWrapperScript.ts  wraps <body> content in one measurable div
    ├── sizeReporterScript.ts    measures and posts the content size
    ├── zoomDetectorScript.ts    detects pinch and double-tap zoom
    └── toScriptLiteral.ts       escapes values safely into the script
lib/                          build output (git-ignored, published to npm)
```

## Further reading

- [architecture.md](architecture.md): the parts and how they depend on each other.
- [flow.md](flow.md): from mounting the component to the final height, step by step.

## Glossary

| Term                     | Meaning                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Injected script**      | JavaScript the library adds to the web page so it can measure itself                                           |
| **Content wrapper**      | A `div#rnahw-wrapper` holding everything in `<body>`, so the page has a single element to measure              |
| **Native bridge**        | `window.ReactNativeWebView.postMessage`, which `react-native-webview` provides for the page to talk to the app |
| **Topic**                | The `"rnaw"` tag on every message, which separates the library's messages from your own `onMessage` traffic    |
| **Content size message** | A `{type: 'contentSize', width, height}` message from the page                                                 |
| **Zoom state message**   | A `{type: 'zoomState', isZoomedIn}` message from the page                                                      |
| **Late-loading content** | Embeds (tweets, images) that grow after the first measurement, so the page measures again a few times          |
