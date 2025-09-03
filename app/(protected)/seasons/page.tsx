'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import CreateSeasonDialog from '@/components/content/create-season-dialog';

export default function SeasonsPage() {
  const { selectedSchool } = useSchool();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [seasonsResponse, coursesResponse] = await Promise.all([
        apiClient.getSeasons(),
        apiClient.getCourses()
      ]);

      if (seasonsResponse.status === 'ok' && seasonsResponse.data) {
        const schoolSeasons = seasonsResponse.data.filter(
          (season: Season) => season.school_id === selectedSchool.id
        );
        setSeasons(schoolSeasons);
      }

      if (coursesResponse.status === 'ok' && coursesResponse.data) {
        const schoolCourses = coursesResponse.data.filter(
          (course: Course) => course.school_id === selectedSchool.id
        );
        setCourses(schoolCourses);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonCreated = () => {
    setIsCreateDialogOpen(false);
    fetchData();
  };

  const filteredSeasons = seasons.filter(
    (season) =>
      season.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to view seasons.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seasons</h1>
          <p className="text-muted-foreground">
            Manage seasons/modules for {selectedSchool.name}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Season
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search seasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{seasons.length}</div>
          <p className="text-xs text-muted-foreground">
            Course modules in {selectedSchool.name}
          </p>
        </CardContent>
      </Card>

      {/* Seasons Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSeasons.map((season) => (
          <Card key={season.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{season.title}</CardTitle>
              <CardDescription className="text-sm">
                {season.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <BookOpen className="mr-1 h-4 w-4" />
                    {season.course?.title || 'No Course'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Order: {season.order || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{season.type || 'Standard'}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Lessons: {season.lessons?.length || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Season Dialog */}
      {isCreateDialogOpen && (
        <CreateSeasonDialog
          onSeasonCreated={handleSeasonCreated}
          courses={courses}
          schoolId={selectedSchool.id}
        />
      )}
    </div>
  );
}
