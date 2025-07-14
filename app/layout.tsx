import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import AuthGuard from '@/components/auth-guard';
import ProtectedLayout from './(protected)/layout';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
