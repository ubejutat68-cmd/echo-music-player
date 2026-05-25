import { Component, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />
          <Typography variant="h6">发生了错误</Typography>
          <Typography variant="body2" color="text.secondary">{this.state.error?.message}</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>重新加载</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
