/**
 * JSON Formatter Pro - Format Converters
 * Convert JSON to/from YAML, XML, CSV, TypeScript, Query String
 */

class JsonConverters {
  // ==================== JSON to YAML ====================
  static toYAML(data, indent = 2) {
    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    return this._toYAMLNode(obj, 0, indent);
  }

  static _toYAMLNode(node, level, indent) {
    const indentStr = ' '.repeat(level * indent);
    const nextIndent = ' '.repeat((level + 1) * indent);

    if (node === null) return 'null';
    if (node === undefined) return 'null';

    if (Array.isArray(node)) {
      if (node.length === 0) return '[]';
      return node.map(item => {
        const value = this._toYAMLNode(item, level + 1, indent);
        if (typeof item === 'object' && item !== null) {
          return `\n${indentStr}- ${value.trim()}`;
        }
        return `\n${indentStr}- ${value}`;
      }).join('');
    }

    if (typeof node === 'object') {
      const keys = Object.keys(node);
      if (keys.length === 0) return '{}';
      return keys.map(key => {
        const value = node[key];
        const yamlValue = this._toYAMLNode(value, level + 1, indent);

        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          return `${level > 0 ? '\n' + indentStr : ''}${this._yamlKey(key)}:${yamlValue}`;
        }
        return `${level > 0 ? '\n' + indentStr : ''}${this._yamlKey(key)}: ${yamlValue}`;
      }).join('');
    }

    if (typeof node === 'string') {
      if (node.includes('\n')) {
        return `|\n${node.split('\n').map(line => nextIndent + line).join('\n')}`;
      }
      if (/[:#\[\]{}&*?|<>=!%@`]/.test(node) || node === '' || /^\s|\s$/.test(node)) {
        return JSON.stringify(node);
      }
      return node;
    }

    if (typeof node === 'boolean') return node ? 'true' : 'false';
    if (typeof node === 'number') return String(node);

    return String(node);
  }

  static _yamlKey(key) {
    if (/[:#\[\]{}&*?|<>=!%@`\s]/.test(key) || key === '') {
      return JSON.stringify(key);
    }
    return key;
  }

  // ==================== YAML to JSON ====================
  static fromYAML(yaml) {
    const lines = yaml.split('\n');
    const result = this._parseYAMLLines(lines, 0, 0);
    return result.value;
  }

  static _parseYAMLLines(lines, start, baseIndent) {
    let i = start;
    let result = null;
    let isArray = false;

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) {
        i++;
        continue;
      }

      const indent = line.search(/\S/);
      if (indent < baseIndent && i > start) {
        break;
      }

      const trimmed = line.trim();

      // Array item
      if (trimmed.startsWith('- ')) {
        if (!isArray) {
          result = [];
          isArray = true;
        }
        const value = trimmed.substring(2).trim();
        if (value.includes(':')) {
          const nested = this._parseYAMLLines(lines, i, indent + 2);
          result.push(nested.value);
          i = nested.nextIndex;
        } else {
          result.push(this._parseYAMLValue(value));
          i++;
        }
        continue;
      }

      // Key-value
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        if (result === null) result = {};

        const key = trimmed.substring(0, colonIndex).trim().replace(/^["']|["']$/g, '');
        const valueStr = trimmed.substring(colonIndex + 1).trim();

        if (valueStr === '' || valueStr === '|' || valueStr === '>') {
          // Nested object or multiline
          const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
          const nextIndent = nextLine.search(/\S/);

          if (nextIndent > indent) {
            const nested = this._parseYAMLLines(lines, i + 1, nextIndent);
            result[key] = nested.value;
            i = nested.nextIndex;
          } else {
            result[key] = null;
            i++;
          }
        } else {
          result[key] = this._parseYAMLValue(valueStr);
          i++;
        }
        continue;
      }

      i++;
    }

    return { value: result, nextIndex: i };
  }

