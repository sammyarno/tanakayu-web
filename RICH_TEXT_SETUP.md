# Rich Text Editor Setup Guide

## Overview
This implementation adds a rich text editor with image upload capabilities to the announcement creation system using Quill.js and Supabase Storage.

## Features Implemented

✅ **Rich Text Editing**
- Bold, italic, underline, strikethrough formatting
- Headers (H1, H2, H3)
- Ordered and unordered lists
- Text indentation and alignment
- Text and background colors
- Links and images

✅ **Image Upload Integration**
- Direct upload to Supabase Storage
- File validation (type and size)
- Unique filename generation
- CDN delivery via Supabase

✅ **Security Features**
- HTML sanitization with DOMPurify
- File type validation
- Size limits (5MB max)
- RLS policies for storage access

✅ **UI/UX Improvements**
- Larger dialog for better editing experience
- Rich content preview in announcement cards
- Content truncation for card views
- Mobile-responsive design

## Setup Instructions

### 1. Storage Bucket Setup
Run the SQL commands in `setup-storage.sql` in your Supabase SQL editor:

```sql
-- This will create the 'rich-text-images' bucket and set up RLS policies
```

### 2. Environment Variables
Ensure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Storage Bucket Configuration
In your Supabase dashboard:
1. Go to Storage → Settings
2. Set file size limit to 5MB
3. Configure allowed file types: `image/*`
4. Enable public access for the bucket

## File Changes Made

### New Files
- `src/components/ui/rich-text-editor.tsx` - Main rich text editor component
- `setup-storage.sql` - Database setup script
- `RICH_TEXT_SETUP.md` - This documentation

### Modified Files
- `src/app/(main)/admin/announcement/CreateDialog.tsx` - Updated to use rich text editor
- `src/components/AnnouncementCard.tsx` - Updated to render HTML content safely
- `package.json` - Added react-quill, quill, and dompurify dependencies

## Usage

### Creating Announcements
1. Click "Tambah Pengumuman" button
2. Fill in the title and select categories
3. Use the rich text editor to format content:
   - Use toolbar buttons for formatting
   - Click the image icon to upload images
   - Images are automatically uploaded to Supabase Storage

### Viewing Announcements
- Rich content is displayed with proper formatting
- Images are served via Supabase CDN
- Content is truncated in card view for better UX

## Technical Details

### Image Upload Flow
1. User selects image via file picker
2. File validation (type, size)
3. Upload to Supabase Storage with unique filename
4. Get public URL and insert into editor
5. Image is embedded in the rich content

### Security Measures
- DOMPurify sanitizes HTML content
- Only allowed HTML tags and attributes
- File type and size validation
- RLS policies restrict storage access
- Content validation before submission

### Performance Optimizations
- Dynamic import of ReactQuill (SSR-safe)
- Image caching with CDN
- Content truncation for card views
- Lazy loading of editor components

## Dialog vs. Page Decision

**Recommendation: Enhanced Dialog (Current Implementation)**

Pros:
- ✅ Faster workflow - no page navigation
- ✅ Better UX for quick content creation
- ✅ Maintains context of current page
- ✅ Larger dialog accommodates rich editor well
- ✅ Consistent with existing patterns

Cons:
- ❌ Limited screen real estate on mobile
- ❌ May feel cramped for very long content

**Alternative: Dedicated Page**

Pros:
- ✅ Full screen real estate
- ✅ Better for complex, long-form content
- ✅ Can add more advanced features (preview, drafts)

Cons:
- ❌ Requires navigation away from current context
- ❌ More complex state management
- ❌ Slower workflow for quick announcements

## Future Enhancements

- [ ] Image resizing and optimization
- [ ] Draft saving functionality
- [ ] Content preview mode
- [ ] Bulk image upload
- [ ] Video embed support
- [ ] Advanced table editing
- [ ] Content templates
- [ ] Collaborative editing

## Troubleshooting

### Common Issues

1. **Images not uploading**
   - Check Supabase storage bucket exists
   - Verify RLS policies are set correctly
   - Ensure user is authenticated

2. **Editor not loading**
   - Check React version compatibility
   - Verify dynamic import is working
   - Check browser console for errors

3. **Content not displaying**
   - Verify DOMPurify is sanitizing correctly
   - Check allowed HTML tags configuration
   - Ensure content is valid HTML

### Debug Tips
- Check browser console for errors
- Verify Supabase connection in Network tab
- Test storage permissions in Supabase dashboard
- Use React DevTools to inspect component state