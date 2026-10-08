import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlog';
import { useMediaByIds } from '@/hooks/useMedia';
import { blogPostService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import useColumnVisibility from '@/hooks/useColumnVisibility';

import BlogToolbar from './components/BlogToolbar';
import BlogPostTable from './components/BlogPostTable';

const BLOG_POST_COLUMNS = [
  { id: 'post', label: 'Bài viết', defaultVisible: true, alwaysVisible: true },
  { id: 'categories', label: 'Danh mục', defaultVisible: true },
  { id: 'author', label: 'Tác giả', defaultVisible: true },
  { id: 'status', label: 'Trạng thái', defaultVisible: true },
  { id: 'views', label: 'Lượt xem', defaultVisible: true },
  { id: 'publishedAt', label: 'Ngày tạo / Đăng', defaultVisible: true },
  { id: 'actions', label: 'Thao tác', defaultVisible: true, alwaysVisible: true },
];

export default function BlogPostListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const rowRefs = useRef({});

  // Query state
  const [keyword, setKeyword] = useState(initialSearch);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    keyword: initialSearch,
    status: searchParams.get('status') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    isFeatured: searchParams.get('isFeatured') || undefined,
    isPinned: searchParams.get('isPinned') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    sort: searchParams.get('sort') || 'newest',
  });

  const [dateRange, setDateRange] = useState({
    from: searchParams.get('startDate') || null,
    to: searchParams.get('endDate') || null,
  });

  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);

  // Column visibility
  const columnVisibility = useColumnVisibility('admin_blog_posts_columns_v2', BLOG_POST_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  // Data fetching
  const { data: resPosts, isLoading: loading, refetch } = useBlogPosts(query);
  const { data: categoriesRes } = useBlogCategories();
  const categoriesList = categoriesRes?.data || [];

  const posts = resPosts?.data || [];
  const pagination = resPosts?.pagination || {};

  // Resolve thumbnail media IDs for fast preview hover
  const resolveId = (v) => (v && typeof v === 'object' ? v._id : v);
  const thumbIds = useMemo(
    () => posts.map((p) => resolveId(p.thumbnailMediaId)).filter(Boolean),
    [posts]
  );
  const { data: mediaMap = {} } = useMediaByIds(thumbIds);

  // Highlight deep-linking
  const highlightId = searchParams.get('highlight');
  useEffect(() => {
    if (!highlightId) return;
    blogPostService
      .locate(highlightId, query.limit)
      .then((res) => {
        setQuery((q) => ({ ...q, page: res.data?.data?.page || 1 }));
      })
      .catch(() => {});
  }, [highlightId, query.limit]);

  useEffect(() => {
    if (!highlightId || !posts.length) return;
    const found = posts.find((p) => p._id === highlightId);
    if (!found) return;
    setSelected((prev) => (prev.includes(highlightId) ? prev : [...prev, highlightId]));
    setTimeout(() => {
      const el = rowRefs.current[highlightId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setSearchParams(
      (p) => {
        p.delete('highlight');
        return p;
      },
      { replace: true }
    );
  }, [highlightId, posts, setSearchParams]);

  // Handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, keyword: keyword.trim() || undefined, page: 1 }));
  };

  const handleDateRangeChange = ({ from, to }) => {
    setDateRange({ from, to });
    setQuery((q) => ({
      ...q,
      startDate: from || undefined,
      endDate: to || undefined,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDateRange({ from: null, to: null });
    setQuery({
      page: 1,
      limit: query.limit,
      sort: 'newest',
    });
  };

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleAll = () => {
    setSelected((s) => (s.length === posts.length ? [] : posts.map((p) => p._id)));
  };

  const handleDeleteOne = (post) => {
    setConfirm({
      title: 'Xóa bài viết',
      description: `Bạn có chắc muốn xóa bài viết "${post.title}"?`,
      danger: true,
      confirmLabel: 'Xóa bài viết',
      action: async () => {
        try {
          await blogPostService.delete(post._id);
          toast.success('Đã xóa bài viết');
          refetch();
        } catch (e) {
          toast.error(e.response?.data?.message || 'Lỗi khi xóa bài viết');
        }
      },
    });
  };

  const handleBulkDelete = () => {
    setConfirm({
      title: `Xóa ${selected.length} bài viết`,
      description: 'Hành động này sẽ xóa vĩnh viễn tất cả các bài viết đã chọn.',
      danger: true,
      confirmLabel: `Xóa ${selected.length} bài`,
      action: async () => {
        try {
          await blogPostService.bulkDelete(selected);
          toast.success(`Đã xóa ${selected.length} bài viết`);
          setSelected([]);
          refetch();
        } catch (e) {
          toast.error(e.response?.data?.message || 'Lỗi khi xóa hàng loạt');
        }
      },
    });
  };

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Header Toolbar */}
      <BlogToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        onSearchSubmit={handleSearchSubmit}
        query={query}
        setQuery={setQuery}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onResetFilters={handleResetFilters}
        categoriesList={categoriesList}
        totalCount={pagination.total || posts.length}
        onRefresh={() => refetch()}
        loading={loading}
        onCreateNew={() => navigate('/blog/posts/new')}
        selectedCount={selected.length}
        onBulkDelete={handleBulkDelete}
        columnVisibility={columnVisibility}
      />

      {/* 2. Blog Posts Table */}
      <BlogPostTable
        posts={posts}
        selected={selected}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        onEdit={(post) => navigate(`/blog/posts/${post._id}/edit`)}
        onDelete={handleDeleteOne}
        isColumnVisible={isColumnVisible}
        highlightId={highlightId}
        rowRefs={rowRefs}
        mediaMap={mediaMap}
      />

      {/* 3. Pagination */}
      <DataTablePagination
        page={query.page}
        pageSize={query.limit}
        total={pagination.total || 0}
        totalPages={pagination.totalPages || 1}
        onPageChange={(p) => setQuery((q) => ({ ...q, page: p }))}
        onPageSizeChange={(l) => setQuery((q) => ({ ...q, limit: l, page: 1 }))}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* 4. Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          title={confirm.title}
          description={confirm.description}
          danger={confirm.danger}
          confirmLabel={confirm.confirmLabel}
          onConfirm={async () => {
            await confirm.action();
            setConfirm(null);
          }}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
