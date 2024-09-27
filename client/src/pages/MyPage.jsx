import React, { useState, useEffect } from 'react';
import '../styles/MyPage.css';
import gendar_male from '../images/gendar_male_icon.png';
import gendar_female from '../images/gendar_female_icon.png';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="mypage-secession-modal-container">
      <div className="mypage-secession-mypage-modal">
        <h2>정말로 회원을 탈퇴하시겠습니까?</h2>
        <p>Are you sure to cancel your membership?</p>
        <button className="mypage-secession-button" onClick={onConfirm}>네, 탈퇴합니다</button>
        <button className="mypage-secession-button mypage-secession-cancel-button" onClick={onCancel}>아니오</button>
      </div>
    </div>
  );
};

const formatDate = (isoDate) => {
  if (!isoDate) {
    console.error('Invalid date value:', isoDate);  // 날짜 값이 유효하지 않음
    return '';  // 빈 문자열 반환
  }

  const date = new Date(isoDate);

  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) {
    console.error('Invalid date value:', isoDate);  // 잘못된 날짜 값 로그 출력
    return '';  // 잘못된 날짜 값일 경우 빈 문자열 반환
  }

  return date.toISOString().slice(0, 10);  // 유효한 경우에만 날짜 변환
};

function MyPage() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthdate: '',
    confirmPassword: '',
    email: '',
    mobile: '',
    accountNo: '',
    holdingAsset: '',
  });

  const [isSecessionModalOpen, setIsSecessionModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("Requesting user profile...");  // 요청 시작 확인

      try {
        const request = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {  // /profile 엔드포인트로 GET 요청
          method: 'GET',
          credentials: 'include',  // 세션 쿠키 포함
        });

        console.log("Response received:", request);  // 응답 수신 확인

        if (!request.ok) {
          throw new Error('프로필 정보를 가져오는 중 오류가 발생했습니다.');
        }

        const resData = await request.json();
        console.log("Profile data fetched successfully:", resData);  // 데이터 성공적으로 가져왔을 때

        // 가져온 데이터로 사용자 이메일을 사용하여 추가 정보 요청
        getUserData(resData.email);
      } catch (error) {
        console.error('프로필 정보를 가져오는 중 오류가 발생했습니다:', error);
      }
    };

    const getUserData = async (email) => {
      try {
        const request = await fetch(`${process.env.REACT_APP_API_URL}/api/mypage/defaultdata`, {
          method: 'POST',
          headers: { 'content-type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ user_email: email }),  // 세션에서 가져온 이메일 사용
          credentials: 'include',
        });

        if (!request.ok) {
          throw new Error('UserData요청 네트워크 응답실패');
        }

        const resData = await request.json();
        console.log('Received user data:', resData);  // 전체 응답 데이터 로그 확인

        setFormData({
          name: resData.name || '',
          email: resData.email || '',
          gender: resData.gender === 'Male' ? 'Male' : 'Female',
          birthdate: formatDate(resData.birthdate),  // 유효성 검사된 날짜만 포맷팅
          mobile: resData.mobile || '',
          accountNo: resData.accountNo || '',
          holdingAsset: resData.holdingAsset || '',
        });
      } catch (error) {
        console.error('유저정보가져오기 비동기통신에러:', error);
      }
    };

    fetchUserProfile(); // 세션 정보를 가져와 사용자 프로필을 요청
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // 기본 폼 제출 동작 방지
    console.log("Form data to be submitted:", formData);  // formData 확인
    alert(JSON.stringify(formData, null, 2));

    try {
      const request = await fetch(`${process.env.REACT_APP_API_URL}/api/mypage/datasubmit`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!request.ok) {
        throw new Error('UserData요청 네트워크 응답실패');
      }

      const resData = await request.json();
      console.log(resData);

      alert('회원정보 수정이 완료되었습니다.');
      window.location.href = '/';
    } catch (error) {
      console.error('회원정보변경확정 비동기통신에러:', error);
    }
  };

  const handleSecessionConfirm = async () => {
    try {
      const request = await fetch(`${process.env.REACT_APP_API_URL}/api/mypage/`, {
        method: 'DELETE',
        credentials: 'include',  // 쿠키와 세션정보를 포함하여 요청
      });
      if (!request.ok) {
        throw new Error('Delete요청 네트워크 응답실패');
      }
      const resData = await request.json();
      console.log(resData);
      alert('회원 탈퇴 완료');
      window.location.href = '/';  // 홈 페이지로 이동
    } catch (error) {
      console.error('회원탈퇴 비동기통신에러:', error);
    }
  };
  

  const handleCancel = () => {
    setIsSecessionModalOpen(false); // 모달 닫기
  };

  return (
    <div className="mypage-container">
      <div className="mypage-white-box">
        <p>수정 정보 확인</p>
        <form id="user-form" onSubmit={handleSubmit}>
          <div className="mypage-form-row">
            <div className="mypage-form-column">
              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="name"><span>*</span> 이름 :</label>
                <input className="mypage-form-input" type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="email"><span>*</span> 이메일 :  </label>
                <input className="mypage-form-input" type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled/>
              </div>

              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="password"><span>*</span> 비밀번호 : </label>
                <input className="mypage-form-input" type="password" id="password" name="password" value={formData.password || ''} onChange={handleChange} required />
              </div>

              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="confirmPassword"><span>*</span> 비밀번호 확인 : </label>
                <input className="mypage-form-input" type="confirmPassword" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword || ''} onChange={handleChange} required />
              </div>

              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="birthdate"><span>*</span> 생년월일 : </label>
                <input className="mypage-form-input" type="date" id="birthdate" name="birthdate" value={formData.birthdate || ''} onChange={handleChange} required />
              </div>
            </div>

            <div className="mypage-form-column">
              <div className="mypage-form-field">
                <label className="mypage-label"><span>*</span> 성별:</label>
                <div className="mypage-button-group">
                  <button
                    type="button"
                    className={`mypage-gender-button ${formData.gender === 'Male' ? 'selected' : ''}`}
                    onClick={() => handleGenderChange('Male')}
                  >
                    <img src={gendar_male} alt="Male" className="mypage-gender-icon" />
                    남성
                  </button>
                  <button
                    type="button"
                    className={`mypage-gender-button ${formData.gender === 'Female' ? 'selected' : ''}`}
                    onClick={() => handleGenderChange('Female')}
                  >
                    <img src={gendar_female} alt="Female" className="mypage-gender-icon" />
                    여성
                  </button>
                </div>
              </div>

              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="mobile"><span>*</span> 연락처 : </label>
                <input className="mypage-form-input" type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required />
              </div>

              <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="accountNo">계좌번호 : </label>
                <input className="mypage-form-input" type="text" id="accountNo" name="accountNo" value={formData.accountNo} onChange={handleChange} />
              </div>

              {/* <div className="mypage-form-field">
                <label className="mypage-label" htmlFor="holdingAsset">초기자산 : </label>
                <input className="mypage-form-input" type="text" id="holdingAsset" name="holdingAsset" value={formData.holdingAsset} onChange={handleChange} />
              </div> */}

            </div>
          </div>

          <button className="mypage-submit-button" type="submit">
            <span className="mypage-text-submit">변경사항 확정하기</span>
          </button>

          <button className="mypage-text-only-right-button" type="button" onClick={() => setIsSecessionModalOpen(true)}>회원 탈퇴</button>
        </form>
      </div>

      {/* 회원탈퇴 모달 */}
      <ConfirmationModal
        isOpen={isSecessionModalOpen}
        onConfirm={handleSecessionConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default MyPage;