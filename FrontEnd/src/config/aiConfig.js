const defaultAiConfig = {

  baseUrls: ['http://26.68.60.194:8000'],// bật lên khi làm ở nhờ hoặc khi thằng làm ai không có ở đó để test chung
  featureFlags: {
    analyze: false,
    moderateComment: false,
    generateTitle: false,
  },
  endpoints: {
    analyze: '/fast-analyze',
    fastAnalyze: '/fast-analyze',
    generateTitle: '/generate-title',
    nsfwCheck: '/nsfw-check',
    moderateComment: '/moderate-comment',
  },
  gates: {
    nsfw: true,
    manipulation: true,
    historical: true,
  },
}

export const getAiFeatureConfig = () => defaultAiConfig

export const getAiEndpointUrl = (key) => {
  const cfg = getAiFeatureConfig()
  const path = cfg.endpoints?.[key]
  if (!path) return null
  const base = (cfg.baseUrls && cfg.baseUrls[0]) || cfg.baseUrl
  if (!base) return path
  return `${base}${path}`
}

export default getAiFeatureConfig

