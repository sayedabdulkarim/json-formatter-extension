/**
 * JSON Formatter Pro - Popup Main Script
 */

class JsonFormatterPro {
  constructor() {
    this.engine = new JsonEngine();
    this.differ = new JsonDiff();
    this.themeManager = new ThemeManager();
    this.treeView = null;
    this.currentData = null;
    this.currentTheme = 'dracula';
    this.isDarkMode = true;

    // Store tab content to preserve when switching
    this.tabContent = {
      'json-input': '',
      'diff-left': '',
      'diff-right': '',
      'convert-input': '',
      'query-input': '',
      'query-expression': ''
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.setupTheme();
    this.bindEvents();
    this.setupTreeView();
    this.restoreTabContent();

    // Listen for storage changes (when options page changes theme)
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        if (changes.theme) {
          this.currentTheme = changes.theme.newValue || 'dracula';
        }
        if (changes.darkMode !== undefined) {
          this.isDarkMode = changes.darkMode.newValue !== false;
        }
        if (changes.theme || changes.darkMode) {
          this.setupTheme();
        }
      }
    });
  }

  // ==================== Settings ====================
  loadSettings() {
    // Load from chrome.storage.sync (same as options page)
    chrome.storage.sync.get({
      theme: 'dracula',
      darkMode: true,
      indent: '2',
      sortKeys: false
    }, (settings) => {
      this.currentTheme = settings.theme || 'dracula';
      this.isDarkMode = settings.darkMode !== false;
      this.setupTheme();

      // Apply indent and sort settings to controls
      const indentSelect = document.getElementById('indent-select');
      const sortKeysCheckbox = document.getElementById('sort-keys');
      if (indentSelect) indentSelect.value = settings.indent || '2';
      if (sortKeysCheckbox) sortKeysCheckbox.checked = settings.sortKeys || false;
    });
  }

  saveSettings() {
    // Save to chrome.storage.sync (same as options page)
    const indentSelect = document.getElementById('indent-select');
    const sortKeysCheckbox = document.getElementById('sort-keys');

    chrome.storage.sync.set({
      theme: this.currentTheme,
      darkMode: this.isDarkMode,
      indent: indentSelect ? indentSelect.value : '2',
      sortKeys: sortKeysCheckbox ? sortKeysCheckbox.checked : false
    });
  }

  // ==================== Theme ====================
  setupTheme() {
    // Apply theme class (e.g., theme-dracula, theme-monokai)
    const themeClass = `theme-${this.currentTheme}`;
    const modeClass = this.isDarkMode ? 'dark' : 'light';

    // Set both theme and mode classes
    document.body.className = `${themeClass} ${modeClass}`;
    this.updateThemeIcons();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.setupTheme();
    this.saveSettings();
    if (this.treeView && this.currentData) {
      this.renderTreeView(this.currentData);
    }
  }

  updateThemeIcons() {
    const darkIcon = document.querySelector('.icon-dark');
    const lightIcon = document.querySelector('.icon-light');
    if (this.isDarkMode) {
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
    } else {
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'block';
    }
  }

  // ==================== Events ====================
  bindEvents() {
    // Theme toggle
    document.getElementById('btn-theme').addEventListener('click', () => this.toggleTheme());

    // Tab switching
    document.querySelectorAll('.jfp-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabEl = e.target.closest('.jfp-tab');
        if (tabEl) this.switchTab(tabEl.dataset.tab);
      });
    });

    // View tabs
    document.querySelectorAll('.jfp-view-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabEl = e.target.closest('.jfp-view-tab');
        if (tabEl) this.switchView(tabEl.dataset.view);
      });
    });

    // Format tab buttons
    document.getElementById('btn-paste').addEventListener('click', () => this.pasteFromClipboard());
    document.getElementById('btn-sample').addEventListener('click', () => this.loadSample());
    document.getElementById('btn-clear').addEventListener('click', () => this.clearInput());
    document.getElementById('btn-format').addEventListener('click', () => this.formatJson());
    document.getElementById('btn-minify').addEventListener('click', () => this.minifyJson());
    document.getElementById('btn-validate').addEventListener('click', () => this.validateJson());
    document.getElementById('btn-copy-output').addEventListener('click', () => this.copyOutput());
    document.getElementById('btn-download').addEventListener('click', () => this.downloadJson());

    // Input change
    document.getElementById('json-input').addEventListener('input', () => this.onInputChange());

    // Settings controls - save to storage when changed
    document.getElementById('indent-select').addEventListener('change', () => this.saveSettings());
    document.getElementById('sort-keys').addEventListener('change', () => this.saveSettings());

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => this.onSearch(e.target.value));
    document.getElementById('btn-search-prev').addEventListener('click', () => this.prevSearchResult());
    document.getElementById('btn-search-next').addEventListener('click', () => this.nextSearchResult());

    // Diff tab
    document.getElementById('btn-compare').addEventListener('click', () => this.compareJson());
    document.querySelector('.btn-paste-left').addEventListener('click', () => this.pasteToElement('diff-left'));
    document.querySelector('.btn-paste-right').addEventListener('click', () => this.pasteToElement('diff-right'));

    // Convert tab
    document.getElementById('btn-convert').addEventListener('click', () => this.convertFormat());
    document.getElementById('btn-copy-converted').addEventListener('click', () => this.copyConverted());

    // Query tab
    document.getElementById('btn-query').addEventListener('click', () => this.executeQuery());

    // Context menu
    document.addEventListener('contextmenu', (e) => this.showContextMenu(e));
    document.addEventListener('click', () => this.hideContextMenu());
    document.querySelectorAll('.jfp-context-item').forEach(item => {
      item.addEventListener('click', (e) => this.handleContextAction(e.target.dataset.action));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Settings button
    document.getElementById('btn-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // ==================== Tab Switching ====================
  switchTab(tabId) {
    document.querySelectorAll('.jfp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.jfp-tab-panel').forEach(p => p.classList.remove('active'));

    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
  }

  switchView(viewId) {
    document.querySelectorAll('.jfp-view-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.jfp-output-view').forEach(v => v.classList.remove('active'));

    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    document.getElementById(`output-${viewId}`).classList.add('active');
  }

  // ==================== Tree View ====================
  setupTreeView() {
    const container = document.getElementById('output-tree');
    if (!container) {
      console.error('Tree view container not found');
      return;
    }

    this.treeView = new TreeView(container, {
      theme: this.isDarkMode ? 'catppuccin-mocha' : 'catppuccin-latte',
      initialExpandLevel: 3,
      showDataTypes: false,
      showItemCount: true,
      onNodeClick: (info) => this.onNodeClick(info)
    });
  }

  renderTreeView(data) {
    if (!this.treeView) {
      this.setupTreeView();
    }

    const container = document.getElementById('output-tree');
    container.innerHTML = '';

    // Create wrapper div with proper styling class
    const treeWrapper = document.createElement('div');
    treeWrapper.className = 'jfp-tree-view';
    treeWrapper.appendChild(this.buildTree(data, [], 0));
    container.appendChild(treeWrapper);
  }

  // Simple tree builder for debugging
  buildTree(node, path, depth) {
    const wrapper = document.createElement('div');
    wrapper.className = 'jfp-node';
    wrapper.style.marginLeft = depth > 0 ? '20px' : '0';

    const type = this.getNodeType(node);

    if (type === 'object' || type === 'array') {
      const isArray = type === 'array';
      const keys = isArray ? Object.keys(node) : Object.keys(node);
      const len = keys.length;

      // Header line
      const header = document.createElement('div');
      header.className = 'jfp-header';
      header.style.cursor = 'pointer';

      // Toggle icon
      const toggle = document.createElement('span');
      toggle.className = 'jfp-toggle';
      toggle.innerHTML = '▶';
      toggle.style.display = 'inline-block';
      toggle.style.width = '16px';
      toggle.style.transition = 'transform 0.15s';
      header.appendChild(toggle);

      // Key name (if not root)
      if (path.length > 0) {
        const keySpan = document.createElement('span');
        keySpan.className = 'jfp-key';
        const keyName = path[path.length - 1];
        keySpan.textContent = typeof keyName === 'number' ? `[${keyName}]` : `"${keyName}"`;
        header.appendChild(keySpan);

        const colon = document.createElement('span');
        colon.className = 'jfp-colon';
        colon.textContent = ': ';
        header.appendChild(colon);
      }

      // Opening bracket
      const bracket = document.createElement('span');
      bracket.className = 'jfp-bracket';
      bracket.textContent = isArray ? '[' : '{';
      header.appendChild(bracket);

      // Item count (shown when collapsed)
      const count = document.createElement('span');
      count.className = 'jfp-count';
      count.textContent = ` ${len} ${len === 1 ? 'item' : 'items'} `;
      header.appendChild(count);

      // Closing bracket for collapsed view
      const closeBracketInline = document.createElement('span');
      closeBracketInline.className = 'jfp-bracket jfp-close-inline';
      closeBracketInline.textContent = isArray ? ']' : '}';
      header.appendChild(closeBracketInline);

      wrapper.appendChild(header);

      // Children container
      const children = document.createElement('div');
      children.className = 'jfp-children';
      children.style.display = depth < 2 ? 'block' : 'none';
      children.style.marginLeft = '8px';
      children.style.paddingLeft = '12px';

      keys.forEach((key, index) => {
        const childPath = [...path, isArray ? parseInt(key) : key];
        const childNode = this.buildTree(node[key], childPath, depth + 1);

        // Add comma
        if (index < len - 1) {
          const comma = document.createElement('span');
          comma.className = 'jfp-comma';
          comma.textContent = ',';
          childNode.appendChild(comma);
        }

        children.appendChild(childNode);
      });

      wrapper.appendChild(children);

      // Closing bracket
      const closeBracket = document.createElement('div');
      closeBracket.className = 'jfp-close-bracket';
      closeBracket.textContent = isArray ? ']' : '}';
      closeBracket.style.display = depth < 2 ? 'block' : 'none';
      wrapper.appendChild(closeBracket);

      // Toggle functionality
      const isExpanded = depth < 2;
      toggle.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
      count.style.display = isExpanded ? 'none' : 'inline';
      closeBracketInline.style.display = isExpanded ? 'none' : 'inline';

      header.addEventListener('click', () => {
        const expanded = children.style.display !== 'none';
        children.style.display = expanded ? 'none' : 'block';
        closeBracket.style.display = expanded ? 'none' : 'block';
        toggle.style.transform = expanded ? 'rotate(0deg)' : 'rotate(90deg)';
        count.style.display = expanded ? 'inline' : 'none';
        closeBracketInline.style.display = expanded ? 'inline' : 'none';
      });

    } else {
      // Primitive value
      const line = document.createElement('div');
      line.className = 'jfp-primitive';

      // Key
      if (path.length > 0) {
        const keySpan = document.createElement('span');
        keySpan.className = 'jfp-key';
        const keyName = path[path.length - 1];
        keySpan.textContent = typeof keyName === 'number' ? `[${keyName}]` : `"${keyName}"`;
        line.appendChild(keySpan);

        const colon = document.createElement('span');
        colon.className = 'jfp-colon';
        colon.textContent = ': ';
        line.appendChild(colon);
      }

      // Value
      const valueSpan = document.createElement('span');
      valueSpan.className = `jfp-value jfp-${type}`;

      if (type === 'string') {
        valueSpan.textContent = `"${node}"`;
      } else if (node === null) {
        valueSpan.textContent = 'null';
      } else {
        valueSpan.textContent = String(node);
      }

      line.appendChild(valueSpan);
      wrapper.appendChild(line);
    }

    return wrapper;
  }

  getNodeType(node) {
    if (node === null) return 'null';
    if (Array.isArray(node)) return 'array';
    return typeof node;
  }

  // ==================== Format Operations ====================
  formatJson() {
    const input = document.getElementById('json-input').value.trim();
    if (!input) {
      this.showToast('Please enter JSON data', 'error');
      return;
    }

    const result = this.engine.parse(input);
    if (!result.success) {
      this.showError(result.error);
      return;
    }

    this.currentData = result.data;
    this.hideError();

    const indent = document.getElementById('indent-select').value;
    const sortKeys = document.getElementById('sort-keys').checked;
    const indentValue = indent === 'tab' ? '\t' : parseInt(indent);

    const formatted = this.engine.format(result.data, { indent: indentValue, sortKeys });

    // Update views
    this.renderTreeView(result.data);
    this.renderRawView(formatted);
    this.renderTableView(result.data);
    this.updateStats(result.data, formatted);
    this.updateBreadcrumb([]);

    this.showToast('JSON formatted successfully', 'success');
  }

  minifyJson() {
    const input = document.getElementById('json-input').value.trim();
    if (!input) {
      this.showToast('Please enter JSON data', 'error');
      return;
    }

    const result = this.engine.parse(input);
    if (!result.success) {
      this.showError(result.error);
      return;
    }

    const minified = this.engine.minify(result.data);
    document.getElementById('json-input').value = minified;
    this.currentData = result.data;
    this.hideError();

    this.renderTreeView(result.data);
    this.renderRawView(minified);
    this.updateStats(result.data, minified);

    this.showToast('JSON minified successfully', 'success');
  }

  validateJson() {
    const input = document.getElementById('json-input').value.trim();
    if (!input) {
      this.showToast('Please enter JSON data', 'error');
      return;
    }

    const result = this.engine.parse(input);
    if (result.success) {
      this.hideError();
      this.showToast('Valid JSON!', 'success');
    } else {
      this.showError(result.error);
      this.showToast('Invalid JSON', 'error');
    }
  }

  // ==================== Render Views ====================
  renderRawView(content) {
    const container = document.getElementById('output-raw');
    const lines = content.split('\n');
    container.innerHTML = lines.map((line, i) =>
      `<div class="jfp-line"><span class="jfp-line-number">${i + 1}</span>${this.escapeHtml(line)}</div>`
    ).join('');
  }

  renderTableView(data) {
    const container = document.getElementById('output-table');

    if (!Array.isArray(data)) {
      container.innerHTML = '<div style="padding: 20px; opacity: 0.5;">Table view is only available for arrays of objects</div>';
      return;
    }

    if (data.length === 0) {
      container.innerHTML = '<div style="padding: 20px; opacity: 0.5;">Empty array</div>';
      return;
    }

    // Get all unique keys
    const keys = [...new Set(data.flatMap(item =>
      typeof item === 'object' && item !== null ? Object.keys(item) : []
    ))];

    if (keys.length === 0) {
      container.innerHTML = '<div style="padding: 20px; opacity: 0.5;">No object properties to display</div>';
      return;
    }

    let html = '<table class="jfp-table"><thead><tr>';
    html += '<th>#</th>';
    keys.forEach(key => html += `<th>${this.escapeHtml(key)}</th>`);
    html += '</tr></thead><tbody>';

    data.forEach((item, index) => {
      html += '<tr>';
      html += `<td>${index}</td>`;
      keys.forEach(key => {
        const value = item && typeof item === 'object' ? item[key] : '';
        const display = value === null ? 'null' :
                       value === undefined ? '' :
                       typeof value === 'object' ? JSON.stringify(value) : String(value);
        html += `<td>${this.escapeHtml(display)}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ==================== Stats ====================
  updateStats(data, formatted) {
    const stats = this.engine.getStats(data);

    document.getElementById('stat-size').textContent = this.formatBytes(stats.size.formatted);
    document.getElementById('stat-keys').textContent = stats.totalKeys.toLocaleString();
    document.getElementById('stat-depth').textContent = stats.maxDepth;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ==================== Breadcrumb ====================
  updateBreadcrumb(path) {
    const container = document.getElementById('breadcrumb');
    if (!container) return; // Breadcrumb removed in new layout

    let html = '<span class="jfp-breadcrumb-item active" data-path="">$</span>';

    let currentPath = [];
    path.forEach((key, index) => {
      currentPath.push(key);
      const isLast = index === path.length - 1;
      const displayKey = typeof key === 'number' ? `[${key}]` : key;
      html += '<span class="jfp-breadcrumb-separator">.</span>';
      html += `<span class="jfp-breadcrumb-item${isLast ? ' active' : ''}" data-path="${currentPath.join('.')}">${displayKey}</span>`;
    });

    container.innerHTML = html;
  }

  // ==================== Search ====================
  onSearch(query) {
    if (!this.currentData) return;

    const results = this.treeView.search(query);
    const resultsEl = document.getElementById('search-results');
    const prevBtn = document.getElementById('btn-search-prev');
    const nextBtn = document.getElementById('btn-search-next');

    if (query && results.length > 0) {
      resultsEl.textContent = `1 of ${results.length}`;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    } else if (query && results.length === 0) {
      resultsEl.textContent = 'No results';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    } else {
      resultsEl.textContent = '';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

  prevSearchResult() {
    const current = this.treeView.prevSearchResult();
    if (current !== undefined) {
      document.getElementById('search-results').textContent =
        `${current} of ${this.treeView.searchResults.length}`;
    }
  }

  nextSearchResult() {
    const current = this.treeView.nextSearchResult();
    if (current !== undefined) {
      document.getElementById('search-results').textContent =
        `${current} of ${this.treeView.searchResults.length}`;
    }
  }

  // ==================== Diff ====================
  compareJson() {
    const leftInput = document.getElementById('diff-left').value.trim();
    const rightInput = document.getElementById('diff-right').value.trim();
    const outputEl = document.getElementById('diff-output');
    const summaryEl = document.getElementById('diff-summary');

    // Clear previous output
    summaryEl.innerHTML = '';

    if (!leftInput || !rightInput) {
      this.renderDiffError([{
        panel: !leftInput ? 'Original JSON' : 'Modified JSON',
        message: 'Please enter JSON data',
        hint: 'Paste valid JSON in both panels to compare'
      }]);
      return;
    }

    const leftResult = this.engine.parse(leftInput);
    const rightResult = this.engine.parse(rightInput);

    const errors = [];
    if (!leftResult.success) {
      errors.push(this.formatJsonError('Original JSON', leftResult.error, leftInput));
    }
    if (!rightResult.success) {
      errors.push(this.formatJsonError('Modified JSON', rightResult.error, rightInput));
    }

    if (errors.length > 0) {
      this.renderDiffError(errors);
      return;
    }

    const ignoreOrder = document.getElementById('ignore-order').checked;
    const diff = this.differ.diff(leftResult.data, rightResult.data, { ignoreArrayOrder: ignoreOrder });
    const summary = this.differ.getSummary(diff);

    this.renderDiff(leftResult.data, rightResult.data, diff);
    this.renderDiffSummary(summary);
    this.showToast('Comparison complete', 'success');
  }

  formatJsonError(panel, error, input) {
    // Get user-friendly error message
    const friendlyMessage = this.getFriendlyErrorMessage(error.message, input, error.position);

    return {
      panel: panel,
      line: error.line,
      column: error.column,
      message: friendlyMessage.message,
      hint: friendlyMessage.hint,
      context: error.context
    };
  }

  getFriendlyErrorMessage(originalMessage, input, position) {
    const msg = originalMessage.toLowerCase();

    // Extract character at error position for context
    const charAtError = position > 0 && position < input.length ? input[position] : '';
    const charBefore = position > 1 ? input[position - 1] : '';

    // Common JSON errors with friendly messages
    if (msg.includes('unexpected token') || msg.includes('unexpected non-whitespace')) {
      if (charAtError === ',') {
        return {
          message: 'Unexpected comma found',
          hint: 'Check for trailing comma after the last item in an object or array, or double commas'
        };
      }
      if (charAtError === '}' || charAtError === ']') {
        return {
          message: `Unexpected closing bracket "${charAtError}"`,
          hint: 'You might be missing a value before this bracket, or have an extra closing bracket'
        };
      }
      if (charAtError === '{' || charAtError === '[') {
        return {
          message: `Unexpected opening bracket "${charAtError}"`,
          hint: 'Check if you\'re missing a comma before this bracket, or a colon after a key'
        };
      }
      if (charBefore === ':' || msg.includes('after colon')) {
        return {
          message: 'Invalid value after colon',
          hint: 'The value after ":" must be a valid JSON value (string, number, object, array, true, false, or null)'
        };
      }
      return {
        message: 'Unexpected character in JSON',
        hint: 'Check for unquoted strings, missing commas, or invalid characters'
      };
    }

    if (msg.includes('unterminated string') || msg.includes('bad string')) {
      return {
        message: 'String not properly closed',
        hint: 'Make sure all strings have matching opening and closing double quotes (")'
      };
    }

    if (msg.includes('expected') && msg.includes('colon')) {
      return {
        message: 'Missing colon after key',
        hint: 'Object keys must be followed by a colon (:) and then a value'
      };
    }

    if (msg.includes('expected') && (msg.includes('comma') || msg.includes(','))) {
      return {
        message: 'Missing comma between elements',
        hint: 'Add a comma between object properties or array items'
      };
    }

    if (msg.includes('property name') || msg.includes('expected string')) {
      return {
        message: 'Invalid or missing property name',
        hint: 'Object keys must be strings enclosed in double quotes ("key")'
      };
    }

    if (msg.includes('end of') || msg.includes('eof')) {
      return {
        message: 'JSON ended unexpectedly',
        hint: 'Check for missing closing brackets } or ]'
      };
    }

    if (msg.includes('duplicate key')) {
      return {
        message: 'Duplicate key found',
        hint: 'Each key in an object must be unique'
      };
    }

    // Default fallback
    return {
      message: originalMessage,
      hint: 'Check the JSON syntax near the indicated position'
    };
  }

  renderDiffError(errors) {
    const outputEl = document.getElementById('diff-output');

    let html = '<div class="jfp-error-display">';

    errors.forEach((err, index) => {
      html += `
        <div class="jfp-error-card">
          <div class="jfp-error-header">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span class="jfp-error-panel">${this.escapeHtml(err.panel)}</span>
            ${err.line ? `<span class="jfp-error-location">Line ${err.line}, Column ${err.column}</span>` : ''}
          </div>
          <div class="jfp-error-message">${this.escapeHtml(err.message)}</div>
          <div class="jfp-error-hint">💡 ${this.escapeHtml(err.hint)}</div>
          ${err.context ? this.renderErrorContext(err.context) : ''}
        </div>
      `;
    });

    html += '</div>';
    outputEl.innerHTML = html;
  }

  renderErrorContext(context) {
    if (!context || context.length === 0) return '';

    let html = '<div class="jfp-error-context">';
    context.forEach(line => {
      const lineClass = line.isError ? 'jfp-error-line error' : 'jfp-error-line';
      html += `<div class="${lineClass}">
        <span class="jfp-line-num">${line.lineNumber}</span>
        <code>${this.escapeHtml(line.content)}</code>
      </div>`;
    });
    html += '</div>';
    return html;
  }

  renderDiff(left, right, diff) {
    const container = document.getElementById('diff-output');

    const leftFormatted = this.engine.format(left, { indent: 2 });
    const rightFormatted = this.engine.format(right, { indent: 2 });

    // Simple side-by-side view
    container.innerHTML = `
      <div class="jfp-diff-view">
        <div class="jfp-diff-panel">
          <div class="jfp-diff-header">Original</div>
          <pre>${this.escapeHtml(leftFormatted)}</pre>
        </div>
        <div class="jfp-diff-panel">
          <div class="jfp-diff-header">Modified</div>
          <pre>${this.escapeHtml(rightFormatted)}</pre>
        </div>
      </div>
    `;
  }

  renderDiffSummary(summary) {
    const container = document.getElementById('diff-summary');
    if (summary.total === 0) {
      container.innerHTML = '<span style="color: #a6e3a1;">No differences found</span>';
      return;
    }

    container.innerHTML = `
      <div class="jfp-diff-stat">
        <span class="jfp-diff-badge added">+${summary.added} added</span>
      </div>
      <div class="jfp-diff-stat">
        <span class="jfp-diff-badge removed">-${summary.removed} removed</span>
      </div>
      <div class="jfp-diff-stat">
        <span class="jfp-diff-badge modified">~${summary.modified} modified</span>
      </div>
    `;
  }

  // ==================== Convert ====================
  convertFormat() {
    const input = document.getElementById('convert-input').value.trim();
    const fromFormat = document.getElementById('convert-from').value;
    const toFormat = document.getElementById('convert-to').value;

    if (!input) {
      this.showToast('Please enter data to convert', 'error');
      return;
    }

    try {
      // Parse input
      let data;
      switch (fromFormat) {
        case 'json':
          data = JSON.parse(input);
          break;
        case 'yaml':
          data = JsonConverters.fromYAML(input);
          break;
        case 'xml':
          data = JsonConverters.fromXML(input);
          break;
        case 'csv':
          data = JsonConverters.fromCSV(input);
          break;
        case 'querystring':
          data = JsonConverters.fromQueryString(input);
          break;
        default:
          throw new Error('Unknown input format');
      }

      // Convert to output
      let output;
      switch (toFormat) {
        case 'json':
          output = JSON.stringify(data, null, 2);
          break;
        case 'yaml':
          output = JsonConverters.toYAML(data);
          break;
        case 'xml':
          output = JsonConverters.toXML(data);
          break;
        case 'csv':
          output = JsonConverters.toCSV(data);
          break;
        case 'typescript':
          output = JsonConverters.toTypeScript(data);
          break;
        case 'querystring':
          output = JsonConverters.toQueryString(data);
          break;
        default:
          throw new Error('Unknown output format');
      }

      document.getElementById('convert-output').textContent = output;
      this.showToast('Conversion successful', 'success');
    } catch (e) {
      this.showToast(`Conversion failed: ${e.message}`, 'error');
    }
  }

  copyConverted() {
    const output = document.getElementById('convert-output').textContent;
    if (output) {
      navigator.clipboard.writeText(output);
      this.showToast('Copied to clipboard', 'success');
    }
  }

  // ==================== Query ====================
  executeQuery() {
    const input = document.getElementById('query-input').value.trim();
    const expression = document.getElementById('query-expression').value.trim();
    const queryType = document.getElementById('query-type').value;

    if (!input) {
      this.showToast('Please enter JSON data', 'error');
      return;
    }

    if (!expression) {
      this.showToast('Please enter a query expression', 'error');
      return;
    }

    try {
      const data = JSON.parse(input);
      let result;

      if (queryType === 'jsonpath') {
        result = this.engine.getPath(data, expression);
      } else {
        // Simple jq-style query (basic implementation)
        result = this.executeJqQuery(data, expression);
      }

      const output = document.getElementById('query-output');
      if (result === undefined) {
        output.textContent = 'No match found';
        document.getElementById('query-count').textContent = '0 results';
      } else {
        output.textContent = JSON.stringify(result, null, 2);
        const count = Array.isArray(result) ? result.length : 1;
        document.getElementById('query-count').textContent = `${count} result${count !== 1 ? 's' : ''}`;
      }
    } catch (e) {
      this.showToast(`Query failed: ${e.message}`, 'error');
    }
  }

  executeJqQuery(data, expression) {
    // Basic jq-style query implementation
    let current = data;
    const parts = expression.split(/\.|\[\]/).filter(Boolean);

    for (const part of parts) {
      if (current === undefined || current === null) break;

      const indexMatch = part.match(/^\[(\d+)\]$/);
      if (indexMatch) {
        current = current[parseInt(indexMatch[1])];
      } else if (part === '') {
        // Handle [] - flatten array
        if (Array.isArray(current)) {
          current = current.flat();
        }
      } else {
        if (Array.isArray(current)) {
          current = current.map(item => item && item[part]).filter(v => v !== undefined);
        } else if (typeof current === 'object') {
          current = current[part];
        }
      }
    }

    return current;
  }

  // ==================== Clipboard & File ====================
  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('json-input').value = text;
      this.onInputChange();
    } catch (e) {
      this.showToast('Failed to read clipboard', 'error');
    }
  }

  async pasteToElement(elementId) {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById(elementId).value = text;
    } catch (e) {
      this.showToast('Failed to read clipboard', 'error');
    }
  }

  copyOutput() {
    if (!this.currentData) return;

    const indent = document.getElementById('indent-select').value;
    const sortKeys = document.getElementById('sort-keys').checked;
    const indentValue = indent === 'tab' ? '\t' : parseInt(indent);

    const output = this.engine.format(this.currentData, { indent: indentValue, sortKeys });
    navigator.clipboard.writeText(output);
    this.showToast('Copied to clipboard', 'success');
  }

  downloadJson() {
    if (!this.currentData) return;

    const output = this.engine.format(this.currentData, { indent: 2 });
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();

    URL.revokeObjectURL(url);
    this.showToast('File downloaded', 'success');
  }

  loadSample() {
    const sample = {
      "name": "JSON Formatter Pro",
      "version": "1.0.0",
      "features": [
        "Format & beautify",
        "Validate JSON",
        "Tree view",
        "Diff comparison",
        "Format conversion",
        "JSONPath queries"
      ],
      "settings": {
        "theme": "dracula",
        "darkMode": true,
        "indent": 2
      },
      "stats": {
        "downloads": 10000,
        "rating": 4.9,
        "lastUpdated": "2024-01-15T10:30:00Z"
      },
      "isActive": true,
      "deprecated": null
    };

    document.getElementById('json-input').value = JSON.stringify(sample, null, 2);
    this.onInputChange();
  }

  clearInput() {
    document.getElementById('json-input').value = '';
    document.getElementById('output-tree').innerHTML = '';
    document.getElementById('output-raw').innerHTML = '';
    document.getElementById('output-table').innerHTML = '';
    this.currentData = null;
    this.hideError();
  }

  // ==================== Input Change ====================
  onInputChange() {
    const input = document.getElementById('json-input').value.trim();
    if (!input) {
      this.hideError();
      return;
    }

    const result = this.engine.parse(input);
    if (result.success) {
      this.hideError();
    } else {
      this.showError(result.error);
    }
  }

  // ==================== Error Display ====================
  showError(error) {
    const container = document.getElementById('input-error');
    container.classList.add('show');
    container.innerHTML = `
      <strong>Error at line ${error.line}, column ${error.column}:</strong><br>
      ${this.escapeHtml(error.message)}
    `;
  }

  hideError() {
    document.getElementById('input-error').classList.remove('show');
  }

  // ==================== Context Menu ====================
  showContextMenu(e) {
    if (!this.currentData) return;

    const menu = document.getElementById('context-menu');
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.classList.add('show');
    e.preventDefault();
  }

  hideContextMenu() {
    document.getElementById('context-menu').classList.remove('show');
  }

  handleContextAction(action) {
    const path = this.treeView?.selectedPath || '$';

    switch (action) {
      case 'copy-path':
        navigator.clipboard.writeText(path);
        this.showToast('Path copied', 'success');
        break;
      case 'copy-path-jsonpath':
        navigator.clipboard.writeText(path.startsWith('$') ? path : '$.' + path);
        this.showToast('JSONPath copied', 'success');
        break;
      case 'copy-value':
        if (this.currentData) {
          const value = this.engine.getPath(this.currentData, path);
          navigator.clipboard.writeText(JSON.stringify(value));
          this.showToast('Value copied', 'success');
        }
        break;
      case 'copy-node':
        if (this.currentData) {
          const node = this.engine.getPath(this.currentData, path);
          navigator.clipboard.writeText(JSON.stringify(node, null, 2));
          this.showToast('Node copied', 'success');
        }
        break;
      case 'expand-all':
        this.treeView?.expandAll();
        break;
      case 'collapse-all':
        this.treeView?.collapseAll();
        break;
    }

    this.hideContextMenu();
  }

  // ==================== Node Click ====================
  onNodeClick(info) {
    this.updateBreadcrumb(info.pathArray);
  }

  // ==================== Keyboard Shortcuts ====================
  handleKeyboard(e) {
    // Ctrl/Cmd + Enter to format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      this.formatJson();
      e.preventDefault();
    }
    // Ctrl/Cmd + M to minify
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
      this.minifyJson();
      e.preventDefault();
    }
    // Escape to collapse all
    if (e.key === 'Escape') {
      this.treeView?.collapseAll();
    }
    // D for dark mode toggle
    if (e.key === 'd' && !e.target.matches('input, textarea')) {
      this.toggleTheme();
    }
    // [ to collapse all
    if (e.key === '[' && !e.target.matches('input, textarea')) {
      this.treeView?.collapseAll();
    }
    // ] to expand all
    if (e.key === ']' && !e.target.matches('input, textarea')) {
      this.treeView?.expandAll();
    }
  }

  // ==================== Toast ====================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `jfp-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ==================== Content Preservation ====================
  saveTabContent() {
    Object.keys(this.tabContent).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        this.tabContent[id] = el.value;
      }
    });
    localStorage.setItem('jfp-tab-content', JSON.stringify(this.tabContent));
  }

  restoreTabContent() {
    const saved = localStorage.getItem('jfp-tab-content');
    if (saved) {
      try {
        this.tabContent = JSON.parse(saved);
        Object.keys(this.tabContent).forEach(id => {
          const el = document.getElementById(id);
          if (el && this.tabContent[id]) {
            el.value = this.tabContent[id];
          }
        });
      } catch (e) {}
    }

    // Auto-save on input change for all text fields
    Object.keys(this.tabContent).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.saveTabContent());
      }
    });
  }

  // ==================== Utilities ====================
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new JsonFormatterPro();
});
