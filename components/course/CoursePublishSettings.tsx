import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, EyeOff, Star, Award } from 'lucide-react';
import { Course } from '@/types/api';

type Props = { course: Course };

function SettingRow({
  icon: Icon,
  label,
  description,
  active,
  activeLabel,
  inactiveLabel
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Badge variant={active ? 'default' : 'secondary'} className="shrink-0">
        {active ? activeLabel : inactiveLabel}
      </Badge>
    </div>
  );
}

const CoursePublishSettings = ({ course }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingRow
          icon={course.is_published ? Globe : EyeOff}
          label="Visibility"
          description="Whether students can find and enroll in this course"
          active={course.is_published}
          activeLabel="Published"
          inactiveLabel="Draft"
        />
        <SettingRow
          icon={Star}
          label="Featured"
          description="Highlighted on the store homepage"
          active={course.is_featured}
          activeLabel="Featured"
          inactiveLabel="Not featured"
        />
        <SettingRow
          icon={Award}
          label="Certificate"
          description="Students receive a certificate on completion"
          active={!!course.is_certificate}
          activeLabel="Enabled"
          inactiveLabel="Disabled"
        />
      </CardContent>
    </Card>
  );
};

export default CoursePublishSettings;
