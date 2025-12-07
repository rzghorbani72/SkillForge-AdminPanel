'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BookOpen, DollarSign, Users } from 'lucide-react';
import { Course, Enrollment, Payment } from '@/types/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
};

const RecentLists = ({ courses, enrollments, payments }: Props) => {
  const { t, language } = useTranslation();
  const store = useCurrentStore();

  return (
    <Tabs
      defaultValue="courses"
      className="space-y-4"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      <TabsList>
        <TabsTrigger value="courses">
          {t('dashboard.recentCourses')}
        </TabsTrigger>
        <TabsTrigger value="enrollments">
          {t('dashboard.recentEnrollments')}
        </TabsTrigger>
        <TabsTrigger value="payments">
          {t('dashboard.recentPayments')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="courses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentCourses')}</CardTitle>
            <CardDescription>
              {t('dashboard.recentCoursesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium leading-none">
                      {course.title}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {course.short_description ||
                        course.description?.substring(0, 100)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={course.is_published ? 'default' : 'secondary'}
                    >
                      {course.is_published
                        ? t('dashboard.published')
                        : t('dashboard.draft')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {course.students_count} {t('dashboard.students')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="enrollments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentEnrollments')}</CardTitle>
            <CardDescription>
              {t('dashboard.recentEnrollmentsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    {t('dashboard.noRecentEnrollments')}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('dashboard.enrollmentsWillAppear')}
                  </p>
                </div>
              ) : (
                enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-4">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        {enrollment.user?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-medium leading-none">
                        {enrollment.user?.name || t('dashboard.unknownUser')}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {t('dashboard.enrolledIn')}{' '}
                        {enrollment.course?.title ||
                          t('dashboard.unknownCourse')}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {enrollment.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentPayments')}</CardTitle>
            <CardDescription>
              {t('dashboard.recentPaymentsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="py-8 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    {t('dashboard.noRecentPayments')}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('dashboard.paymentsWillAppear')}
                  </p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-medium leading-none">
                        {payment.user?.name || t('dashboard.unknownUser')}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {payment.course?.title || t('dashboard.unknownCourse')}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-sm font-medium">
                        {formatCurrencyWithStore(payment.amount ?? 0, store)}
                      </p>
                      <Badge
                        variant={
                          payment.status === 'COMPLETED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default RecentLists;
