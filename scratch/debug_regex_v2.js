const text = "A = \\begin{bmatrix} - 3 \\\\ 5 \\end{bmatrix} and B = \\begin{bmatrix} 3 \\\\ -5 \\end{bmatrix}.";
const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
const parts = text.split(regex);

console.log("Parts Length:", parts.length);
parts.forEach((p, i) => console.log(`[${i}]: "${p}"`));

const processed = parts.map((part, index) => {
    if (!part) return null;
    // Check if this part is the environment name captured in the PREVIOUS match
    // Actually, split produces [before, group1, group2, after]
    // parts[index-1] would be group1 (\begin{...})
    if (parts[index-1]?.startsWith('\\begin{')) {
        const env = parts[index-1].match(/\\begin\{([\s\S]+?)\}/)?.[1];
        if (part === env) return "SKIPPED_GROUP";
    }
    return part;
});

console.log("Processed:", processed);
