import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Nếu có hash (như #post-1), không scroll to top
    // Điều này cho phép scroll đến bài viết cụ thể
    if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop
