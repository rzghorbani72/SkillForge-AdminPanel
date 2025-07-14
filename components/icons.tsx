import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircuitBoardIcon,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  LayoutDashboardIcon,
  Loader2,
  LucideIcon,
  LogOut,
  Newspaper,
  LucideShoppingBag,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  UserCircle2Icon,
  UserPen,
  TvMinimalPlay,
  UserX2Icon,
  School,
  CirclePlus,
  X
} from 'lucide-react';
export type IconType =
  | 'media'
  | 'article'
  | 'course'
  | 'school'
  | 'createSchool'
  | 'close'
  | 'product'
  | 'spinner'
  | 'kanban'
  | 'chevronLeft'
  | 'chevronRight'
  | 'trash'
  | 'employee'
  | 'post'
  | 'page'
  | 'userPen'
  | 'user2'
  | 'media'
  | 'settings'
  | 'billing'
  | 'ellipsis'
  | 'add'
  | 'warning'
  | 'user'
  | 'arrowRight'
  | 'help'
  | 'pizza'
  | 'sun'
  | 'moon'
  | 'laptop'
  | 'twitter'
  | 'check';
export type Icon = LucideIcon;

export const Icons = {
  dashboard: LayoutDashboardIcon,
  logo: Command,
  logout: LogOut,
  article: Newspaper,
  course: TvMinimalPlay,
  school: School,
  createSchool: CirclePlus,
  close: X,
  product: LucideShoppingBag,
  spinner: Loader2,
  kanban: CircuitBoardIcon,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  employee: UserX2Icon,
  post: FileText,
  page: File,
  userPen: UserPen,
  user2: UserCircle2Icon,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  twitter: Twitter,
  check: Check
};
