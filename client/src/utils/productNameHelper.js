/**
 * Helper tính toán tên sản phẩm động (Dynamic Product Name) theo biến thể được chọn
 * 
 * Ví dụ:
 * - Tên gốc: "Samsung Galaxy Tab S9 Ultra 5G 256GB"
 * - Click biến thể: "12GB/512GB 5G" (hoặc "512GB")
 * -> Tên đổi thành: "Samsung Galaxy Tab S9 Ultra 5G 512GB"
 */
export function getDynamicProductName(product, selectedVariant, variants = []) {
  if (!product || !product.name) return '';
  if (!selectedVariant) return product.name;

  // 1. Ưu tiên 1: Biến thể có nameOverride tường minh từ cơ sở dữ liệu
  if (
    selectedVariant.nameOverride &&
    typeof selectedVariant.nameOverride === 'string' &&
    selectedVariant.nameOverride.trim()
  ) {
    return selectedVariant.nameOverride.trim();
  }

  // 2. Kiểm tra nếu chỉ có 1 biến thể mặc định
  const isDefaultOnly =
    variants.length <= 1 &&
    (!selectedVariant.displayName ||
      ['mặc định', 'mac dinh', 'default', 'default title', 'tiêu chuẩn'].includes(
        selectedVariant.displayName.toLowerCase().trim()
      )) &&
    (!selectedVariant.attributes || selectedVariant.attributes.length === 0);

  if (isDefaultOnly) {
    return product.name;
  }

  let resultName = product.name;
  let hasReplaced = false;

  const currentDisplayName = (selectedVariant.displayName || '').trim();
  const otherVariants = variants.filter(
    (v) => (v._id || v.id) !== (selectedVariant._id || selectedVariant.id)
  );

  // 3. Xử lý thay thế theo từng cặp Attributes (Dung lượng, Kích thước, Màu sắc, RAM, etc.)
  if (Array.isArray(selectedVariant.attributes) && selectedVariant.attributes.length > 0) {
    for (const attr of selectedVariant.attributes) {
      const attrName = attr.name || '';
      const currentVal = String(attr.value || '').trim();
      if (!currentVal) continue;

      // Thu thập giá trị thuộc tính này từ các biến thể khác
      const otherValsForThisAttr = new Set();
      for (const ov of otherVariants) {
        if (Array.isArray(ov.attributes)) {
          const matchAttr = ov.attributes.find((a) => a.name === attrName);
          if (matchAttr && matchAttr.value) {
            otherValsForThisAttr.add(String(matchAttr.value).trim());
          }
        }
      }

      // Thử thay thế giá trị cũ xuất hiện trong tên sản phẩm bằng giá trị mới
      let attrReplaced = false;
      const sortedOldVals = Array.from(otherValsForThisAttr).sort(
        (a, b) => b.length - a.length
      );

      for (const oldVal of sortedOldVals) {
        if (!oldVal || oldVal.toLowerCase() === currentVal.toLowerCase()) continue;

        // Escape regex special chars
        const escaped = oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<=\\s|^|[-(/])${escaped}(?=\\s|$|[-)/])`, 'gi');
        if (regex.test(resultName)) {
          resultName = resultName.replace(regex, currentVal);
          attrReplaced = true;
          hasReplaced = true;
          break;
        }
      }

      // Nếu không khớp chính xác với other values, thử nhận diện mẫu dung lượng/kích thước (256GB -> 512GB, 55" -> 65")
      if (!attrReplaced) {
        // Pattern 1: Dung lượng bộ nhớ (256GB, 512GB, 1TB, 128GB, 64GB...)
        const storageMatch = currentVal.match(/^(\d+)\s*(GB|TB|MB)$/i);
        if (storageMatch) {
          const storageRegex = /\b\d+\s*(GB|TB|MB)\b/gi;
          if (
            storageRegex.test(resultName) &&
            !resultName.toLowerCase().includes(currentVal.toLowerCase())
          ) {
            resultName = resultName.replace(storageRegex, currentVal);
            hasReplaced = true;
            attrReplaced = true;
          }
        }

        // Pattern 2: Kích thước màn hình (55 inch, 65 inch, 75", 85"...)
        const sizeMatch = currentVal.match(/^(\d+)\s*(?:inch|["”]|'')$/i);
        if (sizeMatch) {
          const sizeRegex = /\b\d+\s*(?:inch|["”]|'')\b/gi;
          if (
            sizeRegex.test(resultName) &&
            !resultName.toLowerCase().includes(currentVal.toLowerCase())
          ) {
            resultName = resultName.replace(sizeRegex, currentVal);
            hasReplaced = true;
            attrReplaced = true;
          }
        }
      }
    }
  }

  // 4. Xử lý thay thế theo displayName nếu chưa replace được qua attributes
  if (
    !hasReplaced &&
    currentDisplayName &&
    !['mặc định', 'mac dinh', 'default', 'default title', 'tiêu chuẩn'].includes(
      currentDisplayName.toLowerCase()
    )
  ) {
    // Tách các thành phần trong currentDisplayName (ví dụ: "12GB/512GB 5G" -> ["12GB", "512GB", "5G"])
    const subParts = currentDisplayName.split(/[/,\s-]+/).filter((p) => p.length >= 2);

    for (const part of subParts) {
      // Nếu part là dung lượng (ví dụ "512GB")
      const storageMatch = part.match(/^(\d+)\s*(GB|TB|MB)$/i);
      if (storageMatch) {
        const storageRegex = /\b\d+\s*(GB|TB|MB)\b/gi;
        if (
          storageRegex.test(resultName) &&
          !resultName.toLowerCase().includes(part.toLowerCase())
        ) {
          resultName = resultName.replace(storageRegex, part);
          hasReplaced = true;
        }
      }
    }

    // Nếu vẫn chưa replace được, thử replace displayName cũ của biến thể khác
    if (!hasReplaced) {
      for (const ov of otherVariants) {
        const otherDisplay = (ov.displayName || '').trim();
        if (
          !otherDisplay ||
          otherDisplay.toLowerCase() === currentDisplayName.toLowerCase() ||
          ['mặc định', 'mac dinh', 'default', 'default title'].includes(
            otherDisplay.toLowerCase()
          )
        )
          continue;

        const escaped = otherDisplay.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        if (regex.test(resultName)) {
          resultName = resultName.replace(regex, currentDisplayName);
          hasReplaced = true;
          break;
        }
      }
    }
  }

  // 5. Nếu tên gốc hoàn toàn không chứa bất kỳ đặc trưng nào của biến thể -> Ghép displayName vào cuối tên
  if (
    !hasReplaced &&
    currentDisplayName &&
    !['mặc định', 'mac dinh', 'default', 'default title', 'tiêu chuẩn'].includes(
      currentDisplayName.toLowerCase()
    )
  ) {
    const currentAttrValues = Array.isArray(selectedVariant.attributes)
      ? selectedVariant.attributes
          .map((a) => (typeof a === 'object' ? a.value : a))
          .filter(Boolean)
      : [];

    const hasAnyAttrInName =
      resultName.toLowerCase().includes(currentDisplayName.toLowerCase()) ||
      currentAttrValues.some((v) => resultName.toLowerCase().includes(v.toLowerCase()));

    if (!hasAnyAttrInName) {
      resultName = `${resultName} - ${currentDisplayName}`;
    }
  }

  return resultName;
}
