import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText Component
 * Splits a string by $ (inline) or $$ (block) markers and renders text and math separately.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  // Improved regex to detect:
  // 1. $$...$$ (block math)
  // 2. $...$ (inline math)
  // 3. \begin{...}...\end{...} (unwrapped matrices/environments)
  // 4. \[...\] or \(...\) (standard LaTeX blocks)
  // Using [\s\S] instead of . to match newlines within math blocks
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{[\s\S]+?\}[\s\S]+?\\end\{[\s\S]+?\})/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.substring(2, part.length - 2);
          return <BlockMath key={index} math={formula} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.substring(1, part.length - 1).replace(/\\\\/g, '\\');
          return <InlineMath key={index} math={formula} />;
        } else if (part.startsWith('\\begin{') || part.includes('\\\\')) {
          // Auto-detect math environments and fix JSON-escaped backslashes (\\\\ -> \\)
          const formula = part.replace(/\\\\/g, '\\');
          return <InlineMath key={index} math={formula} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MathText;
