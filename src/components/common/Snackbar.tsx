import { Snackbar as MuiSnackbar, Alert } from '@mui/material';
import { create } from 'zustand';

interface ToastState {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  open: boolean;
  show: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  severity: 'info',
  open: false,
  show: (message, severity = 'info') => set({ message, severity, open: true }),
  hide: () => set({ open: false }),
}));

export function ToastSnackbar() {
  const { message, severity, open, hide } = useToast();

  return (
    <MuiSnackbar open={open} autoHideDuration={3000} onClose={hide} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={hide} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </MuiSnackbar>
  );
}
