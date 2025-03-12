import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { motion } from 'framer-motion';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardLayoutProps {
  children: React.ReactNode;
  layout: any[];
  onLayoutChange: (layout: any[]) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  layout,
  onLayoutChange,
}) => {
  const breakpoints = { xxl: 1600, xl: 1200, lg: 992, md: 768, sm: 576, xs: 480 };
  const cols = { xxl: 12, xl: 10, lg: 8, md: 6, sm: 4, xs: 2 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full p-4 bg-gray-50 dark:bg-gray-900"
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100}
        onLayoutChange={(layout) => onLayoutChange(layout)}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
        containerPadding={[16, 16]}
      >
        {children}
      </ResponsiveGridLayout>
    </motion.div>
  );
};

export default DashboardLayout; 