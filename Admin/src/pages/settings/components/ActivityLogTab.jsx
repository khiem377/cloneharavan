import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import auditLogService from '@/services/auditLog.service';
import { Search, RefreshCw, ChevronDown, Calendar, Filter } from 'lucide-react';

export default function ActivityLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogService.getLogs({ limit: 30 });
      const items = res.data?.logs || res.data?.data || res.data || [];
      setLogs(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Lỗi tải nhật ký:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      (log.userName && log.userName.toLowerCase().includes(term)) ||
      (log.targetName && log.targetName.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term));
    const matchModule = selectedModule === 'ALL' || log.module === selectedModule;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-4">
      {/* 1. FILTER BAR SAPO 100% */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#919eab] dark:text-muted-foreground absolute left-3 top-2.5" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên người thao tác, ứng dụng..."
            className="pl-9 h-9 text-[13px] rounded-[6px] border-[#c4cdd5] dark:border-border focus:border-[#0088ff] bg-white dark:bg-card text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown Thời gian */}
          <div className="relative">
            <select className="h-9 px-3 pr-8 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[6px] bg-white dark:bg-card text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff] cursor-pointer appearance-none">
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="all">Toàn bộ thời gian</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#637381] dark:text-muted-foreground absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Dropdown Chức năng */}
          <div className="relative">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-9 px-3 pr-8 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[6px] bg-white dark:bg-card text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff] cursor-pointer appearance-none"
            >
              <option value="ALL">Tất cả chức năng</option>
              <option value="SETTING">Cấu hình hệ thống</option>
              <option value="SHIPPING_PROVIDER">Đối tác vận chuyển</option>
              <option value="PRODUCT">Sản phẩm</option>
              <option value="PURCHASE_ORDER">Đơn hàng nhập (PO)</option>
              <option value="STOCK_RECEIVING">Nhập kho (PNK)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#637381] dark:text-muted-foreground absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={fetchLogs}
            disabled={loading}
            className="h-9 px-3 rounded-[6px] border-[#c4cdd5] dark:border-border text-[#212b36] dark:text-foreground bg-white dark:bg-card hover:bg-[#f4f6f8] dark:hover:bg-accent text-[13px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. TIMELINE LIST CONTAINER SAPO 100% */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[13px] text-[#919eab] dark:text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0088ff] mb-2" />
            Đang tải nhật ký hoạt động...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[#919eab] dark:text-muted-foreground">
            Không tìm thấy bản ghi hoạt động nào phù hợp
          </div>
        ) : (
          <div className="divide-y divide-[#dfe3e8] dark:divide-border">
            {filteredLogs.map((log) => {
              const dateObj = log.createdAt ? new Date(log.createdAt) : new Date();
              const timeStr = dateObj.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const dateStr = dateObj.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <div
                  key={log._id || Math.random()}
                  className="p-4 hover:bg-[#fafbfb] dark:hover:bg-muted/30 transition-colors flex items-start gap-4 text-[13px]"
                >
                  {/* Timeline dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0088ff] shrink-0 mt-1.5" />

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#212b36] dark:text-foreground">
                        {log.userName || log.userEmail || 'Admin Cửa hàng PosDemo'}
                      </span>
                      <span className="text-[#637381] dark:text-muted-foreground text-[12px]">({log.userRole || 'Quản trị viên'})</span>
                      <span className="text-[11px] font-semibold bg-[#e8f2fe] dark:bg-blue-950/50 text-[#0088ff] dark:text-[#38bdf8] px-2 py-0.5 rounded-[3px]">
                        [{log.module || 'HỆ THỐNG'}]
                      </span>
                    </div>

                    <p className="text-[#212b36] dark:text-foreground mt-1 leading-normal">
                      Thực hiện thao tác{' '}
                      <span className="font-medium text-[#212b36] dark:text-foreground lowercase">
                        {log.action === 'UPDATE'
                          ? 'cập nhật'
                          : log.action === 'CREATE'
                          ? 'thêm mới'
                          : log.action === 'DELETE'
                          ? 'xóa'
                          : log.action}
                      </span>{' '}
                      đối tượng{' '}
                      <span className="font-semibold text-[#0088ff] dark:text-[#38bdf8] hover:underline cursor-pointer">
                        {log.targetName || 'Cấu hình hệ thống'}
                      </span>
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="shrink-0 text-right font-mono text-[12px] text-[#637381] dark:text-muted-foreground tabular-nums">
                    <div>{timeStr}</div>
                    <div className="text-[11px] text-[#919eab] dark:text-muted-foreground">{dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
