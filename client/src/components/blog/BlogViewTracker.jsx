'use client';

import { useEffect, useRef } from 'react';
import blogService from '../../services/blog.service';

export const BlogViewTracker = ({ slug }) => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (slug && !trackedRef.current) {
      trackedRef.current = true;
      blogService.incrementPostView(slug);
    }
  }, [slug]);

  return null;
};

export default BlogViewTracker;
