import type { NavItem } from '@/types';
import { academyNavItems } from './academy-nav-items';
import { platformNavItems } from './platform-nav-items';

export const navItems: NavItem[] = [...platformNavItems, ...academyNavItems];
