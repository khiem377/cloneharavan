import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCwIcon, ImageIcon, GlobeIcon, Check } from '@/components/ui/Icons';
import { useBlogPost, useBlogCategories, useBlogTags } from '@/hooks/useBlog';
import { blogPostService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import MultiSelectSearch from '@/components/ui/MultiSelectSearch';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DateTimePicker from '@/components/ui/DateTimePicker';
import useAuthStore from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuthStore();

  const { data: existing, isLoading: loadingPost } = useBlogPost(id);
  const { data: categoriesData } = useBlogCategories({ limit: 100 });
  const { data: allTagsData } = useBlogTags({ limit: 200 });

  const categories = categoriesData?.data || [];
  const allTags = allTagsData?.data || [];

  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [pickedMedia, setPickedMedia] = useState(null);

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

  const activeSlug = form.slug || computedSlug(form.title);
  const canonicalUrl = `${FRONTEND_URL}/blog/${activeSlug}`;

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

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.title.trim()) return toast.error('Vui lòng nhập tiêu đề');
    if (!form.categories?.length) return toast.error('Vui lòng chọn ít nhất một danh mục');
    if (!form.content.trim()) return toast.error('Vui lòng nhập nội dung');

    setSaving(true);
    try {
      const finalSlug = form.slug.trim() || computedSlug(form.title);
      const payload = {
        ...form,
        slug: finalSlug,
        authorId: user?._id,
        canonicalUrl: `${FRONTEND_URL}/blog/${finalSlug}`,
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
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="sticky -top-3 sm:-top-6 z-30 -mt-3 sm:-mt-6 -mx-3 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate('/blog/posts')}
            className="h-8 w-8 rounded-[6px] border-border text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground">{isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? form.title.slice(0, 50) : 'Điền thông tin bài viết'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { set('status', 'draft'); handleSubmit({ preventDefault: () => { } }); }}
            className="h-8 rounded-[6px] text-xs font-semibold"
          >
            Lưu nháp
          </Button>
          <Button
            type="submit"
            disabled={saving}
            size="sm"
            onClick={() => set('status', 'published')}
            className="h-8 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            {isEdit ? 'Cập nhật' : 'Đăng bài'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 pt-2">
        <div className="space-y-6">
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Nội dung chính</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tiêu đề <span className="text-destructive">*</span></label>
                <Input
                  className="h-9 rounded-[6px] text-xs"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
              </div>

              {/* Custom Slug / Permalink Input */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Slug URL
                </label>
                <div className="flex gap-2">
                  <Input
                    className="h-9 rounded-[6px] font-mono text-xs"
                    placeholder="Nhấp Generate hoặc tự nhập slug..."
                    value={form.slug}
                    onChange={e => set('slug', computedSlug(e.target.value))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!form.title.trim()) {
                        toast.error('Vui lòng nhập tiêu đề trước khi sinh slug');
                        return;
                      }
                      set('slug', computedSlug(form.title));
                      toast.success('Đã tạo slug từ tiêu đề');
                    }}
                    className="h-9 px-3 rounded-[6px] text-xs font-semibold shrink-0"
                    title="Tự động tạo slug từ tiêu đề bài viết"
                  >
                    <RefreshCwIcon className="size-3.5 mr-1" />
                    <span>Generate</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 font-mono truncate">
                  <GlobeIcon className="size-3 text-primary shrink-0" />
                  <span>URL:</span>
                  <span className="text-primary font-semibold truncate">{FRONTEND_URL}/blog/{form.slug || computedSlug(form.title || 'bai-viet')}</span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Mô tả ngắn (excerpt)</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-[6px] border border-input bg-background text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring resize-none"
                  placeholder="Tự động lấy từ nội dung nếu để trống..."
                  value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Nội dung bài viết <span className="text-destructive">*</span></CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <RichTextEditor value={form.content} onChange={v => set('content', v)} />
            </CardContent>
          </Card>

          <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-foreground">SEO & Trình tìm kiếm</CardTitle>
              <Badge variant="outline" className="text-[10px] rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Schema auto-generated
              </Badge>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Google SERP Preview */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Google Search Preview</p>
                <div className="border border-border rounded-[6px] p-4 bg-muted/10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate">{canonicalUrl}</span>
                  </div>
                  <div className="text-primary text-base font-semibold leading-snug line-clamp-1 hover:underline cursor-pointer">
                    {form.metaTitle || form.title || 'Tiêu đề bài viết sẽ hiển thị ở đây'}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {form.metaDescription || form.excerpt || 'Mô tả bài viết sẽ hiển thị ở đây. Nếu để trống, hệ thống sẽ tự động trích xuất từ nội dung.'}
                  </div>
                </div>
              </div>

              {/* Editable meta fields */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Meta title</label>
                    <span className={`text-[11px] font-mono tabular-nums ${form.metaTitle.length > 60 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                      {form.metaTitle.length} / 70
                    </span>
                  </div>
                  <Input
                    className="h-8 rounded-[6px] text-xs"
                    placeholder={form.title.slice(0, 70) || 'Để trống — tự lấy từ tiêu đề bài viết'}
                    value={form.metaTitle}
                    onChange={e => set('metaTitle', e.target.value)}
                    maxLength={70}
                  />
                  {form.metaTitle.length > 60 && (
                    <p className="text-[11px] text-amber-500 mt-1">Nên giữ dưới 60 ký tự để hiển thị đầy đủ trên Google</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Meta description</label>
                    <span className={`text-[11px] font-mono tabular-nums ${form.metaDescription.length > 140 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                      {form.metaDescription.length} / 160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-[6px] border border-input bg-background text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Để trống — tự trích xuất từ nội dung bài viết"
                    value={form.metaDescription}
                    onChange={e => set('metaDescription', e.target.value)}
                    maxLength={160}
                  />
                  {form.metaDescription.length > 140 && (
                    <p className="text-[11px] text-amber-500 mt-1">Nên giữ dưới 140 ký tự để tránh bị cắt ngắn</p>
                  )}
                </div>
              </div>

              {/* Auto info */}
              <div className="border border-border rounded-[6px] overflow-hidden text-xs">
                <div className="grid grid-cols-[110px_1fr] divide-x divide-border">
                  <div className="px-3 py-1.5 bg-muted/40 text-muted-foreground font-medium">Canonical URL</div>
                  <div className="px-3 py-1.5 font-mono text-foreground truncate">{canonicalUrl}</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] divide-x divide-border border-t border-border">
                  <div className="px-3 py-1.5 bg-muted/40 text-muted-foreground font-medium">JSON-LD Schema</div>
                  <div className="px-3 py-1.5 text-foreground">BlogPosting · BreadcrumbList · FAQPage · WebSite</div>
                </div>
                <div className="grid grid-cols-[110px_1fr] divide-x divide-border border-t border-border">
                  <div className="px-3 py-1.5 bg-muted/40 text-muted-foreground font-medium">Social Tags</div>
                  <div className="px-3 py-1.5 text-foreground">OpenGraph · Twitter Card</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Trạng thái</label>
                <SearchableSelect
                  options={[
                    { label: 'Nháp', value: 'draft' },
                    { label: 'Chờ duyệt', value: 'pending_review' },
                    { label: 'Đã đăng', value: 'published' },
                    { label: 'Lưu trữ', value: 'archived' },
                  ]}
                  value={form.status}
                  onChange={(val) => set('status', val)}
                  creatable={false}
                  placeholder="Chọn trạng thái..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Lên lịch đăng</label>
                <DateTimePicker
                  value={form.scheduledAt}
                  onChange={(val) => set('scheduledAt', val)}
                  placeholder="Chọn thời gian lên lịch đăng..."
                  align="right"
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                {[
                  { key: 'isActive', label: 'Hiển thị' },
                  { key: 'isPinned', label: 'Ghim lên đầu' },
                  { key: 'isFeatured', label: 'Nổi bật' },
                  { key: 'allowComment', label: 'Cho phép bình luận' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={e => set(key, e.target.checked)}
                      className="rounded-[3px] border-border size-3.5"
                    />
                    <span className="text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Thumbnail</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {form.thumbnailUrl ? (
                <div className="relative group">
                  <MediaThumbnailHover media={pickedMedia} className="w-full">
                    <img src={form.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded-[6px] border border-border" />
                  </MediaThumbnailHover>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => { set('thumbnailMediaId', ''); set('thumbnailUrl', ''); setPickedMedia(null); }}
                    className="absolute top-2 right-2 h-7 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    Xóa
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMedia(true)}
                  className="w-full aspect-video border-2 border-dashed border-border rounded-[6px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer bg-muted/10 active:scale-[0.98]"
                >
                  <ImageIcon className="size-6 opacity-70" />
                  <span className="text-xs">Chọn ảnh thumbnail</span>
                </button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Danh mục <span className="text-destructive">*</span></CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <MultiSelectSearch
                options={categories.map(c => ({ value: c._id, label: c.name }))}
                selected={form.categories}
                onChange={v => set('categories', v)}
                placeholder="Tìm và chọn danh mục..."
                chipColor="primary"
              />
            </CardContent>
          </Card>

          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Tags</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <MultiSelectSearch
                options={allTags.map(t => ({ value: t._id, label: t.name, prefix: '#' }))}
                selected={form.tags}
                onChange={v => set('tags', v)}
                placeholder="Tìm và chọn tag..."
                chipColor="muted"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {showMedia && (
        <MediaPickerModal
          onSelect={(media) => {
            set('thumbnailMediaId', media._id);
            set('thumbnailUrl', media.url);
            setPickedMedia(media);
            setShowMedia(false);
          }}
          onClose={() => setShowMedia(false)}
        />
      )}
    </form>
  );
}
