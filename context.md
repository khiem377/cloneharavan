# context.md — Haravan Clone Project

Tài liệu tham chiếu nội bộ cho toàn bộ codebase. Dùng khi onboard thành viên mới
hoặc khi bắt đầu feature mới để không đi sai pattern.

---

## 1. Tổng quan kiến trúc

```
cloneharavan/
├── BE/         — Express.js API (Node.js + MongoDB)
├── Admin/      — React + Vite (quản trị nội bộ)
└── Client/     — (chưa build — planned: Next.js storefront)
```

Cổng mặc định:
- BE API  : http://localhost:5000
- Admin   : http://localhost:5173
- Client  : http://localhost:3000 (planned)

---

## 2. Backend (BE)

### 2.1 Tech stack

| Thành phần      | Thư viện / Ghi chú                                         |
|-----------------|------------------------------------------------------------|
| Runtime         | Node.js                                                    |
| Framework       | Express.js                                                 |
| Database        | MongoDB + Mongoose (timestamps: true mọi schema)           |
| Auth            | JWT access token + httpOnly cookie refresh token           |
| Upload          | Multer (memStorage) → Cloudinary                           |
| Email           | Nodemailer                                                 |
| Excel           | ExcelJS                                                    |
| AI / Chatbot    | Groq SDK (openai-compatible), SSE stream                   |
| Recommendation  | Matrix factorization — Python script + DB sync             |
| Search (client) | Custom token-based index (không dùng cho chatbot)          |

### 2.2 Cấu trúc thư mục BE

```
BE/src/
├── app.js          — Express setup (CORS, middleware, mount routes)
├── config/         — db.js, cloudinary.js, hằng số môi trường
├── controllers/    — Nhận req/res, gọi service, trả JSON
├── services/       — Business logic, gọi model + external API
├── models/         — Mongoose schema + virtuals + indexes
├── routes/         — Gắn middleware chain + controller
├── middleware/     — auth, permission, error, upload, validate
├── validators/     — Schema validate (Zod/Joi)
├── utils/          — Helper functions thuần túy
└── template/       — Email HTML, Excel template
```

### 2.3 Flow request điển hình

```
Request
  → routes/xxx.routes.js
      → authenticate          (verify JWT, gắn req.user)
      → requirePermission()   (check role.permissions)
      → validate(schema)      (validate body/params)
      → controller.action()
          → service.doSomething()
              → Model.find() / .create() / ...
                  → MongoDB
          ← data
      ← res.json({ success, data, pagination })
```

### 2.4 Chuẩn response API

```js
// List
{ success: true, data: [...], pagination: { page, limit, total, totalPages } }

// Single
{ success: true, data: { ...object } }

// Lỗi (qua error.middleware.js)
{ success: false, message: 'Mô tả lỗi', errors: [...] }
```

### 2.5 Naming conventions BE

| Thứ          | Convention           | Ví dụ                         |
|--------------|----------------------|-------------------------------|
| File         | camelCase.type.js    | product.service.js            |
| Route prefix | /api/v1/resource     | /api/v1/products              |
| Model field  | camelCase            | thumbnailUrl, isActive        |
| Controller   | exports.verb         | exports.list, exports.create  |
| Service fn   | async verbNoun()     | async listProducts()          |

### 2.6 Auth flow

1. Login → BE trả `accessToken` + set `refreshToken` vào **httpOnly cookie**
2. Admin gắn `Authorization: Bearer <accessToken>` vào mọi request (axios interceptor)
3. 401 → axios interceptor tự gọi `/auth/refresh-token` → lấy token mới → retry
4. Refresh thất bại → `clearAuth()` → redirect `/login`

### 2.7 Permission system

- Route dùng: `requirePermission('resource:action')`
- Action chuẩn: `read`, `create`, `update`, `delete`, `manage`
- Role → mảng `permissions[]` ref Permission model
- Middleware check `user.role.permissions.includes(permCode)`

### 2.8 Middleware chain

```
auth.middleware.js        — Verify JWT, gắn req.user
permission.middleware.js  — Check req.user.role.permissions
validate.middleware.js    — Validate body/params
upload.middleware.js      — Multer memStorage → Cloudinary
error.middleware.js       — Catch-all, format error response
```

### 2.9 Controller pattern

```js
exports.list = async (req, res, next) => {
  try {
    const result = await productService.list(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) { next(err); }
};
```

### 2.10 Service pattern

```js
// Không biết gì về req/res
async function listProducts({ page = 1, limit = 20, keyword }) {
  const query = keyword ? { name: new RegExp(keyword, 'i') } : {};
  const [data, total] = await Promise.all([
    Product.find(query).skip((page-1)*limit).limit(limit).lean(),
    Product.countDocuments(query),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } };
}
```

---

## 3. Admin

### 3.1 Tech stack

| Thành phần   | Thư viện                                                    |
|--------------|-------------------------------------------------------------|
| Framework    | React 18 + Vite                                             |
| Routing      | React Router v7                                             |
| Server state | TanStack Query (React Query v5)                             |
| Client state | Zustand (auth store duy nhất)                               |
| Styling      | Tailwind CSS v4 + CSS variables (shadcn token system)       |
| Font         | Geist Variable (@fontsource-variable/geist)                 |
| Icons        | Lucide React — re-export qua @/components/ui/Icons.jsx      |
| DnD          | @dnd-kit/core + @dnd-kit/sortable                           |
| Rich Text    | Custom RichTextEditor                                       |
| Toast        | Custom ToastProvider                                        |
| HTTP         | Axios instance tại src/lib/axios.js (tự refresh token)      |

### 3.2 Cấu trúc thư mục Admin

```
Admin/src/
├── main.jsx            — Entry: QueryClientProvider, RouterProvider
├── App.jsx
├── index.css           — Global CSS + design tokens + utility classes
├── lib/
│   └── axios.js        — Axios instance, token interceptor, refresh logic
├── store/
│   └── authStore.js    — Zustand: user, accessToken, refreshToken
├── providers/
│   ├── ToastProvider.jsx
│   └── ThemeProvider.jsx
├── router/
│   └── index.jsx       — Route definitions (lazy import)
├── hooks/              — React Query hooks (1 file per resource)
├── services/           — Axios calls (không có logic)
├── components/
│   ├── ui/             — Generic, không gắn với domain
│   ├── auth/           — Can.jsx (RBAC render guard)
│   ├── layout/         — AppLayout, Sidebar, Header
│   ├── products/       — Product-specific shared components
│   ├── inventory/      — Inventory-specific shared components
│   └── media/          — Media library components
├── pages/              — Route pages, nhóm theo domain
│   ├── DashboardPage.jsx
│   ├── products/
│   ├── inventory/
│   ├── categories/
│   ├── brands/
│   ├── promotions/
│   ├── menus/
│   ├── media/
│   ├── blog/
│   ├── roles/
│   ├── audit/
│   └── auth/
└── utils/
    └── treeUtils.js    — flattenTree, buildTree, buildRelationMaps, getAncestors...
```

### 3.3 Data fetching — React Query (BẮT BUỘC)

Mỗi resource có 1 hook file ở `hooks/useXxx.js`:

```js
// hooks/useProducts.js
export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.list(params).then(r => r.data),
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Tạo sản phẩm thành công');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
  });
}
```

Query key convention:
```
['products']                        — list
['products', { page, keyword }]     — list có filter
['products', id]                    — single
['products', 'variants', productId] — nested
```

### 3.4 Service layer

```js
// services/product.service.js — chỉ wrap axios, không có logic
const productService = {
  list:    (params) => api.get('/products', { params }),
  getById: (id)     => api.get(`/products/${id}`),
  create:  (data)   => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  delete:  (id)     => api.delete(`/products/${id}`),
};
export default productService;
```

### 3.5 State management

Auth state — Zustand (persist localStorage):
```js
const useAuthStore = create(persist(
  (set) => ({
    user: null, accessToken: null, refreshToken: null,
    setAuth: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
    clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
  }),
  { name: 'auth-store' }
));
```

Server state — React Query (không dùng useState cho data từ API).

Local UI state — useState trong component (form, modal open, filter).

Multi-modal state — dùng `useModalSet` hook:
```js
const modal = useModalSet(['detail', 'confirm', 'excelPreview']);
modal.open('detail', rowData);   // mở + gắn data
modal.close('detail');
modal.isOpen('detail');          // boolean
modal.data('detail');            // rowData
modal.props('detail');           // { open, data, onClose }
```

