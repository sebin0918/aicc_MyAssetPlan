import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Components_Styles.css'; // 스타일 파일 임포트
import logo from '../images/map_logo_all_page.png'; // 로고 이미지
import accountIcon from '../images/account_icon.png'; // 계정 아이콘 이미지
import logoutIcon from '../images/logout_icon.png'; // 로그아웃 아이콘 이미지
import loginIcon from '../images/login_icon.png'; // 로그인 아이콘 이미지
import signupIcon from '../images/login_page_button.png'; // 회원가입 아이콘 이미지

// Header 컴포넌트 정의
const Header = ({ isAuthenticated, userInfo, logout }) => {
  const [activeMenu, setActiveMenu] = useState(null); // 활성화된 메뉴 상태 관리

  // 마우스가 메뉴에 들어올 때 활성화
  const handleMouseEnter = (menu) => {
    setActiveMenu(menu);
  };

  // 마우스가 메뉴에서 나갈 때 비활성화
  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* 메인 로고 링크 */}
        <Link to="/">
          <img src={logo} alt="MAP Logo" className="logo" />
        </Link>
        <nav>
          <ul>
            {/* MAP 메뉴 */}
            <li
              onMouseEnter={() => handleMouseEnter('MAP')}
              onMouseLeave={handleMouseLeave}
              className={activeMenu === 'MAP' ? 'hovered' : ''}
            >
              <Link to="/myassetplaner" className="nav-link">MAP</Link>
              <ul className={activeMenu === 'MAP' ? 'dropdown' : ''}>
                <li><Link to="/myassetplaner" className="nav-link">My Asset Planner</Link></li>
                <li><Link to="/household" className="nav-link">가계부</Link></li>
              </ul>
            </li>
            
            {/* 주식 메뉴 */}
            <li
              onMouseEnter={() => handleMouseEnter('주식')}
              onMouseLeave={handleMouseLeave}
              className={activeMenu === '주식' ? 'hovered' : ''}
            >
              <Link to="/stockchart" className="nav-link">주식</Link>
              <ul className={activeMenu === '주식' ? 'dropdown' : ''}>
                <li><Link to="/stockchart" className="nav-link">주식 비교</Link></li>
                <li><Link to="/stockprediction" className="nav-link">주식 예측</Link></li>
              </ul>
            </li>

            {/* 뉴스 메뉴 */}
            <li
              onMouseEnter={() => handleMouseEnter('뉴스')}
              onMouseLeave={handleMouseLeave}
              className={activeMenu === '뉴스' ? 'hovered' : ''}
            >
              <Link to="/newscheck" className="nav-link">뉴스</Link>
              <ul className={activeMenu === '뉴스' ? 'dropdown' : ''}>
                <li><Link to="/newscheck" className="nav-link">경제 뉴스</Link></li>
                <li><Link to="/newstalk" className="nav-link">통합 채팅방</Link></li>
              </ul>
            </li>

            {/* 고객 서비스 메뉴 */}
            <li
              onMouseEnter={() => handleMouseEnter('고객서비스')}
              onMouseLeave={handleMouseLeave}
              className={activeMenu === '고객서비스' ? 'hovered' : ''}
            >
              <Link to="/faq" className="nav-link">고객서비스</Link>
              <ul className={activeMenu === '고객서비스' ? 'dropdown' : ''}>
                <li><Link to="/faq" className="nav-link">FAQ</Link></li>
              </ul>
            </li>

            {/* 관리자 페이지 메뉴 (관리자일 경우에만 표시됨) */}
            {userInfo?.isAdmin && (
              <li
                onMouseEnter={() => handleMouseEnter('관리자')}
                onMouseLeave={handleMouseLeave}
                className={activeMenu === '관리자' ? 'hovered' : ''}
              >
                <Link to="/admin" className="nav-link">Admin</Link>
              </li>
            )}

          </ul>
        </nav>

        {/* 인증 버튼 (로그인, 로그아웃) */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              {/* 로그아웃 버튼 */}
              <button onClick={logout} className="logout-button">
                <img src={logoutIcon} alt="Logout" style={{ width: '80px', height: '30px' }} />
              </button>
              <Link to="/checkpasswordmypage">
                <img src={accountIcon} alt="My Page" style={{ width: '35px', height: '35px' }} />
              </Link>
            </>
          ) : (
            <>
              {/* 로그인 버튼 */}
              <Link to="/login">
                <button className="login-button">로그인</button>
              </Link>
              {/* 회원가입 버튼 */}
              <Link to="/signup">
                <button className="signup-button">회원가입</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
