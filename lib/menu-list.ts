import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  Video,
  Image,
  Volume2,
  FileText,
  LucideIcon
} from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          active: pathname.includes('/dashboard'),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: 'Contents',
      menus: [
        {
          href: '',
          label: 'Posts',
          active: pathname.includes('/posts'),
          icon: SquarePen,
          submenus: [
            {
              href: '/posts',
              label: 'All Posts'
            },
            {
              href: '/posts/new',
              label: 'New Post'
            }
          ]
        },
        {
          href: '/categories',
          label: 'Categories',
          active: pathname.includes('/categories'),
          icon: Bookmark
        },
        {
          href: '/tags',
          label: 'Tags',
          active: pathname.includes('/tags'),
          icon: Tag
        }
      ]
    },
    {
      groupLabel: 'Media Library',
      menus: [
        {
          href: '/videos',
          label: 'Videos',
          active: pathname.includes('/videos'),
          icon: Video
        },
        {
          href: '/images',
          label: 'Images',
          active: pathname.includes('/images'),
          icon: Image
        },
        {
          href: '/audios',
          label: 'Audios',
          active: pathname.includes('/audios'),
          icon: Volume2
        },
        {
          href: '/documents',
          label: 'Documents',
          active: pathname.includes('/documents'),
          icon: FileText
        }
      ]
    },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/users',
          label: 'Users',
          active: pathname.includes('/users'),
          icon: Users,
          submenus: [
            {
              href: '/users',
              label: 'All Users',
              active: pathname === '/users'
            },
            {
              href: '/users/students',
              label: 'Students',
              active: pathname.startsWith('/users/students')
            },
            {
              href: '/users/teachers',
              label: 'Teachers',
              active: pathname.startsWith('/users/teachers')
            },
            {
              href: '/users/managers',
              label: 'Managers',
              active: pathname.startsWith('/users/managers')
            },
            {
              href: '/users/teacher-requests',
              label: 'Teacher Requests',
              active: pathname.startsWith('/users/teacher-requests')
            }
          ]
        },
        {
          href: '/account',
          label: 'Account',
          active: pathname.includes('/account'),
          icon: Settings
        }
      ]
    }
  ];
}
