import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // 리디렉션을 위한 useNavigate 훅 사용
import axios from 'axios'; 
import '../styles/Admin.css'; // CSS 파일을 임포트합니다.
import adminlogo from '../images/map_logo_login.png';
import ReactPaginate from 'react-paginate'; // 페이지네이션 컴포넌트 추가

const Admin = ({setIsAuthenticated, setUserInfo}) => {
  const [users, setUsers] = useState([]); // 서버에서 가져온 데이터를 저장할 state
  const [warnings, setWarnings] = useState({}); // 경고 횟수를 저장하는 state
  const [loading, setLoading] = useState(true); // 로딩 상태를 관리할 state
  const [error, setError] = useState(null); // 에러를 저장할 state
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태 추가
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const usersPerPage = 5; // 한 페이지에 보여줄 사용자 수
  const navigate = useNavigate(); // 페이지 리디렉션을 위한 useNavigate 훅

  // 로그아웃 처리 함수
  const logout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });

      if (response.status === 200) {
        alert('로그아웃 하셨습니다\n메인화면으로 이동합니다.');
        console.log('Logout successful');

        // 사용자 정보와 인증 상태 초기화
        setIsAuthenticated(false);
        setUserInfo(null);

        navigate('/'); // 로그아웃 후 로그인 페이지로 이동
      } else {
        console.error('Logout failed:', response.data);
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/admin`, { withCredentials: true });
        setUsers(response.data.data);
  
        // 서버에서 받은 경고 횟수로 초기 경고 상태 설정
        const initialWarnings = response.data.data.reduce((acc, user) => {
          acc[user.user_id] = user['경고 횟수'];
          return acc;
        }, {});
        setWarnings(initialWarnings);
  
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // alert('접근 권한이 없습니다.');
          navigate('/'); // 권한이 없으면 홈으로 리디렉션
        } else {
          console.error('Error fetching admin data:', error);
          setError('데이터를 가져오는 중 오류가 발생했습니다.');
        }
        setLoading(false);
      }
    };
  
    fetchData();
  }, [navigate]);
  
  // 경고 횟수 처리 함수
  const handleWarning = async (id) => {
    try {
      const currentCount = warnings[id] || 0;
  
      if (currentCount < 3) {
        const newCount = currentCount + 1;
  
        // 서버에 경고 횟수 업데이트 요청
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/warning`, { user_id: id, warningCount: newCount });
        
        // 서버로부터 업데이트된 데이터 다시 받아오기
        const response = await axios.get('${process.env.REACT_APP_API_URL}/api/admin/admin');
        setUsers(response.data.data); // 최신 데이터로 users 상태 업데이트
  
        alert(`사용자에게 경고 ${newCount}회를 주었습니다.`);
      } else {
        alert('이미 최대 경고 횟수에 도달했습니다.');
      }
    } catch (error) {
      console.error('Error updating warning:', error);
    }
  };

  // 삭제 처리 함수
  const handleDelete = async (id) => {
    try {
      console.log(`삭제: User ID ${id}`);
      // 서버에 삭제 요청 보내기
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/delete/${id}`);
      // 삭제 후 최신 데이터 다시 가져오기
      const response = await axios.get('${process.env.REACT_APP_API_URL}/api/admin/admin');
      setUsers(response.data.data); // 최신 데이터로 users 상태 업데이트

      alert(`사용자 ID ${id}가 삭제되었습니다.`);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected); // 페이지 변경 시 호출되는 함수
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // 검색어 변경 시 페이지를 첫 페이지로 리셋
  };

  if (loading) {
    return <div>Loading...</div>; // 로딩 중일 때 보여줄 화면
  }

  if (error) {
    return <div>{error}</div>; // 에러가 발생했을 때 보여줄 화면
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      String(user.user_id).toLowerCase().includes(searchLower) ||
      (user.이름 && String(user.이름).toLowerCase().includes(searchLower)) ||
      (user.Email && String(user.Email).toLowerCase().includes(searchLower)) ||
      (user.생년월일 && String(user.생년월일).toLowerCase().includes(searchLower)) ||
      (user.성별 && String(user.성별).toLowerCase().includes(searchLower)) ||
      (user.사용자권한 && String(user.사용자권한).toLowerCase().includes(searchLower)) ||
      (user.모바일 && String(user.모바일).toLowerCase().includes(searchLower))
    );
  });

  const offset = currentPage * usersPerPage;
  const currentPageUsers = filteredUsers.slice(offset, offset + usersPerPage);

  return (
    <div id="admin_body">
      <div className="admin-panel">
        <div className="admin-header">
          <div className="admin-header-left">
            <Link to = "/">
            <img src={adminlogo} alt="Logo" className="admin-logo" />
            </Link>
            <p>사용자 관리</p>
          </div>
          <div className="admin-header-right">
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="admin-search-input"
            />
            <button className="admin-logout-button" onClick={logout}>Log Out</button>
          </div>
        </div>

        <div className='admin-pageslide'>
          <table className="admin-user-table">
            <thead className="admin-maintext">
              <tr>
                <th>접속</th>
                <th>User ID</th>
                <th>이름</th>
                <th>Email</th>
                <th>생년월일</th>
                <th>성별</th>
                <th>사용자권한</th>
                <th>모바일</th>
                <th>경고</th> 
                <th>삭제</th>
                <th>경고 횟수</th>
              </tr>
            </thead>
            <tbody>
              {currentPageUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <span className={`admin-status-dot ${user.status === 'online' ? 'online' : 'offline'}`}></span>
                  </td>
                  <td>{user.user_id}</td>
                  <td>{user.이름}</td>
                  <td>{user.Email}</td>
                  <td>{user.생년월일.slice(0, 10)}</td> 
                  <td>{user.성별}</td>
                  <td>{user.사용자권한}</td>
                  <td>{user.모바일}</td>
                  <td>
                    <button 
                      className="admin-warning-button" 
                      onClick={() => handleWarning(user.user_id)}
                      disabled={warnings[user.user_id] >= 3} 
                    >
                      경고
                    </button>
                  </td>
                  <td>
                    <button className="admin-delete-button" onClick={() => handleDelete(user.user_id)}>삭제</button>
                  </td>
                  <td>{warnings[user.user_id]}</td> 
                </tr>
              ))}
            </tbody>
          </table>

          <ReactPaginate
            previousLabel="<"
            nextLabel=">"
            breakLabel={'...'}
            pageCount={Math.ceil(filteredUsers.length / usersPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'admin-pagination-container'}
            pageClassName={'admin-pagination-page'}
            pageLinkClassName={'admin-pagination-link'}
            previousClassName={'admin-pagination-previous'}
            nextClassName={'admin-pagination-next'}
            activeClassName={'admin-pagination-active'}
            forcePage={currentPage}
          />
        </div> 
      </div> 
    </div>
  );
};

export default Admin;
