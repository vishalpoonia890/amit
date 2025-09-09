// src/components/NewsView.js

import React, { useState, useEffect } from 'react';
import './NewsView.css'; // We'll create this CSS file

function NewsView() {
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch this data from an API.
    // For now, we'll use mock data.
    const fetchNews = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockNews = [
        {
          id: 1,
          title: "Global Markets Rally Amid Positive Economic Data",
          source: "Financial Times",
          date: "2024-07-23",
          imageUrl: "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          summary: "Stock markets worldwide saw significant gains today as new reports indicated stronger-than-expected economic growth and cooling inflation."
        },
        {
          id: 2,
          title: "Tech Giants Announce Record-Breaking Q2 Earnings",
          source: "Bloomberg",
          date: "2024-07-22",
          imageUrl: "https://images.pexels.com/photos/39284/macbook-folder-open-app-39284.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          summary: "Major technology companies exceeded analyst expectations with robust earnings, driven by AI investments and cloud computing services."
        },
        {
          id: 3,
          title: "New Investment Fund Targets Renewable Energy Startups",
          source: "Reuters",
          date: "2024-07-21",
          imageUrl: "https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          summary: "A consortium of institutional investors has launched a multi-billion dollar fund dedicated to fostering innovation in sustainable energy solutions."
        },
        {
          id: 4,
          title: "Cryptocurrency Market Sees Volatility After Regulatory News",
          source: "CoinDesk",
          date: "2024-07-20",
          imageUrl: "https://images.pexels.com/photos/843700/pexels-photo-843700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          summary: "The crypto market experienced a sharp downturn followed by a quick recovery as global regulators hinted at stricter oversight."
        },
        {
          id: 5,
          title: "Real Estate Sector Shows Signs of Recovery in Urban Areas",
          source: "The Economic Times",
          date: "2024-07-19",
          imageUrl: "https://images.pexels.com/photos/164522/pexels-photo-164522.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          summary: "Property sales and new housing starts are picking up, indicating renewed confidence among buyers and developers in key metropolitan regions."
        },
      ];
      setTrendingNews(mockNews);
      setLoading(false);
    };

    fetchNews();

    // If you had a real-time API or wanted to refresh news periodically, you could use:
    // const interval = setInterval(fetchNews, 60000); // Refresh every minute
    // return () => clearInterval(interval); // Cleanup on unmount

  }, []);

  if (loading) {
    return <div className="news-container"><p>Loading trending news...</p></div>;
  }

  return (
    <div className="news-container">
      <h2 className="news-header">Trending News & Updates</h2>
      <div className="news-list">
        {trendingNews.map(news => (
          <div key={news.id} className="news-card">
            {news.imageUrl && <img src={news.imageUrl} alt={news.title} className="news-image" />}
            <div className="news-content">
              <h3 className="news-title">{news.title}</h3>
              <p className="news-meta">
                <span className="news-source">{news.source}</span> | <span className="news-date">{news.date}</span>
              </p>
              <p className="news-summary">{news.summary}</p>
              {/* In a real app, you might add a "Read More" link */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default NewsView;
