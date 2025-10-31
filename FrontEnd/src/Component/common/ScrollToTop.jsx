import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Luôn cuộn về đầu trang khi pathname thay đổi (chuyển trang)
    // Điều này đảm bảo mỗi route mới bắt đầu ở đầu trang.
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return null
}

export default ScrollToTop
