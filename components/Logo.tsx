import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4 9v-2a2 2 0 012-2h1.5" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M20 9v-2a2 2 0 00-2-2h-1.5" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M7.5 7s-1 5 4.5 5 4.5-5 4.5-5" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 12v7" 
      />
      <circle 
        cx="12" 
        cy="19" 
        r="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default Logo;