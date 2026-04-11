const sanitizeLaTeX = (formula) => {
  if (!formula) return "";
  let sanitized = formula.trim();
  sanitized = sanitized.replace(/\r?\n/g, ' ');
  sanitized = sanitized.replace(/\\\\\\\\/g, '\\\\');
  sanitized = sanitized.replace(/\\\\(begin|end|matrix|bmatrix|vmatrix|adj|det|frac|sqrt|alpha|beta|gamma|theta|pi|phi|sum|int)/g, '\\$1');
  return sanitized;
};

// Test 1: Double escaped as in JSON (\\\\ in JS string)
const test1 = "adj A = \\\\begin{bmatrix} 1 & 0 \\\\\\\\ 0 & 1 \\\\end{bmatrix}";
console.log("Input 1:", test1);
console.log("Output 1:", sanitizeLaTeX(test1));

// Test 2: Normal escaped
const test2 = "adj A = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}";
console.log("Input 2:", test2);
console.log("Output 2:", sanitizeLaTeX(test2));
