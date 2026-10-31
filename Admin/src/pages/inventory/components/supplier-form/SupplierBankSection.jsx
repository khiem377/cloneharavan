import React from 'react';
import { CreditCard, ChevronDown, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SupplierBankSection({
  selectedBank,
  setSelectedBank,
  isBankDropdownOpen,
  setIsBankDropdownOpen,
  bankSearch,
  setBankSearch,
  filteredBanks,
  accountNumber,
  setAccountNumber,
  accountHolder,
  setAccountHolder,
  branch,
  setBranch,
}) {
  return (
    <div className="space-y-3 pt-1">
      <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/60">
        <CreditCard className="size-4 text-primary" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          3. Tài khoản ngân hàng
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="relative sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Ngân hàng thụ hưởng
          </label>
          <div
            onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
            className="w-full h-9 px-3 rounded-[6px] border border-input bg-background flex items-center justify-between cursor-pointer text-xs"
          >
            {selectedBank ? (
              <div className="flex items-center gap-2.5 truncate">
                {selectedBank.logo && (
                  <img
                    src={selectedBank.logo}
                    alt={selectedBank.shortName}
                    className="h-5 max-w-[60px] object-contain shrink-0"
                  />
                )}
                <span className="font-bold text-foreground font-mono">
                  {selectedBank.shortName || selectedBank.code}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  - {selectedBank.name}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">-- Chọn ngân hàng VietQR --</span>
            )}
            <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-1" />
          </div>

          {isBankDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-[6px] shadow-sm max-h-64 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-border bg-muted/40">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Tìm nhanh theo tên, mã VCB, MB, TCB, ACB, VietinBank..."
                    className="h-8 text-xs pl-8 rounded-[6px]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-border/50">
                {filteredBanks.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    Không tìm thấy ngân hàng phù hợp
                  </div>
                ) : (
                  filteredBanks.map((b) => (
                    <div
                      key={b.id || b.code}
                      onClick={() => {
                        setSelectedBank(b);
                        setIsBankDropdownOpen(false);
                      }}
                      className={`p-2.5 flex items-center justify-between hover:bg-muted/60 cursor-pointer text-xs transition-colors ${
                        selectedBank?.code === b.code ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        {b.logo ? (
                          <img
                            src={b.logo}
                            alt={b.shortName}
                            className="h-5 w-12 object-contain bg-white rounded-[2px] p-0.5 border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-5 w-12 bg-muted rounded-[2px] shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="font-bold text-foreground font-mono mr-2">
                            {b.shortName || b.code}
                          </span>
                          <span className="text-muted-foreground text-xs truncate">
                            {b.name}
                          </span>
                        </div>
                      </div>
                      {selectedBank?.code === b.code && (
                        <Check className="size-4 text-primary shrink-0 ml-1" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Số tài khoản ngân hàng
          </label>
          <Input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\s+/g, ''))}
            placeholder="0123456789"
            className="rounded-[6px] h-9 text-xs font-mono tabular-nums tracking-wider"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Tên chủ tài khoản <span className="text-muted-foreground font-normal">(tự viết hoa)</span>
          </label>
          <Input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
            placeholder="NGUYEN VAN A"
            className="rounded-[6px] h-9 text-xs font-mono uppercase font-bold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Chi nhánh ngân hàng
          </label>
          <Input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="VD: Chi nhánh TP. Hồ Chí Minh"
            className="rounded-[6px] h-9 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
