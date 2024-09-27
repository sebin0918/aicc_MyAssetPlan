// client/src/components/Footer.jsx
import React from 'react';
import './Components_Styles.css';
import footer_logo from '../images/map_logo_footer.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-text">
          <p>Project by Codelab Academy AICC 2기</p>
          <p>MAP (My Asset Plan)</p>
          <p>팀원: 김준우 박상희 신재준 심유경 송민영 인진석 임세빈</p>
          <p>(주)코드랩이앤티</p>
          <p>서울 금천구 가산디지털로 144 현대테라타워 가산DK 20층  T. 02-2038-0800    </p>
          <p>Copyright ⓒ 2024, by CodeLab. All rights reserved.</p>
        </div>
        <div className="footer-logo">
          <img src={footer_logo} alt="MAP Logo" />
        </div>
      </div>
    </footer>
  );
};
export default Footer;
