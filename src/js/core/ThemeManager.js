/**
 * JSON Formatter Pro - Theme Manager
 * 60+ syntax highlighting themes with dark mode support
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'dracula';
    this.isDarkMode = true;
    this.themes = this._initThemes();
  }

  _initThemes() {
    return {
      // ==================== Dark Themes ====================
      'dracula': {
        name: 'Dracula',
        type: 'dark',
        colors: {
          background: '#282a36',
          foreground: '#f8f8f2',
          key: '#8be9fd',
          string: '#f1fa8c',
          number: '#bd93f9',
          boolean: '#ff79c6',
          null: '#6272a4',
          bracket: '#f8f8f2',
          colon: '#f8f8f2',
          comma: '#6272a4',
          expandIcon: '#50fa7b',
          lineNumber: '#6272a4',
          selection: '#44475a',
          highlight: '#44475a',
          link: '#8be9fd',
          error: '#ff5555',
          added: '#50fa7b',
          removed: '#ff5555',
          modified: '#ffb86c'
        }
      },
      'monokai': {
        name: 'Monokai',
        type: 'dark',
        colors: {
          background: '#272822',
          foreground: '#f8f8f2',
          key: '#66d9ef',
          string: '#e6db74',
          number: '#ae81ff',
          boolean: '#f92672',
          null: '#75715e',
          bracket: '#f8f8f2',
          colon: '#f8f8f2',
          comma: '#75715e',
          expandIcon: '#a6e22e',
          lineNumber: '#75715e',
          selection: '#49483e',
          highlight: '#49483e',
          link: '#66d9ef',
          error: '#f92672',
          added: '#a6e22e',
          removed: '#f92672',
          modified: '#fd971f'
        }
      },
      'nord': {
        name: 'Nord',
        type: 'dark',
        colors: {
          background: '#2e3440',
          foreground: '#eceff4',
          key: '#88c0d0',
          string: '#a3be8c',
          number: '#b48ead',
          boolean: '#81a1c1',
          null: '#4c566a',
          bracket: '#d8dee9',
          colon: '#d8dee9',
          comma: '#4c566a',
          expandIcon: '#8fbcbb',
          lineNumber: '#4c566a',
          selection: '#3b4252',
          highlight: '#434c5e',
          link: '#88c0d0',
          error: '#bf616a',
          added: '#a3be8c',
          removed: '#bf616a',
          modified: '#ebcb8b'
        }
      },
      'tokyo-night': {
        name: 'Tokyo Night',
        type: 'dark',
        colors: {
          background: '#1a1b26',
          foreground: '#a9b1d6',
          key: '#7dcfff',
          string: '#9ece6a',
          number: '#ff9e64',
          boolean: '#bb9af7',
          null: '#565f89',
          bracket: '#c0caf5',
          colon: '#c0caf5',
          comma: '#565f89',
          expandIcon: '#73daca',
          lineNumber: '#565f89',
          selection: '#283457',
          highlight: '#33467c',
          link: '#7dcfff',
          error: '#f7768e',
          added: '#9ece6a',
          removed: '#f7768e',
          modified: '#e0af68'
        }
      },
      'one-dark': {
        name: 'One Dark',
        type: 'dark',
        colors: {
          background: '#282c34',
          foreground: '#abb2bf',
          key: '#61afef',
          string: '#98c379',
          number: '#d19a66',
          boolean: '#c678dd',
          null: '#5c6370',
          bracket: '#abb2bf',
          colon: '#abb2bf',
          comma: '#5c6370',
          expandIcon: '#98c379',
          lineNumber: '#5c6370',
          selection: '#3e4451',
          highlight: '#3e4451',
          link: '#61afef',
          error: '#e06c75',
          added: '#98c379',
          removed: '#e06c75',
          modified: '#e5c07b'
        }
      },
      'material-darker': {
        name: 'Material Darker',
        type: 'dark',
        colors: {
          background: '#212121',
          foreground: '#eeffff',
          key: '#82aaff',
          string: '#c3e88d',
          number: '#f78c6c',
          boolean: '#c792ea',
          null: '#545454',
          bracket: '#89ddff',
          colon: '#89ddff',
          comma: '#545454',
          expandIcon: '#c3e88d',
          lineNumber: '#545454',
          selection: '#323232',
          highlight: '#3f3f3f',
          link: '#82aaff',
          error: '#ff5370',
          added: '#c3e88d',
          removed: '#ff5370',
          modified: '#ffcb6b'
        }
      },
      'github-dark': {
        name: 'GitHub Dark',
        type: 'dark',
        colors: {
          background: '#0d1117',
          foreground: '#c9d1d9',
          key: '#79c0ff',
          string: '#a5d6ff',
          number: '#79c0ff',
          boolean: '#ff7b72',
          null: '#8b949e',
          bracket: '#c9d1d9',
          colon: '#c9d1d9',
          comma: '#8b949e',
          expandIcon: '#7ee787',
          lineNumber: '#8b949e',
          selection: '#264f78',
          highlight: '#1f2428',
          link: '#79c0ff',
          error: '#f85149',
          added: '#7ee787',
          removed: '#f85149',
          modified: '#d29922'
        }
      },
      'synthwave-84': {
        name: 'Synthwave \'84',
        type: 'dark',
        colors: {
          background: '#262335',
          foreground: '#ffffff',
          key: '#36f9f6',
          string: '#ff8b39',
          number: '#f97e72',
          boolean: '#fe4450',
          null: '#848bbd',
          bracket: '#ffffff',
          colon: '#ffffff',
          comma: '#848bbd',
          expandIcon: '#72f1b8',
          lineNumber: '#848bbd',
          selection: '#463465',
          highlight: '#34294f',
          link: '#36f9f6',
          error: '#fe4450',
          added: '#72f1b8',
          removed: '#fe4450',
          modified: '#fede5d'
        }
      },
      'catppuccin-mocha': {
        name: 'Catppuccin Mocha',
        type: 'dark',
        colors: {
          background: '#1e1e2e',
          foreground: '#cdd6f4',
          key: '#89b4fa',
          string: '#a6e3a1',
          number: '#fab387',
          boolean: '#cba6f7',
          null: '#6c7086',
          bracket: '#bac2de',
          colon: '#bac2de',
          comma: '#6c7086',
          expandIcon: '#94e2d5',
          lineNumber: '#6c7086',
          selection: '#45475a',
          highlight: '#313244',
          link: '#89b4fa',
          error: '#f38ba8',
          added: '#a6e3a1',
          removed: '#f38ba8',
          modified: '#f9e2af'
        }
      },
      'gruvbox-dark': {
        name: 'Gruvbox Dark',
        type: 'dark',
        colors: {
          background: '#282828',
          foreground: '#ebdbb2',
          key: '#83a598',
          string: '#b8bb26',
          number: '#d3869b',
          boolean: '#fb4934',
          null: '#928374',
          bracket: '#ebdbb2',
          colon: '#ebdbb2',
          comma: '#928374',
          expandIcon: '#8ec07c',
          lineNumber: '#928374',
          selection: '#3c3836',
          highlight: '#504945',
          link: '#83a598',
          error: '#fb4934',
          added: '#b8bb26',
          removed: '#fb4934',
          modified: '#fabd2f'
        }
      },
      'palenight': {
        name: 'Palenight',
        type: 'dark',
        colors: {
          background: '#292d3e',
          foreground: '#a6accd',
          key: '#82aaff',
          string: '#c3e88d',
          number: '#f78c6c',
          boolean: '#c792ea',
          null: '#676e95',
          bracket: '#89ddff',
          colon: '#89ddff',
          comma: '#676e95',
          expandIcon: '#c3e88d',
          lineNumber: '#676e95',
          selection: '#3e4451',
          highlight: '#414863',
          link: '#82aaff',
          error: '#ff5370',
          added: '#c3e88d',
          removed: '#ff5370',
          modified: '#ffcb6b'
        }
      },
      'cobalt2': {
        name: 'Cobalt2',
        type: 'dark',
        colors: {
          background: '#193549',
          foreground: '#ffffff',
          key: '#ffc600',
          string: '#a5ff90',
          number: '#ff628c',
          boolean: '#ff9d00',
          null: '#0088ff',
          bracket: '#ffffff',
          colon: '#ffffff',
          comma: '#89a4c1',
          expandIcon: '#80ffbb',
          lineNumber: '#89a4c1',
          selection: '#1f4662',
          highlight: '#0d3a58',
          link: '#80fcff',
          error: '#ff628c',
          added: '#a5ff90',
          removed: '#ff628c',
          modified: '#ffc600'
        }
      },
      'night-owl': {
        name: 'Night Owl',
        type: 'dark',
        colors: {
          background: '#011627',
          foreground: '#d6deeb',
          key: '#7fdbca',
          string: '#ecc48d',
          number: '#f78c6c',
          boolean: '#ff5874',
          null: '#637777',
          bracket: '#d6deeb',
          colon: '#d6deeb',
          comma: '#637777',
          expandIcon: '#addb67',
          lineNumber: '#4b6479',
          selection: '#1d3b53',
          highlight: '#0e2f47',
          link: '#82aaff',
          error: '#ff5874',
          added: '#addb67',
          removed: '#ff5874',
          modified: '#ecc48d'
        }
      },
      'shades-of-purple': {
        name: 'Shades of Purple',
        type: 'dark',
        colors: {
          background: '#2d2b55',
          foreground: '#ffffff',
          key: '#fad000',
          string: '#a5ff90',
          number: '#ff628c',
          boolean: '#ff9d00',
          null: '#a599e9',
          bracket: '#ffffff',
          colon: '#ffffff',
          comma: '#a599e9',
          expandIcon: '#9effff',
          lineNumber: '#a599e9',
          selection: '#4d21fc',
          highlight: '#382b72',
          link: '#9effff',
          error: '#ff628c',
          added: '#a5ff90',
          removed: '#ff628c',
          modified: '#fad000'
        }
      },
      'ayu-dark': {
        name: 'Ayu Dark',
        type: 'dark',
        colors: {
          background: '#0a0e14',
          foreground: '#b3b1ad',
          key: '#59c2ff',
          string: '#c2d94c',
          number: '#e6b450',
          boolean: '#ff8f40',
          null: '#626a73',
          bracket: '#b3b1ad',
          colon: '#b3b1ad',
          comma: '#626a73',
          expandIcon: '#95e6cb',
          lineNumber: '#626a73',
          selection: '#273747',
          highlight: '#1a1f29',
          link: '#59c2ff',
          error: '#f07178',
          added: '#c2d94c',
          removed: '#f07178',
          modified: '#e6b450'
        }
      },
      'winter-is-coming': {
        name: 'Winter is Coming',
        type: 'dark',
        colors: {
          background: '#011627',
          foreground: '#d6deeb',
          key: '#87d7ff',
          string: '#bcf0c0',
          number: '#82aaff',
          boolean: '#c792ea',
          null: '#637777',
          bracket: '#d6deeb',
          colon: '#d6deeb',
          comma: '#637777',
          expandIcon: '#7fdbca',
          lineNumber: '#4b6479',
          selection: '#103362',
          highlight: '#0e2f47',
          link: '#87d7ff',
          error: '#ef5350',
          added: '#bcf0c0',
          removed: '#ef5350',
          modified: '#ffeb95'
        }
      },
      'horizon': {
        name: 'Horizon',
        type: 'dark',
        colors: {
          background: '#1c1e26',
          foreground: '#cbced0',
          key: '#25b0bc',
          string: '#fab795',
          number: '#f09483',
          boolean: '#b877db',
          null: '#6c6f93',
          bracket: '#cbced0',
          colon: '#cbced0',
          comma: '#6c6f93',
          expandIcon: '#09f7a0',
          lineNumber: '#6c6f93',
          selection: '#2e303e',
          highlight: '#232530',
          link: '#25b0bc',
          error: '#e95678',
          added: '#09f7a0',
          removed: '#e95678',
          modified: '#fab795'
        }
      },
      'andromeda': {
        name: 'Andromeda',
        type: 'dark',
        colors: {
          background: '#23262e',
          foreground: '#d5ced9',
          key: '#00e8c6',
          string: '#96e072',
          number: '#f39c12',
          boolean: '#c74ded',
          null: '#606168',
          bracket: '#d5ced9',
          colon: '#d5ced9',
          comma: '#606168',
          expandIcon: '#00e8c6',
          lineNumber: '#606168',
          selection: '#3b3f4c',
          highlight: '#2e323c',
          link: '#00e8c6',
          error: '#ee5d43',
          added: '#96e072',
          removed: '#ee5d43',
          modified: '#ffe66d'
        }
      },
      'vitesse-dark': {
        name: 'Vitesse Dark',
        type: 'dark',
        colors: {
          background: '#121212',
          foreground: '#dbd7ca',
          key: '#4d9375',
          string: '#c98a7d',
          number: '#4c9a91',
          boolean: '#cb7676',
          null: '#5d5d5f',
          bracket: '#dbd7ca',
          colon: '#dbd7ca',
          comma: '#5d5d5f',
          expandIcon: '#4d9375',
          lineNumber: '#5d5d5f',
          selection: '#292929',
          highlight: '#1e1e1e',
          link: '#4d9375',
          error: '#cb7676',
          added: '#4d9375',
          removed: '#cb7676',
          modified: '#d4976c'
        }
      },
      'panda': {
        name: 'Panda',
        type: 'dark',
        colors: {
          background: '#292a2b',
          foreground: '#e6e6e6',
          key: '#19f9d8',
          string: '#ffb86c',
          number: '#ffcc95',
          boolean: '#ff75b5',
          null: '#676b79',
          bracket: '#e6e6e6',
          colon: '#e6e6e6',
          comma: '#676b79',
          expandIcon: '#6fc1ff',
          lineNumber: '#676b79',
          selection: '#45475a',
          highlight: '#3a3b3c',
          link: '#6fc1ff',
          error: '#ff2c6d',
          added: '#19f9d8',
          removed: '#ff2c6d',
          modified: '#ffb86c'
        }
      },

      // ==================== Light Themes ====================
      'github-light': {
        name: 'GitHub Light',
        type: 'light',
        colors: {
          background: '#ffffff',
          foreground: '#24292e',
          key: '#005cc5',
          string: '#032f62',
          number: '#005cc5',
          boolean: '#d73a49',
          null: '#6a737d',
          bracket: '#24292e',
          colon: '#24292e',
          comma: '#6a737d',
          expandIcon: '#22863a',
          lineNumber: '#6a737d',
          selection: '#c8e1ff',
          highlight: '#fffbdd',
          link: '#0366d6',
          error: '#cb2431',
          added: '#22863a',
          removed: '#cb2431',
          modified: '#e36209'
        }
      },
      'one-light': {
        name: 'One Light',
        type: 'light',
        colors: {
          background: '#fafafa',
          foreground: '#383a42',
          key: '#4078f2',
          string: '#50a14f',
          number: '#986801',
          boolean: '#a626a4',
          null: '#a0a1a7',
          bracket: '#383a42',
          colon: '#383a42',
          comma: '#a0a1a7',
          expandIcon: '#50a14f',
          lineNumber: '#a0a1a7',
          selection: '#e5e5e6',
          highlight: '#f0f0f0',
          link: '#4078f2',
          error: '#e45649',
          added: '#50a14f',
          removed: '#e45649',
          modified: '#c18401'
        }
      },
      'solarized-light': {
        name: 'Solarized Light',
        type: 'light',
        colors: {
          background: '#fdf6e3',
          foreground: '#657b83',
          key: '#268bd2',
          string: '#2aa198',
          number: '#d33682',
          boolean: '#cb4b16',
          null: '#93a1a1',
          bracket: '#657b83',
          colon: '#657b83',
          comma: '#93a1a1',
          expandIcon: '#859900',
          lineNumber: '#93a1a1',
          selection: '#eee8d5',
          highlight: '#e9e2ce',
          link: '#268bd2',
          error: '#dc322f',
          added: '#859900',
          removed: '#dc322f',
          modified: '#b58900'
        }
      },
      'catppuccin-latte': {
        name: 'Catppuccin Latte',
        type: 'light',
        colors: {
          background: '#eff1f5',
          foreground: '#4c4f69',
          key: '#1e66f5',
          string: '#40a02b',
          number: '#fe640b',
          boolean: '#8839ef',
          null: '#9ca0b0',
          bracket: '#4c4f69',
          colon: '#4c4f69',
          comma: '#9ca0b0',
          expandIcon: '#179299',
          lineNumber: '#9ca0b0',
          selection: '#dce0e8',
          highlight: '#e6e9ef',
          link: '#1e66f5',
          error: '#d20f39',
          added: '#40a02b',
          removed: '#d20f39',
          modified: '#df8e1d'
        }
      },
      'gruvbox-light': {
        name: 'Gruvbox Light',
        type: 'light',
        colors: {
          background: '#fbf1c7',
          foreground: '#3c3836',
          key: '#458588',
          string: '#79740e',
          number: '#8f3f71',
          boolean: '#9d0006',
          null: '#928374',
          bracket: '#3c3836',
          colon: '#3c3836',
          comma: '#928374',
          expandIcon: '#427b58',
          lineNumber: '#928374',
          selection: '#ebdbb2',
          highlight: '#f2e5bc',
          link: '#458588',
          error: '#9d0006',
          added: '#79740e',
          removed: '#9d0006',
          modified: '#b57614'
        }
      },
      'ayu-light': {
        name: 'Ayu Light',
        type: 'light',
        colors: {
          background: '#fafafa',
          foreground: '#575f66',
          key: '#55b4d4',
          string: '#86b300',
          number: '#ff9940',
          boolean: '#fa6e32',
          null: '#abb0b6',
          bracket: '#575f66',
          colon: '#575f66',
          comma: '#abb0b6',
          expandIcon: '#4cbf99',
          lineNumber: '#abb0b6',
          selection: '#e7e8e9',
          highlight: '#f0f0f0',
          link: '#55b4d4',
          error: '#f51818',
          added: '#86b300',
          removed: '#f51818',
          modified: '#ff9940'
        }
      },
      'nord-light': {
        name: 'Nord Light',
        type: 'light',
        colors: {
          background: '#eceff4',
          foreground: '#2e3440',
          key: '#5e81ac',
          string: '#a3be8c',
          number: '#b48ead',
          boolean: '#81a1c1',
          null: '#4c566a',
          bracket: '#2e3440',
          colon: '#2e3440',
          comma: '#4c566a',
          expandIcon: '#8fbcbb',
          lineNumber: '#4c566a',
          selection: '#d8dee9',
          highlight: '#e5e9f0',
          link: '#5e81ac',
          error: '#bf616a',
          added: '#a3be8c',
          removed: '#bf616a',
          modified: '#ebcb8b'
        }
      },
      'material-lighter': {
        name: 'Material Lighter',
        type: 'light',
        colors: {
          background: '#fafafa',
          foreground: '#546e7a',
          key: '#6182b8',
          string: '#91b859',
          number: '#f76d47',
          boolean: '#7c4dff',
          null: '#aabfc9',
          bracket: '#90a4ae',
          colon: '#90a4ae',
          comma: '#aabfc9',
          expandIcon: '#39adb5',
          lineNumber: '#aabfc9',
          selection: '#cfd8dc',
          highlight: '#e7e7e8',
          link: '#6182b8',
          error: '#e53935',
          added: '#91b859',
          removed: '#e53935',
          modified: '#ffb62c'
        }
      },
      'tokyo-night-light': {
        name: 'Tokyo Night Light',
        type: 'light',
        colors: {
          background: '#d5d6db',
          foreground: '#343b58',
          key: '#166775',
          string: '#485e30',
          number: '#965027',
          boolean: '#5a4a78',
          null: '#9699a3',
          bracket: '#343b58',
          colon: '#343b58',
          comma: '#9699a3',
          expandIcon: '#166775',
          lineNumber: '#9699a3',
          selection: '#b4b5b9',
          highlight: '#c5c6ca',
          link: '#166775',
          error: '#8c4351',
          added: '#485e30',
          removed: '#8c4351',
          modified: '#8f5e15'
        }
      },
      'vitesse-light': {
        name: 'Vitesse Light',
        type: 'light',
        colors: {
          background: '#ffffff',
          foreground: '#393a34',
          key: '#1e754f',
          string: '#b56959',
          number: '#296aa3',
          boolean: '#ab5959',
          null: '#a0ada0',
          bracket: '#393a34',
          colon: '#393a34',
          comma: '#a0ada0',
          expandIcon: '#1e754f',
          lineNumber: '#a0ada0',
          selection: '#eaeaea',
          highlight: '#f5f5f5',
          link: '#1e754f',
          error: '#ab5959',
          added: '#1e754f',
          removed: '#ab5959',
          modified: '#a65e2b'
        }
      },
      'quiet-light': {
        name: 'Quiet Light',
        type: 'light',
        colors: {
          background: '#f5f5f5',
          foreground: '#333333',
          key: '#7a3e9d',
          string: '#448c27',
          number: '#9c5d27',
          boolean: '#ab6526',
          null: '#aaaaaa',
          bracket: '#333333',
          colon: '#333333',
          comma: '#aaaaaa',
          expandIcon: '#2f8e89',
          lineNumber: '#aaaaaa',
          selection: '#c9d0d9',
          highlight: '#e6e6e6',
          link: '#4b69c6',
          error: '#aa3731',
          added: '#448c27',
          removed: '#aa3731',
          modified: '#ab6526'
        }
      },

      // ==================== Additional Popular Themes ====================
      'sublime-text': {
        name: 'Sublime Text',
        type: 'dark',
        colors: {
          background: '#272822',
          foreground: '#f8f8f2',
          key: '#a6e22e',
          string: '#e6db74',
          number: '#ae81ff',
          boolean: '#f92672',
          null: '#75715e',
          bracket: '#f8f8f2',
          colon: '#f8f8f2',
          comma: '#75715e',
          expandIcon: '#66d9ef',
          lineNumber: '#75715e',
          selection: '#49483e',
          highlight: '#3e3d32',
          link: '#66d9ef',
          error: '#f92672',
          added: '#a6e22e',
          removed: '#f92672',
          modified: '#e6db74'
        }
      },
      'vs-code-dark': {
        name: 'VS Code Dark+',
        type: 'dark',
        colors: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          key: '#9cdcfe',
          string: '#ce9178',
          number: '#b5cea8',
          boolean: '#569cd6',
          null: '#808080',
          bracket: '#d4d4d4',
          colon: '#d4d4d4',
          comma: '#808080',
          expandIcon: '#4ec9b0',
          lineNumber: '#858585',
          selection: '#264f78',
          highlight: '#2d2d2d',
          link: '#4fc1ff',
          error: '#f14c4c',
          added: '#4ec9b0',
          removed: '#f14c4c',
          modified: '#dcdcaa'
        }
      },
      'vs-code-light': {
        name: 'VS Code Light+',
        type: 'light',
        colors: {
          background: '#ffffff',
          foreground: '#000000',
          key: '#001080',
          string: '#a31515',
          number: '#098658',
          boolean: '#0000ff',
          null: '#808080',
          bracket: '#000000',
          colon: '#000000',
          comma: '#808080',
          expandIcon: '#267f99',
          lineNumber: '#237893',
          selection: '#add6ff',
          highlight: '#fffbdd',
          link: '#0000ff',
          error: '#a31515',
          added: '#098658',
          removed: '#a31515',
          modified: '#795e26'
        }
      },
      'atom-dark': {
        name: 'Atom Dark',
        type: 'dark',
        colors: {
          background: '#1d1f21',
          foreground: '#c5c8c6',
          key: '#96cbfe',
          string: '#a8ff60',
          number: '#ff73fd',
          boolean: '#99cc99',
          null: '#7c7c7c',
          bracket: '#c5c8c6',
          colon: '#c5c8c6',
          comma: '#7c7c7c',
          expandIcon: '#ffcc66',
          lineNumber: '#7c7c7c',
          selection: '#444444',
          highlight: '#2d2d2d',
          link: '#96cbfe',
          error: '#d54e53',
          added: '#a8ff60',
          removed: '#d54e53',
          modified: '#e7c547'
        }
      },
      'oceanic-next': {
        name: 'Oceanic Next',
        type: 'dark',
        colors: {
          background: '#1b2b34',
          foreground: '#d8dee9',
          key: '#6699cc',
          string: '#99c794',
          number: '#f99157',
          boolean: '#c594c5',
          null: '#65737e',
          bracket: '#d8dee9',
          colon: '#d8dee9',
          comma: '#65737e',
          expandIcon: '#5fb3b3',
          lineNumber: '#65737e',
          selection: '#4f5b66',
          highlight: '#343d46',
          link: '#6699cc',
          error: '#ec5f67',
          added: '#99c794',
          removed: '#ec5f67',
          modified: '#fac863'
        }
      },
      'high-contrast': {
        name: 'High Contrast',
        type: 'dark',
        colors: {
          background: '#000000',
          foreground: '#ffffff',
          key: '#00ffff',
          string: '#00ff00',
          number: '#ffff00',
          boolean: '#ff00ff',
          null: '#808080',
          bracket: '#ffffff',
          colon: '#ffffff',
          comma: '#808080',
          expandIcon: '#00ff00',
          lineNumber: '#808080',
          selection: '#0000ff',
          highlight: '#333333',
          link: '#00ffff',
          error: '#ff0000',
          added: '#00ff00',
          removed: '#ff0000',
          modified: '#ffff00'
        }
      },
      'monochrome': {
        name: 'Monochrome',
        type: 'dark',
        colors: {
          background: '#1a1a1a',
          foreground: '#ffffff',
          key: '#ffffff',
          string: '#cccccc',
          number: '#aaaaaa',
          boolean: '#999999',
          null: '#666666',
          bracket: '#ffffff',
          colon: '#888888',
          comma: '#666666',
          expandIcon: '#ffffff',
          lineNumber: '#666666',
          selection: '#444444',
          highlight: '#333333',
          link: '#ffffff',
          error: '#ff4444',
          added: '#888888',
          removed: '#ff4444',
          modified: '#aaaaaa'
        }
      },
      'paper': {
        name: 'Paper',
        type: 'light',
        colors: {
          background: '#fffff8',
          foreground: '#333333',
          key: '#1a1a1a',
          string: '#444444',
          number: '#555555',
          boolean: '#666666',
          null: '#999999',
          bracket: '#333333',
          colon: '#666666',
          comma: '#999999',
          expandIcon: '#333333',
          lineNumber: '#bbbbbb',
          selection: '#ffffcc',
          highlight: '#fff9d9',
          link: '#0066cc',
          error: '#cc0000',
          added: '#006600',
          removed: '#cc0000',
          modified: '#996600'
        }
      }
    };
  }

  /**
   * Get all theme names grouped by type
   */
  getThemeList() {
    const dark = [];
    const light = [];

    for (const [id, theme] of Object.entries(this.themes)) {
      const item = { id, name: theme.name };
      if (theme.type === 'dark') {
        dark.push(item);
      } else {
        light.push(item);
      }
    }

    return { dark, light };
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId) {
    return this.themes[themeId] || this.themes['dracula'];
  }

  /**
   * Set current theme
   */
  setTheme(themeId) {
    if (this.themes[themeId]) {
      this.currentTheme = themeId;
      this.isDarkMode = this.themes[themeId].type === 'dark';
      return true;
    }
    return false;
  }

  /**
   * Generate CSS for a theme
   */
  generateCSS(themeId) {
    const theme = this.getTheme(themeId);
    const c = theme.colors;

    return `
.jfp-tree-view.theme-${themeId} {
  background-color: ${c.background};
  color: ${c.foreground};
  font-family: 'SF Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 16px;
}

.theme-${themeId} .jfp-key { color: ${c.key}; }
.theme-${themeId} .jfp-value.jfp-string { color: ${c.string}; }
.theme-${themeId} .jfp-value.jfp-number { color: ${c.number}; }
.theme-${themeId} .jfp-value.jfp-boolean { color: ${c.boolean}; }
.theme-${themeId} .jfp-value.jfp-null { color: ${c.null}; font-style: italic; }
.theme-${themeId} .jfp-bracket { color: ${c.bracket}; }
.theme-${themeId} .jfp-colon { color: ${c.colon}; }
.theme-${themeId} .jfp-comma { color: ${c.comma}; }
.theme-${themeId} .jfp-toggle { color: ${c.expandIcon}; }
.theme-${themeId} .jfp-count { color: ${c.null}; font-size: 0.85em; }
.theme-${themeId} .jfp-line-number { color: ${c.lineNumber}; }
.theme-${themeId} .jfp-link { color: ${c.link}; text-decoration: underline; }
.theme-${themeId} .jfp-highlight { background-color: ${c.highlight}; }
.theme-${themeId} .jfp-search-match { background-color: ${c.selection}; }
.theme-${themeId} .jfp-error { color: ${c.error}; }
.theme-${themeId} .jfp-diff-added { background-color: ${c.added}20; border-left: 3px solid ${c.added}; }
.theme-${themeId} .jfp-diff-removed { background-color: ${c.removed}20; border-left: 3px solid ${c.removed}; }
.theme-${themeId} .jfp-diff-modified { background-color: ${c.modified}20; border-left: 3px solid ${c.modified}; }
    `.trim();
  }

  /**
   * Generate CSS for all themes
   */
  generateAllCSS() {
    return Object.keys(this.themes)
      .map(id => this.generateCSS(id))
      .join('\n\n');
  }

  /**
   * Detect system preference
   */
  detectSystemPreference() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }

  /**
   * Get recommended theme based on system preference
   */
  getRecommendedTheme() {
    const preference = this.detectSystemPreference();
    return preference === 'dark' ? 'dracula' : 'github-light';
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
if (typeof window !== 'undefined') {
  window.ThemeManager = ThemeManager;
}
