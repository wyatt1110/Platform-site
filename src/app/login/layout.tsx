import { ReactNode } from 'react';
import Layout from '@/components/layout/Layout';

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Layout>{children}</Layout>;
} 