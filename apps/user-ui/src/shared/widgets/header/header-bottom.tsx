'use client';

import { useEffect, useState } from 'react';
import { AlignLeft, ChevronDown } from 'lucide-react';
import { navItems } from '@src/configs/constants';
import Link from 'next/link';
import HeaderProfile from './header-profile';

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 bg-white shadow-lg z-[100]' : 'relative'
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between p-0 ${
          isSticky ? 'py-2' : 'pt-0'
        }`}
      >
        {/* All Dropdowns */}
        <div
          className={`w-[260px] cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489FF]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium ">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* Dropdown Menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? 'top-[70px]' : 'top-[50px]'
            } w-[260px] h-[400px] bg-[#F5F5F5] shadow-lg`}
          >
            <div className="p-2">
              <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Department 1
              </span>
              <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Department 2
              </span>
              <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Department 3
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              key={index}
              href={i.href}
              className="px-5 font-medium text-lg"
            >
              {i.title}
            </Link>
          ))}
        </div>

        <div>{isSticky && <HeaderProfile />}</div>
      </div>
    </div>
  );
};
export default HeaderBottom;
