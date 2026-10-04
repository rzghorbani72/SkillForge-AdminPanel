import { apiClient } from '@/lib/api';
import type { TutoringGroup, UpdateTutoringGroupPayload } from '@/types/learning-operations';
import type { GroupWrite, LiveClassDraft } from './live-class-draft';

const SCHEDULE_EDITABLE_STATUSES: readonly string[] = ['DRAFT', 'WAITING'];

/** Once a class has started, its dates are a promise: change them from the class page. */
export const isScheduleEditable = (group: TutoringGroup | null): boolean =>
  group === null || SCHEDULE_EDITABLE_STATUSES.includes(group.status);

function updatePayload(write: GroupWrite, editable: boolean): UpdateTutoringGroupPayload {
  const money = { title: write.title, capacity: write.capacity, seat_price: write.seat_price };
  if (!editable) return money;
  return {
    ...money,
    session_count: write.session_count,
    starts_on_requested: write.starts_on_requested,
    join_deadline: write.join_deadline,
  };
}

/**
 * AUTO needs no call on a new class: publishing creates the protected room.
 * Switching back from an own link regenerates our room.
 */
async function syncMeetingLink(
  group: TutoringGroup,
  previous: TutoringGroup | null,
  draft: LiveClassDraft,
): Promise<void> {
  const notify = group.status !== 'DRAFT';
  const wasOwnLink = previous?.meeting_url_source === 'MANUAL' && Boolean(previous.meeting_url);
  if (draft.meeting === 'OWN') {
    const url = draft.meetingUrl.trim();
    if (url !== previous?.meeting_url) {
      await apiClient.updateTutoringGroupMeetingLink(group.id, url, notify);
    }
    return;
  }
  if (wasOwnLink) await apiClient.updateTutoringGroupMeetingLink(group.id, null, notify, true);
}

/** Creates or updates one of the course's classes from the wizard draft. */
export async function saveLiveClass(
  previous: TutoringGroup | null,
  offerId: string,
  write: GroupWrite,
  draft: LiveClassDraft,
): Promise<TutoringGroup> {
  if (!previous) {
    const created = await apiClient.createTutoringGroup({ offer_id: offerId, ...write });
    await syncMeetingLink(created, null, draft);
    return created;
  }
  const editable = isScheduleEditable(previous);
  const updated = await apiClient.updateTutoringGroup(previous.id, updatePayload(write, editable));
  if (editable) await apiClient.replaceTutoringGroupSlots(previous.id, write.slots);
  await syncMeetingLink(updated, previous, draft);
  return updated;
}
