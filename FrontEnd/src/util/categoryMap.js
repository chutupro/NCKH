// Utility to map dataset category names (Vietnamese) to stable codes and localize labels

export const VN_TO_CODE = {
  'Kiến trúc': 'architecture',
  'Văn hóa': 'culture',
  'Du lịch': 'tourism',
  'Thiên nhiên': 'nature',
};

export const CODE_TO_VN = Object.fromEntries(
  Object.entries(VN_TO_CODE).map(([vn, code]) => [code, vn])
);

export const KNOWN_CODES = ['architecture', 'culture', 'tourism', 'nature'];

export function getCodeFromName(name) {
  if (!name) return 'other';
  // direct VN lookup
  if (VN_TO_CODE[name]) return VN_TO_CODE[name];
  // support common English labels as well
  const EN_TO_CODE = {
    'Architecture': 'architecture',
    'Culture': 'culture',
    'Tourism': 'tourism',
    'Nature': 'nature',
  };
  const maybe = EN_TO_CODE[name] || EN_TO_CODE[String(name).trim()];
  if (maybe) return maybe;
  // case-insensitive English match
  const lower = String(name).toLowerCase()
  for (const [k, v] of Object.entries(EN_TO_CODE)) {
    if (k.toLowerCase() === lower) return v
  }
  return 'other';
}

export function labelFor(code /*, t - kept for compatibility */) {
  // Trả về nhãn tiếng Việt tương ứng với mã danh mục
  switch (code) {
    case 'architecture':
      return 'Kiến trúc';
    case 'culture':
      return 'Văn hóa';
    case 'tourism':
      return 'Du lịch';
    case 'nature':
      return 'Thiên nhiên';
    case 'all':
      return 'Tất cả';
    default:
      return 'Khác';
  }
}

export function displayCategoryName(vnName /*, t - legacy param */) {
  const code = getCodeFromName(vnName);
  return labelFor(code);
}
