import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Robust LaTeX Sanitizer
 * Handles excessive escaping (e.g., \\\\ or \\\\\\\\) and normalizes it for KaTeX.
 */
const sanitizeLaTeX = (formula) => {
  if (!formula) return "";

  let sanitized = formula.trim();

  // Step 1: Normalize newlines
  sanitized = sanitized.replace(/\r?\n/g, ' ');

  // Step 2: Handle 'Exploded' backslashes often found in JSON (\\\\ or \\\\\\\\)
  // We want to collapse sequences of 2+ backslashes to a manageable state.
  // In JS strings, \\\\ is actually two literal backslashes.
  
  // If we see 4 literal backslashes (\\\\), it was likely \\\\\\\\ in JSON. 
  // We convert it to 2 backslashes.
  sanitized = sanitized.replace(/\\\\\\\\/g, '\\\\');
  
  // If we still see 2 literal backslashes followed by a command (like \\begin), 
  // it should almost certainly be 1 (\begin).
  sanitized = sanitized.replace(/\\\\(begin|end|matrix|bmatrix|vmatrix|adj|det|frac|sqrt|alpha|beta|gamma|theta|pi|phi|sum|int)/g, '\\$1');
  
  // Fix common matrix row separator issue: ensure exactly \\ exists between rows if needed
  // Note: we don't want to aggressively collapse \\ unless it's clearly for a command.
  
  return sanitized;
};

const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  const segments = useMemo(() => {
    const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
    const result = [];
    let lastIndex = 0;

    text.replace(regex, (match, full, env, offset) => {
      if (offset > lastIndex) {
        result.push({ type: 'text', content: text.substring(lastIndex, offset) });
      }
      result.push({ type: 'math', content: match });
      lastIndex = offset + match.length;
    });

    if (lastIndex < text.length) {
      result.push({ type: 'text', content: text.substring(lastIndex) });
    }
    return result;
  }, [text]);

  return (
    <span className={className}>
      {segments.map((seg, index) => {
        if (seg.type === 'text') return <span key={index}>{seg.content}</span>;

        let formula = seg.content;
        let isBlock = false;

        // Strip delimiters
        if (formula.startsWith('$$') && formula.endsWith('$$')) {
          formula = formula.substring(2, formula.length - 2);
          isBlock = true;
        } else if (formula.startsWith('$') && formula.endsWith('$')) {
          formula = formula.substring(1, formula.length - 1);
        } else if (formula.startsWith('\\\[') && formula.endsWith('\\\]')) {
          formula = formula.substring(2, formula.length - 2);
          isBlock = true;
        } else if (formula.startsWith('\\\(') && formula.endsWith('\\\)')) {
          formula = formula.substring(2, formula.length - 2);
        }

        const cleanFormula = sanitizeLaTeX(formula);

        try {
          const html = katex.renderToString(cleanFormula, {
            displayMode: isBlock,
            throwOnError: false,
            strict: false,
            trust: true
          });

          return (
            <span 
              key={index} 
              className={isBlock ? "block my-4" : "inline-block"}
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        } catch (error) {
          console.error("KaTeX error:", error);
          return (
            <span key={index} className="text-red-500 font-mono text-xs border border-red-500/20 px-1 rounded" title={error.message}>
              {cleanFormula}
            </span>
          );
        }
      })}
    </span>
  );
};

export default MathText;
