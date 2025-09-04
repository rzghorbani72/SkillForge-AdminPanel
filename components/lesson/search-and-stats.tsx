import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Lesson } from '@/types/api';

const SearchAndStats = ({
  searchTerm,
  setSearchTerm,
  lessons
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  lessons: Lesson[];
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-10"
          />
        </div>
      </div>
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{lessons.length}</div>
              <div className="text-sm text-muted-foreground">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {lessons.filter((lesson) => lesson.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Lessons
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchAndStats;
