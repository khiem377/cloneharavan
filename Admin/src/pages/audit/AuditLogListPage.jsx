import React, { useState, useEffect, useCallback } from 'react';
import { History } from '@/components/ui/Icons';
import auditLogService from '../../services/auditLog.service';
import { toast } from '@/providers/ToastProvider';
import { Card, CardContent } from '@/components/ui/card';

import AuditLogToolbar from './components/AuditLogToolbar';
import AuditLogTable from './components/AuditLogTable';
import AuditLogDetailModal from './components/AuditLogDetailModal';

export default function AuditLogListPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    module: '',
    action: '',
    search: '',
  });

  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [logToRollback, setLogToRollback] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditLogService.getAuditLogs({
        page: query.page,
        limit: query.limit,
        module: query.module || undefined,
        action: query.action || undefined,
        search: query.search || undefined,
      });

      if (res) {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.logs || res.data?.data || [];
        const totalCount =
          res.pagination?.total ??
          res.data?.pagination?.total ??
          list.length;

        setLogs(list);
        setTotal(totalCount);
      }
    } catch (err) {
      toast.error('Không thể tải nhật ký thao tác', {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((prev) => ({ ...prev, search: search.trim(), page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRollback = async () => {
    if (!logToRollback) return;
    try {
      setRollbackLoading(true);
      const res = await auditLogService.rollbackAuditLog(logToRollback._id);
      toast.success(res?.message || 'Khôi phục dữ liệu thành công!');
      setShowConfirmModal(false);
      setLogToRollback(null);
      if (selectedLog?._id === logToRollback._id) {
        setSelectedLog(null);
      }
      fetchLogs();
    } catch (err) {
      toast.error('Lỗi khi khôi phục dữ liệu', {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setRollbackLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased text-foreground">
      {/* 1. Header Banner */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="size-6 text-primary" /> Nhật Ký Thao Tác (Audit Logs)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ghi vết chi tiết từng thay đổi, ai sửa gì lúc nào, địa chỉ IP và hỗ trợ khôi phục (Rollback) 1-click.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Filter Toolbar */}
      <AuditLogToolbar
        search={search}
        setSearch={setSearch}
        moduleVal={query.module === '' ? 'ALL' : query.module}
        setModuleVal={(val) => setQuery((prev) => ({ ...prev, module: val === 'ALL' ? '' : val, page: 1 }))}
        actionVal={query.action === '' ? 'ALL' : query.action}
        setActionVal={(val) => setQuery((prev) => ({ ...prev, action: val === 'ALL' ? '' : val, page: 1 }))}
        onRefresh={fetchLogs}
        loading={loading}
      />

      {/* 3. Data Table */}
      <AuditLogTable
        logs={logs}
        loading={loading}
        total={total}
        page={query.page}
        limit={query.limit}
        onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) => setQuery((prev) => ({ ...prev, limit, page: 1 }))}
        onSelectLog={setSelectedLog}
        onStartRollback={(log) => {
          setLogToRollback(log);
          setShowConfirmModal(true);
        }}
      />

      {/* 4. Modals */}
      <AuditLogDetailModal
        selectedLog={selectedLog}
        onClose={() => setSelectedLog(null)}
        logToRollback={logToRollback}
        showConfirmModal={showConfirmModal}
        onCloseConfirm={() => {
          setShowConfirmModal(false);
          setLogToRollback(null);
        }}
        onConfirmRollback={handleRollback}
        rollbackLoading={rollbackLoading}
      />
    </div>
  );
}
