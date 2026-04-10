import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText Component
 * Splits a string by $ (inline) or $$ (block) markers and renders text and math separately.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  // Pre-process: Auto-wrap naked LaTeX environments (\begin{...}...\end{...}) in $ if not already wrapped
  // This handles the case where users forget to use $ delimiters
  const wrappedText = text.replace(/(?<!\$|\\begin\{[\s\S]+?\})(\\begin\{[\s\S]+?\}[\s\S]+?\\end\{[\s\S]+?\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)(?!\$)/g, '$$$1$$');

  // Improved regex to detect common math blocks
  const parts = wrappedText.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.substring(2, part.length - 2);
          return <BlockMath key={index} math={formula} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.substring(1, part.length - 1);
          return <InlineMath key={index} math={formula} />;
        } else if (part.startsWith('\\begin{') || part.includes('\\\\') || part.includes('\\times')) {
          // Auto-detect math environments and fix common encoding issues
          // If it starts with \begin and ends with \end plus optional superscript, wrap in {} for KaTeX safety
          let formula = part;
          if (part.includes('\\end{') && (part.includes('^') || part.includes('_'))) {
            formula = `{${part}}`;
          }
          return <InlineMath key={index} math={formula} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MathText;
