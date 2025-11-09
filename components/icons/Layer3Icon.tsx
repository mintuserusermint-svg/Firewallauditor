import React from 'react';

const Layer3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.922A9.094 9.094 0 0 1 5.25 6.16m7.5 10.585a9.094 9.094 0 0 1-3.741.479 3 3 0 0 1-4.682-2.72M12 8.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

export default Layer3Icon;
