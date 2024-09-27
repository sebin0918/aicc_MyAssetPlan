import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // framer-motion import
import '../styles/HomePage.css'; // CSS 파일 import

const images = [
  { src: require('../images/mainicon.png'), className: 'image-1' },
  { src: require('../images/NO2_Household.png'), className: 'image-2' },
  { src: require('../images/NO3_Stock.png'), className: 'image-3' },
  { src: require('../images/NO4_NEWS_v3.png'), className: 'image-4' },
  { src: require('../images/NO5_FAQ.png'), className: 'image-5' },
];

// HomePage 컴포넌트 정의
const HomePage = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // 슬라이드가 멈췄는지 여부를 관리하는 상태

  useEffect(() => {
    if (!isPaused) { // 슬라이드가 멈추지 않았을 때만 자동 슬라이드 진행
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000); // 3초마다 자동으로 슬라이드 변경
      return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 클리어
    }
  }, [isPaused]); // isPaused가 변경될 때마다 effect를 다시 실행

  const handleClick = (i) => {
    setIndex(i);
  };

  const prevSlide = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleMouseEnter = () => {
    setIsPaused(true); // 마우스가 이미지에 올라갔을 때 슬라이드를 멈춤
  };

  const handleMouseLeave = () => {
    setIsPaused(false); // 마우스가 이미지에서 벗어났을 때 슬라이드를 재개
  };

  return (
    <div className="slider-container">
      {/* 이미지와 텍스트를 감싸는 div */}
      <div
        className="image-wrapper"
        onMouseEnter={handleMouseEnter} // 마우스가 이미지에 올라갔을 때 실행
        onMouseLeave={handleMouseLeave} // 마우스가 이미지에서 벗어났을 때 실행
      >
        {images[index].className === 'image-1' ? (
          <motion.img
            key={index}
            src={images[index].src}
            alt={`Slide ${index + 1}`}
            className={`slide-image ${images[index].className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          />
        ) : (
          <img
            key={index}
            src={images[index].src}
            alt={`Slide ${index + 1}`}
            className={`slide-image ${images[index].className}`}
          />
        )}

        {/* image-1 일 때만 텍스트를 오버레이 */}
        {images[index].className === 'image-1' && (
          <motion.div
            className="homepage-overlay-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <h1>처음 온 사람들을 위한 가이드</h1>
            <p>My Asset Planer</p>
          </motion.div>
        )}
      </div>

      <div className="homepage-nav-dots">
        <button className="homepage-nav-dot" onClick={prevSlide}>&lt;</button>
        {images.map((_, i) => (
          <button
            key={i}
            className={`homepage-nav-dot ${i === index ? 'active' : ''}`}
            onClick={() => handleClick(i)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="homepage-nav-dot"
          onClick={nextSlide}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default HomePage;
