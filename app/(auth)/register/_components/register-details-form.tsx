'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Eye, EyeOff, Loader2, User, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { toEnglishDigits } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';

export type RegisterValues = {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

interface RegisterDetailsFormProps {
  form: UseFormReturn<RegisterValues>;
  loading: boolean;
  onSubmit: (values: RegisterValues) => void;
}

export function RegisterDetailsForm({
  form,
  loading,
  onSubmit
}: RegisterDetailsFormProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t('auth.yourDetails')}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.fullName')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User
                      className={cn(
                        'absolute top-2.5 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-3' : 'left-3'
                      )}
                    />
                    <Input
                      className={isRTL ? 'pr-9' : 'pl-9'}
                      placeholder={t('auth.fullNamePlaceholder')}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.phoneNumber')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone
                      className={cn(
                        'absolute top-2.5 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-3' : 'left-3'
                      )}
                    />
                    <Input
                      type="tel"
                      dir="ltr"
                      className={isRTL ? 'pr-9' : 'pl-9'}
                      placeholder={t('auth.phonePlaceholder')}
                      {...field}
                      onChange={(e) =>
                        field.onChange(toEnglishDigits(e.target.value))
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className={cn(
                        'absolute top-2.5 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-3' : 'left-3'
                      )}
                    />
                    <Input
                      type={showPw ? 'text' : 'password'}
                      className="pl-9 pr-9"
                      placeholder={t('auth.passwordPlaceholder')}
                      {...field}
                      onChange={(e) =>
                        field.onChange(toEnglishDigits(e.target.value))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="toggle password"
                      className={cn(
                        'absolute top-0 h-full w-9 text-muted-foreground hover:bg-transparent',
                        isRTL ? 'left-0' : 'right-0'
                      )}
                      onClick={() => setShowPw((v) => !v)}
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock
                      className={cn(
                        'absolute top-2.5 h-4 w-4 text-muted-foreground',
                        isRTL ? 'right-3' : 'left-3'
                      )}
                    />
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      className="pl-9 pr-9"
                      placeholder={t('auth.repeatPasswordPlaceholder')}
                      {...field}
                      onChange={(e) =>
                        field.onChange(toEnglishDigits(e.target.value))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="toggle confirm password"
                      className={cn(
                        'absolute top-0 h-full w-9 text-muted-foreground hover:bg-transparent',
                        isRTL ? 'left-0' : 'right-0'
                      )}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.sending')}
              </>
            ) : (
              t('auth.continueBtn')
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
