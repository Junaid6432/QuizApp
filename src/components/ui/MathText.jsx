import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText Component
 * Splits a string by $ (inline) or $$ (block) markers and renders text and math separately.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  // Segment identification logic
  const getSegments = (input) => {
    // Regex for: $$, $, \[, \(, and \begin{env}...\end{env}
    // Note the \2 backreference for environment matching
    const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
    const result = [];
    let lastIndex = 0;

    input.replace(regex, (match, full, env, offset) => {
      // Add text before the match
      if (offset > lastIndex) {
        result.push({ type: 'text', content: input.substring(lastIndex, offset) });
      }
      result.push({ type: 'math', content: match });
      lastIndex = offset + match.length;
    });

    // Add remaining text
    if (lastIndex < input.length) {
      result.push({ type: 'text', content: input.substring(lastIndex) });
    }
    return result;
  };

  const segments = getSegments(text);

  return (
    <span className={className}>
      {segments.map((seg, index) => {
        const { type, content } = seg;
        if (type === 'text') return <span key={index}>{content}</span>;

        // Process Math
        let formula = content;
        let isBlock = false;

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
        } else if (formula.startsWith('\\begin{')) {
          // Keep the whole string for \begin blocks, but ensure safety
          if (formula.includes('\\end{') && (formula.includes('^') || formula.includes('_'))) {
            formula = `{${formula}}`;
          }
        }

        // Sanitize formula for KaTeX (handle potential newline issues in some JS engines)
        const cleanFormula = formula.trim().replace(/\r?\n/g, ' ');

        return isBlock ? (
          <BlockMath key={index} math={cleanFormula} />
        ) : (
          <InlineMath key={index} math={cleanFormula} />
        );
      })}
    </span>
  );
};

export default MathText;
