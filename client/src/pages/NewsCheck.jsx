import React, { useState, useEffect }  from 'react';
import '../styles/NewsCheck.css';
import good_png from '../images/good_news_image.png'
import bad_png from '../images/bad_news_image.png'



function NewsCheckPage() {  
  const [newsData, setNewsData] = useState([]);
  const [newsClick, setNewsClick] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/news-check/newscheck`);
        const data = await response.json();
        if (response.ok && data.news) {
          setNewsData(data.news);
        } else {
          console.error('Failed to fetch News Data : ', data.error || 'No Newsdata in response');
        }
      } catch (error) {
        console.log('Error fetching News data', error);
      }
    };
    fetchData();
  }, []);
  return (
    <div id="news-container">
      <div className="news-main-content">
        <h1>News Head</h1>
        {newsClick !== null && newsData[newsClick] && (
          <p>{newsData[newsClick].news_simple_text}</p>
        )}
        <div className='news-bottom'>
        {newsClick !== null && newsData[newsClick] && (
          <p>원문 링크 : <a href={newsData[newsClick].news_link} target="_blank">{newsData[newsClick].news_link}</a></p>
        )}
        </div>
      </div>
      <div className="news-sidebar">
        <h2>News</h2>
        <div className='news-simple-list'>
        {newsData && newsData.map((newsItem, index) => (
          <div className='news-item' key={index}>
            <a href="#" onClick={() => setNewsClick(index)}>
              {newsItem['news_title']}
            </a>
            {newsItem['news_classification'] === 0 ? (
              <img src={good_png}></img>
            ) : (
              <img src={bad_png}></img>
            )}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default NewsCheckPage;