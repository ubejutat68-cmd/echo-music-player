import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
      {icon && <Box sx={{ color: 'text.secondary', mb: 1 }}>{icon}</Box>}
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      {description && <Typography variant="body2" color="text.disabled">{description}</Typography>}
      {action}
    </Box>
  );
}
