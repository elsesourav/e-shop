import SidebarWrapper from 'apps/seller-ui/src/shared/components/sidebar/sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-[100svh] overflow-hidden bg-[rgb(40,42,56)] min-h-screen">
      {/* Sidebar */}
      <aside className="w-[280px] min-w-[250px] max-w-[300px] bg-black/30 border-r border-r-slate-800 text-white p-4">
        <div className="sticky top-0">
          <SidebarWrapper />
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="relative overflow-auto flex-1 p-4">
        <div className="">{children}</div>
      </main>
    </div>
  );
};
export default Layout;
