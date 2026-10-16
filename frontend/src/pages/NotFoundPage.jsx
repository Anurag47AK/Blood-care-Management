import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blood-100 flex items-center justify-center text-blood-600 shadow-inner">
        <Droplet className="w-10 h-10 fill-current animate-bounce" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-5xl font-black text-slate-900">404</span>
        <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested healthcare page or resource does not exist or may have been relocated.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blood-600/30 transition-transform hover:scale-105"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/find-donors"
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Find Donors</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
