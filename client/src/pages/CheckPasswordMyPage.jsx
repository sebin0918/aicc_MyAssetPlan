import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // 리디렉션을 위한 useNavigate 훅 사용
import '../styles/CheckPasswordMyPage.css';

function CheckPasswordMyPage({onPasswordCheckSuccess}) {
  const [writePassword, setWritePassword] = useState('');
  const navigate = useNavigate();  // navigate 함수 호출

  const handleChange = (e) => {
    const password = e.target.value;
    setWritePassword(password);
  };

  const handlePasswordCheck = async () => {

    console.log(writePassword);

    try {
      const request = await fetch(`${process.env.REACT_APP_API_URL}/api/myPagePassword/checkpassword`, {
        method: 'POST',
        headers: {'content-type': 'application/json; charset=UTF-8'},
        body: JSON.stringify( {userpassword: writePassword} ),
        credentials: 'include'
      });

      if (!request.ok) {
        throw new Error('비밀번호확인 네트워크 응답실패');
      }
      
      const resData = await request.json();
      console.log(resData.message);

      if (resData.message === 'checkOk') {
        alert("비밀번호가 확인 되었습니다");
        onPasswordCheckSuccess(); // 비밀번호 확인 성공시 호출
      } else {
        alert("비밀번호가 옳바르지 않습니다. 다시 확인해주세요.");
      }
    } catch(error) {
      console.error('비밀번호확인 비동기통신에러:', error);
    }    
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordCheck();  // 엔터 키가 눌렸을 때 비밀번호 확인 함수 호출
    }
  };

  return (
    <div className="checkpassword-mypage-container">
      <div className="checkpassword-mypage-white-box">
        <h2>비밀번호 입력</h2>
        <div className="checkpassword-mypage-form-field">
          <label className="checkpassword-mypage-label" htmlFor="password"></label>
          <input
            className="checkpassword-mypage-form-input"
            type="password"  // 비밀번호 입력을 위해 type을 'password'로 설정
            id="password"
            name="password"  // 상태 관리 및 handleChange와 연결
            onChange={handleChange}
            onKeyPress={handleKeyPress}  // 키 입력 이벤트 추가
            required
          />
          <button
            className="checkpassword-mypage-change-button"
            type="button"
            onClick={handlePasswordCheck}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckPasswordMyPage;
