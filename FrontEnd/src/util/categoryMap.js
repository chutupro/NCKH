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
  return VN_TO_CODE[name] || 'other';
}

export function labelFor(code, t) {
  switch (code) {
    case 'architecture':
      return t('sidebar.architecture');
    case 'culture':
      return t('sidebar.culture');
    case 'tourism':
      return t('sidebar.tourism');
    case 'nature':
      return t('sidebar.nature');
    case 'all':
      return t('sidebar.all');
    default:
      return t('sidebar.other');
  }
}

export function displayCategoryName(vnName, t) {
  const code = getCodeFromName(vnName);
  return labelFor(code, t);
}
