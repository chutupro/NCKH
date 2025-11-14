const defaultAiConfig = {
  baseUrls: ['http://localhost:8000'],
//   baseUrls: ['http://192.168.1.87:8000'],
  featureFlags: {
    analyze: true,
    moderateComment: false,
    generateTitle: true,
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