### 3.6 Component conventions

| Loại                            | Nơi đặt                      |
|---------------------------------|------------------------------|
| Dùng ở nhiều domain             | components/ui/               |
| Gắn với 1 domain                | components/{domain}/         |
| Chỉ dùng trong 1 page           | Inline local function        |
| Route page                      | pages/{domain}/XxxPage.jsx   |

Shared components đã có:
- `components/ui/PriceInput.jsx` — input tiền VNĐ format dấu phẩy, export formatVND
- `components/ui/SearchableSelect.jsx` — dropdown có search, creatable
- `components/ui/MediaPickerModal.jsx` — chọn ảnh từ thư viện
- `components/ui/ConfirmDialog.jsx` — confirm popup (thay window.confirm)
- `components/ui/RichTextEditor.jsx` — rich text WYSIWYG
- `components/products/SpecsEditor.jsx` — bảng thông số kỹ thuật, prop showGroup
- `components/products/SortableGalleryItem.jsx` — DnD gallery item, prop size='md'|'sm'

Icons — LUÔN import từ wrapper:
```js
import { Plus, Trash2, Loader2, Edit3 } from '@/components/ui/Icons';
// KHÔNG import trực tiếp từ lucide-react trong page
```

### 3.7 Page structure chuẩn

```jsx
export default function XxxListPage() {
  // 1. Server data
  const { data, isLoading } = useXxx(params);
  const deleteMut = useDeleteXxx();

  // 2. Local UI state
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const modal = useModalSet(['confirm']);

  // 3. Handlers
  const handleDelete = (item) => modal.open('confirm', item);
  const confirmDelete = () => deleteMut.mutate(modal.data('confirm')?._id);

  // 4. Loading guard
  if (isLoading) return <div className="page-loading"><Loader2 className="animate-spin" /></div>;

  // 5. JSX
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tiêu đề</h1>
          <p className="page-subtitle">Mô tả</p>
        </div>
        <button className="btn-primary">Thêm mới</button>
      </div>

      <div className="page-toolbar">
        {/* filter, search */}
      </div>

      <div className="table-wrap">
        <table className="data-table">...</table>
      </div>

      <ConfirmDialog
        {...modal.props('confirm')}
        title="Xóa?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
```

---

## 4. Styling — Tailwind CSS v4 + Design Tokens

### 4.1 Setup

- Tailwind v4 — `@import "tailwindcss"` trong CSS, không có `tailwind.config.js`
- Tokens theo chuẩn shadcn — CSS variables trong `:root` và `.dark`
- Font: Geist Variable (giống Vercel dashboard)
- Color space: OKLCH

### 4.2 Color Palette (CSS Variables)

| Token                | Light                          | Dark                           | Dùng cho              |
|----------------------|--------------------------------|--------------------------------|-----------------------|
| `--background`       | oklch(1 0 0) — trắng           | oklch(0.145 0 0) — đen         | Nền trang             |
| `--foreground`       | oklch(0.145 0 0)               | oklch(0.985 0 0)               | Text chính            |
| `--card`             | oklch(1 0 0)                   | oklch(0.205 0 0)               | Nền card/panel        |
| `--primary`          | oklch(0.205 0 0) — đen         | oklch(0.922 0 0) — trắng xám   | Nút chính             |
| `--primary-foreground`| oklch(0.985 0 0)              | oklch(0.205 0 0)               | Text trên primary     |
| `--muted`            | oklch(0.97 0 0)                | oklch(0.269 0 0)               | Nền mờ, row zebra     |
| `--muted-foreground` | oklch(0.556 0 0)               | oklch(0.708 0 0)               | Text phụ, placeholder |
| `--border`           | oklch(0.922 0 0)               | oklch(1 0 0 / 10%)             | Viền                  |
| `--input`            | oklch(0.922 0 0)               | oklch(1 0 0 / 15%)             | Viền input            |
| `--ring`             | oklch(0.708 0 0)               | oklch(0.556 0 0)               | Focus ring            |
| `--destructive`      | oklch(0.577 0.245 27.325) — đỏ | oklch(0.704 0.191 22.216)      | Xóa, lỗi              |
| `--accent`           | oklch(0.97 0 0)                | oklch(0.269 0 0)               | Hover state           |
| `--sidebar`          | oklch(0.975 0.005 240) — xanh nhạt | oklch(0.205 0 0)           | Nền sidebar           |
| `--radius`           | 0.625rem                       | —                              | Base border radius    |

