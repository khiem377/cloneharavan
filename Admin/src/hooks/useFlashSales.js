import { useState, useEffect, useCallback } from 'react';
import { flashSaleService } from '@/services/flashSale.service';
import { toast } from '@/providers/ToastProvider';

export const useFlashSales = (query = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flashSaleService.getAll(query);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tải danh sách Flash Sale');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(query)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, pagination, loading, refetch: fetch };
};
