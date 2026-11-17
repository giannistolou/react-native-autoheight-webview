# @brown-bear/react-native-autoheight-webview

An auto height webview for React Native, with support for auto width on inline HTML content. This is a fork of the original project [iou90](https://github.com/iou90/react-native-autoheight-webview).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Auto Height**: Automatically adjusts webview height based on content
- **Auto Width**: Supports auto width for inline HTML content
- **Cross Platform**: Works on both iOS and Android
- **Customizable**: Support for custom CSS, JavaScript, and styling
- **Performance Optimized**: Efficient size calculation and updates

## 📦 Installation

`react-native-webview` is a peer dependency, so install it next to this package:

```sh
yarn add @brown-bear/react-native-autoheight-webview react-native-webview
# or
npm install @brown-bear/react-native-autoheight-webview react-native-webview
```

On iOS, link the native WebView module afterwards:

```sh
cd ios && pod install
```

## 📖 Usage

The component is the package's default export. Use it like a normal `WebView`, but leave out the height: it sizes itself to fit the content.

```tsx
import React from 'react';
import {Dimensions} from 'react-native';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';

export function ArticleBody() {
  return (
    <AutoHeightWebView
      style={{width: Dimensions.get('window').width - 15, marginTop: 35}}
      customScript={`document.body.style.background = 'lightyellow';`}
      customStyle={`
        * { font-family: 'Times New Roman'; }
        p { font-size: 16px; }
      `}
      onSizeUpdated={(size) => console.log(size.height)}
      files={[
        {
          href: 'https://example.com/article.css',
          type: 'text/css',
          rel: 'stylesheet',
        },
      ]}
      source={{
        html: '<p>Tags are great for describing the essence of your story.</p>',
      }}
      scalesPageToFit={true}
      viewportContent={'width=device-width, user-scalable=no'}
    />
  );
}
```

All other [`react-native-webview` props](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md) are passed through to the underlying `WebView`.

### TypeScript

The package ships its own type definitions, so you don't need an `@types/...` package:

```tsx
import React, {useRef} from 'react';
import type {WebView} from 'react-native-webview';
import AutoHeightWebView, {
  type AutoHeightWebViewProps,
  type SizeUpdate,
  type StylesFile,
} from '@brown-bear/react-native-autoheight-webview';

const stylesheets: StylesFile[] = [
  {
    href: 'https://example.com/article.css',
    type: 'text/css',
    rel: 'stylesheet',
  },
];

export function Article({html}: {html: string}) {
  const webViewRef = useRef<WebView>(null);
  const logHeight = ({height}: SizeUpdate) => console.log(height);

  return (
    <AutoHeightWebView
      ref={webViewRef}
      source={{html}}
      files={stylesheets}
      onSizeUpdated={logHeight}
    />
  );
}
```

The `ref` gives you the underlying `WebView`, so methods like `webViewRef.current?.reload()` and `injectJavaScript(...)` work as usual.

#### Type errors from `react-native-webview` on React Native 0.87+

React Native 0.87 made its strict TypeScript API the default. `react-native-webview` (up to at least 14.0.1) still uses types that API removed. With `skipLibCheck` turned off, your app then reports errors inside `node_modules/react-native-webview` such as:

```
Module '"react-native"' has no exported member 'NativeMethodsMixin'.
Module '"react-native"' has no exported member 'UIManagerStatic'.
Cannot find module 'react-native/Libraries/Types/CodegenTypes'
```

These come from `react-native-webview` itself, not from this package. Pick either fix in your app's `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    // Option 1: the React Native template default
    "skipLibCheck": true,

    // Option 2: keep library checks and opt in to React Native's legacy types
    "customConditions": ["react-native-legacy-deep-imports"],
  },
}
```

`customConditions` needs `"moduleResolution": "bundler"` (the React Native template default) or `"node16"`.

### Migrating from 2.x

- **Peer versions:** React 19+, React Native 0.78+ and `react-native-webview` 13.13.2+ are now required.
- **No runtime PropTypes:** props are checked by the TypeScript types instead.
- **Ref type:** type refs as `useRef<WebView>` (from `react-native-webview`), not `useRef<AutoHeightWebView>`.
- **Your values now apply:** `scalesPageToFit` and `viewportContent` were previously ignored in favor of the platform defaults.

## 📱 Demo

![Demo](demo.gif) |

You can also try the [demo project](https://github.com/giannistolou/react-native-autoheight-webview-demo) for a full example.

## ⚙️ API Reference

### Props

| Prop                               | Type                         | Default                      | Description                                                                                 |
| ---------------------------------- | ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| **style**                          | `ViewStyle`                  | -                            | Component styling. For iOS text selection issues, reduce width by 15+ and add marginTop 35+ |
| **customScript**                   | `string`                     | -                            | Custom JavaScript code to inject into the webview                                           |
| **customStyle**                    | `string`                     | -                            | Custom CSS content added to the page's `<head>`                                             |
| **onSizeUpdated**                  | `(size: SizeUpdate) => void` | -                            | Callback triggered when height or width changes                                             |
| **files**                          | `StylesFile[]`               | -                            | Array of local or remote files to include                                                   |
| **source**                         | `object`                     | -                            | WebView source object (HTML, URI, etc.)                                                     |
| **scalesPageToFit**                | `boolean`                    | `false` (Android)            | Enable page scaling (differs from react-native-webview default)                             |
| **scrollEnabledWithZoomedin**      | `boolean`                    | `false`                      | Allow scrolling on iOS when zoomed in                                                       |
| **viewportContent**                | `string`                     | `'width=device-width'` (iOS) | Viewport meta tag content                                                                   |
| **showsVerticalScrollIndicator**   | `boolean`                    | `false`                      | Show vertical scroll indicator                                                              |
| **showsHorizontalScrollIndicator** | `boolean`                    | `false`                      | Show horizontal scroll indicator                                                            |
| **originWhitelist**                | `string[]`                   | `['*']`                      | Allowed origins for navigation                                                              |

### StylesFile

Exported as `StylesFile`:

```ts
interface StylesFile {
  href: string; // File URL or path
  type: string; // MIME type (e.g., 'text/css')
  rel: string; // Relationship (e.g., 'stylesheet')
}
```

## 📋 Requirements

- React >= 19
- React Native >= 0.78
- react-native-webview >= 13.13.2

## 📚 Documentation

- [How the library works](doc/README.md): architecture and flow diagrams.
- For earlier versions, see the [original author's README](original_author/README.md).

> **Note**: Bug fixes and new features are only included in the latest version.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 💝 Support

### Support the Original Author (iou90)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/iou90)

### Support This Fork

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/giannistolou)

## 🔗 Links

- **Repository**: [https://github.com/giannistolou/react-native-autoheight-webview](https://github.com/giannistolou/react-native-autoheight-webview)
- **npm Package**: [@brown-bear/react-native-autoheight-webview](https://www.npmjs.com/package/@brown-bear/react-native-autoheight-webview)
- **Issues**: [Report bugs or request features](https://github.com/giannistolou/react-native-autoheight-webview/issues)

---

**Made with ❤️ by the React Native community**