  static _parseYAMLValue(str) {
    if (str === 'null' || str === '~') return null;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (/^-?\d+$/.test(str)) return parseInt(str);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    if ((str.startsWith('"') && str.endsWith('"')) ||
        (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    return str;
  }

  // ==================== JSON to XML ====================
  static toXML(data, options = {}) {
    const {
      rootName = 'root',
      indent = 2,
      declaration = true,
      arrayItemName = 'item'
    } = options;

    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    let xml = declaration ? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';
    xml += this._toXMLNode(obj, rootName, 0, indent, arrayItemName);
    return xml;
  }

  static _toXMLNode(node, name, level, indent, arrayItemName) {
    const indentStr = ' '.repeat(level * indent);

    if (node === null || node === undefined) {
      return `${indentStr}<${name} />\n`;
    }

    if (Array.isArray(node)) {
      return node.map(item =>
        this._toXMLNode(item, arrayItemName, level, indent, arrayItemName)
      ).join('');
    }

    if (typeof node === 'object') {
      const keys = Object.keys(node);
      if (keys.length === 0) {
        return `${indentStr}<${name} />\n`;
      }

      let children = '';
      for (const key of keys) {
        children += this._toXMLNode(node[key], this._xmlSafeName(key), level + 1, indent, arrayItemName);
      }
      return `${indentStr}<${name}>\n${children}${indentStr}</${name}>\n`;
    }

    const escaped = this._escapeXML(String(node));
    return `${indentStr}<${name}>${escaped}</${name}>\n`;
  }

  static _xmlSafeName(name) {
    // XML element names can't start with numbers
    let safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (/^[0-9]/.test(safe)) {
      safe = '_' + safe;
    }
    return safe;
  }

  static _escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ==================== XML to JSON ====================
  static fromXML(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      throw new Error('Invalid XML: ' + errorNode.textContent);
    }

    return this._xmlNodeToJson(doc.documentElement);
  }

  static _xmlNodeToJson(node) {
    const result = {};

    // Attributes
    if (node.attributes && node.attributes.length > 0) {
      result['@attributes'] = {};
      for (const attr of node.attributes) {
        result['@attributes'][attr.name] = attr.value;
      }
    }

    // Child nodes
    const children = {};
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) {
          if (node.childNodes.length === 1) {
            return this._parseXMLValue(text);
          }
          result['#text'] = text;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childResult = this._xmlNodeToJson(child);
        if (children[child.nodeName]) {
          if (!Array.isArray(children[child.nodeName])) {
            children[child.nodeName] = [children[child.nodeName]];
          }
          children[child.nodeName].push(childResult);
        } else {
          children[child.nodeName] = childResult;
        }
      }
    }

    Object.assign(result, children);

