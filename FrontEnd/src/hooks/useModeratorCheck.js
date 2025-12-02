import { useAppContext } from '../context/useAppContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Custom hook để check quyền Moderator
 * Nếu user là Moderator, chỉ cho xem một số trang nhất định
 * Các trang khác sẽ redirect về trang cho phép
 */
export const useModeratorCheck = (allowedForModerator = false) => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  const isModerator = user?.role === 'Moderator' || user?.Role === 'Moderator';

  useEffect(() => {
    if (isModerator && !allowedForModerator) {
      // Redirect Moderator tới trang Contributions nếu không được phép vào trang này
      navigate('/admin/contributions', { replace: true });
    }
  }, [isModerator, allowedForModerator, navigate]);

  return { isModerator };
};

export default useModeratorCheck;
