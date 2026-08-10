/** Shape returned by GET /videos (Backend VIDEO_PUBLIC_SELECT + generated urls). */
export interface VideoItem {
  id: string;
  title: string;
  description?: string | null;
  poster_url?: string | null;
  duration?: number | null;
  size?: number | null;
  mime_type?: string | null;
  created_at?: string;
  streaming_url?: string;
  Profile?: { id: string; display_name?: string | null };
  Lesson?: { id: string; title: string }[];
}
