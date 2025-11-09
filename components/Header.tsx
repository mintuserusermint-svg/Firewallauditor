import React from 'react';
import LogoIcon from './icons/LogoIcon';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center p-4 md:p-6">
      <LogoIcon className="h-10 w-10 md:h-12 md:w-12 mr-4 text-blue-400" />
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 text-left">
          Sentinel AI
        </h1>
        <p className="mt-1 text-lg text-slate-400 text-left">
          Firewall Compliance Auditor
        </p>
      </div>
    </header>
  );
};

export default Header;
