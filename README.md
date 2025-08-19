# react-native-autoheight-webview

An auto height webview for React Native, with support for auto width on inline HTML content. This is a fork of the original project [iou90](https://github.com/iou90/react-native-autoheight-webview).

[![npm version](https://badge.fury.io/js/react-native-autoheight-webview.svg)](https://badge.fury.io/js/react-native-autoheight-webview)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Auto Height**: Automatically adjusts webview height based on content
- **Auto Width**: Supports auto width for inline HTML content  
- **Cross Platform**: Works on both iOS and Android
- **Customizable**: Support for custom CSS, JavaScript, and styling
- **Performance Optimized**: Efficient size calculation and updates

## 📦 Installation

This package requires `react-native-webview` as a peer dependency.

`npm install react-native-autoheight-webview react-native-webview`


## 📖 Usage

```jsx
import AutoHeightWebView from 'react-native-autoheight-webview'
import { Dimensions } from 'react-native'

<AutoHeightWebView
style={{
width: Dimensions.get('window').width - 15,
marginTop: 35
}}
customScript={document.body.style.background = 'lightyellow';}
customStyle={ * { font-family: 'Times New Roman'; } p { font-size: 16px; } }
onSizeUpdated={size => console.log(size.height)}
files={[{
href: 'cssfileaddress',
type: 'text/css',
rel: 'stylesheet'
}]}
source={{
html: <p style="font-weight: 400;font-style: normal;font-size: 21px;line-height: 1.58;letter-spacing: -.003em;"> Tags are great for describing the essence of your story in a single word or phrase, but stories are rarely about a single thing. <span style="background-color: transparent !important;background-image: linear-gradient(to bottom, rgba(146, 249, 190, 1), rgba(146, 249, 190, 1));"> If I pen a story about moving across the country to start a new job in a car with my husband, two cats, a dog, and a tarantula, I wouldn't only tag the piece with "moving". I'd also use the tags "pets", "marriage", "career change", and "travel tips". </span> </p>
}}
scalesPageToFit={true}
viewportContent={'width=device-width, user-scalable=no'}
// Additional react-native-webview props supported
/>
```


## 📱 Demo

![Demo](demo.gif) |

You can also try the [demo project](https://github.com/giannistolou/react-native-autoheight-webview-demo) for a full example.


## ⚙️ API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **style** | `ViewStyle` | - | Component styling. For iOS text selection issues, reduce width by 15+ and add marginTop 35+ |
| **customScript** | `string` | - | Custom JavaScript code to inject into the webview |
| **customStyle** | `string` | - | Custom CSS content added to the page's `<head>` |
| **onSizeUpdated** | `function` | - | Callback triggered when height or width changes |
| **files** | `FileObject[]` | - | Array of local or remote files to include |
| **source** | `object` | - | WebView source object (HTML, URI, etc.) |
| **scalesPageToFit** | `boolean` | `false` | Enable page scaling (differs from react-native-webview default) |
| **scrollEnabledWithZoomedin** | `boolean` | `false` | Allow scrolling on iOS when zoomed in |
| **viewportContent** | `string` | `'width=device-width'` (iOS) | Viewport meta tag content |
| **showsVerticalScrollIndicator** | `boolean` | `false` | Show vertical scroll indicator |
| **showsHorizontalScrollIndicator** | `boolean` | `false` | Show horizontal scroll indicator |
| **originWhitelist** | `string[]` | `['*']` | Allowed origins for navigation |

### FileObject


```js
interface FileObject {
href: string; // File URL or path
type: string; // MIME type (e.g., 'text/css')
rel: string; // Relationship (e.g., 'stylesheet')
}
```


## 📋 Requirements

- React Native >= 0.78
- react-native-webview >= 13.13.2

## 📚 Documentation

For earlier versions and migration guides, see the [original author's README](.original_author/README.md).

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
- **npm Package**: [react-native-autoheight-webview](https://www.npmjs.com/package/react-native-autoheight-webview)
- **Issues**: [Report bugs or request features](https://github.com/giannistolou/react-native-autoheight-webview/issues)

---

**Made with ❤️ by the React Native community**
