/**
 * JSON Formatter Pro - JSON Diff Engine
 * Compare two JSON objects and highlight differences
 */

class JsonDiff {
  constructor() {
    this.ADDED = 'added';
    this.REMOVED = 'removed';
    this.MODIFIED = 'modified';
    this.UNCHANGED = 'unchanged';
    this.MOVED = 'moved';
  }

  /**
   * Compare two JSON values
   */
  diff(left, right, options = {}) {
    const {
      ignoreArrayOrder = false,
      ignoreCase = false,
      showUnchanged = false
    } = options;

    return this._diffNode(left, right, [], {
      ignoreArrayOrder,
      ignoreCase,
      showUnchanged
    });
  }

  _diffNode(left, right, path, options) {
    const leftType = this._getType(left);
    const rightType = this._getType(right);

    // Both undefined or null
    if (left === undefined && right === undefined) {
      return null;
    }

    // Added
    if (left === undefined) {
      return {
        type: this.ADDED,
        path: path,
        value: right,
        rightValue: right
      };
    }

    // Removed
    if (right === undefined) {
      return {
        type: this.REMOVED,
        path: path,
        value: left,
        leftValue: left
      };
    }

    // Type changed
    if (leftType !== rightType) {
      return {
        type: this.MODIFIED,
        path: path,
        leftValue: left,
        rightValue: right,
        leftType: leftType,
        rightType: rightType
      };
    }

    // Both arrays
    if (leftType === 'array') {
      return this._diffArrays(left, right, path, options);
    }

    // Both objects
    if (leftType === 'object') {
      return this._diffObjects(left, right, path, options);
    }

    // Primitives
    const isEqual = options.ignoreCase && typeof left === 'string'
      ? left.toLowerCase() === right.toLowerCase()
      : left === right;

    if (isEqual) {
      return options.showUnchanged ? {
        type: this.UNCHANGED,
        path: path,
        value: left
      } : null;
    }

    return {
      type: this.MODIFIED,
      path: path,
      leftValue: left,
      rightValue: right
    };
  }

  _diffObjects(left, right, path, options) {
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    const changes = [];

    for (const key of allKeys) {
      const childPath = [...path, key];
      const leftHas = key in left;
      const rightHas = key in right;

      if (!leftHas) {
        changes.push({
          type: this.ADDED,
          path: childPath,
          key: key,
          value: right[key],
          rightValue: right[key]
        });
      } else if (!rightHas) {
        changes.push({
          type: this.REMOVED,
          path: childPath,
          key: key,
          value: left[key],
          leftValue: left[key]
        });
      } else {
        const childDiff = this._diffNode(left[key], right[key], childPath, options);
        if (childDiff) {
          if (Array.isArray(childDiff)) {
            changes.push(...childDiff);
          } else {
            changes.push(childDiff);
          }
        }
      }
    }

    return changes.length > 0 ? changes : null;
  }

  _diffArrays(left, right, path, options) {
    if (options.ignoreArrayOrder) {
      return this._diffArraysUnordered(left, right, path, options);
    }

    const changes = [];
    const maxLen = Math.max(left.length, right.length);

    for (let i = 0; i < maxLen; i++) {
      const childPath = [...path, i];

      if (i >= left.length) {
        changes.push({
          type: this.ADDED,
          path: childPath,
          index: i,
          value: right[i],
          rightValue: right[i]
        });
      } else if (i >= right.length) {
        changes.push({
          type: this.REMOVED,
          path: childPath,
          index: i,
          value: left[i],
          leftValue: left[i]
        });
      } else {
        const childDiff = this._diffNode(left[i], right[i], childPath, options);
        if (childDiff) {
          if (Array.isArray(childDiff)) {
            changes.push(...childDiff);
          } else {
            changes.push(childDiff);
          }
        }
      }
    }

    return changes.length > 0 ? changes : null;
  }

