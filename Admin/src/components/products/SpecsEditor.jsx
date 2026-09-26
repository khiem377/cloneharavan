import { Trash2, Plus } from '@/components/ui/Icons';

/**
 * SpecsEditor — bảng chỉnh sửa thông số kỹ thuật.
 * Dùng ở ProductFormPage và VariantEditPage.
 *
 * Props:
 *   specs    — Array<{ group?: string, key: string, value: string }>
 *   onChange — (newSpecs) => void
 *   showGroup — boolean (default true) — có hiện cột "Nhóm" không
 */
export default function SpecsEditor({ specs = [], onChange, showGroup = true }) {
  const add = () =>
    onChange([...specs, { group: 'Thông tin chung', key: '', value: '' }]);

  const remove = (i) => onChange(specs.filter((_, idx) => idx !== i));

  const update = (i, field, val) =>
    onChange(specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  const inputCls =
    'h-7 w-full rounded border border-transparent bg-transparent px-2 text-sm outline-none focus:border-input focus:bg-background hover:bg-muted/40 transition-colors text-foreground';

  if (specs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer w-fit"
        >
          <Plus size={14} /> Thêm thông số
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {showGroup && (
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-32">
                  Nhóm
                </th>
              )}
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                Tên thông số
              </th>
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                Giá trị
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {specs.map((s, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {showGroup && (
                  <td className="px-2 py-1.5">
                    <input
                      className={inputCls}
                      value={s.group || ''}
                      onChange={(e) => update(i, 'group', e.target.value)}
                      placeholder="Nhóm"
                    />
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <input
                    className={inputCls}
                    value={s.key}
                    onChange={(e) => update(i, 'key', e.target.value)}
                    placeholder="VD: CPU, RAM, Màu sắc..."
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={inputCls}
                    value={s.value}
                    onChange={(e) => update(i, 'value', e.target.value)}
                    placeholder="Giá trị"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="size-6 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer w-fit"
      >
        <Plus size={14} /> Thêm thông số
      </button>
    </div>
  );
}
