"use client";
import Link from 'next/link';
import { Search } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import HeaderBottom from './header-bottom';
import HeaderProfile from './header-profile';
import { useState } from 'react';


const Header = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<string>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) return;

    setLoadingSuggestions(true);
    try {
      const response = await axiosInstance.get(
        `/product/api/search-product?Q=${encodeURIComponent(searchQuery)}`
      );

      setSuggestions(response.data.products?.slice(0, 10) || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href={'/'}>
            <span className="text-3xl font-semibold">Eshop</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            name="search"
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0">
            <Search />
          </div>
        </div>
        <HeaderProfile />
      </div>
      <div className="border-b border-b-slate-200" />
      <HeaderBottom />
    </div>
  );
};
export default Header;
