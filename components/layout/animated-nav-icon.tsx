'use client';

import type { IconType } from '@/components/icons';
import {
  AnimatedHoverIcon,
  type AnimateNavIcon
} from '@/components/layout/animated-hover-icon';
import { ActivityIcon } from '@animateicons/react/lucide/activity-icon';
import { BadgePercentIcon } from '@animateicons/react/lucide/badge-percent-icon';
import { BookOpenIcon } from '@animateicons/react/lucide/book-open-icon';
import { CalendarIcon } from '@animateicons/react/lucide/calendar-icon';
import { CreditCardIcon } from '@animateicons/react/lucide/credit-card-icon';
import { FileTextIcon } from '@animateicons/react/lucide/file-text-icon';
import { GlobeIcon } from '@animateicons/react/lucide/globe-icon';
import { HardDriveIcon } from '@animateicons/react/lucide/hard-drive-icon';
import { ImageIcon } from '@animateicons/react/lucide/image-icon';
import { InfoIcon } from '@animateicons/react/lucide/info-icon';
import { LayersIcon } from '@animateicons/react/lucide/layers-icon';
import { LayoutDashboardIcon } from '@animateicons/react/lucide/layout-dashboard-icon';
import { MegaphoneIcon } from '@animateicons/react/lucide/megaphone-icon';
import { MonitorIcon } from '@animateicons/react/lucide/monitor-icon';
import { SearchIcon } from '@animateicons/react/lucide/search-icon';
import { SettingsIcon } from '@animateicons/react/lucide/settings-icon';
import { ShieldCheckIcon } from '@animateicons/react/lucide/shield-check-icon';
import { StoreIcon } from '@animateicons/react/lucide/store-icon';
import { TrendingUpIcon } from '@animateicons/react/lucide/trending-up-icon';
import { TvMinimalIcon } from '@animateicons/react/lucide/tv-minimal-icon';
import { UserPlusIcon } from '@animateicons/react/lucide/user-plus-icon';
import { UsersIcon } from '@animateicons/react/lucide/users-icon';
import { VideoIcon } from '@animateicons/react/lucide/video-icon';
import { WalletIcon } from '@animateicons/react/lucide/wallet-icon';

type AnimatedNavIconProps = {
  name?: IconType;
  playing: boolean;
  className?: string;
};

const NAV_ICONS: Partial<Record<IconType, AnimateNavIcon>> = {
  dashboard: LayoutDashboardIcon,
  store: StoreIcon,
  users: UsersIcon,
  help: InfoIcon,
  dollarSign: WalletIcon,
  gallery: ImageIcon,
  image: ImageIcon,
  settings: SettingsIcon,
  shield: ShieldCheckIcon,
  course: TvMinimalIcon,
  video: VideoIcon,
  media: VideoIcon,
  bookOpen: BookOpenIcon,
  layout: MonitorIcon,
  trendingUp: TrendingUpIcon,
  barChart: TrendingUpIcon,
  network: GlobeIcon,
  globe: GlobeIcon,
  activity: ActivityIcon,
  fileText: FileTextIcon,
  megaphone: MegaphoneIcon,
  search: SearchIcon,
  layers: LayersIcon,
  percent: BadgePercentIcon,
  userPlus: UserPlusIcon,
  banknote: WalletIcon,
  wallet2: WalletIcon,
  billing: CreditCardIcon,
  calendarClock: CalendarIcon,
  hardDrive: HardDriveIcon
};

export function AnimatedNavIcon({
  name,
  playing,
  className
}: AnimatedNavIconProps) {
  const icon = (name && NAV_ICONS[name]) || LayoutDashboardIcon;

  return (
    <AnimatedHoverIcon icon={icon} playing={playing} className={className} />
  );
}
