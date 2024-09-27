import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationBar from '../components/NavigationBar';
import ChatBot from '../components/ChatBot';

const MainLayout = ({ children, isAuthenticated, logout }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 사용자 권한 확인 API 호출
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/components/user-info`, {
          method: 'GET',
          credentials: 'include',  // 세션 쿠키를 포함해서 전송
        });
  
        if (response.ok) {  // response.ok는 HTTP 상태 코드가 200~299 사이일 때 true
          const data = await response.json();
          setUserInfo(data);  // 사용자 정보 저장
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo(null);
      }
    };
  
    fetchUserInfo();  // 컴포넌트 마운트 시 사용자 정보 가져오기
  }, []);

  return (
    <div>
      {/* Header에 isAuthenticated와 logout 전달 */}
      <Header isAuthenticated={isAuthenticated} userInfo={userInfo} logout={logout} />
      
      {/* NavigationBar에 isAuthenticated와 userInfo 전달 */}
      <NavigationBar isAuthenticated={isAuthenticated} userInfo={userInfo} />
      
      {children}
      <ChatBot />
      <Footer />
    </div>
  );
};

export default MainLayout;
