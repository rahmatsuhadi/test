import { NavItem } from "@/types";


export const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: 'dashboard',
      isActive: false,
      shortcut: ['d', 'd'],
      items: [] // Empty array as there are no child items for Dashboard
    },
    // {
    //   title: 'Databases',
    //   url: '/dash/databases',
    //   icon: 'product',
    //   shortcut: ['d', 'd'],
    //   isActive: false,
    //   items: [] // No child items
    // },
    // {
    //   title: 'Tables',
    //   url: '#', // Placeholder as there is no direct link for the parent
    //   icon: 'billing',
    //   isActive: true,
  
    //   items: [
    //     {
    //       title: 'Users',
    //       url: '/dashboard/profile',
    //       icon: 'userPen',
    //       shortcut: ['m', 'm']
    //     },
    //     {
    //       title: 'Produk',
    //       shortcut: ['l', 'l'],
    //       url: '/',
    //       icon: 'login'
    //     }
    //   ]
    // },
    // {
    //   title: 'Kanban',
    //   url: '/dashboard/kanban',
    //   icon: 'kanban',
    //   shortcut: ['k', 'k'],
    //   isActive: false,
    //   items: [] // No child items
    // }
  ];