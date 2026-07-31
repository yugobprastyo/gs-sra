import React, { useState } from 'react';
import { 
  Home, 
  ListOrdered, 
  Folder, 
  FileText, 
  CheckCircle2, 
  Box, 
  Atom, 
  FileCode, 
  Info 
} from 'lucide-react';

export default function Sidebar() {
  const [activeMenu, setActiveMenu] = useState('Queue');

  const menuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Queue', icon: ListOrdered },
    { name: 'Runs', icon: Folder },
    { name: 'Draft', icon: FileText },
    { name: 'Finished', icon: CheckCircle2 },
    { name: 'Labware', icon: Box },
    { name: 'Instrument', icon: Atom },
    { name: 'Template', icon: FileCode },
  ];

  return (
    <aside className="w-20 bg-white border-r border-gray-300 flex flex-col justify-between items-center py-3 select-none shrink-0 h-screen">
      
      {/* Top Section: Logo + Nav Items */}
      <div className="flex flex-col items-center w-full space-y-4">
        
        {/* Custom Logo with Notification Badges */}
        <div className="relative mb-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            GS
          </div>
          {/* Badge Merah (Atas Kiri) */}
          <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
            2
          </span>
          {/* Badge Biru (Bawah Kiri) */}
          <span className="absolute top-3 -left-2 bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
            2
          </span>
        </div>

        {/* Navigation Menu List */}
        <nav className="w-full flex flex-col space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full py-2.5 flex flex-col items-center justify-center transition-all relative ${
                  isActive
                    ? 'text-blue-600 font-medium bg-blue-50/50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-700'}`} />
                <span className="text-[11px] mt-1 leading-none">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: About Menu */}
      <div className="w-full pt-2 border-t border-gray-200">
        <button
          onClick={() => setActiveMenu('About')}
          className={`w-full py-2 flex flex-col items-center justify-center transition-all ${
            activeMenu === 'About'
              ? 'text-blue-600 font-medium border-l-4 border-blue-600'
              : 'text-gray-700 hover:text-black hover:bg-gray-100 border-l-4 border-transparent'
          }`}
        >
          <Info className="w-5 h-5 text-gray-700" />
          <span className="text-[11px] mt-1 leading-none">About</span>
        </button>
      </div>

    </aside>
  );
}