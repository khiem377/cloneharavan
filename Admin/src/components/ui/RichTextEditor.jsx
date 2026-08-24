import { useRef, useState, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import MediaPickerModal from '@/components/ui/MediaPickerModal';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const insertImageToEditor = useCallback((url, alt = '') => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.insertContent(`<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`);
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
      tooltip: 'Tải ảnh từ máy tính',
      onAction: () => fileInputRef.current?.click(),
    });

    editor.ui.registry.addButton('mediapicker', {
      icon: 'gallery',
      tooltip: 'Chọn ảnh từ thư viện Media',
      onAction: () => setShowMediaPicker(true),
    });
  };

  return (
    <div className="rich-editor-wrap border border-border rounded-lg overflow-hidden shadow-2xs">
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
          height: 480,
          menubar: 'file edit view insert format tools table',
          promotion: false,
          branding: false,
          skin: 'oxide',
          content_css: 'default',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'wordcount', 'emoticons',
            'accordion', 'directionality', 'pagebreak', 'nonbreaking',
          ],
          toolbar1:
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
            'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent',
          toolbar2:
            'link image media table accordion | emoticons charmap insertdatetime | ' +
            'uploadimage mediapicker | removeformat code preview fullscreen',
          toolbar_mode: 'sliding',
          setup,
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              padding: 12px;
              color: #1e293b;
            }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            blockquote { border-left: 4px solid #3b82f6; margin: 1em 0; padding-left: 1em; color: #475569; font-style: italic; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
            th { background-color: #f8fafc; }
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
