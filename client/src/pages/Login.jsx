import React, { useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import '../styles/login.css'; 
import login_image from '../images/Login_image_1.png'; 
import login_logo from '../images/map_logo_login.png'; 
import signInButton from '../images/signin_button.png'; 
import Footer from '../components/Footer';
import axios from 'axios'; // axios 추가

const Login = ({ onLogin, initialErrorMessage }) => {  // 매개변수 이름 변경
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(initialErrorMessage || '');  // 상태 이름 변경 후 초기값 설정
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        console.log('Submitting:', { email: trimmedEmail, password: trimmedPassword });

        try {
            // 서버에 로그인 요청 보내기
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                user_email: trimmedEmail,
                user_password: trimmedPassword
            }, {
                withCredentials: true // 세션 쿠키 포함
            });

            if (response.status === 200) {
                // 로그인 성공 시 navigate로 페이지 이동
                // onLogin(trimmedEmail, trimmedPassword);  // 부모 컴포넌트에서 관리할 수 있도록 콜백 호출
                // navigate('/dashboard');  // 로그인 후 대시보드로 이동
                await onLogin(trimmedEmail, trimmedPassword);  // 콜백 호출이 비동기라면 기다립니다.
                navigate('/');  // 로그인 후 대시보드로 이동
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('로그인 실패. 이메일과 비밀번호를 확인해주세요.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="illustration">
                        <img src={login_image} alt="illustration" />
                    </div>
                </div>
                <div className="login-right">
                    <div className="login-box">
                        <Link to="/">
                            <img src={login_logo} alt="MAP Logo" className="logo" />
                        </Link>
                        <h2>Welcome back !!!</h2>
                        <h1>Login</h1>
                        {errorMessage && <p className="error-message">{errorMessage}</p>} 
                        <form onSubmit={handleSubmit}>
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="test@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="*********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* <div className="forgot-password">
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div> */}
                            <button type="submit" className="sign-in-btn">
                                <img src={signInButton} alt="Sign In" />
                            </button>
                        </form>
                        <div className="sign-up">
                            <p>I don't have an account? <Link to="/signup">Sign up</Link></p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;