import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import DashboardLoader from '../DashboardLoader';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, initialLoading } = useApp();

  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20 overflow-x-clip">
      {user && initialLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
          <DashboardLoader name={user.name} />
        </div>
      ) : (
        <>
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
          />
          
          <div className={`flex min-h-screen flex-col min-w-0 transition-[margin] duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'}`}>
            <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-full"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
