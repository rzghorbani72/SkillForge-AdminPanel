'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Plus,
  BookOpen,
  ShoppingBag,
  Users,
  BarChart3,
  FileText,
  Video,
  Headphones,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const QuickActions = () => {
  const { t } = useTranslation();

  const primaryActions = [
    {
      title: t('dashboard.createCourse'),
      description: t('dashboard.addNewCourse'),
      icon: BookOpen,
      href: '/courses/create',
      gradient: 'from-violet-500 to-purple-600',
      hoverGradient: 'hover:from-violet-600 hover:to-purple-700'
    },
    {
      title: t('dashboard.createProduct'),
      description: t('dashboard.addNewProduct'),
      icon: ShoppingBag,
      href: '/products/create',
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-teal-700'
    }
  ];

  const secondaryActions = [
    {
      title: t('dashboard.viewStudents'),
      icon: Users,
      href: '/students',
      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
    },
    {
      title: t('dashboard.viewAnalytics'),
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
    },
    {
      title: t('dashboard.uploadVideo'),
      icon: Video,
      href: '/videos',
      color: 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
    },
    {
      title: t('dashboard.uploadAudio'),
      icon: Headphones,
      href: '/audios',
      color: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20'
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t('dashboard.quickActions')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.quickActionsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions - Big buttons */}
        <div className="grid gap-3">
          {primaryActions.map((action, index) => (
            <Link key={index} href={action.href} className="block">
              <Button
                className={cn(
                  'group relative h-auto w-full justify-start overflow-hidden bg-gradient-to-r px-4 py-4 text-white transition-all',
                  action.gradient,
                  action.hoverGradient
                )}
              >
                <div className="flex w-full items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm text-white/80">
                      {action.description}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t('dashboard.moreActions')}
            </span>
          </div>
        </div>

        {/* Secondary Actions - Grid of smaller buttons */}
        <div className="grid grid-cols-2 gap-2">
          {secondaryActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="ghost"
                className={cn(
                  'h-auto w-full flex-col gap-2 py-4 transition-all',
                  action.color
                )}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
