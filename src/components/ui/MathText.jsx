import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText Component
 * Splits a string by $ (inline) or $$ (block) markers and renders text and math separately.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  // New Splitter: Detects $$, $, \[, \(, and \begin{env}...\end{env} blocks
  // The \1 backreference ensures \begin{X} matches \end{X}
  const regex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\begin\{([\s\S]+?)\}[\s\S]+?\\end\{\2\}(?:\^[\w\d]|\^\{[\s\S]+?\})?)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Skip the backreference capture groups from the split regex
        // If this part is exactly the environment name of the previous \begin block
        if (parts[index-1]?.startsWith('\\begin{') && part === parts[index-1].match(/\\begin\{([\s\S]+?)\}/)?.[1]) return null;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.substring(2, part.length - 2);
          return <BlockMath key={index} math={formula} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.substring(1, part.length - 1);
          return <InlineMath key={index} math={formula} />;
        } else if (part.startsWith('\\\[') && part.endsWith('\\\]')) {
          const formula = part.substring(2, part.length - 2);
          return <BlockMath key={index} math={formula} />;
        } else if (part.startsWith('\\\(') && part.endsWith('\\\)')) {
          const formula = part.substring(2, part.length - 2);
          return <InlineMath key={index} math={formula} />;
        } else if (part.startsWith('\\begin{')) {
          // Standard LaTeX environments
          let formula = part;
          if (part.includes('\\end{') && (part.includes('^') || part.includes('_'))) {
            formula = `{${part}}`; // KaTeX safety for superscripts on environments
          }
          return <InlineMath key={index} math={formula} />;
        }
        
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MathText;
