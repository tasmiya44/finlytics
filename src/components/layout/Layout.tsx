import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import DashboardLoader from '../DashboardLoader';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, initialLoading } = useApp();

  return (
    <div className="flex min-h-screen bg-bg selection:bg-primary/20">
      {user && initialLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
          <DashboardLoader name={user.name} />
        </div>
      ) : (
        <>
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            
            <main className="flex-1 p-6 lg:p-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
