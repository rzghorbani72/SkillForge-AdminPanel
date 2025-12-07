# Content Management System Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the comprehensive content management system for your SkillForge store platform. The system includes course creation, lesson management, season organization, audio uploads, and document management.

## New Components Created

### 1. Content Creation Dialogs

- **CreateCourseDialog** (`components/content/create-course-dialog.tsx`)
  - Full course creation with title, description, pricing, difficulty, categories
  - Cover image upload support
  - Free/paid course options
- **CreateLessonDialog** (`components/content/create-lesson-dialog.tsx`)
  - Lesson creation with title, description, content, duration
  - Course and season association
  - Media file attachment (video, audio, documents)
- **CreateSeasonDialog** (`components/content/create-season-dialog.tsx`)
  - Season/module creation for course organization
  - Course association and description
- **UploadAudioDialog** (`components/content/upload-audio-dialog.tsx`)
  - Audio file upload with metadata
  - Course association and tagging
  - Support for MP3, WAV, AAC, OGG, M4A, FLAC formats
- **UploadDocumentDialog** (`components/content/upload-document-dialog.tsx`)
  - Document upload with categorization
  - Support for PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD
  - Course association and tagging

### 2. Content Creation Hub

- **ContentCreationHub** (`components/content/content-creation-hub.tsx`)
  - Centralized interface for all content creation
  - Card-based selection of content types
  - Integrated workflow for content creation

### 3. Enhanced Content Page

- Updated main content page with comprehensive overview
- Course, lesson, season, and media management tabs
- Statistics dashboard with content counts
- Search and filtering capabilities

## Installation Steps

### Step 1: Transfer Files

Copy the following files to your server:

```
SkillForge-AdminPanel/
├── components/content/
│   ├── create-course-dialog.tsx
│   ├── create-lesson-dialog.tsx
│   ├── create-season-dialog.tsx
│   ├── upload-audio-dialog.tsx
│   ├── upload-document-dialog.tsx
│   └── content-creation-hub.tsx
├── app/(protected)/content/
│   └── page.tsx (updated)
└── lib/
    └── api.ts (updated with media endpoints)
```

### Step 2: Install Dependencies

Ensure these packages are installed in your `package.json`:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4"
  }
}
```

### Step 3: Backend API Endpoints

Verify these endpoints are available in your backend:

#### Course Management

- `GET /courses` - List all courses
- `POST /courses` - Create new course
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

#### Lesson Management

- `GET /lessons` - List all lessons
- `POST /lessons` - Create new lesson
- `PATCH /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson

#### Season Management

- `GET /seasonss` - List all seasons
- `POST /seasonss` - Create new season
- `PATCH /seasonss/:id` - Update season
- `DELETE /seasonss/:id` - Delete season

#### Media Upload

- `POST /images/upload` - Upload images
- `POST /videos/upload` - Upload videos
- `POST /audio/upload` - Upload audio files
- `POST /files/upload` - Upload documents

#### Media Retrieval

- `GET /images` - List all images
- `GET /videos` - List all videos
- `GET /audio` - List all audio files
- `GET /files` - List all documents

#### Categories

- `GET /categories` - List all categories
- `POST /categories` - Create new category

## Usage Instructions

### Creating Content

1. **Navigate to Content Management**
   - Go to the Content page in your admin panel
   - Click "Create Content" button

2. **Choose Content Type**
   - Select from: Course, Lesson, Season, Audio, Document
   - Each option opens a specialized creation form

3. **Fill Required Information**
   - **Courses**: Title, description, pricing, difficulty, category, cover image
   - **Lessons**: Title, description, content, duration, course association, media
   - **Seasons**: Title, description, course association
   - **Audio**: File upload, title, description, course association, tags
   - **Documents**: File upload, title, description, type, course association, tags

4. **Upload Media Files**
   - Supported formats are automatically validated
   - File size limits are enforced
   - Progress indicators show upload status

### Managing Content

1. **View All Content**
   - Use the tabs to switch between Courses, Lessons, Seasons, and Media
   - Each tab shows relevant statistics and recent items

2. **Search and Filter**
   - Use the search bar to find specific content
   - Apply filters to narrow down results

3. **Content Statistics**
   - Overview cards show total counts for each content type
   - Real-time updates when content is created

## File Size Limits

- **Images**: 5MB maximum
- **Videos**: 100MB maximum
- **Audio**: 50MB maximum
- **Documents**: 20MB maximum

## Supported File Formats

### Images

- PNG, JPG, JPEG, WebP

### Videos

- MP4, AVI, MOV, WMV

### Audio

- MP3, WAV, AAC, OGG, M4A, FLAC

### Documents

- PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size limits
   - Verify file format is supported
   - Ensure network connection is stable

2. **Form Validation Errors**
   - All required fields must be filled
   - Minimum character limits apply
   - File uploads are required where specified

3. **API Connection Issues**
   - Verify backend server is running
   - Check API endpoint URLs
   - Ensure authentication is valid

### Error Handling

- All forms include comprehensive error handling
- User-friendly error messages are displayed
- Network errors are gracefully handled
- Form state is preserved on errors

## Best Practices

1. **Content Organization**
   - Use seasons to organize course content logically
   - Tag audio and documents for easy searching
   - Associate media with relevant courses

2. **File Management**
   - Use descriptive titles for all content
   - Provide detailed descriptions for better discoverability
   - Optimize file sizes before upload

3. **Course Structure**
   - Create courses before adding lessons
   - Use seasons to group related lessons
   - Set appropriate difficulty levels

## Security Considerations

- File uploads are validated for type and size
- User authentication is required for all operations
- Content is associated with the current store context
- File access is controlled through proper permissions

## Performance Notes

- Large file uploads show progress indicators
- Content lists are paginated for better performance
- Images are optimized for web display
- Media files are served efficiently

## Support

For technical support or questions about the content management system:

1. Check the error logs in your browser console
2. Verify all API endpoints are accessible
3. Ensure all required dependencies are installed
4. Test with smaller files first

## Version Information

- **Content Management System**: v1.0.0
- **Compatible with**: SkillForge Admin Panel v1.0+
- **Last Updated**: [Current Date]
- **Backend Requirements**: NestJS API with media upload support
