'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { CourseFormData } from './schema';
import { Tag, Star } from 'lucide-react';

type Props = {
  form: UseFormReturn<CourseFormData>;
};

export default function CreateCoursePricing({ form }: Props) {
  return (
    <div className="space-y-4">
      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter whole numbers (0 = free)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Sale price */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sale Price</span>
              </div>
              <FormField
                control={form.control}
                name="primary_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Amount *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min="0"
                        max="999999999"
                        step="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Original / crossed-out price */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Original Price</span>
                <span className="text-xs text-muted-foreground">
                  (shown crossed out)
                </span>
              </div>
              <FormField
                control={form.control}
                name="secondary_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min="0"
                        max="999999999"
                        step="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course settings */}
      <Card>
        <CardHeader>
          <CardTitle>Course Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Featured
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Highlighted on the homepage
                    </p>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
