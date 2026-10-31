import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MascotStepSearch,
  MascotStepSidebar,
  MascotStepNotification,
  MascotStepTheme,
  MascotStepWorkspace,
} from './mascots';

const TOUR_STEPS = [
  {
    target: '[data-tour="command-palette"]',
    title: 'Thanh tìm kiếm nhanh (Ctrl + K)',
    badge: 'Tốc độ',
    content:
      'Gõ phím tắt Ctrl+K hoặc click vào đây để mở Command Palette: Tìm kiếm thần tốc đơn hàng, sản phẩm, phiếu kho hoặc nhảy tới bất kỳ phân hệ nào!',
    mascot: MascotStepSearch,
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Menu Quản Trị Đa Phân Hệ',
    badge: '47 Phân hệ',
    content:
      'Toàn bộ 47 phân hệ nghiệp vụ chuẩn Enterprise: Bán hàng (OMS), Kho vận đa điểm (WMS), Khuyến mãi, Media DAM, Khách hàng & Cài đặt hệ thống.',
    mascot: MascotStepSidebar,
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Trung Tâm Thông Báo Realtime',
    badge: 'Realtime',
    content:
      'Nhận chuông báo tức thì qua Socket.io khi có đơn hàng mới, khách thanh toán COD/VietQR hoặc cảnh báo hàng sắp hết tồn kho.',
    mascot: MascotStepNotification,
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Giao Diện Sáng / Tối Mượt Mà',
    badge: 'Theme HSL',
    content:
      'Chuyển đổi tức thì giữa chế độ nền Sáng (Light) và Tối (Dark) với bảng màu Tailored HSL dịu mắt, tối ưu làm việc ca đêm.',
    mascot: MascotStepTheme,
  },
  {
    target: '[data-tour="workspace"]',
    title: 'Khu Vực Làm Việc Tập Trung',
    badge: 'Báo cáo',
    content:
      'Không gian bảng biểu dữ liệu phẳng, lọc đa chiều, thao tác hàng loạt, xuất Excel và quản trị nghiệp vụ với trải nghiệm mượt mà không độ trễ.',
    mascot: MascotStepWorkspace,
  },
];

export default function AdminTourGuide({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('admin_tour_seen', 'true');
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const StepMascot = step.mascot || MascotStepSearch;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none animate-in fade-in duration-200">
      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-black/65" onClick={handleComplete} />

      {/* Target Element Highlight Cutout Ring */}
      {targetRect && (
        <div
          className="absolute rounded-[6px] ring-4 ring-primary ring-offset-2 ring-offset-background pointer-events-none transition-all duration-300 ease-out z-[101]"
          style={{
            top: `${Math.max(0, targetRect.top - 4)}px`,
            left: `${Math.max(0, targetRect.left - 4)}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* Floating Mascot Tooltip Dialog Card */}
      <div
        className="absolute z-[102] w-[90vw] max-w-md rounded-[6px] border border-border bg-card p-5 shadow-lg transition-all duration-300 ease-out"
        style={{
          top: targetRect
            ? targetRect.bottom + 18 > window.innerHeight - 240
              ? `${Math.max(20, targetRect.top - 230)}px`
              : `${targetRect.bottom + 14}px`
            : '50%',
          left: targetRect
            ? `${Math.min(Math.max(20, targetRect.left), window.innerWidth - 440)}px`
            : '50%',
          transform: !targetRect ? 'translate(-50%, -50%)' : 'none',
        }}
      >
        {/* Header with Step Mascot */}
        <div className="flex items-center gap-4">
          <div className="size-24 shrink-0 flex items-center justify-center p-1 rounded-[10px] bg-muted/40 border border-border/60 overflow-visible">
            <StepMascot size={95} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-[4px] border border-primary/20">
                  Bước {currentStep + 1} / {TOUR_STEPS.length}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-[4px]">
                  {step.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={handleComplete}
                className="size-6 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
                title="Đóng hướng dẫn"
              >
                <X size={14} />
              </button>
            </div>
            <h4 className="text-sm font-bold text-foreground mt-1.5 leading-snug">
              {step.title}
            </h4>
          </div>
        </div>

        {/* Content body */}
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed pl-0.5">
          {step.content}
        </p>

        {/* Footer actions with step dots */}
        <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  currentStep === i ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                title={`Đến bước ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors mr-1"
            >
              Bỏ qua
            </button>

            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="h-8 px-2.5 rounded-[6px] text-xs font-semibold"
              >
                <ChevronLeft size={13} className="mr-0.5" />
                <span>Trước</span>
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleNext}
              className="h-8 px-3 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}</span>
              {currentStep === TOUR_STEPS.length - 1 ? (
                <Check size={13} className="ml-1" />
              ) : (
                <ChevronRight size={13} className="ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
