import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 서버로부터 세션 유효성 확인
    const checkSession = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/check-session`, {
          withCredentials: true, // 세션 쿠키를 포함하여 서버로 전송
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // 세션 확인 중 로딩 표시
  }

  // isAuthenticated가 false일 경우 /login으로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 컴포넌트를 렌더링
  return children;
};

export default ProtectedRoute;
