import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/useAppContext'

const ProtectedLink = ({ to, className, children, onClick, ...rest }) => {
  const { isAuthenticated } = useAppContext()
  const navigate = useNavigate()

  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (!isAuthenticated) {
      e.preventDefault()
      const goLogin = window.confirm('Bạn cần đăng nhập để đóng góp. Đi tới trang đăng nhập?')
      if (goLogin) navigate('/login')
    }
  }

  return (
    <Link to={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}

export default ProtectedLink
