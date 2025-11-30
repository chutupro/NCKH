const defaultAiConfig = {
  // baseUrls: ['http://localhost:8000'],// bật lên khi cài AI trên máy cá nhân để test
  // baseUrls: ['http://192.168.1.87:8000'],//làm việc khi trên công ty hoặc kết nối chung wifi
  baseUrls: ["http://26.68.60.194:8000"], // bật lên khi làm ở nhờ hoặc khi thằng làm ai không có ở đó để test chung
  featureFlags: {
    analyze: false,
    moderateComment: true,
    moderateArticle: false,
    gemini: false,
  },
  endpoints: {
    analyze: "/fast-analyze",
    moderateComment: "/moderate-comment",
    moderateArticle: "/moderate-article",
    geminiGenerate: "/gemini/generate",
  },
  // Gates: Các cổng kiểm tra để tự động chặn nội dung vi phạm
  // - nsfw: true = chặn ảnh không phù hợp (NSFW content)
  // - manipulation: true = chặn ảnh đã chỉnh sửa/giả mạo
  // - historical: true = chỉ chấp nhận ảnh lịch sử (chặn ảnh không phải lịch sử)
  gates: {
    nsfw: true,
    manipulation: true,
    historical: true,
  },
};

export const getAiFeatureConfig = () => defaultAiConfig;

export const getAiEndpointUrl = (key) => {
  const cfg = getAiFeatureConfig();
  const path = cfg.endpoints?.[key];
  if (!path) return null;
  const base = (cfg.baseUrls && cfg.baseUrls[0]) || cfg.baseUrl;
  if (!base) return path;
  return `${base}${path}`;
};

export default getAiFeatureConfig;
