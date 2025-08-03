export interface NavigationItem {
  label: string;
  href: string;
  showOn?: ('desktop' | 'mobile')[];
  icon?: string;
  external?: boolean;
}

export interface NavigationConfig {
  main: NavigationItem[];
  footer: NavigationItem[];
  legal: NavigationItem[];
}

export const navigationConfig: NavigationConfig = {
  main: [
    {
      label: 'About',
      href: '/about',
      showOn: ['desktop', 'mobile'],
    },
    {
      label: 'Features',
      href: '/#features',
      showOn: ['desktop', 'mobile'],
    },
    {
      label: 'FAQ',
      href: '/faq',
      showOn: ['desktop', 'mobile'],
    },
    {
      label: 'Contact',
      href: '/contact',
      showOn: ['desktop', 'mobile'],
    },
  ],
  footer: [
    {
      label: 'Twitter',
      href: 'https://twitter.com/degentalk',
      external: true,
      icon: 'twitter',
    },
    {
      label: 'Discord',
      href: 'https://discord.gg/degentalk',
      external: true,
      icon: 'discord',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/degentalk',
      external: true,
      icon: 'github',
    },
  ],
  legal: [
    {
      label: 'Terms',
      href: '/legal/terms',
    },
    {
      label: 'Privacy',
      href: '/legal/privacy',
    },
    {
      label: 'Disclaimer',
      href: '/legal/disclaimer',
    },
  ],
};