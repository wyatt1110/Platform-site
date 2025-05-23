'use client';

import React from 'react';
import AccountDetailsPage from '@/frontend-ui/pages/account-details-page';
import DashboardLayout from '@/frontend-ui/layouts/DashboardLayout';

export default function AccountPage() {
  return (
    <DashboardLayout>
      <AccountDetailsPage />
    </DashboardLayout>
  );
} 