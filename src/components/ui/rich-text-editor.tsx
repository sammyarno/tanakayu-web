'use client';

import { useCallback, useMemo, useRef } from 'react';
import 'react-quill-new/dist/quill.snow.css';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/plugins/supabase/client';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full" />,
});

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
  const quillRef = useRef<any>(null);
  const supabase = getSupabaseClient();

  // Custom image upload handler
  const imageHandler = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      try {
        // Generate unique filename with uploads folder
        const fileExt = file.name.split('.').pop();
        const fileName = `${storageFolder}/${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log('upload', fileName, fileExt, file.type, file.size);
        // Upload to Supabase Storage
        const { error } = await supabase.storage.from('tanakayu').upload(fileName, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: '3600',
        });

        if (error) {
          console.error('Upload error:', error);
          const { data } = await supabase.auth.getUser();
          console.log('Current user:', data);
          alert('Failed to upload image. Please try again.');
          return;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('tanakayu').getPublicUrl(fileName);

        // Insert image into editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', publicUrl);
          quill.setSelection((range?.index || 0) + 1);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  }, [supabase]);

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
