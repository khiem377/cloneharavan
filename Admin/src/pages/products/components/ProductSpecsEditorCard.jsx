import React from 'react';
import { Plus, Trash2 } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Product Key-Value Specifications Editor Card
 */
export default function ProductSpecsEditorCard({
  specifications = [],
  addSpecRow,
  updateSpecRow,
  removeSpecRow,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-foreground">Thông số kỹ thuật</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-[6px] text-xs cursor-pointer"
          onClick={addSpecRow}
        >
          <Plus size={13} className="mr-1" /> Thêm dòng
        </Button>
      </CardHeader>

      <CardContent className="pt-4">
        {specifications.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">Chưa có thông số nào</p>
        ) : (
          <div className="flex flex-col gap-2">
            {specifications.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  className="h-8 flex-1 rounded-[6px] text-xs font-sans"
                  placeholder="Tên thông số (VD: Màn hình)"
                  value={s.key}
                  onChange={(e) => updateSpecRow(idx, e.target.value, s.value)}
                />
                <Input
                  className="h-8 flex-1 rounded-[6px] text-xs font-sans"
                  placeholder="Giá trị (VD: 6.7 inch Dynamic AMOLED)"
                  value={s.value}
                  onChange={(e) => updateSpecRow(idx, s.key, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-[6px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  onClick={() => removeSpecRow(idx)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
