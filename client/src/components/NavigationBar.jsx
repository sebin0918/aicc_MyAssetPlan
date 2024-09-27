import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Components_Styles.css';
import openButton from '../images/navigate_open_button1.png';
import logo from '../images/map_logo_all_page.png';
import myAssetPlannerIcon from '../images/nav_map_icon.png';
import stockIcon from '../images/nav_stock_icon.png';
import newsIcon from '../images/nav_news_icon.png';
import ServiceIcon from '../images/nav_service_icon.png';
import myPageIcon from '../images/nav_mypage_icon.png';
import adminIcon from '../images/map_household_button_icon.png';

const NavigationBar = ({ isAuthenticated, userInfo}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenus, setActiveMenus] = useState([]);



  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const toggleMenu = (menu) => {
    setActiveMenus(prevActiveMenus => 
      prevActiveMenus.includes(menu) 
        ? prevActiveMenus.filter(activeMenu => activeMenu !== menu) 
        : [...prevActiveMenus, menu]
    );
  };

  return (
    <div className={`navigation-bar ${isOpen ? 'open' : ''}`}>
      <button className="nav-toggle" onClick={toggleNav}>
        <img src={openButton} alt="Open Navigation" />
      </button>
      <nav className={`nav-content ${isOpen ? 'show' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="nav-logo" />
        </div>
        <ul>
          <li onClick={() => toggleMenu('myAssetPlanner')}>
            <div className="menu-item">
              <img src={myAssetPlannerIcon} alt="My Asset Planner" className="nav-icon" />
              <span className="nav-link">My Asset Planner</span>
            </div>
            <ul className={`submenu ${activeMenus.includes('myAssetPlanner') ? 'open' : ''}`}>
              <li><Link to="/myassetplaner" className="nav-link">MAP</Link></li>
              <li><Link to="/household" className="nav-link">가계부</Link></li>
            </ul>
          </li>
          <li onClick={() => toggleMenu('stock')}>
            <div className="menu-item">
              <img src={stockIcon} alt="Stock" className="nav-icon" />
              <span className="nav-link">주식</span>
            </div>
            <ul className={`submenu ${activeMenus.includes('stock') ? 'open' : ''}`}>
              <li><Link to="/stockchart" className="nav-link">주식 비교</Link></li>
              <li><Link to="/stockprediction" className="nav-link">주식 예측</Link></li>
              
            </ul>
          </li>
          <li onClick={() => toggleMenu('news')}>
            <div className="menu-item">
              <img src={newsIcon} alt="News" className="nav-icon" />
              <span className="nav-link">뉴스</span>
            </div>
            <ul className={`submenu ${activeMenus.includes('news') ? 'open' : ''}`}>
              <li><Link to="/newscheck" className="nav-link">뉴스 정보</Link></li>
              <li><Link to="/newstalk" className="nav-link">뉴스 채팅</Link></li>
            </ul>
          </li>
          <li onClick={() => toggleMenu('Service')}>
            <div className="menu-item">
              <img src={ServiceIcon} alt="Customer Service" className="nav-icon" />
              <span className="nav-link">고객 서비스</span>
            </div>
            <ul className={`submenu ${activeMenus.includes('Service') ? 'open' : ''}`}>
              <li><Link to="/faq" className="nav-link">FAQ</Link></li>
            </ul>
          </li>
          <li onClick={() => toggleMenu('myPage')}>
            <div className="menu-item">
              <img src={myPageIcon} alt="My Page" className="nav-icon" />
              <Link to="/checkpasswordmypage" className="nav-link">My Page</Link>
            </div>
          </li>

          {/* 관리자일 경우 관리자 페이지 링크를 보여줌 */}
          {userInfo?.isAdmin && (
            <li onClick={() => toggleMenu('admin')}>
              <div className="menu-item">
                <img src={adminIcon} alt="Admin Page" className="nav-icon" />
                <Link to="/admin" className="nav-link">Admin</Link>
              </div>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavigationBar;
