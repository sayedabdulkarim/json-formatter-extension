/**
 * JSON Formatter Pro - Core JSON Engine
 * Handles parsing, formatting, validation, and manipulation
 */

class JsonEngine {
  constructor() {
    this.lastError = null;
    this.stats = null;
  }

  /**
   * Parse JSON string with detailed error handling
   */
  parse(jsonString) {
    this.lastError = null;
    try {
      // Try standard JSON first
      const result = JSON.parse(jsonString);
      return { success: true, data: result, error: null };
    } catch (e) {
      // Try to fix common issues
      const fixed = this.tryFix(jsonString);
      if (fixed.success) {
        return fixed;
      }

      // Parse error details
      const errorInfo = this.parseError(e, jsonString);
      this.lastError = errorInfo;
      return { success: false, data: null, error: errorInfo };
    }
  }

  /**
   * Try to fix common JSON issues
   */
  tryFix(jsonString) {
    const fixes = [
      // Remove trailing commas
      (s) => s.replace(/,(\s*[}\]])/g, '$1'),
      // Add missing quotes to keys
      (s) => s.replace(/(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
      // Replace single quotes with double quotes
      (s) => s.replace(/'/g, '"'),
      // Handle undefined as null
      (s) => s.replace(/:\s*undefined/g, ': null'),
      // Remove comments (single line)
      (s) => s.replace(/\/\/.*$/gm, ''),
      // Remove comments (multi line)
      (s) => s.replace(/\/\*[\s\S]*?\*\//g, ''),
    ];

    let current = jsonString;
    for (const fix of fixes) {
      try {
        current = fix(current);
        const result = JSON.parse(current);
        return { success: true, data: result, error: null, fixed: true };
      } catch (e) {
        // Continue trying
      }
    }

    return { success: false };
  }

  /**
   * Parse JSON error to get line and column
   */
  parseError(error, jsonString) {
    const message = error.message;
    let line = 1;
    let column = 1;
    let position = 0;

    // Try to extract position from error message
    const posMatch = message.match(/position\s+(\d+)/i);
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

    if (lineColMatch) {
      line = parseInt(lineColMatch[1]);
      column = parseInt(lineColMatch[2]);
    } else if (posMatch) {
      position = parseInt(posMatch[1]);
      // Convert position to line and column
      const lines = jsonString.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    // Get context around error
    const lines = jsonString.split('\n');
    const contextStart = Math.max(0, line - 3);
    const contextEnd = Math.min(lines.length, line + 2);
    const context = lines.slice(contextStart, contextEnd).map((l, i) => ({
      lineNumber: contextStart + i + 1,
      content: l,
      isError: contextStart + i + 1 === line
    }));

    return {
      message: message,
      line: line,
      column: column,
      position: position,
      context: context
    };
  }

  /**
   * Format JSON with options
   */
  format(data, options = {}) {
    const {
      indent = 2,
      sortKeys = false,
      quoteStyle = 'double'
    } = options;

    let obj = typeof data === 'string' ? JSON.parse(data) : data;

    if (sortKeys) {
      obj = this.sortObjectKeys(obj);
    }

    const indentStr = typeof indent === 'number' ? ' '.repeat(indent) : indent;
    return JSON.stringify(obj, null, indentStr);
  }

  /**
   * Minify JSON
   */
  minify(data) {
    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    return JSON.stringify(obj);
  }

  /**
   * Sort object keys recursively
   */
  sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = this.sortObjectKeys(obj[key]);
          return sorted;
        }, {});
    }
    return obj;
  }

  /**
   * Get value at JSONPath
   */
  getPath(data, path) {
    if (!path || path === '$') return data;

    const parts = this.parsePath(path);
    let current = data;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Parse JSONPath or dot notation to parts
   */
  parsePath(path) {
    // Handle JSONPath ($.) or dot notation
    let cleanPath = path.replace(/^\$\.?/, '');

    const parts = [];
    let current = '';
    let inBracket = false;
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < cleanPath.length; i++) {
      const char = cleanPath[i];

      if (inQuote) {
        if (char === quoteChar) {
          inQuote = false;
        } else {
          current += char;
        }
      } else if (char === '"' || char === "'") {
        inQuote = true;
        quoteChar = char;
      } else if (char === '[') {
        if (current) {
          parts.push(current);
          current = '';
        }
        inBracket = true;
      } else if (char === ']') {
        if (current) {
          // Check if it's a number
          parts.push(/^\d+$/.test(current) ? parseInt(current) : current);
          current = '';
        }
        inBracket = false;
      } else if (char === '.' && !inBracket) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Generate path for a node
   */
  generatePath(keys, format = 'dot') {
    if (format === 'jsonpath') {
      return '$' + keys.map(k =>
        typeof k === 'number' ? `[${k}]` :
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? `.${k}` : `["${k}"]`
      ).join('');
    }

    if (format === 'bracket') {
      return keys.map(k =>
        typeof k === 'number' ? `[${k}]` : `["${k}"]`
      ).join('');
    }

    // Dot notation
    return keys.map((k, i) => {
      if (typeof k === 'number') {
        return `[${k}]`;
      }
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) {
        return i === 0 ? k : `.${k}`;
      }
      return `["${k}"]`;
    }).join('');
  }

  /**
   * Calculate JSON statistics
   */
  getStats(data) {
    const stats = {
      totalKeys: 0,
      totalValues: 0,
      maxDepth: 0,
      types: {
        objects: 0,
        arrays: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0
      },
      arrayLengths: [],
      stringLengths: [],
      size: {
        formatted: 0,
        minified: 0
      }
    };

    this._analyzeNode(data, stats, 0);

    // Calculate sizes
    stats.size.formatted = new Blob([this.format(data)]).size;
    stats.size.minified = new Blob([this.minify(data)]).size;

    return stats;
  }

  _analyzeNode(node, stats, depth) {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (node === null) {
      stats.types.nulls++;
      stats.totalValues++;
    } else if (Array.isArray(node)) {
      stats.types.arrays++;
      stats.arrayLengths.push(node.length);
      node.forEach(item => this._analyzeNode(item, stats, depth + 1));
    } else if (typeof node === 'object') {
      stats.types.objects++;
      const keys = Object.keys(node);
      stats.totalKeys += keys.length;
      keys.forEach(key => this._analyzeNode(node[key], stats, depth + 1));
    } else if (typeof node === 'string') {
      stats.types.strings++;
      stats.stringLengths.push(node.length);
      stats.totalValues++;
    } else if (typeof node === 'number') {
      stats.types.numbers++;
      stats.totalValues++;
    } else if (typeof node === 'boolean') {
      stats.types.booleans++;
      stats.totalValues++;
    }
  }

  /**
   * Detect and format timestamps
   */
  detectTimestamps(data, path = []) {
    const timestamps = [];

    const check = (node, currentPath) => {
      if (typeof node === 'number') {
        // Check if it looks like a Unix timestamp
        const now = Date.now();
        const tenYearsAgo = now - (10 * 365 * 24 * 60 * 60 * 1000);
        const tenYearsFromNow = now + (10 * 365 * 24 * 60 * 60 * 1000);

        // Seconds
        if (node > tenYearsAgo / 1000 && node < tenYearsFromNow / 1000) {
          timestamps.push({
            path: this.generatePath(currentPath),
            value: node,
            type: 'unix_seconds',
            formatted: new Date(node * 1000).toISOString()
          });
        }
        // Milliseconds
        else if (node > tenYearsAgo && node < tenYearsFromNow) {
          timestamps.push({
            path: this.generatePath(currentPath),
            value: node,
            type: 'unix_ms',
            formatted: new Date(node).toISOString()
          });
        }
      } else if (typeof node === 'string') {
        // Check ISO date strings
        const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?)?$/;
        if (isoRegex.test(node)) {
          const date = new Date(node);
          if (!isNaN(date.getTime())) {
            timestamps.push({
              path: this.generatePath(currentPath),
              value: node,
              type: 'iso_string',
              formatted: date.toLocaleString()
            });
          }
        }
      } else if (Array.isArray(node)) {
        node.forEach((item, i) => check(item, [...currentPath, i]));
      } else if (node !== null && typeof node === 'object') {
        Object.keys(node).forEach(key => check(node[key], [...currentPath, key]));
      }
    };

    check(data, path);
    return timestamps;
  }

  /**
   * Search in JSON
   */
  search(data, query, options = {}) {
    const {
      searchKeys = true,
      searchValues = true,
      caseSensitive = false,
      useRegex = false
    } = options;

    const results = [];
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    let regex = null;

    if (useRegex) {
      try {
        regex = new RegExp(query, caseSensitive ? '' : 'i');
      } catch (e) {
        return { error: 'Invalid regex pattern' };
      }
    }

    const matches = (value) => {
      const str = String(value);
      const compareStr = caseSensitive ? str : str.toLowerCase();

      if (regex) {
        return regex.test(str);
      }
      return compareStr.includes(searchQuery);
    };

    const searchNode = (node, path) => {
      if (Array.isArray(node)) {
        node.forEach((item, i) => searchNode(item, [...path, i]));
      } else if (node !== null && typeof node === 'object') {
        Object.keys(node).forEach(key => {
          if (searchKeys && matches(key)) {
            results.push({
              type: 'key',
              path: this.generatePath([...path, key]),
              match: key,
              value: node[key]
            });
          }
          searchNode(node[key], [...path, key]);
        });
      } else {
        if (searchValues && matches(node)) {
          results.push({
            type: 'value',
            path: this.generatePath(path),
            match: node,
            value: node
          });
        }
      }
    };

    searchNode(data, []);
    return results;
  }

  /**
   * Filter by type
   */
  filterByType(data, types) {
    const results = [];

    const checkNode = (node, path) => {
      let nodeType = null;

      if (node === null) nodeType = 'null';
      else if (Array.isArray(node)) nodeType = 'array';
      else if (typeof node === 'object') nodeType = 'object';
      else if (typeof node === 'string') nodeType = 'string';
      else if (typeof node === 'number') nodeType = 'number';
      else if (typeof node === 'boolean') nodeType = 'boolean';

      if (types.includes(nodeType)) {
        results.push({
          type: nodeType,
          path: this.generatePath(path),
          value: node
        });
      }

      if (Array.isArray(node)) {
        node.forEach((item, i) => checkNode(item, [...path, i]));
      } else if (node !== null && typeof node === 'object') {
        Object.keys(node).forEach(key => checkNode(node[key], [...path, key]));
      }
    };

    checkNode(data, []);
    return results;
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JsonEngine;
}
if (typeof window !== 'undefined') {
  window.JsonEngine = JsonEngine;
}
