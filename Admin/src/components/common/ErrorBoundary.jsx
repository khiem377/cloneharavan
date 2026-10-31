import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
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
        <div className="min-h-[360px] w-full flex items-center justify-center p-4 sm:p-6 bg-background">
          <div className="w-full max-w-lg rounded-[6px] border border-border bg-card p-6 shadow-xs select-none">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-[6px] bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  {this.props.title || 'Đã xảy ra lỗi tải giao diện'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {this.props.description ||
                    'Phân hệ này gặp sự cố bất ngờ khi kết nối dữ liệu. Bạn có thể thử tải lại hoặc quay về trang chủ.'}
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {this.state.error && (
              <div className="mt-4 rounded-[6px] bg-muted/40 border border-border p-3 text-xs font-mono text-muted-foreground break-all">
                <span className="font-bold text-destructive">Lỗi: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            {/* Collapsible Tech Details */}
            {this.state.errorInfo && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Chi tiết kỹ thuật (Developer Info)</span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`}
                  />
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-2.5 rounded-[4px] bg-muted/70 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-40 leading-relaxed">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="h-9 px-3.5 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
              >
                <Home className="size-3.5 mr-1.5" />
                <span>Về trang chủ</span>
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={this.handleReset}
                className="h-9 px-4 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                <span>Thử lại ngay</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
