import { ComponentType } from 'react';

interface NavItemProps {
  label: string;
  Icon: ComponentType<any>;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

const NavItem = ({ label, Icon, active, danger, onClick }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm font-medium transition 
    ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} 
    ${danger ? 'text-red-600 hover:bg-red-100' : ''}`}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
};
export default NavItem;
