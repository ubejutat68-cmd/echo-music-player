import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Home, LibraryMusic, Search, QueueMusic, Album } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 220;

const navItems = [
  { label: '首页', icon: <Home />, path: '/' },
  { label: '音乐库', icon: <LibraryMusic />, path: '/library' },
  { label: '搜索', icon: <Search />, path: '/search' },
  { label: '歌单', icon: <QueueMusic />, path: '/playlist/__favorites__' },
  { label: '正在播放', icon: <Album />, path: '/nowplaying' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', top: 0, borderRight: 1, borderColor: 'divider' },
      }}
    >
      <List sx={{ mt: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
