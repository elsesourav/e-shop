'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Box from '../box';
import { Sidebar } from './sidebar.style';
import Logo from 'apps/seller-ui/src/app/assets/svg/logo';
import SidebarItem from './sidebar.item';
import SidebarMenu from './sidebar.menu';
import Home from 'apps/seller-ui/src/app/assets/icons/home';
import { BellPlus, BellRing, CalendarPlus, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent } from 'lucide-react';
import Payment from 'apps/seller-ui/src/app/assets/icons/payment';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getColorIcon = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <Box
      $css={{
        height: '100svh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={'/'} className="flex justify-center text-center gap-2">
            <Logo width={30} height={30} />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            href="/dashboard"
            title="Dashboard"
            icon={
              <Home width={26} height={26} fill={getColorIcon('/dashboard')} />
            }
            isActive={activeSidebar === '/dashboard'}
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                href="/dashboard/orders"
                title="Orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getColorIcon('/dashboard/orders')}
                  />
                }
                isActive={activeSidebar === '/dashboard/orders'}
              />
              <SidebarItem
                href="/dashboard/payment"
                title="Payment"
                icon={
                  <Payment
                    height={26}
                    width={26}
                    fill={getColorIcon('/dashboard/payment')}
                  />
                }
                isActive={activeSidebar === '/dashboard/payment'}
              />
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                href="/dashboard/create-product"
                title="Create Product"
                icon={
                  <SquarePlus
                    size={24}
                    color={getColorIcon('/dashboard/create-product')}
                  />
                }
                isActive={activeSidebar === '/dashboard/create-product'}
              />
              <SidebarItem
                href="/dashboard/all-products"
                title="All Products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getColorIcon('/dashboard/all-products')}
                  />
                }
                isActive={activeSidebar === '/dashboard/all-products'}
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                href="/dashboard/create-event"
                title="Create Event"
                icon={
                  <CalendarPlus
                    size={22}
                    color={getColorIcon('/dashboard/create-event')}
                  />
                }
                isActive={activeSidebar === '/dashboard/create-event'}
              />
              <SidebarItem
                href="/dashboard/all-events"
                title="All Events"
                icon={
                  <BellPlus
                    size={22}
                    color={getColorIcon('/dashboard/all-events')}
                  />
                }
                isActive={activeSidebar === '/dashboard/all-events'}
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                href="/dashboard/inbox"
                title="Inbox"
                icon={
                  <Mail size={22} color={getColorIcon('/dashboard/inbox')} />
                }
                isActive={activeSidebar === '/dashboard/inbox'}
              />
              <SidebarItem
                href="/dashboard/settings"
                title="Settings"
                icon={
                  <Settings
                    size={22}
                    color={getColorIcon('/dashboard/settings')}
                  />
                }
                isActive={activeSidebar === '/dashboard/settings'}
              />
              <SidebarItem
                href="/dashboard/notifications"
                title="Notifications"
                icon={
                  <BellRing
                    size={22}
                    color={getColorIcon('/dashboard/notifications')}
                  />
                }
                isActive={activeSidebar === '/dashboard/notifications'}
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                href="/dashboard/discount-codes"
                title="Discount Codes"
                icon={
                  <TicketPercent
                    size={22}
                    color={getColorIcon('/dashboard/discount-codes')}
                  />
                }
                isActive={activeSidebar === '/dashboard/discount-codes'}
              />
              <SidebarItem
                href="/dashboard/logout"
                title="Logout"
                icon={
                  <LogOut
                    size={22}
                    color={getColorIcon('/dashboard/logout')}
                  />
                }
                isActive={activeSidebar === '/dashboard/logout'}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};
export default SidebarWrapper;
