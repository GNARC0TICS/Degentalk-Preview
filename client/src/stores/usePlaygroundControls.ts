import create from 'zustand';

interface PlaygroundControlsState {
  isDrawerOpen: boolean;
  selectedComponentId: string | null;
  props: Record<string, any>;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  selectComponent: (id: string | null, initialProps?: Record<string, any>) => void;
  updateProp: (key: string, value: any) => void;
}

export const usePlaygroundControls = create<PlaygroundControlsState>((set) => ({
  isDrawerOpen: false,
  selectedComponentId: null,
  props: {},
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  selectComponent: (id, initialProps = {}) => set({ selectedComponentId: id, props: initialProps, isDrawerOpen: true }),
  updateProp: (key, value) => set((s) => ({ props: { ...s.props, [key]: value } })),
})); 