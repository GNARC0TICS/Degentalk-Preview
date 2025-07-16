import React from 'react';
import { Outlet } from 'react-router-dom';
import ModularAdminLayout from '@/features/admin/layout/admin-layout';

/**
 * Admin Layout - Administrative section shell
 * Contains the admin-specific layout and renders child pages via Outlet
 */
export default function AdminLayout() {
  return (
    <ModularAdminLayout>
      <Outlet />
    </ModularAdminLayout>
  );
}