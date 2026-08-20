import { useState, useEffect, useCallback } from 'react';
import { blogPostService, blogCategoryService, tagService } from '@/services/blog.service';
import { toast } from '@/providers/ToastProvider';

export const useBlogPosts = (query = {}) => {
  const [data, setData]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogPostService.getAll(query);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tải bài viết');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, pagination, loading, refetch: fetch };
};

export const useBlogPost = (id) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    blogPostService.getById(id)
      .then(res => setData(res.data))
      .catch(e => toast.error(e.response?.data?.message || 'Lỗi tải bài viết'))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
};

export const useBlogCategories = (query = {}) => {
  const [data, setData]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogCategoryService.getAll(query);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tải danh mục blog');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, pagination, loading, refetch: fetch };
};

export const useTags = (query = {}) => {
  const [data, setData]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tagService.getAll(query);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tải tags');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, pagination, loading, refetch: fetch };
};
