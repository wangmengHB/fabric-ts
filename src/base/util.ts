

/**
 * Returns string representation of function body
 * @param {Function} fn Function to get body of
 * @return {String} Function body
 */
export function getFunctionBody(fn: Function) {
  const str = String(fn);
  const match = str.match(/function[^{]*\{([\s\S]*)\}/);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}

