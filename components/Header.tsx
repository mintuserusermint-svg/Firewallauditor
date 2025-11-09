
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
        Sentinel AI
      </h1>
      <p className="mt-2 text-lg text-slate-400">
        Firewall Compliance Auditor
      </p>
    </header>
  );
};

export default Header;
