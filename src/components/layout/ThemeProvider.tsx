import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const primaryColor = useThemeStore((s) => s.primaryColor);

  const theme = useMemo(() => {
    const prefersDark =
      mode === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : mode === 'dark';

    return createTheme({
      palette: {
        mode: prefersDark ? 'dark' : 'light',
        primary: { main: primaryColor },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: prefersDark ? '#121212' : '#fafafa',
            },
          },
        },
      },
    });
  }, [mode, primaryColor]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
