const text = "A = \\begin{bmatrix} - 3 \\\\ 5 \\end{bmatrix} and $B = \\begin{bmatrix} 3 \\\\ -5 \\end{bmatrix}$.";

// Use non-capturing groups (?:) for everything except the segments we want to split by.
// To use a backreference \2, we need the environment name to be in a group.
// But we can use matchAll to get results without polluting split.

function parseMath(input) {
    const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
    let parts = [];
    let lastIndex = 0;
    
    // Using replace with a function is a great way to find all matches and non-matches
    input.replace(regex, (match, g1, g2, offset) => {
        // Push the text before the match
        if (offset > lastIndex) {
            parts.push({ type: 'text', content: input.substring(lastIndex, offset) });
        }
        parts.push({ type: 'math', content: match });
        lastIndex = offset + match.length;
    });
    
    // Push the remaining text
    if (lastIndex < input.length) {
        parts.push({ type: 'text', content: input.substring(lastIndex) });
    }
    return parts;
}

const results = parseMath(text);
console.log(JSON.stringify(results, null, 2));
