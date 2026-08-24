import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogPostService, blogCategoryService, tagService } from '@/services/blog.service';

export const BLOG_POSTS_KEY = ['blog_posts'];
export const BLOG_CATEGORIES_KEY = ['blog_categories'];
export const BLOG_TAGS_KEY = ['blog_tags'];

// ==========================================
// BLOG POSTS HOOKS
// ==========================================
export const useBlogPosts = (query = {}) =>
  useQuery({
    queryKey: [...BLOG_POSTS_KEY, query],
    queryFn: () => blogPostService.getAll(query).then((r) => r.data),
    staleTime: 30_000,
  });

export const useBlogPost = (id) =>
  useQuery({
    queryKey: [...BLOG_POSTS_KEY, id],
    queryFn: () => blogPostService.getById(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 30_000,
  });

// ==========================================
// BLOG CATEGORIES HOOKS (Dùng TanStack Query Caching)
// ==========================================
export const useBlogCategories = (query = {}) =>
  useQuery({
    queryKey: [...BLOG_CATEGORIES_KEY, query],
    queryFn: () => blogCategoryService.getAll(query).then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 phút cache
  });

export const useCreateBlogCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => blogCategoryService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY }),
  });
};

export const useUpdateBlogCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogCategoryService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY }),
  });
};

export const useDeleteBlogCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => blogCategoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY }),
  });
};

// ==========================================
// BLOG TAGS HOOKS (Dùng TanStack Query Caching)
// ==========================================
export const useBlogTags = (query = {}) =>
  useQuery({
    queryKey: [...BLOG_TAGS_KEY, query],
    queryFn: () => tagService.getAll(query).then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 phút cache
  });

export const useCreateBlogTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tagService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_TAGS_KEY }),
  });
};

export const useUpdateBlogTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tagService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_TAGS_KEY }),
  });
};

export const useDeleteBlogTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tagService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOG_TAGS_KEY }),
  });
};
