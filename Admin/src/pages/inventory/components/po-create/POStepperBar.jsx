import React from 'react';
import { FileText, FileSpreadsheet, ShieldCheck, ChevronRightIcon as ChevronRight } from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';

export default function POStepperBar({ currentStep, setCurrentStep, canProceedToStep2, onGoToStep2 }) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none bg-card p-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 transition-colors active:scale-[0.98] ${
            currentStep === 1 ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <span className="text-xs font-semibold flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> BƯỚC 1: Lập Đơn & Chọn Hàng
          </span>
        </button>

        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

        <button
          type="button"
          onClick={() => {
            if (canProceedToStep2) onGoToStep2();
          }}
          className={`flex items-center gap-2 transition-colors active:scale-[0.98] ${
            currentStep === 2 ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <span className="text-xs font-semibold flex items-center gap-1">
            <FileSpreadsheet className="h-3.5 w-3.5" /> BƯỚC 2: Xem Trước File Excel (.xlsx)
          </span>
        </button>

        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

        <button
          type="button"
          onClick={() => {
            if (canProceedToStep2) setCurrentStep(3);
          }}
          className={`flex items-center gap-2 transition-colors active:scale-[0.98] ${
            currentStep === 3 ? 'text-emerald-600 font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </div>
          <span className="text-xs font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> BƯỚC 3: Chốt Đơn & Nhập Kho
          </span>
        </button>
      </div>
    </Card>
  );
}
