/**
 * JSON Formatter Pro - Options Page Script
 */

class OptionsPage {
  constructor() {
    this.defaults = {
      theme: 'dracula',
      darkMode: true,
      fontSize: '13',
      fontFamily: 'system',
      indent: '2',
      sortKeys: false,
      quoteStyle: 'double',
      lineNumbers: true,
      dataTypes: false,
      linkify: true,
      timestamps: true,
      expandLevel: '2',
      autoFormat: true,
      pathFormat: 'dot'
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.bindEvents();
  }

  loadSettings() {
    chrome.storage.sync.get(this.defaults, (settings) => {
      // Theme
      document.getElementById('theme-select').value = settings.theme;
      document.getElementById('dark-mode-toggle').checked = settings.darkMode;

      // Appearance
      document.getElementById('font-size-select').value = settings.fontSize;
      document.getElementById('font-family-select').value = settings.fontFamily;

      // Formatting
      document.getElementById('indent-select').value = settings.indent;
      document.getElementById('sort-keys-toggle').checked = settings.sortKeys;
      document.getElementById('quote-style-select').value = settings.quoteStyle;

      // Display
      document.getElementById('line-numbers-toggle').checked = settings.lineNumbers;
      document.getElementById('data-types-toggle').checked = settings.dataTypes;
      document.getElementById('linkify-toggle').checked = settings.linkify;
      document.getElementById('timestamps-toggle').checked = settings.timestamps;
      document.getElementById('expand-level-select').value = settings.expandLevel;

      // Behavior
      document.getElementById('auto-format-toggle').checked = settings.autoFormat;
      document.getElementById('path-format-select').value = settings.pathFormat;
    });
  }

  getSettings() {
    return {
      theme: document.getElementById('theme-select').value,
      darkMode: document.getElementById('dark-mode-toggle').checked,
      fontSize: document.getElementById('font-size-select').value,
      fontFamily: document.getElementById('font-family-select').value,
      indent: document.getElementById('indent-select').value,
      sortKeys: document.getElementById('sort-keys-toggle').checked,
      quoteStyle: document.getElementById('quote-style-select').value,
      lineNumbers: document.getElementById('line-numbers-toggle').checked,
      dataTypes: document.getElementById('data-types-toggle').checked,
      linkify: document.getElementById('linkify-toggle').checked,
      timestamps: document.getElementById('timestamps-toggle').checked,
      expandLevel: document.getElementById('expand-level-select').value,
      autoFormat: document.getElementById('auto-format-toggle').checked,
      pathFormat: document.getElementById('path-format-select').value
    };
  }

  saveSettings() {
    const settings = this.getSettings();
    chrome.storage.sync.set(settings, () => {
      this.showToast('Settings saved!');
    });
  }

  resetSettings() {
    chrome.storage.sync.set(this.defaults, () => {
      this.loadSettings();
      this.showToast('Settings reset to defaults');
    });
  }

  bindEvents() {
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('Reset all settings to defaults?')) {
        this.resetSettings();
      }
    });

    // Auto-toggle dark mode based on theme selection
    document.getElementById('theme-select').addEventListener('change', (e) => {
      const lightThemes = ['github-light', 'one-light', 'solarized-light', 'catppuccin-latte', 'gruvbox-light', 'ayu-light', 'nord-light', 'material-lighter', 'vs-code-light', 'quiet-light'];
      const isLightTheme = lightThemes.includes(e.target.value);
      document.getElementById('dark-mode-toggle').checked = !isLightTheme;
      this.saveSettings();
    });

    // Auto-save on change
    const inputs = document.querySelectorAll('select, input[type="checkbox"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.saveSettings();
      });
    });
  }

  showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 200);
    }, 2000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsPage();
});