Semantic colors bổ sung (dùng Tailwind trực tiếp):

| Màu     | Tailwind class                    | Dùng cho                         |
|---------|-----------------------------------|----------------------------------|
| Xanh lá | emerald-500/10, emerald-600       | Thành công, active, published    |
| Xanh    | blue-500/10, blue-600             | Info, link, edit action          |
| Tím     | purple-500/10, purple-600         | Variant, level badge 2           |
| Indigo  | indigo-500/10, indigo-600         | In transit, level badge 1        |
| Vàng    | amber-500/10, amber-600           | Warning, pending                 |
| Đỏ      | destructive token                 | Delete, error, cancelled         |

### 4.3 Border Radius

| Class        | Giá trị (base 0.625rem)   |
|--------------|---------------------------|
| rounded-sm   | ~0.375rem (0.6×)          |
| rounded-md   | 0.5rem (0.8×)             |
| rounded-lg   | 0.625rem (1×)             |
| rounded-xl   | ~0.875rem (1.4×)          |
| rounded-2xl  | ~1.125rem (1.8×)          |

### 4.4 CSS Utility Classes (index.css)

#### Layout & Container

```
.page-container    — Wrapper chính mỗi page
.page-header       — Header row title + actions
.page-title        — h1 tiêu đề
.page-subtitle     — Mô tả nhỏ dưới title
.page-toolbar      — Row filter + search + button
.page-card         — Panel có border, rounded-xl, shadow-2xs
.page-loading      — Spinner center (py-20)
.page-empty        — Empty state center (py-20)
.filter-bar        — Row chứa filter dropdowns
.filter-select     — Dropdown filter h-9
```

#### Table

```
.table-wrap        — Wrapper overflow-x-auto + border + rounded-xl
.data-table        — <table> style mặc định
.empty-cell        — <td> empty state center
.loading-center    — Loading row trong table
.slug-text         — Monospace code pill
.row-checkbox      — Checkbox cell
```

#### Form & Input

```
.form-group        — flex flex-col gap-1.5
.form-label        — text-xs font-medium
.form-input        — h-9 input chuẩn với focus ring
.form-row          — grid 1/2/3 cols responsive
.search-box        — Wrapper search với icon
.search-input      — Input search padding-left icon
.required          — Dấu * màu destructive
```

#### Buttons

```
.btn-primary       — h-9 bg-primary, nút chính
.btn-outline       — h-9 border-input, nút phụ
.btn-ghost         — h-9 hover:bg-accent
.btn-danger-outline — h-9 viền đỏ
.btn-primary-sm    — h-8 text-xs
.btn-ghost-sm      — h-8 text-xs ghost
.btn-danger-sm     — h-8 text-xs danger
.btn-icon          — size-8 icon button
.btn-icon.danger   — icon hover đỏ
.btn-icon-sm       — size-6 icon button nhỏ
.ia-btn            — Inline action button base
.ia-edit           — Edit (xanh)
.ia-toggle         — Toggle (tím)
.ia-delete         — Delete (đỏ)
```

#### Badges & Status

```
.badge             — Base pill
.badge-info        — Xanh dương
.badge-success     — Xanh lá
.badge-muted       — Xám
.status-badge      — Có dot indicator
.status-badge.active / .inactive
.level-badge-0/1/2 — primary / indigo / purple
```

#### Modal

```
.modal-overlay     — Fixed backdrop blur
.modal-box         — Container max-w-lg
.modal-header      — Header border-b
.modal-body        — Scrollable max-h-[80vh]
.modal-footer      — Footer actions
```

### 4.5 Quy tắc style

1. Dùng utility class trong index.css trước khi viết inline Tailwind
2. Input chuẩn:
   `h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20`
3. Card/Panel chuẩn:
   `rounded-xl border border-border bg-card p-5 shadow-2xs`
