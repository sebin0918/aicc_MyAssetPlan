import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/NewsTalk.css'; 
import newsChatHeadIcon from '../images/news_chat_head_icon.png'; 
import sendIcon from '../images/news_chat_post_icon.png'; 
import { v4 as uuidv4 } from 'uuid';

function NewsTalk() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [anonymousId, setAnonymousId] = useState(null);  // 서버로부터 할당받은 익명 ID
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const clearTimerRef = useRef(null);

  // 유저 ID 가져오기 및 익명 ID 할당
  const fetchUserId = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId);
        console.log(`User ID: ${data.userId}`);
      } else {
        console.error('User not logged in');
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  // 모든 메시지 삭제 및 새로운 익명 번호 부여
  const clearAllMessages = () => {
    setMessages([]);
    localStorage.removeItem('newsTalkMessages');
    localStorage.removeItem('clearTime');
    console.log('All messages cleared');
    
    // 서버에 익명 번호 재부여 요청
    if (socketRef.current) {
      socketRef.current.emit('reassignNumbers'); // 서버에 익명 번호 재부여 요청
    }
  };

  // 메시지 저장
  const saveMessage = (msg) => {
    const storedMessages = JSON.parse(localStorage.getItem('newsTalkMessages')) || [];
    storedMessages.push(msg);
    localStorage.setItem('newsTalkMessages', JSON.stringify(storedMessages));
  };

  // 로컬 저장소에서 메시지 불러오기
  const loadMessages = () => {
    const storedMessages = JSON.parse(localStorage.getItem('newsTalkMessages')) || [];
    storedMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(storedMessages.map(msg => ({
      ...msg,
      id: msg.id || uuidv4(),
      time: new Date(msg.timestamp).toLocaleTimeString(),
    })));
  };

  // 1분 타이머 설정
  const setClearTimer = (clearTime) => {
    const currentTime = Date.now();
    const delay = clearTime - currentTime;
    if (delay > 0) {
      clearTimerRef.current = setTimeout(() => {
        clearAllMessages(); // 1분 후 모든 메시지 삭제
      }, delay);
      console.log(`Timer set: will clear messages in ${delay} ms`);
    } else {
      clearAllMessages();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchUserId(); // session에서 사용자 ID 가져오기

    // Socket.IO 초기화
    socketRef.current = io(`${process.env.REACT_APP_API_URL}`, {
      withCredentials: true,
    });

    // 서버로부터 익명 ID 할당
    socketRef.current.on('assignNumber', (number) => {
      console.log(`Assigned Anonymous ID: ${number}`);
      setAnonymousId(number);  // 서버에서 받은 익명 번호 설정
    });

    socketRef.current.on('receiveMessage', (messageData) => {
      const messageWithId = { ...messageData, id: uuidv4() };
      setMessages(prevMessages => [...prevMessages, messageWithId]);
      saveMessage(messageWithId);
      scrollToBottom();

      const existingClearTime = localStorage.getItem('clearTime');
      if (!existingClearTime) {
        const newClearTime = Date.now() + 1 * 60 * 1000; // 1분 후 타이머 설정
        localStorage.setItem('clearTime', newClearTime);
        setClearTimer(newClearTime);
      }
    });

    loadMessages();
    scrollToBottom();

    const storedClearTime = localStorage.getItem('clearTime');
    if (storedClearTime) {
      const clearTime = parseInt(storedClearTime, 10);
      if (Date.now() < clearTime) {
        setClearTimer(clearTime);
      } else {
        clearAllMessages();
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []); // 빈 배열로 초기화하여 한 번만 실행되도록 설정

  const handleSendMessage = () => {
    if (message.trim() && userId) {
      const msgData = {
        userId: userId,
        anonymousId: anonymousId,
        message: message.trim(),
        timestamp: Date.now(),
      };
      socketRef.current.emit('sendMessage', msgData);
      setMessage('');  // 메시지 전송 후 입력창 초기화
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage();
      e.preventDefault();
    }
  };

  return (
    <div className="news-talk">
      <p>
        <img src={newsChatHeadIcon} alt="News Chat Icon" style={{ width: '65px', height: '50px', marginLeft: '10px' }} />
        <span>NewsTalk</span>
      </p>
      
      <div className="news-talk-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`news-talk-message-container ${msg.userId === userId ? 'right' : 'left'}`}>
            <div className="news-talknoname">
              <strong>익명 {msg.anonymousId}</strong>
            </div>
            <div className="news-talk-message-wrapper">  
              <div className="news-talk-message">
                <div>{msg.message}</div>
              </div>
              <div className="news-talk-timestamp">{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="news-talk-input-area">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메세지는 24시간 뒤 삭제됩니다."
          className="news-talk-input"
        />
        <button onClick={handleSendMessage}>
          <img src={sendIcon} alt="Send" />
        </button>
      </div>
    </div>
  );
}

export default NewsTalk;
