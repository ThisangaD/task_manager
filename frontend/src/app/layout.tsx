import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow — Manage your tasks',
  description: 'A modern, beautiful task management app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A24',
              color: '#E2E8F0',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
