import { useRef, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Upload, Image as ImageIcon } from '@/components/ui/Icons';
import MediaPickerModal from '@/components/ui/MediaPickerModal';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const insertImageToEditor = useCallback((url, alt = '') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.insertContent(`<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;" />`);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => insertImageToEditor(ev.target.result, file.name);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMediaSelect = (media) => {
    insertImageToEditor(media.url, media.filename || '');
    setShowMediaPicker(false);
  };

  const setup = (editor) => {
    editorRef.current = editor;

    editor.ui.registry.addButton('uploadimage', {
      icon: 'upload',
      tooltip: 'Tai anh len tu may tinh',
      onAction: () => fileInputRef.current?.click(),
    });

    editor.ui.registry.addButton('mediapicker', {
      icon: 'gallery',
      tooltip: 'Chon anh tu thu vien Media',
      onAction: () => setShowMediaPicker(true),
    });
  };

  return (
    <div className="rich-editor-wrap">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        init={{
          height: 400,
          menubar: false,
          skin: 'oxide',
          content_css: 'default',
          plugins: [
            'lists', 'link', 'image', 'table', 'code',
            'fullscreen', 'wordcount', 'autolink', 'media',
          ],
          toolbar:
            'undo redo | styles | bold italic underline strikethrough | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist | link table | uploadimage mediapicker | code fullscreen',
          setup,
          content_style: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; }
          `,
        }}
        value={value}
        onEditorChange={(content) => onChange(content)}
      />

      {showMediaPicker && (
        <MediaPickerModal
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
