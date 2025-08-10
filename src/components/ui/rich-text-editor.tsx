'use client';

import { useCallback, useMemo, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

// Removed Supabase client import - now using API route for uploads

// Type for ReactQuill component
interface ReactQuillComponent {
  getEditor: () => any;
  focus: () => void;
  blur: () => void;
}

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full" />,
}) as any;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  storageFolder?: string; // e.g., 'announcements' or 'news-events'
  fileNamePrefix?: string; // optional prefix for uploaded files
}

function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  disabled = false,
  className,
  storageFolder = 'uploads',
  fileNamePrefix = 'tanakayu',
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuillComponent | null>(null);

  // Custom image upload handler
  const imageHandler = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file size (max 200KB)
      if (file.size > 200 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      try {
        // Upload via API route (handles server-side auth)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', storageFolder);

        const { data, error } = await authenticatedFetchJson('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (error || !data.success) {
          console.error('Upload error:', error || data.error);
          alert('Failed to upload image. Please try again.');
          return;
        }

        const publicUrl = data.url;

        // Insert image into editor - proper way to get Quill instance
        if (quillRef.current && typeof quillRef.current.getEditor === 'function') {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', publicUrl);
          quill.setSelection((range?.index || 0) + 1);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  }, [storageFolder, fileNamePrefix]);

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image'],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  // Allowed formats
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
    'color',
    'background',
  ];

  return (
    <div className={cn('rich-text-editor', className)}>
      <ReactQuill
        ref={(el: ReactQuillComponent | null) => {
          quillRef.current = el;
        }}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          backgroundColor: disabled ? '#f8f9fa' : 'white',
        }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: 150px;
          font-size: 14px;
          line-height: 1.6;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 6px 6px 0 0;
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 0 0 6px 6px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
