import { BookOpen, FileText, Folder } from 'lucide-react';
import { ReactElement } from 'react';

export const getCategoryTypeIcon = (type: string): ReactElement => {
  switch (type) {
    case 'COURSE':
      return <BookOpen className="h-4 w-4" />;
    case 'ARTICLE':
      return <FileText className="h-4 w-4" />;
    case 'BLOG':
      return <FileText className="h-4 w-4" />;
    case 'NEWS':
      return <FileText className="h-4 w-4" />;
    default:
      return <Folder className="h-4 w-4" />;
  }
};

export const getCategoryTypeColor = (type: string) => {
  switch (type) {
    case 'COURSE':
      return 'bg-blue-100 text-blue-800';
    case 'ARTICLE':
      return 'bg-green-100 text-green-800';
    case 'BLOG':
      return 'bg-purple-100 text-purple-800';
    case 'NEWS':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export type CategoryType = 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS';
export type FilterType = 'all' | CategoryType;
