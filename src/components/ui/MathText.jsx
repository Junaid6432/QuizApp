import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText Component
 * Splits a string and renders text and math separately with production-hardened KaTeX settings.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  // Segment identification logic
  const getSegments = (input) => {
    // Regex for: $$, $, \[, \(, and \begin{env}...\end{env}
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
          if (formula.includes('\\end{') && (formula.includes('^') || formula.includes('_'))) {
            formula = `{${formula}}`;
          }
        }

        // Sanitize formula for KaTeX (production-hardened)
        const cleanFormula = formula
          .trim()
          .replace(/\r?\n/g, ' ') // Standardize newlines
          .replace(/\\\\ /g, '\\\\') // Fix common matrix row spacing issues
          .replace(/\\ /g, ' '); // Decode escaped spaces for KaTeX

        const settings = {
          strict: false,
          throwOnError: false,
          trust: true
        };

        return isBlock ? (
          <BlockMath key={index} math={cleanFormula} settings={settings} />
        ) : (
          <InlineMath key={index} math={cleanFormula} settings={settings} />
        );
      })}
    </span>
  );
};

export default MathText;
