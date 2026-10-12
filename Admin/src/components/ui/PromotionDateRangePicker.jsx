import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Infinity as InfinityIcon,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTH_NAMES_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const DAY_NAMES_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

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

function formatDateValue(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PromotionDateRangePicker({
  startDate,
  endDate,
  isUnlimited = false,
  onChange,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Active selecting field: 'start' | 'end'
  const [activeField, setActiveField] = useState('end');

  // Internal date states
  const parsedStart = useMemo(() => stripTime(startDate) || stripTime(new Date()), [startDate]);
  const parsedEnd = useMemo(() => {
    if (isUnlimited) return null;
    if (endDate) return stripTime(endDate);
    // Mặc định kết thúc sau 30 ngày nếu không có
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return stripTime(d);
  }, [endDate, isUnlimited]);

  // Calendar current view month
  const [currentMonth, setCurrentMonth] = useState(() => {
    return parsedEnd || parsedStart || new Date();
  });

  // Temp working state
  const [tempStart, setTempStart] = useState(parsedStart);
  const [tempEnd, setTempEnd] = useState(parsedEnd);
  const [tempUnlimited, setTempUnlimited] = useState(isUnlimited);

  // Sync on prop change or open
  useEffect(() => {
    if (isOpen) {
      setTempStart(parsedStart);
      setTempEnd(parsedEnd);
      setTempUnlimited(isUnlimited);
      setActiveField(isUnlimited ? 'start' : 'end');
      if (parsedEnd) {
        setCurrentMonth(new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), 1));
      } else if (parsedStart) {
        setCurrentMonth(new Date(parsedStart.getFullYear(), parsedStart.getMonth(), 1));
      }
    }
  }, [isOpen, parsedStart, parsedEnd, isUnlimited]);

  // Close outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Presets
  const handleApplyPreset = (type) => {
    const today = stripTime(new Date());
    let newStart = today;
    let newEnd = null;
    let unlimited = false;

    if (type === 'today') {
      newEnd = today;
    } else if (type === '7days') {
      newEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    } else if (type === '14days') {
      newEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    } else if (type === '30days') {
      newEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    } else if (type === 'end_of_month') {
      newEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (type === 'unlimited') {
      unlimited = true;
      newEnd = null;
    }

    setTempStart(newStart);
    setTempEnd(newEnd);
    setTempUnlimited(unlimited);
    if (newEnd) {
      setCurrentMonth(new Date(newEnd.getFullYear(), newEnd.getMonth(), 1));
      setActiveField('end');
    }

    // Áp dụng ngay khi bấm preset
    onChange?.({
      startDate: formatDateValue(newStart),
      endDate: unlimited ? null : newEnd ? formatDateValue(newEnd) : null,
      isUnlimited: unlimited,
    });
  };

  // Calendar days grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  // Click on date
  const handleDateClick = (dayDate) => {
    const clicked = stripTime(dayDate);

    let nextStart = tempStart || stripTime(new Date());
    let nextEnd = tempEnd;
    let nextUnlimited = false;

    if (activeField === 'end') {
      nextUnlimited = false;
      if (nextStart && clicked.getTime() < nextStart.getTime()) {
        nextEnd = nextStart;
        nextStart = clicked;
      } else {
        nextEnd = clicked;
      }
      setTempStart(nextStart);
      setTempEnd(nextEnd);
      setTempUnlimited(false);
    } else {
      // Đang chọn ngày bắt đầu
      nextStart = clicked;
      if (nextEnd && clicked.getTime() > nextEnd.getTime()) {
        nextEnd = clicked;
      }
      setTempStart(nextStart);
      setTempEnd(nextEnd);
      setTempUnlimited(false);
      // Tự động chuyển sang chọn ngày kết thúc
      setActiveField('end');
    }

    // Áp dụng ngay khi click ngày
    onChange?.({
      startDate: formatDateValue(nextStart),
      endDate: nextUnlimited ? null : nextEnd ? formatDateValue(nextEnd) : null,
      isUnlimited: nextUnlimited,
    });
  };

  const handleApply = () => {
    onChange?.({
      startDate: tempStart ? formatDateValue(tempStart) : formatDateValue(new Date()),
      endDate: tempUnlimited ? null : tempEnd ? formatDateValue(tempEnd) : null,
      isUnlimited: tempUnlimited,
    });
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Pancake-style Elegant Date Bar Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-9 px-3 flex items-center justify-between text-xs rounded-[6px] border border-input bg-background font-mono tabular-nums transition-colors cursor-pointer text-left',
          'hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary',
          isOpen && 'border-primary ring-1 ring-primary'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground">
            {parsedStart ? formatDateDisplay(parsedStart) : formatDateDisplay(new Date())}
          </span>
          <span className="text-muted-foreground mx-1">→</span>
          {isUnlimited ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-[4px]">
              <InfinityIcon size={12} /> Vô thời hạn
            </span>
          ) : (
            <span className={cn('font-semibold', parsedEnd ? 'text-foreground' : 'text-muted-foreground')}>
              {parsedEnd ? formatDateDisplay(parsedEnd) : 'Chọn ngày kết thúc'}
            </span>
          )}
        </div>

        <CalendarIcon size={14} className="text-muted-foreground hover:text-foreground shrink-0" />
      </button>

      {/* Popover Custom Date Picker */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-84 sm:w-96 rounded-[6px] border border-border bg-popover text-popover-foreground shadow-lg p-3.5 space-y-3 animate-in fade-in duration-100">
          {/* Quick Presets for Future Promotions */}
          <div className="space-y-1.5 border-b border-border pb-2.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Gợi ý nhanh thời gian
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleApplyPreset('7days')}
                className="px-2 py-0.5 rounded-[4px] text-[11px] border border-border bg-background hover:bg-muted text-foreground transition-transform active:scale-[0.98]"
              >
                7 ngày tới
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('14days')}
                className="px-2 py-0.5 rounded-[4px] text-[11px] border border-border bg-background hover:bg-muted text-foreground transition-transform active:scale-[0.98]"
              >
                14 ngày tới
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('30days')}
                className="px-2 py-0.5 rounded-[4px] text-[11px] border border-border bg-background hover:bg-muted text-foreground transition-transform active:scale-[0.98]"
              >
                30 ngày tới
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('end_of_month')}
                className="px-2 py-0.5 rounded-[4px] text-[11px] border border-border bg-background hover:bg-muted text-foreground transition-transform active:scale-[0.98]"
              >
                Hết tháng này
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('unlimited')}
                className={cn(
                  'px-2 py-0.5 rounded-[4px] text-[11px] border font-semibold flex items-center gap-1 transition-transform active:scale-[0.98]',
                  tempUnlimited
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                )}
              >
                <InfinityIcon size={11} /> Vô thời hạn
              </button>
            </div>
          </div>

          {/* DUAL SELECTOR TABS: TỪ NGÀY & ĐẾN NGÀY */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveField('start')}
              className={cn(
                'flex flex-col items-start p-2 rounded-[6px] border text-left transition-all',
                activeField === 'start'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-background hover:bg-muted/50'
              )}
            >
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Ngày bắt đầu
              </span>
              <span className="text-xs font-mono font-bold text-foreground mt-0.5">
                {tempStart ? formatDateDisplay(tempStart) : 'Hôm nay'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveField('end');
                setTempUnlimited(false);
              }}
              className={cn(
                'flex flex-col items-start p-2 rounded-[6px] border text-left transition-all',
                activeField === 'end' && !tempUnlimited
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-background hover:bg-muted/50'
              )}
            >
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                Ngày kết thúc
              </span>
              <span className="text-xs font-mono font-bold text-foreground mt-0.5">
                {tempUnlimited ? 'Vô thời hạn' : tempEnd ? formatDateDisplay(tempEnd) : 'Bấm chọn ngày'}
              </span>
            </button>
          </div>

          {/* Cues: Cho người dùng biết đang chọn ngày nào */}
          <div className="text-[11px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-[4px] flex items-center justify-between">
            <span>
              👉 Đang chọn: <strong>{activeField === 'start' ? 'Ngày bắt đầu' : 'Ngày kết thúc'}</strong> (nhấp vào ô ngày trên lịch)
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {activeField === 'start' ? 'Bước 1/2' : 'Bước 2/2'}
            </span>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="size-7 rounded-[4px] border border-border flex items-center justify-center hover:bg-muted text-foreground active:scale-[0.98] transition-transform"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-bold text-xs text-foreground font-mono">
              {MONTH_NAMES_VI[currentMonth.getMonth()]} / {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="size-7 rounded-[4px] border border-border flex items-center justify-center hover:bg-muted text-foreground active:scale-[0.98] transition-transform"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-muted-foreground uppercase">
              {DAY_NAMES_VI.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-xs">
              {calendarDays.map((item, idx) => {
                const time = item.date.getTime();
                const isStart = tempStart && time === tempStart.getTime();
                const isEnd = tempEnd && !tempUnlimited && time === tempEnd.getTime();
                const isInRange =
                  tempStart && tempEnd && !tempUnlimited && time > tempStart.getTime() && time < tempEnd.getTime();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(item.date)}
                    className={cn(
                      'size-8 mx-auto flex items-center justify-center rounded-[4px] text-xs font-mono tabular-nums transition-colors',
                      !item.isCurrentMonth && 'text-muted-foreground/30',
                      item.isCurrentMonth && 'text-foreground hover:bg-muted',
                      isInRange && 'bg-primary/10 text-primary font-bold rounded-none',
                      (isStart || isEnd) &&
                        'bg-primary text-primary-foreground font-bold shadow-xs'
                    )}
                  >
                    {item.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Preview & Unlimited Checkbox */}
          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px]">
            <label className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={tempUnlimited}
                onChange={(e) => {
                  setTempUnlimited(e.target.checked);
                  if (e.target.checked) {
                    setTempEnd(null);
                    setActiveField('start');
                  } else {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setTempEnd(stripTime(d));
                    setActiveField('end');
                  }
                }}
                className="size-3.5 rounded-[4px] border-input text-primary focus:ring-0"
              />
              Không giới hạn kết thúc
            </label>

            <span className="font-mono text-muted-foreground text-xs">
              {tempStart ? formatDateDisplay(tempStart) : '—'} →{' '}
              {tempUnlimited ? 'Vô hạn' : tempEnd ? formatDateDisplay(tempEnd) : 'Chưa chọn'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 border-t border-border pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-[4px] text-xs font-medium hover:bg-muted text-muted-foreground"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3 py-1 rounded-[4px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
