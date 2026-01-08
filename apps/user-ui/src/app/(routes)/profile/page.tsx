'use client';
import useUser from '@/hooks/useUser';
import QuickActionCard from '@/shared/components/cards/quick-action-card';
import StatCard from '@/shared/components/cards/stat-card';
import NavItem from '@/shared/components/nav/nav-item';
import ShippingAddressSection from '@/shared/components/shippingAddress/page';
import axiosInstance from '@/utils/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type ActiveTab =
  | 'Profile'
  | 'My Orders'
  | 'Inbox'
  | 'Notifications'
  | 'Shipping Address'
  | 'Change Password'
  | 'Logout';

const page = () => {
  const searchPrams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user, isLoading } = useUser();
  const queryTab = searchPrams.get('active') as ActiveTab;
  const [activeTab, setActiveTab] = useState<ActiveTab>(queryTab || 'Profile');

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newPrams = new URLSearchParams(searchPrams);
      newPrams.set('active', activeTab);
      router.replace(`/profile?${newPrams.toString()}`);
    }
  }, [activeTab]);

  const logOutHandler = async () => {
    await axiosInstance.post('/api/user-logout').then(() => {
      queryClient.invalidateQueries({ queryKey: ['user'] });

      router.push('/login');
    });
  };

  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{' '}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="inline animate-spin size-5" />
              ) : (
                user?.name || 'User'
              )}
            </span>{' '}
            👋
          </h1>
        </div>

        {/* Profile Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" count={10} Icon={Clock} />
          <StatCard title="Processing Orders" count={5} Icon={Truck} />
          <StatCard title="Completed Orders" count={5} Icon={CheckCircle} />
        </div>

        {/* Sidebar and Content Layout */}
        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* Left Navigation */}
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full md:w-1/5">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === 'Profile'}
                onClick={() => setActiveTab('Profile')}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === 'My Orders'}
                onClick={() => setActiveTab('My Orders')}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === 'Inbox'}
                onClick={() => router.push('/inbox')}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === 'Notifications'}
                onClick={() => setActiveTab('Notifications')}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === 'Shipping Address'}
                onClick={() => setActiveTab('Shipping Address')}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === 'Change Password'}
                onClick={() => setActiveTab('Change Password')}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                onClick={() => logOutHandler()}
              />
            </nav>
          </div>

          {/* Main Content */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full md:w-[55%]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>

            {activeTab === 'Profile' && !isLoading && user ? (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      user?.avatar ||
                      'https://ik.imagekit.io/elsesourav/products/avatar-user.png'
                    }
                    alt="User Avatar"
                    width={60}
                    height={60}
                    className="size-16 border border-gray-200 rounded-full"
                  />
                  <button className="flex items-center gap-1 text-blue-500 text-xs">
                    <Pencil className="size-4" /> Edit Profile Picture
                  </button>
                </div>
                <p>
                  <span className="font-semibold">Name:</span> {user.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">Joined:</span>{' '}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Earned Points:</span>{' '}
                  {user?.points || 0}
                </p>
              </div>
            ) : activeTab === 'Shipping Address' ? (
                <div className="">
                  <ShippingAddressSection />
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">
                  Content for "{activeTab}" will be available soon.
                </p>
              </div>
            )}
          </div>

          {/* Right Quick Panel */}
          <div className="w-full md:w-1/4 space-y-4">
            <QuickActionCard
              Icon={Gift}
              title="Referral Program"
              description="Invite friends and earn rewards."
            />
            <QuickActionCard
              Icon={BadgeCheck}
              title="Your Badges"
              description="View your earned achievements."
            />
            <QuickActionCard
              Icon={Settings}
              title="Account Settings"
              description="Manage preferences and security."
            />
            <QuickActionCard
              Icon={Receipt}
              title="Billing History"
              description="Check your receipt payments."
            />
            <QuickActionCard
              Icon={PhoneCall}
              title="Customer Support"
              description="Need help? Contact our support team."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default page;
