import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText Component
 * Splits a string by $ (inline) or $$ (block) markers and renders text and math separately.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  // Split by $$...$$ (block) or $...$ (inline)
  // This regex matches: 
  // 1. $$...$$ (block math)
  // 2. $...$ (inline math)
  const parts = text.split(/(\$\$.+?\$\$|\$.+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.substring(2, part.length - 2);
          return <BlockMath key={index} math={formula} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.substring(1, part.length - 1);
          return <InlineMath key={index} math={formula} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MathText;
