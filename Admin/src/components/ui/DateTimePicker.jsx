import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, XIcon } from '@/components/ui/Icons';

const MONTH_NAMES_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAY_NAMES_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function parseToDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateDisplay(date, showTime) {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  if (!showTime) {
    return `${day}/${month}/${year}`;
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function dateToISOString(date, showTime) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (!showTime) {
    return `${year}-${month}-${day}`;
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

export default function DateTimePicker({
  value = '',
  onChange,
  placeholder = 'Chọn ngày giờ...',
  showTime = true,
  className = '',
  disabled = false,
  align = 'left',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parsedDate = parseToDate(value);
  const [selectedDate, setSelectedDate] = useState(parsedDate);
  const [viewDate, setViewDate] = useState(parsedDate || new Date());
  const [selectedHour, setSelectedHour] = useState(parsedDate ? parsedDate.getHours() : 12);
  const [selectedMinute, setSelectedMinute] = useState(parsedDate ? parsedDate.getMinutes() : 0);

  // Sync state if external value changes
  useEffect(() => {
    const d = parseToDate(value);
    setSelectedDate(d);
    if (d) {
      setViewDate(d);
      setSelectedHour(d.getHours());
      setSelectedMinute(d.getMinutes());
    }
  }, [value]);

  // Click outside to close popover
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

  const handleDateClick = (dayNumber, isCurrentMonth, monthOffset = 0) => {
    let targetYear = viewDate.getFullYear();
    let targetMonth = viewDate.getMonth() + monthOffset;

    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    const newD = new Date(targetYear, targetMonth, dayNumber, selectedHour, selectedMinute);
    setSelectedDate(newD);

    if (onChange) {
      onChange(dateToISOString(newD, showTime));
    }
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (h, m) => {
    setSelectedHour(h);
    setSelectedMinute(m);
    const base = selectedDate || new Date();
    const newD = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
    setSelectedDate(newD);
    if (onChange) {
      onChange(dateToISOString(newD, showTime));
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePreset = (type) => {
    const now = new Date();
    let target = new Date();

    if (type === 'today') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), showTime ? 12 : 0, 0);
    } else if (type === 'tomorrow') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, showTime ? 12 : 0, 0);
    } else if (type === 'next7days') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, showTime ? 23 : 0, 59);
    } else if (type === 'next30days') {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, showTime ? 23 : 0, 59);
    } else if (type === 'nextYear') {
      target = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate(), showTime ? 23 : 0, 59);
    } else if (type === 'clear') {
      setSelectedDate(null);
      if (onChange) onChange('');
      setIsOpen(false);
      return;
    }

    setSelectedDate(target);
    setViewDate(target);
    setSelectedHour(target.getHours());
    setSelectedMinute(target.getMinutes());

    if (onChange) {
      onChange(dateToISOString(target, showTime));
    }
    if (!showTime) {
      setIsOpen(false);
    }
  };

  // Calendar matrix calculation
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      monthOffset: -1,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      monthOffset: 0,
    });
  }

  // Next month padding (make up to 35 or 42 cells)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      monthOffset: 1,
    });
  }

  const isToday = (dayObj) => {
    if (!dayObj.isCurrentMonth) return false;
    const now = new Date();
    return (
      now.getDate() === dayObj.day &&
      now.getMonth() === currentMonth &&
      now.getFullYear() === currentYear
    );
  };

  const isSelected = (dayObj) => {
    if (!selectedDate) return false;
    let month = currentMonth + dayObj.monthOffset;
    let year = currentYear;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }

    return (
      selectedDate.getDate() === dayObj.day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Input Box Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between h-9 px-3 rounded-lg border bg-background text-sm cursor-pointer select-none transition-all ${
          isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-input hover:border-accent-foreground/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
          <span className={`truncate text-xs font-medium ${selectedDate ? 'text-foreground' : 'text-muted-foreground'}`}>
            {selectedDate ? formatDateDisplay(selectedDate, showTime) : placeholder}
          </span>
        </div>
        {selectedDate && !disabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePreset('clear');
            }}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Xóa lựa chọn"
          >
            <XIcon className="size-3" />
          </button>
        ) : (
          <ClockIcon className="size-3.5 text-muted-foreground shrink-0 opacity-60" />
        )}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 p-3 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-md transition-all ${
            align === 'right' ? 'right-0' : 'left-0'
          } w-[320px] sm:w-[340px]`}
        >
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 pb-2.5 mb-2.5 border-b border-border flex-wrap">
            <button
              type="button"
              onClick={() => handlePreset('today')}
              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-medium transition-colors"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handlePreset('tomorrow')}
              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-medium transition-colors"
            >
              Ngày mai
            </button>
            <button
              type="button"
              onClick={() => handlePreset('next7days')}
              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-medium transition-colors"
            >
              +7 ngày
            </button>
            <button
              type="button"
              onClick={() => handlePreset('next30days')}
              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-medium transition-colors"
            >
              +30 ngày
            </button>
            <button
              type="button"
              onClick={() => handlePreset('nextYear')}
              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-medium transition-colors"
            >
              +1 năm
            </button>
          </div>

          {/* Month & Year Navigation Header with Jump Controls */}
          <div className="flex items-center justify-between mb-3 px-0.5 gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewDate(new Date(currentYear - 1, currentMonth, 1))}
                className="size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-xs font-bold"
                title="Lùi 1 năm"
              >
                «
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                title="Lùi 1 tháng"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
            </div>

            {/* Direct Month & Year Dropdowns */}
            <div className="flex items-center gap-1">
              <select
                value={currentMonth}
                onChange={(e) => setViewDate(new Date(currentYear, Number(e.target.value), 1))}
                className="h-7 px-1 rounded-md border border-input bg-card text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer hover:bg-accent transition-colors"
                title="Chọn nhanh tháng"
              >
                {MONTH_NAMES_VI.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setViewDate(new Date(Number(e.target.value), currentMonth, 1))}
                className="h-7 px-1 rounded-md border border-input bg-card text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer hover:bg-accent transition-colors"
                title="Chọn nhanh năm"
              >
                {Array.from({ length: 30 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextMonth}
                className="size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                title="Tới 1 tháng"
              >
                <ChevronRightIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate(new Date(currentYear + 1, currentMonth, 1))}
                className="size-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-xs font-bold"
                title="Tới 1 năm"
              >
                »
              </button>
            </div>
          </div>

          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES_VI.map((d) => (
              <span key={d} className="text-[11px] font-semibold text-muted-foreground py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {calendarDays.map((d, idx) => {
              const selected = isSelected(d);
              const today = isToday(d);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateClick(d.day, d.isCurrentMonth, d.monthOffset)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center cursor-pointer ${
                    selected
                      ? 'bg-primary text-primary-foreground font-bold shadow-md'
                      : d.isCurrentMonth
                      ? today
                        ? 'border border-primary text-primary font-bold bg-primary/5'
                        : 'text-foreground hover:bg-accent'
                      : 'text-muted-foreground/40 hover:bg-muted/30'
                  }`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          {/* Time Selector (24-hour format) */}
          {showTime && (
            <div className="pt-2.5 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <ClockIcon className="size-3.5 text-primary" />
                <span>Giờ (24h):</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Hour Select */}
                <select
                  value={selectedHour}
                  onChange={(e) => handleTimeChange(Number(e.target.value), selectedMinute)}
                  className="h-8 px-2 rounded-md border border-input bg-card text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')} giờ
                    </option>
                  ))}
                </select>

                <span className="font-bold text-foreground">:</span>

                {/* Minute Select */}
                <select
                  value={selectedMinute}
                  onChange={(e) => handleTimeChange(selectedHour, Number(e.target.value))}
                  className="h-8 px-2 rounded-md border border-input bg-card text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')} phút
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Confirm Footer */}
          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handlePreset('clear')}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium cursor-pointer"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
