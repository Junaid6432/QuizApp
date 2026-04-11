const text = "Find $A+B$ if $A = \\begin{bmatrix} - 3 \\\\ 5 \\end{bmatrix}$ and $B = \\begin{bmatrix} 3 \\\\ -5 \\end{bmatrix}$.";
const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
const parts = text.split(regex);

console.log("Parts Length:", parts.length);
parts.forEach((p, i) => console.log(`[${i}]: "${p}"`));

const processed = parts.map((part, index) => {
    if (!part) return null;
    if (parts[index-1]?.startsWith('\\begin{') && part === parts[index-1].match(/\\begin\{([\s\S]+?)\}/)?.[1]) return "SKIPPED_GROUP";
    return part;
});

console.log("Processed:", processed);
