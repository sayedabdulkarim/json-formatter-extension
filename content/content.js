/**
 * JSON Formatter Pro - Content Script
 * Auto-detect and format JSON on web pages
 */

(function() {
  'use strict';

  // Only run once
  if (window.__jsonFormatterProLoaded) return;
  window.__jsonFormatterProLoaded = true;

  const CONFIG = {
    maxSize: 10 * 1024 * 1024, // 10MB max
    minSize: 2, // Minimum {} or []
    initialExpandLevel: 2
  };

  class ContentFormatter {
    constructor() {
      this.isJsonPage = false;
      this.jsonData = null;
      this.originalContent = null;
      this.formatted = false;
      this.theme = 'dracula';

      this.init();
    }

    init() {
      // Check if this is a JSON response
      if (this.detectJsonPage()) {
        this.isJsonPage = true;
        this.formatPage();
      }
    }

    detectJsonPage() {
      // Check content type header (set by extension background)
      const contentType = document.contentType || '';
      if (contentType.includes('application/json') || contentType.includes('text/json')) {
        return true;
      }

      // Check if page is plain text with JSON content
      const body = document.body;
      if (!body) return false;

      // Check for pre tag (raw JSON often displayed in pre)
      const pre = body.querySelector('pre');
      const content = pre ? pre.textContent : body.textContent;

      if (!content || content.length < CONFIG.minSize || content.length > CONFIG.maxSize) {
        return false;
      }

      // Quick check for JSON-like content
      const trimmed = content.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return false;
      }

      // Try to parse
      try {
        this.jsonData = JSON.parse(trimmed);
        this.originalContent = trimmed;
        return true;
      } catch (e) {
        // Try JSONP detection
        return this.detectJsonp(trimmed);
      }
    }

    detectJsonp(content) {
      // Match JSONP pattern: callback({...}) or callback([...])
      const jsonpMatch = content.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(\s*([\s\S]*)\s*\);?\s*$/);
      if (jsonpMatch) {
        try {
          this.jsonData = JSON.parse(jsonpMatch[1]);
          this.originalContent = jsonpMatch[1];
          return true;
        } catch (e) {}
      }
      return false;
    }

    formatPage() {
      if (!this.jsonData) return;

      // Save original content
      this.originalContent = document.body.innerHTML;

      // Create formatted view
      document.body.innerHTML = '';
      document.body.className = 'jfp-formatted-page';

      // Add styles
      this.injectStyles();

      // Create container
      const container = document.createElement('div');
      container.id = 'jfp-container';
      container.className = 'jfp-page-container';

      // Toolbar
      container.appendChild(this.createToolbar());

      // Tree view container
      const treeContainer = document.createElement('div');
      treeContainer.id = 'jfp-tree';
      treeContainer.className = 'jfp-tree-view';
      container.appendChild(treeContainer);

      // Raw view container
      const rawContainer = document.createElement('div');
      rawContainer.id = 'jfp-raw';
      rawContainer.className = 'jfp-raw-view';
      rawContainer.style.display = 'none';
      container.appendChild(rawContainer);

      document.body.appendChild(container);

      // Render tree view
      this.renderTree(this.jsonData, treeContainer);
      this.renderRaw(this.jsonData, rawContainer);

      this.formatted = true;
    }

    createToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'jfp-toolbar';

      toolbar.innerHTML = `
        <div class="jfp-toolbar-left">
          <span class="jfp-logo">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M5 3h2v2H5v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3h2z"/>
            </svg>
            JSON Formatter Pro
          </span>
        </div>
        <div class="jfp-toolbar-center">
          <button class="jfp-btn active" data-view="tree">Tree</button>
          <button class="jfp-btn" data-view="raw">Raw</button>
        </div>
        <div class="jfp-toolbar-right">
          <button class="jfp-btn" id="jfp-expand-all" title="Expand All">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 18.17L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83z"/></svg>
          </button>
          <button class="jfp-btn" id="jfp-collapse-all" title="Collapse All">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59m9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/></svg>
          </button>
          <button class="jfp-btn" id="jfp-copy" title="Copy to Clipboard">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/></svg>
          </button>
          <button class="jfp-btn" id="jfp-download" title="Download JSON">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7z"/></svg>
          </button>
          <button class="jfp-btn" id="jfp-raw-view" title="View Raw">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m4 18H6V4h7v5h5v11z"/></svg>
          </button>
        </div>
      `;

      // Bind events
      toolbar.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
      });

      toolbar.querySelector('#jfp-expand-all').addEventListener('click', () => this.expandAll());
      toolbar.querySelector('#jfp-collapse-all').addEventListener('click', () => this.collapseAll());
      toolbar.querySelector('#jfp-copy').addEventListener('click', () => this.copyToClipboard());
      toolbar.querySelector('#jfp-download').addEventListener('click', () => this.downloadJson());

      return toolbar;
    }

    switchView(view) {
      const treeView = document.getElementById('jfp-tree');
      const rawView = document.getElementById('jfp-raw');
      const buttons = document.querySelectorAll('[data-view]');

      buttons.forEach(btn => btn.classList.remove('active'));
      document.querySelector(`[data-view="${view}"]`).classList.add('active');

      if (view === 'tree') {
        treeView.style.display = 'block';
        rawView.style.display = 'none';
      } else {
        treeView.style.display = 'none';
        rawView.style.display = 'block';
      }
    }

    renderTree(data, container, path = [], level = 0) {
      const type = this.getType(data);

      if (type === 'object' || type === 'array') {
        const node = document.createElement('div');
        node.className = 'jfp-node jfp-complex';
        if (level < CONFIG.initialExpandLevel) {
          node.classList.add('jfp-expanded');
        }

        const header = document.createElement('div');
        header.className = 'jfp-header';

        // Toggle
        const toggle = document.createElement('span');
        toggle.className = 'jfp-toggle';
        toggle.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          node.classList.toggle('jfp-expanded');
        });
        header.appendChild(toggle);

        // Key (if has parent)
        if (path.length > 0) {
          const key = path[path.length - 1];
          const keySpan = document.createElement('span');
          keySpan.className = 'jfp-key';
          keySpan.textContent = typeof key === 'number' ? `${key}` : `"${key}"`;
          header.appendChild(keySpan);

          const colon = document.createElement('span');
          colon.className = 'jfp-colon';
          colon.textContent = ': ';
          header.appendChild(colon);
        }

        // Opening bracket
        const bracket = document.createElement('span');
        bracket.className = 'jfp-bracket';
        bracket.textContent = type === 'array' ? '[' : '{';
        header.appendChild(bracket);

        // Count
        const count = document.createElement('span');
        count.className = 'jfp-count';
        const len = type === 'array' ? data.length : Object.keys(data).length;
        count.textContent = ` ${len} ${len === 1 ? 'item' : 'items'}`;
        header.appendChild(count);

        node.appendChild(header);

        // Children
        const children = document.createElement('div');
        children.className = 'jfp-children';

        const keys = type === 'array' ? data.map((_, i) => i) : Object.keys(data);
        keys.forEach((key, index) => {
          const childPath = [...path, key];
          const childWrapper = document.createElement('div');
          childWrapper.className = 'jfp-child';

          this.renderTree(data[key], childWrapper, childPath, level + 1);

          // Comma
          if (index < keys.length - 1) {
            const comma = document.createElement('span');
            comma.className = 'jfp-comma';
            comma.textContent = ',';
            childWrapper.appendChild(comma);
          }

          children.appendChild(childWrapper);
        });

        node.appendChild(children);

        // Closing bracket
        const closeBracket = document.createElement('span');
        closeBracket.className = 'jfp-bracket jfp-close';
        closeBracket.textContent = type === 'array' ? ']' : '}';
        node.appendChild(closeBracket);

        container.appendChild(node);
      } else {
        // Primitive
        const node = document.createElement('span');
        node.className = 'jfp-primitive';

        if (path.length > 0) {
          const key = path[path.length - 1];
          const keySpan = document.createElement('span');
          keySpan.className = 'jfp-key';
          keySpan.textContent = typeof key === 'number' ? `${key}` : `"${key}"`;
          node.appendChild(keySpan);

          const colon = document.createElement('span');
          colon.className = 'jfp-colon';
          colon.textContent = ': ';
          node.appendChild(colon);
        }

        const valueSpan = document.createElement('span');
        valueSpan.className = `jfp-value jfp-${type}`;

        if (type === 'string') {
          // Check for URL
          if (/^https?:\/\/[^\s]+$/.test(data)) {
            const link = document.createElement('a');
            link.href = data;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `"${data}"`;
            link.className = 'jfp-link';
            valueSpan.appendChild(link);
          } else {
            valueSpan.textContent = `"${data}"`;
          }
        } else if (data === null) {
          valueSpan.textContent = 'null';
        } else {
          valueSpan.textContent = String(data);
        }

        node.appendChild(valueSpan);
        container.appendChild(node);
      }
    }

    renderRaw(data, container) {
      const formatted = JSON.stringify(data, null, 2);
      const lines = formatted.split('\n');

      container.innerHTML = lines.map((line, i) =>
        `<div class="jfp-line"><span class="jfp-line-num">${i + 1}</span><span class="jfp-line-content">${this.escapeHtml(line)}</span></div>`
      ).join('');
    }

    expandAll() {
      document.querySelectorAll('.jfp-node.jfp-complex').forEach(node => {
        node.classList.add('jfp-expanded');
      });
    }

    collapseAll() {
      document.querySelectorAll('.jfp-node.jfp-complex').forEach(node => {
        node.classList.remove('jfp-expanded');
      });
    }

    copyToClipboard() {
      const formatted = JSON.stringify(this.jsonData, null, 2);
      navigator.clipboard.writeText(formatted).then(() => {
        this.showToast('Copied to clipboard!');
      });
    }

    downloadJson() {
      const formatted = JSON.stringify(this.jsonData, null, 2);
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = this.getFileName();
      a.click();

      URL.revokeObjectURL(url);
      this.showToast('Downloaded!');
    }

    getFileName() {
      // Try to get filename from URL
      const url = window.location.pathname;
      const match = url.match(/([^/]+)\.json$/i);
      if (match) return match[1] + '.json';
      return 'data.json';
    }

    showToast(message) {
      const toast = document.createElement('div');
      toast.className = 'jfp-toast';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }

    getType(value) {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    }

    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        body.jfp-formatted-page {
          margin: 0;
          padding: 0;
          background: #1e1e2e;
          color: #cdd6f4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .jfp-page-container {
          min-height: 100vh;
        }

        .jfp-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #181825;
          border-bottom: 1px solid #313244;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .jfp-toolbar-left,
        .jfp-toolbar-center,
        .jfp-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .jfp-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #89b4fa;
        }

        .jfp-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          border-radius: 4px;
          background: #313244;
          color: #cdd6f4;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .jfp-btn:hover {
          background: #45475a;
        }

        .jfp-btn.active {
          background: #89b4fa;
          color: #1e1e2e;
        }

        .jfp-tree-view,
        .jfp-raw-view {
          padding: 16px;
          font-family: 'SF Mono', 'Fira Code', Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        .jfp-node {
          margin-left: 0;
        }

        .jfp-complex > .jfp-children {
          display: none;
          margin-left: 20px;
          padding-left: 16px;
          border-left: 1px dashed #45475a;
        }

        .jfp-complex.jfp-expanded > .jfp-children {
          display: block;
        }

        .jfp-complex > .jfp-close {
          display: none;
        }

        .jfp-complex.jfp-expanded > .jfp-close {
          display: inline;
        }

        .jfp-complex > .jfp-header > .jfp-count {
          display: inline;
        }

        .jfp-complex.jfp-expanded > .jfp-header > .jfp-count {
          display: none;
        }

        .jfp-header {
          cursor: pointer;
        }

        .jfp-header:hover {
          opacity: 0.8;
        }

        .jfp-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          margin-right: 4px;
          transition: transform 0.15s ease;
          color: #89b4fa;
        }

        .jfp-complex.jfp-expanded > .jfp-header > .jfp-toggle {
          transform: rotate(90deg);
        }

        .jfp-key { color: #89b4fa; }
        .jfp-colon { color: #cdd6f4; }
        .jfp-bracket { color: #cdd6f4; }
        .jfp-count { color: #6c7086; font-size: 0.9em; margin-left: 8px; }
        .jfp-comma { color: #6c7086; }

        .jfp-value.jfp-string { color: #a6e3a1; }
        .jfp-value.jfp-number { color: #fab387; }
        .jfp-value.jfp-boolean { color: #cba6f7; }
        .jfp-value.jfp-null { color: #6c7086; font-style: italic; }

        .jfp-link {
          color: #89b4fa;
          text-decoration: underline;
        }

        .jfp-link:hover {
          opacity: 0.8;
        }

        .jfp-child {
          margin: 2px 0;
        }

        .jfp-raw-view .jfp-line {
          display: flex;
        }

        .jfp-line-num {
          width: 40px;
          text-align: right;
          padding-right: 16px;
          color: #6c7086;
          user-select: none;
        }

        .jfp-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          background: #a6e3a1;
          color: #1e1e2e;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.2s ease;
          z-index: 10000;
        }

        .jfp-toast.show {
          opacity: 1;
          transform: translateY(0);
        }

        /* Light theme support */
        @media (prefers-color-scheme: light) {
          body.jfp-formatted-page {
            background: #ffffff;
            color: #1e1e2e;
          }

          .jfp-toolbar {
            background: #f5f5f5;
            border-color: #e0e0e0;
          }

          .jfp-btn {
            background: #e0e0e0;
            color: #1e1e2e;
          }

          .jfp-btn:hover {
            background: #d0d0d0;
          }

          .jfp-complex > .jfp-children {
            border-color: #d0d0d0;
          }

          .jfp-key { color: #1e66f5; }
          .jfp-value.jfp-string { color: #40a02b; }
          .jfp-value.jfp-number { color: #fe640b; }
          .jfp-value.jfp-boolean { color: #8839ef; }
          .jfp-value.jfp-null { color: #9ca0b0; }
          .jfp-count { color: #9ca0b0; }
          .jfp-comma { color: #9ca0b0; }
          .jfp-line-num { color: #9ca0b0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Initialize
  new ContentFormatter();
})();
