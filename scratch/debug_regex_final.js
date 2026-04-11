const text = "A = \\begin{bmatrix} - 3 \\\\ 5 \\end{bmatrix} and $B = \\begin{bmatrix} 3 \\\\ -5 \\end{bmatrix}$.";

function getSegments(input) {
    const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
    const result = [];
    let lastIndex = 0;

    input.replace(regex, (match, full, env, offset) => {
      if (offset > lastIndex) {
        result.push({ type: 'text', content: input.substring(lastIndex, offset) });
      }
      result.push({ type: 'math', content: match });
      lastIndex = offset + match.length;
    });

    if (lastIndex < input.length) {
      result.push({ type: 'text', content: input.substring(lastIndex) });
    }
    return result;
}

const segs = getSegments(text);
console.log(JSON.stringify(segs, null, 2));

const finalCheck = segs.map(s => {
    if (s.type === 'text') return s.content;
    let formula = s.content;
    if (formula.startsWith('$') && formula.endsWith('$')) {
        formula = formula.substring(1, formula.length - 1);
    }
    return `[MATH: ${formula}]`;
});

console.log("Final Render Simulation:", finalCheck.join(' | '));
