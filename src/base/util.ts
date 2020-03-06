

/**
 * Returns string representation of function body
 * @param {Function} fn Function to get body of
 * @return {String} Function body
 */
export function getFunctionBody(fn: Function) {
  return (String(fn).match(/function[^{]*\{([\s\S]*)\}/) || {})[1];
}

