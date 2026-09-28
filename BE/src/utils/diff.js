const calculateDiff = (oldObj = {}, newObj = {}, prefix = '') => {
  const changes = [];
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  const ignoredKeys = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'password']);

  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue;

    const oldVal = oldObj ? oldObj[key] : undefined;
    const newVal = newObj ? newObj[key] : undefined;
    const fieldName = prefix ? `${prefix}.${key}` : key;

    if (oldVal === undefined && newVal !== undefined) {
      changes.push({
        field: fieldName,
        oldValue: null,
        newValue: typeof newVal === 'object' ? JSON.stringify(newVal) : newVal,
      });
    } else if (oldVal !== undefined && newVal === undefined) {
      changes.push({
        field: fieldName,
        oldValue: typeof oldVal === 'object' ? JSON.stringify(oldVal) : oldVal,
        newValue: null,
      });
    } else if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
      if (Array.isArray(oldVal) || Array.isArray(newVal)) {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({
            field: fieldName,
            oldValue: oldVal,
            newValue: newVal,
          });
        }
      } else {
        const nestedChanges = calculateDiff(oldVal, newVal, fieldName);
        changes.push(...nestedChanges);
      }
    } else if (String(oldVal) !== String(newVal)) {
      changes.push({
        field: fieldName,
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }

  return changes;
};

module.exports = { calculateDiff };
