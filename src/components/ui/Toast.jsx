// Toast notification wrapper. Centralizes react-hot-toast styling so the
// rest of the app calls notify.success / notify.error.

import toast, { Toaster } from 'react-hot-toast';

const baseStyle = {
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  fontSize: '14px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
};

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: baseStyle,
        success: { iconTheme: { primary: '#00B894', secondary: '#fff' } },
        error: { iconTheme: { primary: '#FF6B6B', secondary: '#fff' } },
      }}
    />
  );
}

export const notify = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id) => toast.dismiss(id),
};

export default toast;
