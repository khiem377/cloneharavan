'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Client ErrorBoundary caught]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[360px] w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 select-none">
          <div className="w-full max-w-lg rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-[6px] bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {this.props.title || 'Đã xảy ra lỗi hiển thị'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {this.props.description ||
                    'Hệ thống gặp sự cố tạm thời khi xử lý dữ liệu. Bạn có thể thử tải lại hoặc quay về trang chủ.'}
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mt-4 rounded-[6px] bg-slate-50 border border-slate-200 p-3 text-xs font-mono text-slate-600 break-all">
                <span className="font-bold text-red-600">Lỗi: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            {this.state.errorInfo && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Chi tiết lỗi kỹ thuật</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`}
                  />
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-2.5 rounded-[4px] bg-slate-100 text-[10px] font-mono text-slate-600 overflow-x-auto max-h-40 leading-relaxed">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <a
                href="/"
                className="h-9 px-3.5 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 active:scale-[0.98]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Trang chủ</span>
              </a>

              <button
                type="button"
                onClick={this.handleReset}
                className="h-9 px-4 rounded-[6px] bg-[#e30019] text-xs font-semibold text-white hover:bg-[#c40015] transition-colors flex items-center gap-1.5 active:scale-[0.98] shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại ngay</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
