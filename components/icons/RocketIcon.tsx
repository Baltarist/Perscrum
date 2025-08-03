import React from 'react';

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05A5.73 5.73 0 0 0 5.5 8.5c0 .91.18 1.83.53 2.65C6.7 12.33 7.5 13 8.5 13.5c.91.45 1.91.67 2.82.53.84-.09 2.1-.53 2.9-1.33c.75-.75 1.24-2 .53-2.82C13.83 9.17 13 8.5 12.5 7.5c-.95-1-2.22-1.45-3.05-1.45A5.73 5.73 0 0 0 8.5 5.5c-.91 0-1.83.18-2.65.53C4.67 6.7 4 7.5 3.5 8.5Z" />
    <path d="m14 10 3-3" />
    <path d="M20 5 17 8" />
    <path d="M19 12.5c0 .55.18 1.05.5 1.5" />
    <path d="M21.5 15.5c.35-.45.5-.95.5-1.5" />
    <path d="M16 18c-1.5-1.5-3-3-3-3" />
  </svg>
);

export default RocketIcon;