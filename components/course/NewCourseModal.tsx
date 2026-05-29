'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiToast } from '@/lib/api-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useStore } from '@/hooks/useStore';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { StepIndicator } from './steps/StepIndicator';
import { Step1Details } from './steps/Step1Details';
import { Step2Content } from './steps/Step2Content';
import { Step3Pricing } from './steps/Step3Pricing';
import { Step4Publish } from './steps/Step4Publish';
import {
  PricingType,
  PublishStatus,
  Section,
  extractList
} from './steps/course-modal-types';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  editCourseId?: number;
}

export default function NewCourseModal({
  open,
  onClose,
  onCreated,
  editCourseId
}: Props) {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { user } = useAuthUser();
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editCourseId;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [teachers, setTeachers] = useState<
    { id: number; display_name: string }[]
  >([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [teacherId, setTeacherId] = useState('');
  const [description, setDescription] = useState('');
  const [coverId, setCoverId] = useState<string | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  const [pricingType, setPricingType] = useState<PricingType>('ONE_TIME');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [commission, setCommission] = useState('15');
  const [cookieDays, setCookieDays] = useState('30');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('DRAFT');

  const fetchCategories = useCallback(async () => {
    try {
      const catsRaw = await apiClient.getCategories();
      const catList = extractList(catsRaw).map((c) => ({
        id: String((c as Record<string, unknown>).id),
        name: (c as Record<string, unknown>).name as string
      }));
      setCategories(catList);
    } catch {
      /* non-critical */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    async function loadDropdowns() {
      try {
        const [catsRaw, teachersRaw] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getTeacherUsers({ limit: 100 })
        ]);

        const catList = extractList(catsRaw).map((c) => ({
          id: String((c as Record<string, unknown>).id),
          name: (c as Record<string, unknown>).name as string
        }));
        setCategories(catList);

        const teacherList = extractList(teachersRaw).map((teacher) => ({
          id: (teacher as Record<string, unknown>).id as number,
          display_name:
            ((teacher as Record<string, unknown>).display_name as string) ??
            ((teacher as Record<string, unknown>).name as string) ??
            t('courses.userWithId', {
              id: String((teacher as Record<string, unknown>).id)
            })
        }));

        if (!isEditMode && user?.role === 'MANAGER') {
          const managerEntry = {
            id: user.id,
            display_name:
              user.profile?.display_name ?? t('courses.managerDefault')
          };
          const alreadyIn = teacherList.some(
            (teacher) => teacher.id === user.id
          );
          setTeachers(alreadyIn ? teacherList : [managerEntry, ...teacherList]);
          setTeacherId(String(user.id));
        } else {
          setTeachers(teacherList);
        }
      } catch {
        /* non-critical — dropdowns stay empty */
      }
    }
    loadDropdowns();
  }, [open, isEditMode, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !editCourseId) return;
    async function loadCourse() {
      setLoadingEdit(true);
      try {
        const raw = await apiClient.getCourse(editCourseId!);
        const c = (raw as Record<string, unknown>)?.data
          ? ((raw as Record<string, unknown>).data as Record<string, unknown>)
          : (raw as Record<string, unknown>);

        setTitle((c.title as string) ?? '');
        setCategoryId(c.category_id ? String(c.category_id) : '');
        setLevel((c.level as string) ?? 'BEGINNER');
        setTeacherId(c.teacher_id ? String(c.teacher_id) : '');
        setDescription((c.description as string) ?? '');
        const coverUrl =
          ((c.cover as Record<string, unknown>)?.url as string) ??
          ((c.cover as Record<string, unknown>)?.file_path as string) ??
          null;
        if (c.cover_id) setCoverId(String(c.cover_id));
        if (coverUrl) setCoverPreview(coverUrl);
        setPricingType((c.pricing_type as PricingType) ?? 'ONE_TIME');
        setPrice(c.primary_price ? String(c.primary_price) : '');
        setPublishStatus(c.published ? 'PUBLISHED' : 'DRAFT');
      } catch {
        toast.error(t('courses.errorLoadingCourse'));
      } finally {
        setLoadingEdit(false);
      }
    }
    loadCourse();
  }, [open, editCourseId]); // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setStep(1);
    setTitle('');
    setCategoryId('');
    setLevel('BEGINNER');
    setTeacherId('');
    setDescription('');
    setCoverId(undefined);
    setCoverPreview(null);
    setSections([]);
    setPricingType('ONE_TIME');
    setPrice('');
    setDiscount('0');
    setAffiliateEnabled(false);
    setCommission('15');
    setCookieDays('30');
    setPublishStatus('DRAFT');
    setShowNewCategory(false);
    setNewCategoryName('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  const handleCoverClick = useCallback(() => fileRef.current?.click(), []);
  const handleRemoveCover = useCallback(() => {
    setCoverId(undefined);
    setCoverPreview(null);
  }, []);
  const handleToggleNewCategory = useCallback(
    () => setShowNewCategory((v) => !v),
    []
  );
  const handleCancelCategory = useCallback(() => {
    setShowNewCategory(false);
    setNewCategoryName('');
  }, []);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await apiClient.createCategory({
        name: newCategoryName.trim(),
        type: 'COURSE'
      });
      // request() returns { data: <backend body> }
      // backend body is { message, status, data: newCategory }
      const body = (res as unknown as Record<string, unknown>)?.data as Record<
        string,
        unknown
      >;
      const cat = (body?.data as Record<string, unknown>) ?? body;
      const newId = String(cat.id);
      await fetchCategories();
      setCategoryId(newId);
      setNewCategoryName('');
      setShowNewCategory(false);
      apiToast.success(res, t('courses.categoryCreated'));
    } catch (err) {
      apiToast.error(err, t('courses.errorCreatingCategory'));
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await apiClient.uploadImage(file, {
        title: title || 'Cover'
      });
      const rawResult = result as unknown as Record<string, unknown>;
      const id =
        rawResult?.id ?? (rawResult?.data as Record<string, unknown>)?.id;
      if (id) {
        setCoverId(String(id));
        const reader = new FileReader();
        reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    } catch {
      toast.error(t('courses.errorUploadingImage'));
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setUploading(false);
    }
  }

  function validateStep(): boolean {
    if (step === 1 && title.trim().length < 5) {
      toast.error(t('courses.titleMinLength'));
      return false;
    }
    return true;
  }

  function buildPayload(published: boolean) {
    const priceNum = pricingType === 'FREE' ? 0 : Number(price) || 0;
    return {
      title: title.trim(),
      description: description.trim() || '—',
      primary_price: priceNum,
      secondary_price: 0,
      pricing_type: pricingType,
      published,
      category_id: categoryId ? Number(categoryId) : undefined,
      cover_id: coverId ? Number(coverId) : undefined,
      teacher_id: teacherId ? Number(teacherId) : undefined,
      seasons:
        sections.length > 0
          ? sections.map((sec) => ({
              title: sec.title,
              lessons: sec.lessons.map((l) => ({ title: l.title }))
            }))
          : undefined
    };
  }

  async function handleSaveDraft() {
    if (!selectedAcademy) return;
    if (!title.trim()) {
      toast.error(t('courses.enterCourseTitle'));
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        await apiClient.updateCourse(
          editCourseId!,
          buildPayload(false) as Parameters<typeof apiClient.updateCourse>[1]
        );
        toast.success(t('courses.courseUpdated'));
      } else {
        const res = await apiClient.createCourse(
          buildPayload(false) as Parameters<typeof apiClient.createCourse>[0]
        );
        const rawRes = res as unknown as Record<string, unknown>;
        const id = rawRes?.data
          ? (rawRes.data as Record<string, unknown>).id
          : rawRes?.id;
        toast.success(t('courses.draftSaved'));
        handleClose();
        onCreated?.();
        if (id) router.push(`/courses/${id}`);
        return;
      }
      handleClose();
      onCreated?.();
    } catch {
      toast.error(t('courses.errorSaving'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!selectedAcademy) return;
    if (!title.trim()) {
      toast.error(t('courses.enterCourseTitle'));
      return;
    }
    setSaving(true);
    try {
      const published = publishStatus === 'PUBLISHED';
      if (isEditMode) {
        await apiClient.updateCourse(
          editCourseId!,
          buildPayload(published) as Parameters<
            typeof apiClient.updateCourse
          >[1]
        );
        toast.success(t('courses.courseUpdated'));
      } else {
        const res = await apiClient.createCourse(
          buildPayload(published) as Parameters<
            typeof apiClient.createCourse
          >[0]
        );
        const rawRes = res as unknown as Record<string, unknown>;
        const id = rawRes?.data
          ? (rawRes.data as Record<string, unknown>).id
          : rawRes?.id;
        toast.success(
          published ? t('courses.coursePublished') : t('courses.courseSaved')
        );
        handleClose();
        onCreated?.();
        if (id) router.push(`/courses/${id}`);
        return;
      }
      handleClose();
      onCreated?.();
    } catch {
      toast.error(t('courses.errorSavingCourse'));
    } finally {
      setSaving(false);
    }
  }

  const isLastStep = step === 4;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="flex max-h-[92vh] max-w-[680px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pb-0 pe-12 pt-5 text-start">
          <p className="text-[11px] text-muted-foreground">
            {isEditMode ? t('courses.editCourse') : t('courses.newCourse')}
          </p>
          <DialogTitle className="text-[17px] font-bold">
            {isEditMode
              ? t('courses.editCourseDetails')
              : t('courses.createCourseTitle')}
          </DialogTitle>
        </DialogHeader>

        <StepIndicator step={step} />

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loadingEdit ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <Step1Details
                  title={title}
                  setTitle={setTitle}
                  categoryId={categoryId}
                  setCategoryId={setCategoryId}
                  level={level}
                  setLevel={setLevel}
                  teacherId={teacherId}
                  setTeacherId={setTeacherId}
                  description={description}
                  setDescription={setDescription}
                  coverPreview={coverPreview}
                  uploading={uploading}
                  onCoverClick={handleCoverClick}
                  onRemoveCover={handleRemoveCover}
                  fileRef={fileRef}
                  handleFileChange={handleCoverChange}
                  categories={categories}
                  teachers={teachers}
                  showNewCategory={showNewCategory}
                  newCategoryName={newCategoryName}
                  setNewCategoryName={setNewCategoryName}
                  onToggleNewCategory={handleToggleNewCategory}
                  onCreateCategory={handleCreateCategory}
                  onCancelCategory={handleCancelCategory}
                  creatingCategory={creatingCategory}
                />
              )}
              {step === 2 && (
                <Step2Content sections={sections} setSections={setSections} />
              )}
              {step === 3 && (
                <Step3Pricing
                  pricingType={pricingType}
                  setPricingType={setPricingType}
                  price={price}
                  setPrice={setPrice}
                  discount={discount}
                  setDiscount={setDiscount}
                  affiliateEnabled={affiliateEnabled}
                  setAffiliateEnabled={setAffiliateEnabled}
                  commission={commission}
                  setCommission={setCommission}
                  cookieDays={cookieDays}
                  setCookieDays={setCookieDays}
                />
              )}
              {step === 4 && (
                <Step4Publish
                  title={title}
                  hasCover={!!coverId}
                  sections={sections}
                  publishStatus={publishStatus}
                  setPublishStatus={setPublishStatus}
                />
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                {t('courses.prevStep')}
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
            >
              {isEditMode ? t('common.save') : t('courses.saveDraft')}
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? t('courses.submitting')
                  : isEditMode
                    ? t('common.update')
                    : t('courses.publishCourse')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (validateStep()) setStep((s) => s + 1);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t('courses.nextStep')}
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
