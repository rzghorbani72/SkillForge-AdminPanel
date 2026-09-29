import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { TutoringGroup } from '@/types/learning-operations';

/** Publishing a class is what writes its session dates. Shows the error and returns false on failure. */
export async function tryPublishClass(groupId: string): Promise<boolean> {
  try {
    await apiClient.publishTutoringGroup(groupId);
    return true;
  } catch (err) {
    ErrorHandler.handleApiError(err);
    return false;
  }
}

/**
 * A class can only be published after its course. One at a time, so the
 * teacher-clash check sees the classes published just before. Returns how
 * many stayed draft.
 */
export async function publishDraftClasses(groups: readonly TutoringGroup[]): Promise<number> {
  let failed = 0;
  for (const group of groups) {
    if (group.status !== 'DRAFT' || !group.Slots?.length) continue;
    if (!(await tryPublishClass(group.id))) failed += 1;
  }
  return failed;
}
