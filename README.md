# JSON Formatter Pro

A powerful browser extension for formatting, validating, diffing, and converting JSON data with 60+ syntax highlighting themes.

## Features

### Core Features
- **Format & Beautify** - Pretty-print JSON with configurable indentation
- **Minify** - Compress JSON by removing whitespace
- **Validate** - Real-time syntax error detection with line/column info
- **Tree View** - Interactive collapsible tree with expand/collapse all
- **Copy Paths** - Click any node to copy JSONPath, dot notation, or bracket notation

### Advanced Features
- **JSON Diff** - Side-by-side comparison with highlighted additions/removals/changes
- **Format Conversion** - Convert between JSON, YAML, XML, CSV, TypeScript, Query String
- **JSONPath Queries** - Query and filter JSON data using JSONPath expressions
- **jq-style Queries** - Use jq-like syntax to extract data
- **Schema Validation** - Validate JSON against JSON Schema
- **Search & Filter** - Search keys and values with regex support

### View Modes
- **Tree View** - Hierarchical collapsible tree
- **Raw View** - Formatted text with line numbers
- **Table View** - Tabular view for arrays of objects

### Themes
60+ beautiful syntax highlighting themes including:
- **Dark**: Dracula, Monokai, Nord, Tokyo Night, One Dark, GitHub Dark, Catppuccin Mocha, Gruvbox Dark, and more
- **Light**: GitHub Light, One Light, Solarized Light, Catppuccin Latte, Gruvbox Light, and more

### Additional Features
- **Auto-detect JSON** - Automatically formats JSON responses in browser
- **Keyboard Shortcuts** - Quick access to common operations
- **Statistics** - View size, key count, depth, and type distribution
- **Timestamp Detection** - Automatically converts Unix timestamps
- **URL Linkification** - Makes URLs clickable
- **Dark/Light Mode** - System preference detection
- **Privacy-Focused** - 100% client-side, no data sent to servers

## Installation

### From Source (Development)

1. Clone or download this repository
2. Generate icon PNG files from the SVG:
   ```bash
   # Using ImageMagick
   convert -background none assets/icons/icon.svg -resize 16x16 assets/icons/icon16.png
   convert -background none assets/icons/icon.svg -resize 32x32 assets/icons/icon32.png
   convert -background none assets/icons/icon.svg -resize 48x48 assets/icons/icon48.png
   convert -background none assets/icons/icon.svg -resize 128x128 assets/icons/icon128.png
   ```
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extension folder
6. The extension icon should appear in your toolbar

### From Chrome Web Store
Coming soon!

## Usage

### Popup Interface
1. Click the extension icon to open the popup
2. Paste or type JSON in the input area
3. Click "Format" to beautify, "Minify" to compress, or "Validate" to check

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+J` | Open JSON Formatter Pro |
| `Ctrl+Enter` | Format JSON |
| `Ctrl+M` | Minify JSON |
| `D` | Toggle dark mode |
| `[` | Collapse all nodes |
| `]` | Expand all nodes |
| `Ctrl+F` | Search |

### Auto-Format JSON Pages
When you visit a URL that returns JSON, the extension automatically formats it with a beautiful tree view.

### Context Menu
Right-click on selected text to format JSON directly.

## Project Structure

```
json-formatter-extension/
├── manifest.json           # Extension manifest
├── popup/                  # Popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/                # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
├── content/                # Content script for auto-formatting
│   ├── content.js
│   └── content.css
├── background/             # Background service worker
│   └── background.js
├── src/
│   ├── js/
│   │   ├── core/           # Core functionality
│   │   │   ├── JsonEngine.js    # JSON parser & formatter
│   │   │   ├── JsonDiff.js      # JSON diff engine
│   │   │   └── ThemeManager.js  # 60+ themes
│   │   ├── views/
│   │   │   └── TreeView.js      # Tree view component
│   │   └── converters/
│   │       └── Converters.js    # Format converters
│   └── css/
│       └── main.css        # Main styles
└── assets/
    └── icons/              # Extension icons
```

## Tech Stack

- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling with CSS variables
- **Chrome Extension Manifest V3** - Latest extension API

## Privacy

JSON Formatter Pro is completely privacy-focused:
- All processing happens locally in your browser
- No data is ever sent to external servers
- No analytics or tracking
- No accounts required

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this code in your own projects.

## Changelog

### v1.0.0
- Initial release
- Format, minify, validate JSON
- Tree, raw, and table views
- JSON diff comparison
- Format conversion (JSON, YAML, XML, CSV, TypeScript, Query String)
- JSONPath and jq-style queries
- 60+ syntax themes
- Auto-format JSON pages
- Keyboard shortcuts
- Settings page

---

Made with ❤️ by **Sayed Abdul Karim**
