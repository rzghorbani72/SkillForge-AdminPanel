'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Settings,
  DollarSign,
  Image as ImageIcon,
  BarChart2,
  ArrowLeft,
  Globe,
  EyeOff
} from 'lucide-react';
import { Course } from '@/types/api';
import CourseCover from './CourseCover';
import CourseInfo from './CourseInfo';
import CoursePricing from './CoursePricing';
import CourseAssociations from './CourseAssociations';
import CoursePublishSettings from './CoursePublishSettings';
import CourseManagement from './CourseManagement';
import CourseQnA from './CourseQnA';
import { StatusBadge } from '@/components/shared/status-badge';

interface CourseEditTabsProps {
  course: Course;
  onManageSeasons: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export default function CourseEditTabs({
  course,
  onManageSeasons,
  onEdit,
  onBack
}: CourseEditTabsProps) {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {course.title}
              </h1>
              <StatusBadge
                status={course.is_published ? 'published' : 'draft'}
              />
            </div>
            {course.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit Details
          </Button>
          <Button
            size="sm"
            variant={course.is_published ? 'secondary' : 'default'}
          >
            {course.is_published ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-10 w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
          {[
            { value: 'overview', label: 'Overview', icon: BookOpen },
            { value: 'content', label: 'Content', icon: BarChart2 },
            { value: 'media', label: 'Media', icon: ImageIcon },
            { value: 'pricing', label: 'Pricing', icon: DollarSign },
            { value: 'settings', label: 'Settings', icon: Settings }
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="relative h-10 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-sm font-medium text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <CourseInfo course={course} />
          <CourseAssociations course={course} />
        </TabsContent>

        <TabsContent value="content" className="mt-0 space-y-6">
          <CourseManagement
            course={course}
            onManageSeasons={onManageSeasons}
            onEdit={onEdit}
          />
          <CourseQnA courseId={course.id} />
        </TabsContent>

        <TabsContent value="media" className="mt-0 space-y-6">
          <CourseCover course={course} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-0 space-y-6">
          <CoursePricing course={course} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0 space-y-6">
          <CoursePublishSettings course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
