import { ReactNode } from 'react';
import Layout from '@/components/layout/Layout';

export default function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Layout>{children}</Layout>;
} 