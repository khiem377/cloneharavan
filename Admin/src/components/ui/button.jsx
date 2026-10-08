import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[6px] border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-100 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Nút chính: Hành động chính duy nhất của một khu (Evondev taste - solid dark)
        default:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-xs disabled:bg-slate-300 disabled:text-slate-500",
        primary:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-xs disabled:bg-slate-300 disabled:text-slate-500",

        // Nút nền xám: Nút phụ đứng cạnh nút chính hoặc rộng hết card
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400",

        // Nút viền: Mặc định cho mọi hành động khác (thêm, sửa, mở, lọc)
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:border-slate-200 disabled:text-slate-300",

        // Nút trong suốt: Hành động phụ nằm trong hàng, chữ xám lúc thường, rê vào mới hiện nền
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300",

        // Nút cảnh báo / xóa
        destructive:
          "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50",

        link: "text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-sm",
        xs: "h-6 gap-1 px-2 text-[11px]",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-10 gap-2 px-5 text-sm",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2 className="size-3.5 animate-spin shrink-0" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
