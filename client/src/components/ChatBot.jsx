import React, { useState, useRef, useEffect } from 'react';
import './Components_Styles.css';
import Chatbot_image from '../images/ai_chat_image.png';
import mike_image from '../images/mike.png';
import mike_on_image from '../images/mike_on.jpg';
import speaker from '../images/speaker.png';

function ChatBot() {
  const [modalOpen, setModalOpen] = useState(false);  // 기본 모달
  const [detailModalOpen, setDetailModalOpen] = useState(false);  // 상세 모달
  const [modalContent, setModalContent] = useState('');  // 모달창에 표시할 전체 내용
  const modalBackground = useRef();
  const [chat, setChat] = useState('');
  const [chatList, setChatList] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let speechRecognition = useRef(null);

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-bot/chatList`, { credentials: 'include' });
        if (response.ok) {
          const chatdata = await response.json();
          setChatList(chatdata);
        } else {
          console.error('Failed to fetch initial chat');
        }
      } catch (error) {
        console.error('Error fetching initial chat', error);
      }
    };
    fetchChatList();
  }, []);

  useEffect(() => {
    if (SpeechRecognition) {
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;

      speechRecognition.current.onresult = (event) => {
        let transcript = event.results[event.resultIndex][0].transcript;
        setChat(transcript);
      };

      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setChatList(prevChatList => [
        { text: '마이크가 연결이 되어있지 않거나,\n권한이 허용되지 않아 브라우저에서 마이크를 사용할 수 없습니다.', type: 'bot' },
        ...prevChatList,
      ]);
    }

    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
    };
  }, [SpeechRecognition]);

  const toggleListening = () => {
    if (!speechRecognition.current) {
      setChatList(prevChatList => [
        { text: '마이크가 연결이 되어있지 않거나,\n권한이 허용되지 않아 브라우저에서 마이크를 사용할 수 없습니다.', type: 'bot' },
        ...prevChatList,
      ]);
      return;
    }

    if (isListening) {
      speechRecognition.current.stop();
    } else {
      speechRecognition.current.start();
    }
    setIsListening(!isListening);
  };

  const handleSpeak = (text) => {
    // SpeechSynthesis API 사용
    const speech = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text); // 읽을 텍스트 설정
  
    utterance.lang = 'ko-KR'; // 언어 설정 (한국어)
    speech.speak(utterance); // 텍스트 읽기
  };

  const handleSendChat = async () => {
    if (chat.trim()) {
      const newMessage = { text: chat, type: 'user' };
      setChatList(prevChatList => [newMessage, ...prevChatList]);
      const currentChat = chat;
      setChat('');

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-bot/chatbot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentChat }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setChatList(prevChatList => [{ text: data.data, id: data.newChatId, type: 'bot' }, ...prevChatList]);
          }
        } else {
          console.error('Failed to send chat message');
        }
      } catch (error) {
        console.error('Error sending chat message', error);
      }
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleSendChat();
      setChat('');
    }
  };

  // 상세 내용 모달 열기
  const openDetailModal = async (chatId) => {
    console.log('chatId:', chatId);
    if (!chatId) {
      console.error('chatId가 정의되지 않았습니다.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-bot/chatDetail/${chatId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log(data.cb_text)
        setModalContent(data.cb_text); // 데이터베이스에서 가져온 내용을 모달에 설정
        setDetailModalOpen(true);
      } else {
        console.error('Failed to fetch chat detail');
      }
    } catch (error) {
      console.error('Error fetching chat detail', error);
    }
  };

  return (
    <div className='ChatBot'>
      <img className='ChatBot-image' src={Chatbot_image} onClick={() => setModalOpen(true)} alt="Chatbot Icon" />
      {
        modalOpen &&
        <div className='ChatBot-modal-container' ref={modalBackground} onClick={e => {
          if (e.target === modalBackground.current) {
            setModalOpen(false);
          }
        }}>
          <div className='ChatBot-modal-content'>
            <div className='ChatBot-modal-text'>
            {
              chatList.length === 0 ? (
                <p>채팅 기록이 없습니다.</p>
              ) : (
                chatList.map((ct, index) => {
                  // ct.text가 존재하는지 확인하고 문자열 타입인지 확인
                  if (typeof ct.text !== 'string') {
                    console.error('ct.text is not a string:', ct.text);
                    return null; // 잘못된 데이터는 렌더링하지 않음
                  }
              
                  const lines = ct.text.split('\n'); // 줄바꿈으로 텍스트 분리
                  const isLongText = lines.length > 10; // 10줄이 넘는지 확인
              
                  return (
                    <div key={index} className={`ChatBot-message-container ${ct.type === 'user' ? 'user' : 'bot'}`}>
                      <p style={{ whiteSpace: 'pre-line' }} className={`ChatBot-message ${ct.type === 'user' ? 'ChatBot-question' : 'ChatBot-answer'}`}>
                        {isLongText ? (
                          <>
                            {lines.slice(0, 10).join('\n')}... 
                            <button onClick={() => openDetailModal(ct.id)} className='ChatBot-detail-button'>상세 내용</button>
                          </>
                        ) : ct.text}

                      </p>
                    {ct.type === 'bot' && (
                      <button 
                        className="ChatBot-speaker-button" 
                        onClick={() => handleSpeak(ct.text)} // 클릭 시 TTS 적용
                      ><img src={speaker} alt="Bot Avatar" className="ChatBot-speaker-image" /></button> // 이미지를 추가
                    )}
                    </div>
                  );
                })
              )
            }
            </div>

            <input 
              className='ChatBot-modal-input'
              type='text'
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              onKeyDown={handleEnter}
              placeholder='메세지를 입력하세요...'
            />
            <button 
              onClick={toggleListening}
              className='Chatbot-stt-button'
            >
              {isListening ? (
                <img className='Chatbot-mike-button' src={mike_on_image} alt="Microphone On" />
              ) : (
                <img className='Chatbot-mike-button' src={mike_image} alt="Microphone Off" />
              )}
            </button>
            <button 
              type='submit' 
              className='ChatBot-modal-send-button'
              onClick={handleSendChat}
            >SEND</button>
          </div>
        </div>
      }

      {
        detailModalOpen &&  // 상세 내용 모달 창
        <div className='ChatBot-detail-modal'>
          <div className='ChatBot-detail-modal-content'>
            <h2>상세 내용</h2>
            <p>{modalContent}</p> {/* 모달에 전체 내용 표시 */}
            <button onClick={() => setDetailModalOpen(false)}>닫기</button>
          </div>
        </div>
      }
    </div>
  );
}

export default ChatBot;
