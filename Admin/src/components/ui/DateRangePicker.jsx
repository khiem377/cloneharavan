import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check
} from 'lucide-react';

const MONTH_NAMES_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAY_NAMES_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Helper date utilities (zero dependencies, robust local timezone handling)
function stripTime(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateDisplay(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatISO(d, isEnd = false) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  if (isEnd) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function isDateInRange(target, start, end) {
  if (!target || !start || !end) return false;
  const t = stripTime(target).getTime();
  const s = stripTime(start).getTime();
  const e = stripTime(end).getTime();
  return t >= s && t <= e;
}

// Preset generator
function getPresets() {
  const now = new Date();
  const today = stripTime(now);

  // Yesterday
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);

  // 7 days ago (including today)
  const l7 = new Date(today);
  l7.setDate(today.getDate() - 6);

  // 30 days ago (including today)
  const l30 = new Date(today);
  l30.setDate(today.getDate() - 29);

  // This month
  const tmStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const tmEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Last month
  const lmStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lmEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // This quarter
  const qMonth = Math.floor(today.getMonth() / 3) * 3;
  const tqStart = new Date(today.getFullYear(), qMonth, 1);
  const tqEnd = new Date(today.getFullYear(), qMonth + 3, 0);

  // Last quarter
  const lqMonth = qMonth - 3;
  const lqStart = new Date(today.getFullYear(), lqMonth, 1);
  const lqEnd = new Date(today.getFullYear(), lqMonth + 3, 0);

  // This year
  const tyStart = new Date(today.getFullYear(), 0, 1);
  const tyEnd = new Date(today.getFullYear(), 11, 31);

  // Last year
  const lyStart = new Date(today.getFullYear() - 1, 0, 1);
  const lyEnd = new Date(today.getFullYear() - 1, 11, 31);

  return [
    { key: 'today', label: 'Hôm nay', from: today, to: today },
    { key: 'yesterday', label: 'Hôm qua', from: yest, to: yest },
    { key: 'last7days', label: '7 ngày qua', from: l7, to: today },
    { key: 'last30days', label: '30 ngày qua', from: l30, to: today },
    { key: 'thisMonth', label: 'Tháng này', from: tmStart, to: tmEnd },
    { key: 'lastMonth', label: 'Tháng trước', from: lmStart, to: lmEnd },
    { key: 'thisQuarter', label: 'Quý này', from: tqStart, to: tqEnd },
    { key: 'lastQuarter', label: 'Quý trước', from: lqStart, to: lqEnd },
    { key: 'thisYear', label: 'Năm nay', from: tyStart, to: tyEnd },
    { key: 'lastYear', label: 'Năm trước', from: lyStart, to: lyEnd },
    { key: 'custom', label: 'Tùy chọn', from: null, to: null },
  ];
}

export default function DateRangePicker({
  value = { from: null, to: null },
  onChange,
  onReset,
  placeholder = 'Chọn khoảng thời gian...',
  className = '',
  align = 'right',
  showResetButton = true,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const presets = useMemo(() => getPresets(), []);

  // Internal provisional state
  const [tempStart, setTempStart] = useState(value.from ? stripTime(value.from) : null);
  const [tempEnd, setTempEnd] = useState(value.to ? stripTime(value.to) : null);
  const [hoverDate, setHoverDate] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  // Calendar View month (Left calendar displays viewMonth, Right calendar displays viewMonth + 1)
  const initialViewMonth = useMemo(() => {
    if (value.to) return new Date(new Date(value.to).getFullYear(), new Date(value.to).getMonth() - 1, 1);
    if (value.from) return new Date(new Date(value.from).getFullYear(), new Date(value.from).getMonth(), 1);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }, [value.from, value.to]);

  const [viewMonth, setViewMonth] = useState(initialViewMonth);

  // Sync external values
  useEffect(() => {
    const s = value.from ? stripTime(value.from) : null;
    const e = value.to ? stripTime(value.to) : null;
    setTempStart(s);
    setTempEnd(e);

    // Detect matched preset
    if (s && e) {
      const match = presets.find(p => p.from && p.to && isSameDay(p.from, s) && isSameDay(p.to, e));
      setActivePreset(match ? match.key : 'custom');
    } else if (!s && !e) {
      setActivePreset(null);
    }
  }, [value.from, value.to, presets]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.key);
    if (preset.key === 'custom') {
      return;
    }
    setTempStart(preset.from);
    setTempEnd(preset.to);
    if (preset.to) {
      // Set right calendar to target month
      setViewMonth(new Date(preset.to.getFullYear(), preset.to.getMonth() - 1, 1));
    }
  };

  const handleDayClick = (dayDate) => {
    setActivePreset('custom');
    if (!tempStart || (tempStart && tempEnd)) {
      // First click
      setTempStart(dayDate);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      // Second click
      if (dayDate.getTime() < tempStart.getTime()) {
        setTempEnd(tempStart);
        setTempStart(dayDate);
      } else {
        setTempEnd(dayDate);
      }
    }
  };

  const handleApply = () => {
    if (onChange) {
      onChange({
        from: tempStart ? formatISO(tempStart, false) : null,
        to: tempEnd ? formatISO(tempEnd, true) : null,
        startDate: tempStart ? formatISO(tempStart, false) : null,
        endDate: tempEnd ? formatISO(tempEnd, true) : null,
        presetKey: activePreset,
        display: tempStart && tempEnd
          ? `${formatDateDisplay(tempStart)} - ${formatDateDisplay(tempEnd)}`
          : tempStart
          ? `${formatDateDisplay(tempStart)} - ...`
          : ''
      });
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Revert to original value
    setTempStart(value.from ? stripTime(value.from) : null);
    setTempEnd(value.to ? stripTime(value.to) : null);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    setTempStart(null);
    setTempEnd(null);
    setActivePreset(null);
    if (onChange) {
      onChange({
        from: null,
        to: null,
        startDate: null,
        endDate: null,
        presetKey: null,
        display: ''
      });
    }
    if (onReset) onReset();
  };

  // Render trigger display text
  const triggerText = useMemo(() => {
    if (value.from && value.to) {
      const match = presets.find(p => p.from && p.to && isSameDay(p.from, value.from) && isSameDay(p.to, value.to));
      if (match && match.key !== 'custom') {
        return match.label;
      }
      return `${formatDateDisplay(value.from)} - ${formatDateDisplay(value.to)}`;
    }
    if (value.from) return `Từ ${formatDateDisplay(value.from)}`;
    if (value.to) return `Đến ${formatDateDisplay(value.to)}`;
    return placeholder;
  }, [value.from, value.to, presets, placeholder]);

  const isValueActive = Boolean(value.from || value.to);

  // Month renderer helper
  const renderCalendarMonth = (targetDate, isRight = false) => {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date: prevDate,
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      days.push({
        date: currDate,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 42 cells (6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    // Determine preview range if hovering
    const effectiveStart = tempStart;
    let effectiveEnd = tempEnd;
    if (tempStart && !tempEnd && hoverDate) {
      if (hoverDate.getTime() >= tempStart.getTime()) {
        effectiveEnd = hoverDate;
      }
    }

    return (
      <div className="flex flex-col w-[252px] select-none">
        {/* Month Title */}
        <div className="flex items-center justify-between h-9 px-1 mb-1">
          {!isRight ? (
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
              title="Tháng trước"
            >
              <ChevronLeft className="size-4" />
            </button>
          ) : (
            <div className="size-6" />
          )}

          <div className="font-semibold text-sm text-foreground tabular-nums">
            {MONTH_NAMES_VI[month]} {year}
          </div>

          {isRight ? (
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
              title="Tháng kế tiếp"
            >
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <div className="size-6" />
          )}
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-0 text-center mb-1 text-[11px] font-medium text-muted-foreground">
          {DAY_NAMES_VI.map(name => (
            <div key={name} className="h-7 flex items-center justify-center">
              {name}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1 text-xs">
          {days.map((item, idx) => {
            const isStart = isSameDay(item.date, effectiveStart);
            const isEnd = isSameDay(item.date, effectiveEnd);
            const inRange = isDateInRange(item.date, effectiveStart, effectiveEnd);
            const isToday = isSameDay(item.date, new Date());

            let cellBg = '';
            let textStyle = item.isCurrentMonth
              ? 'text-foreground'
              : 'text-muted-foreground/40';

            if (isStart && isEnd) {
              cellBg = 'bg-primary text-primary-foreground font-semibold rounded-[6px] shadow-xs';
              textStyle = 'text-primary-foreground';
            } else if (isStart) {
              cellBg = 'bg-primary text-primary-foreground font-semibold rounded-l-[6px] shadow-xs';
              textStyle = 'text-primary-foreground';
            } else if (isEnd) {
              cellBg = 'bg-primary text-primary-foreground font-semibold rounded-r-[6px] shadow-xs';
              textStyle = 'text-primary-foreground';
            } else if (inRange) {
              cellBg = 'bg-primary/10 text-primary font-medium';
            } else if (item.isCurrentMonth) {
              cellBg = 'hover:bg-muted rounded-[6px]';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(item.date)}
                onMouseEnter={() => setHoverDate(item.date)}
                className={`h-8 flex items-center justify-center tabular-nums text-xs transition-colors relative cursor-pointer ${cellBg} ${textStyle} ${
                  isToday && !inRange && !isStart && !isEnd
                    ? 'border border-primary/50 rounded-[6px]'
                    : ''
                }`}
              >
                {item.dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const rightMonthDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex h-9 items-center justify-between gap-2 px-3 rounded-[6px] border text-xs sm:text-sm font-medium transition-all active:scale-[0.98] cursor-pointer ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-background text-foreground'
            : isValueActive
            ? 'border-primary/50 bg-primary/5 text-foreground hover:bg-primary/10'
            : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <div className="inline-flex items-center gap-2 truncate">
          <CalendarIcon className={`size-4 shrink-0 ${isValueActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="truncate tabular-nums">{triggerText}</span>
        </div>

        {isValueActive && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Xóa bộ lọc ngày"
          >
            <X className="size-3.5" />
          </span>
        )}
      </button>

      {/* Reset Shortcut Button */}
      {showResetButton && isValueActive && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex h-9 items-center justify-center gap-1.5 px-2.5 rounded-[6px] border border-border bg-background hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Đặt lại về mặc định"
        >
          <RotateCcw className="size-3.5" />
          <span>Đặt lại</span>
        </button>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-50 rounded-[6px] border border-border bg-card text-card-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col md:flex-row overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ minWidth: '660px', maxWidth: '92vw' }}
        >
          {/* Left Presets Sidebar */}
          <div className="w-full md:w-36 border-b md:border-b-0 md:border-r border-border bg-muted/20 p-2 flex flex-row md:flex-col gap-0.5 overflow-x-auto md:overflow-y-auto shrink-0 max-h-[380px]">
            {presets.map(p => {
              const isSelected = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="size-3 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Right Dual Calendar Body */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            {/* Range Inputs / Display Header */}
            <div className="flex items-center justify-center gap-2 pb-2.5 mb-2.5 border-b border-border text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-border bg-muted/30 tabular-nums font-mono text-foreground font-medium min-w-[110px] justify-center">
                {tempStart ? formatDateDisplay(tempStart) : '--/--/----'}
              </div>
              <span className="text-muted-foreground font-semibold">→</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] border border-border bg-muted/30 tabular-nums font-mono text-foreground font-medium min-w-[110px] justify-center">
                {tempEnd ? formatDateDisplay(tempEnd) : '--/--/----'}
              </div>
            </div>

            {/* Calendars Container (Dual month) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-5 px-1">
              {renderCalendarMonth(viewMonth, false)}
              <div className="hidden sm:block w-px bg-border self-stretch" />
              {renderCalendarMonth(rightMonthDate, true)}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border gap-2">
              <div className="text-xs text-muted-foreground tabular-nums truncate max-w-[260px]">
                {tempStart && tempEnd ? (
                  <span>
                    Đã chọn: <strong className="text-foreground">{formatDateDisplay(tempStart)}</strong> đến <strong className="text-foreground">{formatDateDisplay(tempEnd)}</strong>
                  </span>
                ) : tempStart ? (
                  <span>Chọn ngày kết thúc...</span>
                ) : (
                  <span>Chọn khoảng ngày mong muốn</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-[6px] border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 rounded-[6px] bg-primary hover:bg-primary/90 text-xs font-semibold text-primary-foreground shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