4. Dark mode: các token tự handle — không viết thủ công `dark:` trừ semantic color
5. Transparency: `/` slash — `bg-primary/10`, `border-primary/20`
6. Shadow: chỉ `shadow-xs`, `shadow-2xs`, `shadow-sm`
7. Spacing: `gap-2`, `gap-3`, `gap-4`, `gap-6` — tránh gap-5 hay gap-7

---

## 5. Anti-patterns — Không làm

### BE

- Không để business logic trong controller — phải vào service
- Không gọi model trực tiếp từ controller
- Không bỏ `next(err)` trong catch block
- Không trả format response khác chuẩn `{ success, data, pagination }`

### Admin

- Không dùng `useEffect + fetch/axios` để lấy data — phải dùng React Query
- Không import từ `lucide-react` trực tiếp trong pages — dùng `@/components/ui/Icons`
- Không dùng `alert()` hay `window.confirm()` — dùng `toast` và `ConfirmDialog`
- Không copy component inline nếu đã có shared version
- Không dùng `useState` để lưu server data

### Styling

- Không dùng `style={{...}}` inline trừ DnD transform
- Không hardcode màu hex/rgb — phải dùng Tailwind class hoặc CSS var
- Không dùng emoji trong UI
- Không dùng markdown (bold, italic) trong chatbot response

---

## 6. Môi trường

BE (.env):
```
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GROQ_API_KEY=...
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173
```

Admin (.env):
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 7. Flow thêm feature mới (end-to-end)

Ví dụ thêm "Supplier Ratings":

BE:
1. `models/supplierRating.model.js`
2. `services/supplierRating.service.js`
3. `controllers/supplierRating.controller.js`
4. `validators/supplierRating.validator.js`
5. `routes/supplierRating.routes.js`
6. Mount vào `routes/index.js`

Admin:
1. `services/supplierRating.service.js`
2. `hooks/useSupplierRatings.js`
3. `pages/suppliers/SupplierRatingPage.jsx`
4. Thêm route vào `router/index.jsx`
5. Thêm link vào sidebar

---

## 8. Models quan trọng

| Model                     | Chức năng chính                                          |
|---------------------------|----------------------------------------------------------|
| product.model.js          | Sản phẩm, specifications[], media refs, variants ref     |
| productVariant.model.js   | Biến thể: SKU, giá, stock, options, images               |
| category.model.js         | Tree: parentId, slug, level                              |
| purchaseOrder.model.js    | Đơn đặt hàng, items[], status workflow                   |
| stockReceiving.model.js   | Phiếu nhập kho, link PO                                  |
| stockExport.model.js      | Phiếu xuất kho                                           |
| stockAudit.model.js       | Kiểm kê tồn kho                                          |
| user.model.js             | User + địa chỉ + refresh token store                     |
| role.model.js             | Role → permissions[]                                     |
| media.model.js            | File Cloudinary: url, publicId, folderId                 |
| menu.model.js             | Navigation menu với items tree                           |

---

## 9. Shared utilities đã có

| File                                  | Export                                                    |
|---------------------------------------|-----------------------------------------------------------|
| utils/treeUtils.js                    | flattenTree, buildTree, buildNodeMap, buildBreadcrumb,    |
|                                       | buildRelationMaps, getAncestors, getDescendants,          |
|                                       | getDepth, flattenFolders                                  |
| components/ui/PriceInput.jsx          | default PriceInput, named formatVND, parseVND             |
| components/products/SpecsEditor.jsx   | default SpecsEditor (prop: specs, onChange, showGroup)    |
| components/products/SortableGalleryItem.jsx | default SortableGalleryItem (prop: id, url, idx,   |
|                                       | onRemove, size='md'|'sm')                                 |
| hooks/useModalSet.js                  | useModalSet(keys[]) → { open, close, isOpen, data, props }|
| hooks/useRoles.js                     | useRoles, usePermissions, useCreateRole, useUpdateRole,   |
|                                       | useDeleteRole, useSeedFullPermissions                     |
| hooks/usePOCreateForm.js              | usePOCreateForm() → step, items, addItem, removeItem,     |
|                                       | updateItem, autoFillAll, totalQuantity, totalAmount       |

---

*Cập nhật: 2026-09-03*
