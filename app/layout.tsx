import type { Metadata } from 'next';
import './globals.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import AuthGuard from '@/components/auth-guard';
import ProtectedLayout from './(protected)/layout';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SkillForge Admin Panel',
  description:
    'Admin panel for SkillForge - Manage your schools, courses, and students'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{
              top: '20px',
              right: '20px',
              zIndex: 9999
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
