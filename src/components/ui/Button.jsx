import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "relative overflow-hidden px-6 py-3 font-semibold rounded-xl transition-all duration-300 active:scale-95 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const variants = {
    primary: "bg-accent-gradient shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
    outline: "border-2 border-primary-500/50 bg-transparent hover:bg-primary-500/10 hover:border-primary-500",
    ghost: "bg-transparent hover:bg-white/10 text-slate-300",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={twMerge(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
