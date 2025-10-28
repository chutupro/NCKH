import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Always scroll to top when the pathname changes (navigation between pages)
    // This ensures each new route starts at the top of the page.
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return null
}

export default ScrollToTop
