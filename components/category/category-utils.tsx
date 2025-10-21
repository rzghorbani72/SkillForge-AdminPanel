import {
  BookOpen,
  FileText,
  Folder,
  Video,
  Volume2,
  Image,
  Newspaper
} from 'lucide-react';
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
      return <Newspaper className="h-4 w-4" />;
    case 'VIDEO':
      return <Video className="h-4 w-4" />;
    case 'AUDIO':
      return <Volume2 className="h-4 w-4" />;
    case 'DOCUMENT':
      return <FileText className="h-4 w-4" />;
    case 'IMAGE':
      return <Image className="h-4 w-4" />;
    case 'ROOT':
      return <Folder className="h-4 w-4" />;
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
    case 'VIDEO':
      return 'bg-red-100 text-red-800';
    case 'AUDIO':
      return 'bg-yellow-100 text-yellow-800';
    case 'DOCUMENT':
      return 'bg-indigo-100 text-indigo-800';
    case 'IMAGE':
      return 'bg-pink-100 text-pink-800';
    case 'ROOT':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export enum CategoryType {
  COURSE = 'COURSE',
  ARTICLE = 'ARTICLE',
  BLOG = 'BLOG',
  NEWS = 'NEWS',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  ROOT = 'ROOT'
}
export const getCategoryTypeLabel = (type: string): string => {
  switch (type) {
    case 'COURSE':
      return 'Course';
    case 'ARTICLE':
      return 'Article';
    case 'BLOG':
      return 'Blog';
    case 'NEWS':
      return 'News';
    case 'VIDEO':
      return 'Video';
    case 'AUDIO':
      return 'Audio';
    case 'DOCUMENT':
      return 'Document';
    case 'IMAGE':
      return 'Image';
    case 'ROOT':
      return 'Root';
    default:
      return 'All';
  }
};
export type FilterType = 'all' | CategoryType;
