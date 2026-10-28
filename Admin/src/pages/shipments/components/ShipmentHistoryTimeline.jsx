import React from 'react';

export default function ShipmentHistoryTimeline({ historyLogs = [] }) {
  return (
    <div className="p-4 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] space-y-3">
      <h4 className="font-semibold text-[#212b36] dark:text-foreground">
        Lịch sử hành trình vận đơn
      </h4>
      <div className="space-y-3 pl-2 border-l-2 border-[#0088ff]">
        {historyLogs.length === 0 ? (
          <p className="text-[12px] text-muted-foreground pl-3">Chưa có lịch sử cập nhật nào.</p>
        ) : (
          historyLogs.map((log, i) => (
            <div key={i} className="relative pl-3 text-[12.5px]">
              <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-[#0088ff]" />
              <p className="font-medium text-[#212b36] dark:text-foreground">{log.description}</p>
              <span className="text-[11px] text-[#8a99a8] font-mono">
                {new Date(log.updatedAt).toLocaleString('vi-VN')} {log.location && `| ${log.location}`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
