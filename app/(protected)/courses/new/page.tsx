'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient } from '@/lib/api';
import { ChevronDown, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react';

// Lightweight, single-page course builder. The flow is deliberately optimistic:
// the page assembles the full draft client-side, then on Save it issues a
// sequence — course → seasons → lessons — surfacing partial-progress on error
// so a failed lesson doesn't lose the course you already created.

type LessonDraft = {
  title: string;
  description: string;
  is_free: boolean;
  published: boolean;
};

type SeasonDraft = {
  title: string;
  description: string;
  lessons: LessonDraft[];
};

type CategoryOption = { id: number; name: string };

const emptyLesson = (): LessonDraft => ({
  title: '',
  description: '',
  is_free: false,
  published: false
});

const emptySeason = (): SeasonDraft => ({
  title: '',
  description: '',
  lessons: [emptyLesson()]
});

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [primaryPrice, setPrimaryPrice] = useState<number>(0);
  const [secondaryPrice, setSecondaryPrice] = useState<number>(0);
  const [published, setPublished] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [seasons, setSeasons] = useState<SeasonDraft[]>([emptySeason()]);
  const [saving, setSaving] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');

  useEffect(() => {
    apiClient
      .getCategories()
      .then((data: any) => {
        const list: CategoryOption[] = Array.isArray(data)
          ? data
          : (data?.data ?? []);
        setCategories(list);
      })
      .catch((e) => ErrorHandler.handleApiError(e));
  }, []);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && description.trim().length > 0 && !saving,
    [title, description, saving]
  );

  // Season helpers ----------------------------------------------------------

  const updateSeason = (idx: number, patch: Partial<SeasonDraft>) =>
    setSeasons((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const addSeason = () => setSeasons((s) => [...s, emptySeason()]);

  const removeSeason = (idx: number) =>
    setSeasons((s) => s.filter((_, i) => i !== idx));

  // Lesson helpers ----------------------------------------------------------

  const updateLesson = (
    seasonIdx: number,
    lessonIdx: number,
    patch: Partial<LessonDraft>
  ) =>
    setSeasons((s) =>
      s.map((season, i) =>
        i !== seasonIdx
          ? season
          : {
              ...season,
              lessons: season.lessons.map((l, j) =>
                j === lessonIdx ? { ...l, ...patch } : l
              )
            }
      )
    );

  const addLesson = (seasonIdx: number) =>
    setSeasons((s) =>
      s.map((season, i) =>
        i !== seasonIdx
          ? season
          : { ...season, lessons: [...season.lessons, emptyLesson()] }
      )
    );

  const removeLesson = (seasonIdx: number, lessonIdx: number) =>
    setSeasons((s) =>
      s.map((season, i) =>
        i !== seasonIdx
          ? season
          : {
              ...season,
              lessons: season.lessons.filter((_, j) => j !== lessonIdx)
            }
      )
    );

  // Submit ------------------------------------------------------------------

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      // 1. Create category if user typed a new one
      let resolvedCategoryId = categoryId ?? undefined;
      if (!resolvedCategoryId && newCategoryName.trim()) {
        setProgressMsg('Creating category…');
        const cat = await apiClient.createCategory({
          name: newCategoryName.trim(),
          type: 'COURSE'
        } as any);
        const catData = (cat as any)?.data?.data ?? (cat as any)?.data;
        resolvedCategoryId = catData?.id;
      }

      // 2. Create course
      setProgressMsg('Creating course…');
      const courseResp = await apiClient.createCourse({
        title: title.trim(),
        description: description.trim(),
        short_description: shortDescription.trim() || undefined,
        primary_price: primaryPrice,
        secondary_price: secondaryPrice,
        meta_tags: [],
        category_id: resolvedCategoryId,
        published
      });
      const courseData =
        (courseResp as any)?.data?.data ?? (courseResp as any)?.data;
      const courseId: number | undefined = courseData?.id;
      if (!courseId) {
        throw new Error('Course creation did not return an id');
      }

      // 3. Sequentially create seasons + lessons. If a season errors, abort —
      //    the partially-created course remains and the user can finish from
      //    the course detail page.
      for (let si = 0; si < seasons.length; si += 1) {
        const season = seasons[si];
        if (!season.title.trim()) continue;
        setProgressMsg(`Saving season ${si + 1}…`);
        const seasonResp = await apiClient.createSeason({
          title: season.title.trim(),
          description: season.description.trim() || undefined,
          order: si + 1,
          course_id: courseId
        });
        const seasonData =
          (seasonResp as any)?.data?.data ?? (seasonResp as any)?.data;
        const seasonId: number | undefined = seasonData?.id;
        if (!seasonId) continue;

        for (let li = 0; li < season.lessons.length; li += 1) {
          const lesson = season.lessons[li];
          if (!lesson.title.trim()) continue;
          setProgressMsg(`Saving season ${si + 1} lesson ${li + 1}…`);
          await apiClient.createLesson({
            title: lesson.title.trim(),
            description: lesson.description.trim() || undefined,
            season_id: seasonId,
            is_free: lesson.is_free,
            published: lesson.published
          });
        }
      }

      ErrorHandler.showSuccess('Course created');
      router.push(`/courses/${courseId}`);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setSaving(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New course</h1>
          <p className="text-sm text-muted-foreground">
            Compose the entire course — category, seasons, and lessons — in one
            go. You can refine details after saving.
          </p>
        </div>
        <Button
          onClick={submit}
          disabled={!canSubmit}
          className="min-w-[140px]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {progressMsg || 'Saving…'}
            </span>
          ) : (
            'Save course'
          )}
        </Button>
      </header>

      {/* Course basics ----------------------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Short description</Label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input
              type="number"
              min={0}
              value={primaryPrice}
              onChange={(e) => setPrimaryPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Original price (optional)</Label>
            <Input
              type="number"
              min={0}
              value={secondaryPrice}
              onChange={(e) => setSecondaryPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId ?? ''}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">— pick existing —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Or new category name</Label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="leave blank to skip"
              disabled={categoryId !== null}
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={published} onCheckedChange={setPublished} />
            <Label
              className="cursor-pointer"
              onClick={() => setPublished(!published)}
            >
              Publish immediately
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Seasons & lessons ------------------------------------------------ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Seasons & lessons</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag to reorder isn't wired yet — seasons save in the order listed
              here.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addSeason}>
            <Plus className="mr-1 h-4 w-4" />
            Add season
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {seasons.map((season, si) => (
            <details
              key={si}
              open
              className="rounded-md border border-border/60 bg-card/30"
            >
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">
                  Season {si + 1}
                  {season.title ? ` — ${season.title}` : ''}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    removeSeason(si);
                  }}
                  disabled={seasons.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </summary>
              <div className="space-y-4 px-4 pb-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Season title</Label>
                    <Input
                      value={season.title}
                      onChange={(e) =>
                        updateSeason(si, { title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Season description</Label>
                    <Input
                      value={season.description}
                      onChange={(e) =>
                        updateSeason(si, { description: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {season.lessons.map((lesson, li) => (
                    <div
                      key={li}
                      className="rounded-md border border-border/40 bg-background/40 p-3"
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Lesson {li + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLesson(si, li)}
                          disabled={season.lessons.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Title</Label>
                          <Input
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(si, li, { title: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Description</Label>
                          <Input
                            value={lesson.description}
                            onChange={(e) =>
                              updateLesson(si, li, {
                                description: e.target.value
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lesson.is_free}
                            onCheckedChange={(v) =>
                              updateLesson(si, li, { is_free: v })
                            }
                          />
                          <Label className="text-sm">Free preview</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lesson.published}
                            onCheckedChange={(v) =>
                              updateLesson(si, li, { published: v })
                            }
                          />
                          <Label className="text-sm">Published</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addLesson(si)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add lesson
                  </Button>
                </div>
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
