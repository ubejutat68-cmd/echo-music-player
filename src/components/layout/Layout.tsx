import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomPlayerBar } from '../player/BottomPlayerBar';

export function Layout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', pb: '80px' }}>
          <Outlet />
        </Box>
        <BottomPlayerBar />
      </Box>
    </Box>
  );
}
