import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Eye, EyeOff, Search, Loader2, RefreshCw, Pin, Star, ExternalLink } from '@/components/ui/Icons';
import { useBlogPosts } from '@/hooks/useBlog';
import { blogPostService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import Can from '@/components/auth/Can';

const CLIENT_STORE_URL = import.meta.env.VITE_STORE_FRONTEND_URL || import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000';

const STATUS_BADGE = {
  draft:          'bg-gray-100 text-gray-600',
  pending_review: 'bg-yellow-100 text-yellow-700',
  published:      'bg-green-100 text-green-700',
  archived:       'bg-red-100 text-red-600',
};
const STATUS_LABEL = {
  draft:          'Nháp',
  pending_review: 'Chờ duyệt',
  published:      'Đã đăng',
  archived:       'Lưu trữ',
};

export default function BlogPostListPage() {
  const navigate = useNavigate();
  const [query, setQuery]       = useState({ page: 1, limit: 10 });
  const [keyword, setKeyword]   = useState('');
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm]   = useState(null);

  const { data: resPosts, isLoading: loading, refetch } = useBlogPosts(query);
  const posts = resPosts?.data || [];
  const pagination = resPosts?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(q => ({ ...q, keyword, page: 1 }));
  };

  const toggleSelect = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(s => s.length === posts.length ? [] : posts.map(p => p._id));

  const handleToggleStatus = async (post) => {
    try {
      await blogPostService.toggleStatus(post._id, !post.isActive);
      toast.success(`Đã ${!post.isActive ? 'bật' : 'tắt'} bài viết`);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    try {
      await blogPostService.remove(id);
      toast.success('Đã xóa bài viết');
      setSelected(s => s.filter(x => x !== id));
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xóa');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await blogPostService.removeBulk(selected);
      toast.success('Đã xóa các bài viết đã chọn');
      setSelected([]);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xóa hàng loạt');
    }
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bài viết Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý nội dung blog</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 border border-input bg-background px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
          <Can do="blog.create">
            <button
              onClick={() => navigate('/blog/posts/new')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" /> Tạo bài mới
            </button>
          </Can>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="Tìm kiếm bài viết..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className="px-3 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              Tìm
            </button>
          </form>

          <select
            className="h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring"
            value={query.status || ''}
            onChange={e => setQuery(q => ({ ...q, status: e.target.value || undefined, page: 1 }))}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending_review">Chờ duyệt</option>
            <option value="published">Đã đăng</option>
            <option value="archived">Lưu trữ</option>
          </select>

          {selected.length > 0 && (
            <button
              onClick={() => setConfirm({ type: 'bulk' })}
              className="flex items-center gap-2 px-3 h-9 bg-destructive text-destructive-foreground rounded-md text-sm font-medium"
            >
              <Trash2 className="size-4" /> Xóa {selected.length} mục
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === posts.length && posts.length > 0} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bài viết</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-32">Danh mục</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-28">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-28">Lượt xem</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">Ngày đăng</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có bài viết nào</td></tr>
              ) : posts.map(post => (
                <tr key={post._id} className={`hover:bg-muted/30 transition-colors ${!post.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(post._id)} onChange={() => toggleSelect(post._id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {(post.thumbnailUrl || post.thumbnailMediaId?.url) && (
                        <img src={post.thumbnailUrl || post.thumbnailMediaId?.url} alt="" className="w-12 h-9 object-cover rounded shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-foreground line-clamp-1 flex items-center gap-1">
                          {post.isPinned && <Pin className="size-3 text-primary shrink-0" />}
                          {post.isFeatured && <Star className="size-3 text-yellow-500 shrink-0" />}
                          {post.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{post.slug}</div>
                        <div className="text-xs text-muted-foreground">{post.minRead} phút đọc</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Array.isArray(post.categories) && post.categories.length > 0
                      ? post.categories.map(c => c.name || c).join(', ')
                      : (post.categoryId?.name || '—')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[post.status]}`}>
                      {STATUS_LABEL[post.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{post.viewsCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => window.open(`${CLIENT_STORE_URL}/blogs/news/${post.slug}`, '_blank')}
                        title="Xem trên Cửa hàng"
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="size-4" />
                      </button>
                      <Can do="blog.edit">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          title={post.isActive ? 'Ẩn' : 'Hiện'}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {post.isActive ? <Eye className="size-4 text-emerald-600" /> : <EyeOff className="size-4" />}
                        </button>
                        <button
                          onClick={() => navigate(`/blog/posts/${post._id}/edit`)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit className="size-4" />
                        </button>
                      </Can>
                      <Can do="blog.delete">
                        <button
                          onClick={() => setConfirm({ type: 'single', id: post._id, title: post.title })}
                          title="Xóa"
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          page={pagination.page || 1}
          pageSize={query.limit}
          total={pagination.total || 0}
          totalPages={pagination.totalPages || 1}
          onPageChange={p => setQuery(q => ({ ...q, page: p }))}
          onPageSizeChange={s => setQuery(q => ({ ...q, limit: s, page: 1 }))}
          className="px-4"
        />
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'bulk' ? `Xóa ${selected.length} bài viết?` : `Xóa "${confirm.title}"?`}
          description="Hành động này không thể hoàn tác."
          onConfirm={() => {
            if (confirm.type === 'bulk') handleBulkDelete();
            else handleDelete(confirm.id);
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
