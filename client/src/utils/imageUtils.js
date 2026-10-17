/**
 * Tối ưu URL ảnh logo:
 * - e_trim: Tự động cắt bỏ khoảng trắng hoặc nền trong suốt thừa xung quanh logo của Cloudinary
 * - f_auto,q_auto: Tối ưu WebP và dung lượng sắc nét
 */
export function formatLogoUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (!url.includes('/upload/e_trim')) {
      return url.replace('/upload/', '/upload/e_trim,f_auto,q_auto/');
    }
  }
  return url;
}
