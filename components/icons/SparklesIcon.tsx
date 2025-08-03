
import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.5 3L7 7.5l3 1.5L12 12l1.5-3L17 7.5l-3-1.5z" />
    <path d="M5 12h.01" />
    <path d="M19 12h.01" />
    <path d="M12 19.01V19" />
    <path d="M5 5.99V6" />
    <path d="M19 18.01V18" />
    <path d="m7 16-1.5 3L2 20.5l3 1.5L7 25l1.5-3L12 20.5l-3-1.5z" />
  </svg>
);

export default SparklesIcon;
