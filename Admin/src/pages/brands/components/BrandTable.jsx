import { Globe, Pencil, Trash2, Check } from '@/components/ui/Icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function BrandTable({
  brands = [],
  selected = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onToggle,
  highlightId,
  rowRefs,
}) {
  const isAllSelected = brands.length > 0 && selected.length === brands.length;

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            <TableHead className="w-10 text-center">
              <button
                type="button"
                className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                  isAllSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                }`}
                onClick={onSelectAll}
              >
                {isAllSelected && <Check className="size-3" />}
              </button>
            </TableHead>
            <TableHead className="w-16">Logo</TableHead>
            <TableHead>Tên thương hiệu</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-center w-16">Thứ tự</TableHead>
            <TableHead className="text-right w-28">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground font-mono">
                Không tìm thấy thương hiệu nào
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => {
              const isSelected = selected.includes(brand._id);
              const isHighlighted = brand._id === highlightId;

              return (
                <TableRow
                  key={brand._id}
                  ref={(el) => {
                    if (rowRefs && rowRefs.current) rowRefs.current[brand._id] = el;
                  }}
                  className={`transition-colors hover:bg-muted/40 ${
                    isSelected || isHighlighted ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <TableCell className="w-10 px-3 py-2 text-center">
                    <button
                      type="button"
                      className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => onSelect(brand._id)}
                    >
                      {isSelected && <Check className="size-3" />}
                    </button>
                  </TableCell>

                  {/* Logo */}
                  <TableCell className="w-16 px-3 py-2">
                    {brand.logo?.url ? (
                      <img
                        src={brand.logo.url}
                        alt={brand.name}
                        className="size-8 rounded-[4px] object-contain border border-border bg-white p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="size-8 rounded-[4px] border border-border bg-secondary flex items-center justify-center text-xs font-bold font-mono text-muted-foreground shrink-0">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </TableCell>

                  {/* Name */}
                  <TableCell className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-foreground">{brand.name}</span>
                      {brand.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {brand.description}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="px-3 py-2">
                    <code className="inline-flex items-center rounded-[4px] bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground border border-border">
                      {brand.slug}
                    </code>
                  </TableCell>

                  {/* Website */}
                  <TableCell className="px-3 py-2">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                      >
                        <Globe className="size-3" />
                        <span>
                          {brand.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground font-mono text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onToggle(brand)}
                      className="cursor-pointer inline-flex items-center gap-1"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium border ${
                          brand.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${brand.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                        {brand.isActive ? 'Hoạt động' : 'Đang ẩn'}
                      </span>
                    </button>
                  </TableCell>

                  {/* Order */}
                  <TableCell className="px-3 py-2 text-center text-muted-foreground font-mono text-xs tabular-nums">
                    {brand.order}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Sửa thương hiệu"
                        onClick={() => onEdit(brand)}
                        className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Xóa thương hiệu"
                        onClick={() => onDelete(brand)}
                        className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