  _diffArraysUnordered(left, right, path, options) {
    const changes = [];
    const rightMatched = new Set();

    // Find matches and modifications
    for (let i = 0; i < left.length; i++) {
      let matched = false;

      for (let j = 0; j < right.length; j++) {
        if (rightMatched.has(j)) continue;

        if (this._deepEqual(left[i], right[j], options.ignoreCase)) {
          rightMatched.add(j);
          matched = true;

          if (i !== j) {
            changes.push({
              type: this.MOVED,
              path: [...path, i],
              fromIndex: i,
              toIndex: j,
              value: left[i]
            });
          }
          break;
        }
      }

      if (!matched) {
        changes.push({
          type: this.REMOVED,
          path: [...path, i],
          index: i,
          value: left[i],
          leftValue: left[i]
        });
      }
    }

    // Find additions
    for (let j = 0; j < right.length; j++) {
      if (!rightMatched.has(j)) {
        changes.push({
          type: this.ADDED,
          path: [...path, j],
          index: j,
          value: right[j],
          rightValue: right[j]
        });
      }
    }

    return changes.length > 0 ? changes : null;
  }

  _deepEqual(a, b, ignoreCase = false) {
    if (a === b) return true;

    const typeA = this._getType(a);
    const typeB = this._getType(b);

    if (typeA !== typeB) return false;

    if (typeA === 'array') {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this._deepEqual(a[i], b[i], ignoreCase)) return false;
      }
      return true;
    }

    if (typeA === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!this._deepEqual(a[key], b[key], ignoreCase)) return false;
      }
      return true;
    }

    if (ignoreCase && typeof a === 'string') {
      return a.toLowerCase() === b.toLowerCase();
    }

    return false;
  }

  _getType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  /**
   * Generate a summary of changes
   */
  getSummary(diff) {
    if (!diff) return { total: 0, added: 0, removed: 0, modified: 0, moved: 0 };

    const changes = Array.isArray(diff) ? diff : [diff];
    const flat = this._flattenChanges(changes);

    return {
      total: flat.length,
      added: flat.filter(c => c.type === this.ADDED).length,
      removed: flat.filter(c => c.type === this.REMOVED).length,
      modified: flat.filter(c => c.type === this.MODIFIED).length,
      moved: flat.filter(c => c.type === this.MOVED).length
    };
  }

  _flattenChanges(changes, result = []) {
    for (const change of changes) {
      if (Array.isArray(change)) {
        this._flattenChanges(change, result);
      } else if (change && change.type) {
        result.push(change);
      }
    }
    return result;
  }

  /**
   * Generate patch operations (RFC 6902 JSON Patch format)
   */
  toPatch(diff) {
    if (!diff) return [];

    const changes = Array.isArray(diff) ? diff : [diff];
    const flat = this._flattenChanges(changes);
    const patches = [];

    for (const change of flat) {
      const pathStr = '/' + change.path.map(p =>
        String(p).replace(/~/g, '~0').replace(/\//g, '~1')
      ).join('/');

      switch (change.type) {
        case this.ADDED:
          patches.push({ op: 'add', path: pathStr, value: change.rightValue });
          break;
        case this.REMOVED:
          patches.push({ op: 'remove', path: pathStr });
          break;
        case this.MODIFIED:
          patches.push({ op: 'replace', path: pathStr, value: change.rightValue });
          break;
      }
    }

    return patches;
  }

  /**
   * Apply JSON Patch to data
   */
  applyPatch(data, patches) {
    let result = JSON.parse(JSON.stringify(data));

    for (const patch of patches) {
      const path = patch.path.split('/').filter(Boolean).map(p =>
        p.replace(/~1/g, '/').replace(/~0/g, '~')
      );

      switch (patch.op) {
        case 'add':
        case 'replace':
          this._setPath(result, path, patch.value);
          break;
        case 'remove':
          this._removePath(result, path);
          break;
      }
    }

    return result;
  }

  _setPath(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  _removePath(obj, path) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    const lastKey = path[path.length - 1];
    if (Array.isArray(current)) {
      current.splice(parseInt(lastKey), 1);
    } else {
      delete current[lastKey];
    }
  }

  /**
   * Merge two JSON objects
   */
  merge(left, right, options = {}) {
    const { strategy = 'right-wins' } = options;

    if (this._getType(left) !== this._getType(right)) {
      return strategy === 'right-wins' ? right : left;
    }

    if (Array.isArray(left)) {
      if (strategy === 'concat') {
        return [...left, ...right];
      }
      return right;
    }

    if (typeof left === 'object' && left !== null) {
      const result = { ...left };
      for (const key of Object.keys(right)) {
        if (key in result) {
          result[key] = this.merge(result[key], right[key], options);
        } else {
          result[key] = right[key];
        }
      }
      return result;
    }

    return strategy === 'right-wins' ? right : left;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JsonDiff;
}
if (typeof window !== 'undefined') {
  window.JsonDiff = JsonDiff;
}
