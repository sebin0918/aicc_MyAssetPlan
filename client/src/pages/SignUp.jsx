import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../styles/SignUp.css';
import Footer from '../components/Footer';
import Signup_image from '../images/Signup_image_1.png'; // 이미지를 프로젝트에 맞게 경로를 설정해 주세요
import gendar_male from '../images/gendar_male_icon.png';
import gendar_female from '../images/gendar_female_icon.png';
import signup_logo from '../images/map_logo_login.png';

const SignUp = () => {
  const [checkEmail, setCheckEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [value, setValue] = useState("");
  const [codeButtonActivate, setCodeButtonActivate] = useState(true);
  const [confirmButtonActivate, setConfirmButtonActive] = useState(true);
  const [registerButtonActivate, setRegisterButtonActive] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const emailHandle = (event) => {
    setCheckEmail(event.target.value);
  };

  const emailCheck = async () => {
    if (checkEmail.length > 0 && checkEmail.includes('@')) {
      try {
        const checkRes = await fetch('http://localhost:5000/api/register/useremail', {
          method: 'POST',
          headers: { 'content-type': 'application/json; charset=UTF-8' },
          credentials: 'include',
          body: JSON.stringify({ email: checkEmail })
        });

        if (!checkRes.ok) {
          throw new Error('email중복확인 네트워크 응답실패');
        }

        const resData = await checkRes.json();
        if (resData.message === 'email possible') {
          alert("가입가능한 이메일입니다.");
          setCodeButtonActivate(false);
        } else {
          alert("중복된 이메일입니다. 이메일을 다시 입력하세요.");
        }
      } catch (error) {
        console.error('email중복확인 비동기통신에러:', error);
      }
    } else {
      alert('올바른 이메일 형식이 아닙니다. 다시 확인해주세요.');
    }
  };

  const emailCode = async () => {
    try {
      const request = await fetch('http://localhost:5000/api/register/usercheckcode', {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        credentials: 'include',
        body: JSON.stringify({ email: checkEmail })
      });
      if (!request.ok) {
        throw new Error('인증코드 네트워크 응답실패');
      }
      alert(`인증코드가 ${checkEmail}로 발송되었습니다.`);
      setConfirmButtonActive(false);
    } catch (error) {
      console.error('인증코드 비동기통신에러:', error);
    }
  };

  const confirmCodeHandle = (event) => {
    setConfirmCode(event.target.value);
  };

  const confirmCodeChecking = async () => {
    try {
      const request = await fetch('http://localhost:5000/api/register/userconfirmcode', {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        credentials: 'include',
        body: JSON.stringify({ userconfirm: confirmCode })
      });

      if (!request.ok) {
        throw new Error('인증코드확인 네트워크 응답실패');
      }

      const resData = await request.json();
      if (resData.message === 'code possible') {
        alert("인증코드가 확인 되었습니다");
        setRegisterButtonActive(false);
      } else {
        alert("인증코드가 옳바르지 않습니다. 코드를 다시 확인해주세요.");
      }
    } catch (error) {
      console.error('인증코드 비동기통신에러:', error);
    }
  };

  const RegisterId = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (data.user_sex === 'male') {
      data.user_sex = 0;
    } else {
      data.user_sex = 1;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register/userdata`, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('네트워크 응답실패');
      }
      const resData = await response.json();
      if (resData.message === 'bad email') {
        alert('중복확인한 Email Id가 변경되었습니다. 다시 확인해주세요.');
      } else {
        alert("회원가입 완료!");
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('비동기통신에러:', error);
      alert("회원가입 실패. 다시 시도해주세요.");
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    if (isNaN(inputValue)) {
      alert("숫자만 입력 가능합니다.");
    } else {
      setValue(inputValue);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordMatch(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    checkPasswordMatch(password, newConfirmPassword);
  };

  const checkPasswordMatch = (password, confirmPassword) => {
    if (password && confirmPassword) {
      if (password === confirmPassword) {
        setPasswordMessage("비밀번호가 일치합니다.");
      } else {
        setPasswordMessage("비밀번호가 일치하지 않습니다.");
      }
    } else {
      setPasswordMessage("");
    }
  };

  return (
    <div className="signup-signup-page">
      <div className="signup-signup-container">
        <div className="signup-signup-illustration">
          <img src={Signup_image} alt="Sign Up" />
        </div>
        <div className="signup-signup-right">
          <div className="signup-signup-box">
            <Link to="/">
              <img src={signup_logo} alt="MAP Logo" className="signup-logo" />
            </Link>
            <div className="signup-signup-form">
              <h2>회원가입을 해주세요!</h2>

              <form name="registerData" onSubmit={RegisterId}>
                <div className="signup-form-group">
                  <label><span>*</span>이름:</label>
                  <input type="text" name="user_name" placeholder="이름을 입력하세요" required />
                </div>
                <div className="signup-form-group">
                  <label><span>*</span>성별:</label>
                  <div className="signup-gender-options">
                    <label>
                      <input type="radio" name="user_sex" value="male" />
                      <img src={gendar_male} alt="Male" style={{ width: '15px', height: '18px', marginRight: '5px' }} />
                      남성
                    </label>
                    <label>
                      <input type="radio" name="user_sex" value="female" />
                      <img src={gendar_female} alt="Female" style={{ width: '15px', height: '18px', marginRight: '5px' }} />
                      여성
                    </label>
                  </div>
                </div>
                <div className="signup-form-group">
                  <label><span>*</span>이메일:</label>
                  <div className="signup-email-group">
                    <input type="email" name="user_email" placeholder="info@xyz.com" onChange={emailHandle} maxLength="50" />
                    <button type="button" className="signup-email-check-status" onClick={emailCheck}>중복확인</button>
                  </div>
                  <p className="signup-email-availability"></p>
                </div>
                <div className="signup-form-group signup-email-confirm-group">
                  <label><span>*</span>이메일 확인:</label>
                  <div className="signup-email-group">
                    <input type="text" name="email_code" onChange={confirmCodeHandle} required />
                    <button type="button" className="signup-verify-btn" onClick={emailCode} disabled={codeButtonActivate}>인증코드 발송</button>
                    <button type="button" className="signup-verify-btn" onClick={confirmCodeChecking} disabled={confirmButtonActivate}>인증확인</button>
                  </div>
                </div>
                <div className="signup-form-group">
                  <label><span>*</span>생년월일:</label>
                  <input type="date" name="user_birth_date" placeholder="yyyy / mm / dd" required />
                </div>
                <div className="signup-form-group">
                  <label><span>*</span>휴대폰 번호:</label>
                  <input type="text" name="user_mobile" placeholder="000 000 000" onChange={handleInputChange} maxLength="9" required/>
                </div>
                <div className="signup-form-group">
                  <label><span>*</span>비밀번호:</label>
                  <input type="password" name="password" placeholder="xxxxxxxxx" onChange={handlePasswordChange} required />
                </div>
                <div className="signup-form-group">
                  <label><span>*</span>비밀번호 확인:</label>
                  <input type="password" name="user_password" placeholder="xxxxxxxxx" onChange={handleConfirmPasswordChange} required />
                </div>
                {/* 비밀번호 일치 여부 메시지 */}
                <div className="signup-form-group">
                  <p style={{ color: password === confirmPassword && password ? "green" : "red" }}>
                    {passwordMessage}
                  </p>
                </div>
                {/* 새로 추가된 칸과 문구 */}
                <div className="signup-form-group">
                  <p>* 아래 내용은 필수기재사항은 아니나, 추후 기능 이용에 필요할 수 있습니다.</p>
                </div>
                <div className="signup-form-group">
                  <label>계좌번호:</label>
                  <input type="text" name="user_bank_num" placeholder="00000 - 00 - 0000000" />
                </div>
                <div className="signup-form-group">
                  <label>현재 자산:</label>
                  <input type="text" name="user_capital" placeholder="00,000,000,000" />
                </div>
                <button type="submit" className="signup-signup-btn" disabled={registerButtonActivate}>회원가입</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;