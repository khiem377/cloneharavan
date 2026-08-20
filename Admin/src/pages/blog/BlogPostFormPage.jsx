import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from '@/components/ui/Icons';
import { useBlogPost, useBlogCategories, useTags } from '@/hooks/useBlog';
import { blogPostService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import MultiSelectSearch from '@/components/ui/MultiSelectSearch';
import useAuthStore from '@/store/authStore';

const decodeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const DEFAULT_FORM = {
  title: '',
  excerpt: '',
  content: '',
  categories: [],
  tags: [],
  thumbnailMediaId: '',
  thumbnailUrl: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  slug: '',
  status: 'draft',
  isActive: true,
  isPinned: false,
  isFeatured: false,
  allowComment: true,
  scheduledAt: '',
  relatedPostIds: [],
};

export default function BlogPostFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const { user } = useAuthStore();

  const { data: existing, loading: loadingPost } = useBlogPost(id);
  const { data: categories } = useBlogCategories({ limit: 100 });
  const { data: allTags }    = useTags({ limit: 200 });

  const [form, setForm]           = useState(DEFAULT_FORM);
  const [saving, setSaving]       = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';

  const computedSlug = (title) =>
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') || 'bai-viet';

  const canonicalUrl = `${FRONTEND_URL}/blog/${computedSlug(form.title)}`;

  useEffect(() => {
    if (existing) {
      setForm({
        ...DEFAULT_FORM,
        ...existing,
        categories: (existing.categories || []).map(c => c._id || c),
        tags: (existing.tags || []).map(t => t._id || t),
        excerpt: decodeHtml(existing.excerpt || ''),
        metaTitle: decodeHtml(existing.metaTitle || ''),
        metaDescription: decodeHtml(existing.metaDescription || ''),
        scheduledAt: existing.scheduledAt
          ? new Date(existing.scheduledAt).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [existing]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleTag = (tagId) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter(t => t !== tagId) : [...f.tags, tagId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())          return toast.error('Vui lòng nhập tiêu đề');
    if (!form.categories?.length)    return toast.error('Vui lòng chọn ít nhất một danh mục');
    if (!form.content.trim())        return toast.error('Vui lòng nhập nội dung');

    setSaving(true);
    try {
      const payload = {
        ...form,
        authorId: user?._id,
        canonicalUrl,
        scheduledAt: form.scheduledAt || null,
      };
      if (isEdit) {
        await blogPostService.update(id, payload);
        toast.success('Cập nhật thành công');
        navigate('/blog/posts');
      } else {
        await blogPostService.create(payload);
        toast.success('Đăng bài thành công');
        navigate('/blog/posts');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fixed action bar */}
      <div className="fixed top-[53px] right-0 left-[var(--sidebar-width,256px)] z-30 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/blog/posts')} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">{isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? form.title.slice(0, 50) : 'Điền thông tin bài viết'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { set('status', 'draft'); handleSubmit({ preventDefault: () => {} }); }}
            className="px-4 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            disabled={saving}
            onClick={() => set('status', 'published')}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Cập nhật' : 'Đăng bài'}
          </button>
        </div>
      </div>

      {/* Spacer to push content below fixed bar */}
      <div className="h-12" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Tiêu đề <span className="text-destructive">*</span></label>
              <input
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="Nhập tiêu đề bài viết..."
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Mô tả ngắn (excerpt)</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 resize-none"
                placeholder="Tự động lấy từ nội dung nếu để trống..."
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <label className="text-sm font-medium text-foreground block mb-3">Nội dung <span className="text-destructive">*</span></label>
            <RichTextEditor value={form.content} onChange={v => set('content', v)} />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">SEO Preview</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Schema auto-generated
              </div>
            </div>

            {/* Google SERP Preview */}
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Google Search Preview</p>
                <div className="border border-border rounded-lg p-4 bg-background space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <svg className="size-2.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <span className="text-xs text-[#202124] dark:text-zinc-400 truncate">{canonicalUrl}</span>
                    <svg className="size-3 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                  <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg leading-snug line-clamp-1 hover:underline cursor-pointer">
                    {form.metaTitle || form.title || 'Tiêu đề bài viết sẽ hiển thị ở đây'}
                  </div>
                  <div className="text-sm text-[#4d5156] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {form.metaDescription || form.excerpt || 'Mô tả bài viết sẽ hiển thị ở đây. Nếu để trống, hệ thống sẽ tự động trích xuất từ nội dung.'}
                  </div>
                </div>
              </div>

              {/* Editable meta fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-foreground">Meta title</label>
                    <span className={`text-xs tabular-nums ${form.metaTitle.length > 60 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                      {form.metaTitle.length} / 70
                    </span>
                  </div>
                  <input
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder={form.title.slice(0, 70) || 'Để trống — tự lấy từ tiêu đề bài viết'}
                    value={form.metaTitle}
                    onChange={e => set('metaTitle', e.target.value)}
                    maxLength={70}
                  />
                  {form.metaTitle.length > 60 && (
                    <p className="text-xs text-orange-500 mt-1">Nên giữ dưới 60 ký tự để hiển thị đầy đủ trên Google</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-foreground">Meta description</label>
                    <span className={`text-xs tabular-nums ${form.metaDescription.length > 140 ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
                      {form.metaDescription.length} / 160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 resize-none"
                    placeholder="Để trống — tự trích xuất từ nội dung bài viết"
                    value={form.metaDescription}
                    onChange={e => set('metaDescription', e.target.value)}
                    maxLength={160}
                  />
                  {form.metaDescription.length > 140 && (
                    <p className="text-xs text-orange-500 mt-1">Nên giữ dưới 140 ký tự để tránh bị cắt ngắn</p>
                  )}
                </div>
              </div>

              {/* Auto info — professional table style */}
              <div className="border border-border rounded-lg overflow-hidden text-xs">
                <div className="grid grid-cols-[120px_1fr] divide-x divide-border">
                  <div className="px-3 py-2 bg-muted/40 text-muted-foreground font-medium">Canonical URL</div>
                  <div className="px-3 py-2 font-mono text-foreground truncate">{canonicalUrl}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] divide-x divide-border border-t border-border">
                  <div className="px-3 py-2 bg-muted/40 text-muted-foreground font-medium">JSON-LD Schema</div>
                  <div className="px-3 py-2 text-foreground">BlogPosting · BreadcrumbList · FAQPage · WebSite</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] divide-x divide-border border-t border-border">
                  <div className="px-3 py-2 bg-muted/40 text-muted-foreground font-medium">Social Tags</div>
                  <div className="px-3 py-2 text-foreground">OpenGraph · Twitter Card</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] divide-x divide-border border-t border-border">
                  <div className="px-3 py-2 bg-muted/40 text-muted-foreground font-medium">Language</div>
                  <div className="px-3 py-2 text-foreground">vi-VN · E-E-A-T author entity</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Xuất bản</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Trạng thái</label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="draft">Nháp</option>
                <option value="pending_review">Chờ duyệt</option>
                <option value="published">Đã đăng</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Lên lịch đăng</label>
              <input
                type="datetime-local"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
                value={form.scheduledAt}
                onChange={e => set('scheduledAt', e.target.value)}
              />
            </div>
            <div className="space-y-2 pt-1">
              {[
                { key: 'isActive',     label: 'Hiển thị' },
                { key: 'isPinned',     label: 'Ghim lên đầu' },
                { key: 'isFeatured',   label: 'Nổi bật' },
                { key: 'allowComment', label: 'Cho phép bình luận' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={e => set(key, e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Thumbnail</h3>
            {form.thumbnailUrl ? (
              <div className="relative group">
                <img src={form.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { set('thumbnailMediaId', ''); set('thumbnailUrl', ''); }}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMedia(true)}
                className="w-full aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <span className="text-2xl">🖼</span>
                <span className="text-xs">Chọn ảnh thumbnail</span>
              </button>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Danh mục <span className="text-destructive">*</span></h3>
            <MultiSelectSearch
              options={categories.map(c => ({ value: c._id, label: c.name }))}
              selected={form.categories}
              onChange={v => set('categories', v)}
              placeholder="Tìm và chọn danh mục..."
              chipColor="primary"
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tags</h3>
            <MultiSelectSearch
              options={allTags.map(t => ({ value: t._id, label: t.name, prefix: '#' }))}
              selected={form.tags}
              onChange={v => set('tags', v)}
              placeholder="Tìm và chọn tag..."
              chipColor="muted"
            />
          </div>
        </div>
      </div>

      {showMedia && (
        <MediaPickerModal
          onSelect={(media) => {
            set('thumbnailMediaId', media._id);
            set('thumbnailUrl', media.url);
            setShowMedia(false);
          }}
          onClose={() => setShowMedia(false)}
        />
      )}
    </form>
  );
}
