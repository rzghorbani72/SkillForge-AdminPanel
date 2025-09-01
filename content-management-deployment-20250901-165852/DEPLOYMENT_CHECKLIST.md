# Deployment Checklist

## Pre-Deployment

- [ ] Backend API is running and accessible
- [ ] All required dependencies are installed
- [ ] File upload directories have proper permissions
- [ ] Database schema supports new content types

## File Transfer

- [ ] Copy all component files to `components/content/`
- [ ] Update `app/(protected)/content/page.tsx`
- [ ] Update `lib/api.ts` with new endpoints
- [ ] Verify file permissions are correct

## Testing

- [ ] Content creation hub opens correctly
- [ ] Course creation form works
- [ ] Lesson creation form works
- [ ] Season creation form works
- [ ] Audio upload works
- [ ] Document upload works
- [ ] File size limits are enforced
- [ ] Form validation works
- [ ] Error handling works
- [ ] Content lists display correctly

## Post-Deployment

- [ ] Test with different file types
- [ ] Verify content associations work
- [ ] Check search and filtering
- [ ] Test with large files
- [ ] Verify statistics display correctly

## Rollback Plan

If issues occur:

1. Restore original `page.tsx` and `api.ts` files
2. Remove `components/content/` directory
3. Restart the application
