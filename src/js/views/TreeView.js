/**
 * JSON Formatter Pro - Tree View Component
 * Renders JSON as an interactive collapsible tree
 */

class TreeView {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    this.options = {
      theme: 'default',
      initialExpandLevel: 2,
      showLineNumbers: true,
      showDataTypes: true,
      showArrayIndex: true,
      showItemCount: true,
      linkifyUrls: true,
      maxStringLength: 500,
      sortKeys: false,
      pathFormat: 'dot', // dot, jsonpath, bracket
      onNodeClick: null,
      onPathCopy: null,
      ...options
    };

    this.data = null;
    this.searchResults = [];
    this.currentSearchIndex = 0;
    this.expandedPaths = new Set();
    this.selectedPath = null;
  }

  /**
   * Render JSON data as tree
   */
  render(data) {
    this.data = data;
    this.container.innerHTML = '';
    this.container.className = `jfp-tree-view theme-${this.options.theme}`;

    const rootElement = this._renderNode(data, [], 0);
    this.container.appendChild(rootElement);

    // Auto-expand to initial level
    this._autoExpand(this.options.initialExpandLevel);
  }

  /**
   * Render a single node
   */
  _renderNode(node, path, depth) {
    const wrapper = document.createElement('div');
    wrapper.className = 'jfp-node';
    wrapper.dataset.path = this._formatPath(path);
    wrapper.dataset.depth = depth;

    const type = this._getType(node);

    if (type === 'object' || type === 'array') {
      wrapper.appendChild(this._renderComplexNode(node, path, depth, type));
    } else {
      wrapper.appendChild(this._renderPrimitiveNode(node, path, type));
    }

    return wrapper;
  }

  /**
   * Render object or array
   */
  _renderComplexNode(node, path, depth, type) {
    const container = document.createElement('div');
    container.className = `jfp-complex jfp-${type}`;

    // Header with toggle
    const header = document.createElement('div');
    header.className = 'jfp-header';

    // Toggle button
    const toggle = document.createElement('span');
    toggle.className = 'jfp-toggle';
    toggle.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleNode(container);
    });
    header.appendChild(toggle);

    // Key (if not root)
    if (path.length > 0) {
      const key = path[path.length - 1];
      const keySpan = document.createElement('span');
      keySpan.className = 'jfp-key';
      keySpan.textContent = typeof key === 'number' && this.options.showArrayIndex
        ? `[${key}]`
        : `"${key}"`;
      keySpan.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleNodeClick(path, 'key');
      });
      header.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'jfp-colon';
      colon.textContent = ': ';
      header.appendChild(colon);
    }

    // Opening bracket
    const openBracket = document.createElement('span');
    openBracket.className = 'jfp-bracket';
    openBracket.textContent = type === 'array' ? '[' : '{';
    header.appendChild(openBracket);

    // Item count
    if (this.options.showItemCount) {
      const count = document.createElement('span');
      count.className = 'jfp-count';
      const len = type === 'array' ? node.length : Object.keys(node).length;
      count.textContent = ` ${len} ${len === 1 ? 'item' : 'items'}`;
      header.appendChild(count);
    }

    // Collapsed preview
    const preview = document.createElement('span');
    preview.className = 'jfp-preview';
    preview.textContent = this._getPreview(node, type);
    header.appendChild(preview);

    container.appendChild(header);

    // Children
    const children = document.createElement('div');
    children.className = 'jfp-children';

    const keys = type === 'array'
      ? node.map((_, i) => i)
      : (this.options.sortKeys ? Object.keys(node).sort() : Object.keys(node));

    keys.forEach((key, index) => {
      const childPath = [...path, key];
      const childNode = this._renderNode(node[key], childPath, depth + 1);

      // Add comma after each item except last
      if (index < keys.length - 1) {
        const comma = document.createElement('span');
        comma.className = 'jfp-comma';
        comma.textContent = ',';
        childNode.appendChild(comma);
      }

      children.appendChild(childNode);
    });

    container.appendChild(children);

    // Closing bracket
    const closeBracket = document.createElement('div');
    closeBracket.className = 'jfp-bracket jfp-close-bracket';
    closeBracket.textContent = type === 'array' ? ']' : '}';
    container.appendChild(closeBracket);

    // Set initial expand state
    const pathStr = this._formatPath(path);
    if (this.expandedPaths.has(pathStr) || depth < this.options.initialExpandLevel) {
      container.classList.add('jfp-expanded');
    }

    return container;
  }

  /**
   * Render primitive value
   */
  _renderPrimitiveNode(node, path, type) {
    const container = document.createElement('span');
    container.className = 'jfp-primitive';

    // Key (if not root)
    if (path.length > 0) {
      const key = path[path.length - 1];
      const keySpan = document.createElement('span');
      keySpan.className = 'jfp-key';
      keySpan.textContent = typeof key === 'number' && this.options.showArrayIndex
        ? `[${key}]`
        : `"${key}"`;
      keySpan.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleNodeClick(path, 'key');
      });
      container.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'jfp-colon';
      colon.textContent = ': ';
      container.appendChild(colon);
    }

    // Value
    const valueSpan = document.createElement('span');
    valueSpan.className = `jfp-value jfp-${type}`;

    if (type === 'string') {
      let displayValue = node;

      // Truncate long strings
      if (node.length > this.options.maxStringLength) {
        displayValue = node.substring(0, this.options.maxStringLength) + '...';
      }

      // Check for URL
      if (this.options.linkifyUrls && /^https?:\/\/[^\s]+$/.test(node)) {
        const link = document.createElement('a');
        link.href = node;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'jfp-link';
        link.textContent = `"${displayValue}"`;
        valueSpan.appendChild(link);
      } else {
        valueSpan.textContent = `"${displayValue}"`;
      }

      // Check for nested JSON
      try {
        if (node.startsWith('{') || node.startsWith('[')) {
          const parsed = JSON.parse(node);
          if (typeof parsed === 'object') {
            valueSpan.classList.add('jfp-nested-json');
            valueSpan.title = 'Click to expand nested JSON';
          }
        }
      } catch (e) {}

    } else if (type === 'null') {
      valueSpan.textContent = 'null';
    } else if (type === 'boolean') {
      valueSpan.textContent = node.toString();
    } else if (type === 'number') {
      valueSpan.textContent = node.toString();

      // Check for timestamp
      if (this._isTimestamp(node)) {
        const badge = document.createElement('span');
        badge.className = 'jfp-timestamp-badge';
        badge.textContent = new Date(node > 9999999999 ? node : node * 1000).toISOString();
        valueSpan.appendChild(badge);
      }
    } else {
      valueSpan.textContent = String(node);
    }

    // Data type badge
    if (this.options.showDataTypes) {
      const typeBadge = document.createElement('span');
      typeBadge.className = 'jfp-type-badge';
      typeBadge.textContent = type;
      valueSpan.appendChild(typeBadge);
    }

    valueSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      this._handleNodeClick(path, 'value', node);
    });

    container.appendChild(valueSpan);

    return container;
  }

  /**
   * Toggle expand/collapse
   */
  _toggleNode(container) {
    container.classList.toggle('jfp-expanded');

    const pathStr = container.closest('.jfp-node')?.dataset.path;
    if (pathStr) {
      if (container.classList.contains('jfp-expanded')) {
        this.expandedPaths.add(pathStr);
      } else {
        this.expandedPaths.delete(pathStr);
      }
    }
  }

  /**
   * Expand all nodes
   */
  expandAll() {
    this.container.querySelectorAll('.jfp-complex').forEach(node => {
      node.classList.add('jfp-expanded');
    });
  }

  /**
   * Collapse all nodes
   */
  collapseAll() {
    this.container.querySelectorAll('.jfp-complex').forEach(node => {
      node.classList.remove('jfp-expanded');
    });
    this.expandedPaths.clear();
  }

  /**
   * Expand to specific level
   */
  expandToLevel(level) {
    this.container.querySelectorAll('.jfp-node').forEach(node => {
      const depth = parseInt(node.dataset.depth || 0);
      const complex = node.querySelector(':scope > .jfp-complex');
      if (complex) {
        if (depth < level) {
          complex.classList.add('jfp-expanded');
        } else {
          complex.classList.remove('jfp-expanded');
        }
      }
    });
  }

  /**
   * Navigate to path
   */
  navigateToPath(path) {
    const pathStr = typeof path === 'string' ? path : this._formatPath(path);
    const node = this.container.querySelector(`[data-path="${CSS.escape(pathStr)}"]`);

    if (node) {
      // Expand all parent nodes
      let parent = node.parentElement;
      while (parent && parent !== this.container) {
        if (parent.classList.contains('jfp-complex')) {
          parent.classList.add('jfp-expanded');
        }
        parent = parent.parentElement;
      }

      // Scroll and highlight
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node.classList.add('jfp-highlight');
      setTimeout(() => node.classList.remove('jfp-highlight'), 2000);

      this.selectedPath = pathStr;
    }
  }

  /**
   * Search in tree
   */
  search(query, options = {}) {
    const {
      searchKeys = true,
      searchValues = true,
      caseSensitive = false
    } = options;

    // Clear previous highlights
    this.container.querySelectorAll('.jfp-search-match').forEach(el => {
      el.classList.remove('jfp-search-match');
    });

    if (!query) {
      this.searchResults = [];
      return [];
    }

    this.searchResults = [];
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    const checkMatch = (str) => {
      const compare = caseSensitive ? str : str.toLowerCase();
      return compare.includes(searchQuery);
    };

    const findMatches = (node, path) => {
      if (Array.isArray(node)) {
        node.forEach((item, i) => findMatches(item, [...path, i]));
      } else if (node !== null && typeof node === 'object') {
        Object.keys(node).forEach(key => {
          if (searchKeys && checkMatch(key)) {
            this.searchResults.push({ type: 'key', path: [...path, key] });
          }
          findMatches(node[key], [...path, key]);
        });
      } else {
        if (searchValues && checkMatch(String(node))) {
          this.searchResults.push({ type: 'value', path });
        }
      }
    };

    findMatches(this.data, []);

    // Highlight matches
    this.searchResults.forEach(result => {
      const pathStr = this._formatPath(result.path);
      const node = this.container.querySelector(`[data-path="${CSS.escape(pathStr)}"]`);
      if (node) {
        node.classList.add('jfp-search-match');
      }
    });

    this.currentSearchIndex = 0;
    if (this.searchResults.length > 0) {
      this.navigateToPath(this.searchResults[0].path);
    }

    return this.searchResults;
  }

  /**
   * Navigate to next search result
   */
  nextSearchResult() {
    if (this.searchResults.length === 0) return;

    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
    this.navigateToPath(this.searchResults[this.currentSearchIndex].path);
    return this.currentSearchIndex + 1;
  }

  /**
   * Navigate to previous search result
   */
  prevSearchResult() {
    if (this.searchResults.length === 0) return;

    this.currentSearchIndex = this.currentSearchIndex === 0
      ? this.searchResults.length - 1
      : this.currentSearchIndex - 1;
    this.navigateToPath(this.searchResults[this.currentSearchIndex].path);
    return this.currentSearchIndex + 1;
  }

  // ==================== Helpers ====================

  _getType(node) {
    if (node === null) return 'null';
    if (Array.isArray(node)) return 'array';
    return typeof node;
  }

  _formatPath(path) {
    if (path.length === 0) return '$';

    switch (this.options.pathFormat) {
      case 'jsonpath':
        return '$' + path.map(k =>
          typeof k === 'number' ? `[${k}]` :
          /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? `.${k}` : `["${k}"]`
        ).join('');

      case 'bracket':
        return path.map(k =>
          typeof k === 'number' ? `[${k}]` : `["${k}"]`
        ).join('');

      default: // dot
        return path.map((k, i) => {
          if (typeof k === 'number') return `[${k}]`;
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) return i === 0 ? k : `.${k}`;
          return `["${k}"]`;
        }).join('');
    }
  }

  _getPreview(node, type) {
    if (type === 'array') {
      if (node.length === 0) return '[]';
      const preview = node.slice(0, 3).map(item => {
        const t = this._getType(item);
        if (t === 'object') return '{...}';
        if (t === 'array') return '[...]';
        if (t === 'string') return `"${item.substring(0, 20)}${item.length > 20 ? '...' : ''}"`;
        return String(item);
      }).join(', ');
      return node.length > 3 ? `${preview}, ...` : preview;
    }

    if (type === 'object') {
      const keys = Object.keys(node);
      if (keys.length === 0) return '{}';
      const preview = keys.slice(0, 3).join(', ');
      return keys.length > 3 ? `${preview}, ...` : preview;
    }

    return '';
  }

  _isTimestamp(num) {
    const now = Date.now();
    const tenYears = 10 * 365 * 24 * 60 * 60 * 1000;

    // Check seconds
    if (num > (now - tenYears) / 1000 && num < (now + tenYears) / 1000) {
      return true;
    }

    // Check milliseconds
    if (num > (now - tenYears) && num < (now + tenYears)) {
      return true;
    }

    return false;
  }

  _handleNodeClick(path, type, value) {
    this.selectedPath = this._formatPath(path);

    if (this.options.onNodeClick) {
      this.options.onNodeClick({
        path: this.selectedPath,
        pathArray: path,
        type,
        value
      });
    }
  }

  _autoExpand(level) {
    this.expandToLevel(level);
  }

  /**
   * Update options
   */
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    if (this.data) {
      this.render(this.data);
    }
  }

  /**
   * Get current data
   */
  getData() {
    return this.data;
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    this.container.innerHTML = '';
    this.data = null;
    this.searchResults = [];
    this.expandedPaths.clear();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TreeView;
}
if (typeof window !== 'undefined') {
  window.TreeView = TreeView;
}
