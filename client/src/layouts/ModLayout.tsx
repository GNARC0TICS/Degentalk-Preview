import React from 'react';
import { Outlet } from 'react-router-dom';
import { ModLayout as ModLayoutComponent } from '@/components/mod/mod-layout';

/**
 * Moderator Layout - Moderator section shell
 * Contains the moderator-specific layout and renders child pages via Outlet
 */
export default function ModLayout() {
  return (
    <ModLayoutComponent>
      <Outlet />
    </ModLayoutComponent>
  );
}