    return Object.keys(result).length === 0 ? null : result;
  }

  static _parseXMLValue(str) {
    if (str === 'null') return null;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (/^-?\d+$/.test(str)) return parseInt(str);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    return str;
  }

  // ==================== JSON to CSV ====================
  static toCSV(data, options = {}) {
    const {
      delimiter = ',',
      includeHeaders = true,
      flattenNested = true
    } = options;

    const arr = typeof data === 'string' ? JSON.parse(data) : data;

    if (!Array.isArray(arr)) {
      throw new Error('CSV conversion requires an array of objects');
    }

    if (arr.length === 0) return '';

    // Flatten and collect all keys
    const flattenedRows = arr.map(row => flattenNested ? this._flattenObject(row) : row);
    const allKeys = [...new Set(flattenedRows.flatMap(row => Object.keys(row)))];

    const lines = [];

    if (includeHeaders) {
      lines.push(allKeys.map(k => this._escapeCSV(k, delimiter)).join(delimiter));
    }

    for (const row of flattenedRows) {
      const values = allKeys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return this._escapeCSV(JSON.stringify(value), delimiter);
        return this._escapeCSV(String(value), delimiter);
      });
      lines.push(values.join(delimiter));
    }

    return lines.join('\n');
  }

  static _flattenObject(obj, prefix = '', result = {}) {
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        this._flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }

  static _escapeCSV(str, delimiter) {
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  // ==================== CSV to JSON ====================
  static fromCSV(csv, options = {}) {
    const {
      delimiter = ',',
      hasHeaders = true
    } = options;

    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const parseRow = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
          if (char === '"' && line[i + 1] === '"') {
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === delimiter) {
            values.push(this._parseCSVValue(current));
            current = '';
          } else {
            current += char;
          }
        }
      }
      values.push(this._parseCSVValue(current));
      return values;
    };

    const headers = hasHeaders ? parseRow(lines[0]) : null;
    const dataLines = hasHeaders ? lines.slice(1) : lines;

    return dataLines.map((line, index) => {
      const values = parseRow(line);
      if (headers) {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      }
      return values;
    });
  }

  static _parseCSVValue(str) {
    const trimmed = str.trim();
    if (trimmed === '') return null;
    if (trimmed === 'null') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed);
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    return trimmed;
  }

  // ==================== JSON to TypeScript ====================
  static toTypeScript(data, options = {}) {
    const {
      rootName = 'RootObject',
      exportTypes = true,
      useInterfaces = true
    } = options;

    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    const types = new Map();

    this._generateTSType(obj, rootName, types);

    let result = '';
    for (const [name, definition] of types) {
      const keyword = useInterfaces ? 'interface' : 'type';
      const prefix = exportTypes ? 'export ' : '';
      const equals = useInterfaces ? '' : ' =';
      result += `${prefix}${keyword} ${name}${equals} {\n${definition}}\n\n`;
    }

    return result.trim();
  }

  static _generateTSType(node, name, types, level = 0) {
    if (node === null) return 'null';
    if (typeof node === 'undefined') return 'undefined';
    if (typeof node === 'boolean') return 'boolean';
    if (typeof node === 'number') return Number.isInteger(node) ? 'number' : 'number';
    if (typeof node === 'string') return 'string';

    if (Array.isArray(node)) {
      if (node.length === 0) return 'unknown[]';

      const itemTypes = new Set();
      const objectExamples = [];

      for (const item of node) {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          objectExamples.push(item);
        } else {
          itemTypes.add(this._generateTSType(item, name, types, level));
        }
      }

      if (objectExamples.length > 0) {
        // Merge object properties from all examples
        const merged = this._mergeObjectsForType(objectExamples);
        const itemTypeName = name + 'Item';
        this._generateTSType(merged, itemTypeName, types, level);
        itemTypes.add(itemTypeName);
      }

      const typeArray = [...itemTypes];
      if (typeArray.length === 1) {
        return `${typeArray[0]}[]`;
      }
      return `(${typeArray.join(' | ')})[]`;
    }

    if (typeof node === 'object') {
      const props = [];
      for (const key of Object.keys(node)) {
        const value = node[key];
        const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        const isOptional = value === null || value === undefined;
        const propType = this._generateTSType(
          value,
          this._capitalize(key),
          types,
          level + 1
        );
        props.push(`  ${safeName}${isOptional ? '?' : ''}: ${propType};`);
      }

      if (level === 0) {
        types.set(name, props.join('\n') + '\n');
        return name;
      }

      // Inline for nested
      return `{\n${props.join('\n')}\n${'  '.repeat(level)}}`;
    }

    return 'unknown';
  }

  static _mergeObjectsForType(objects) {
    const result = {};
    for (const obj of objects) {
      for (const key of Object.keys(obj)) {
        if (!(key in result)) {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }

  static _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, '');
  }

  // ==================== JSON to Query String ====================
  static toQueryString(data, options = {}) {
    const { encode = true, arrayFormat = 'brackets' } = options;
    const obj = typeof data === 'string' ? JSON.parse(data) : data;

    const params = [];
    this._buildQueryString(obj, '', params, arrayFormat);

    return params.map(([key, value]) => {
      const k = encode ? encodeURIComponent(key) : key;
      const v = encode ? encodeURIComponent(String(value)) : String(value);
      return `${k}=${v}`;
    }).join('&');
  }

  static _buildQueryString(obj, prefix, params, arrayFormat) {
    if (obj === null || obj === undefined) return;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        let key;
        if (arrayFormat === 'brackets') {
          key = `${prefix}[]`;
        } else if (arrayFormat === 'index') {
          key = `${prefix}[${index}]`;
        } else {
          key = prefix;
        }
        this._buildQueryString(item, key, params, arrayFormat);
      });
    } else if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        const newPrefix = prefix ? `${prefix}[${key}]` : key;
        this._buildQueryString(obj[key], newPrefix, params, arrayFormat);
      }
    } else {
      params.push([prefix, obj]);
    }
  }

  // ==================== Query String to JSON ====================
  static fromQueryString(queryString) {
    const result = {};
    const params = queryString.replace(/^\?/, '').split('&');

    for (const param of params) {
      if (!param) continue;

      const [rawKey, rawValue] = param.split('=');
      const key = decodeURIComponent(rawKey);
      const value = rawValue ? decodeURIComponent(rawValue) : '';

      this._setQueryValue(result, key, this._parseCSVValue(value));
    }

    return result;
  }

  static _setQueryValue(obj, key, value) {
    const match = key.match(/^([^[]+)(\[.*\])?$/);
    if (!match) return;

    const base = match[1];
    const rest = match[2];

    if (!rest) {
      obj[base] = value;
      return;
    }

    if (rest === '[]') {
      if (!Array.isArray(obj[base])) obj[base] = [];
      obj[base].push(value);
      return;
    }

    const indexMatch = rest.match(/^\[(\d+)\]$/);
    if (indexMatch) {
      if (!Array.isArray(obj[base])) obj[base] = [];
      obj[base][parseInt(indexMatch[1])] = value;
      return;
    }

    const keyMatch = rest.match(/^\[([^\]]+)\](.*)$/);
    if (keyMatch) {
      if (typeof obj[base] !== 'object' || obj[base] === null) obj[base] = {};
      this._setQueryValue(obj[base], keyMatch[1] + keyMatch[2], value);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JsonConverters;
}
if (typeof window !== 'undefined') {
  window.JsonConverters = JsonConverters;
}
