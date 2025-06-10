import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import './UpdatesCarousel.css';

const updatesData = [
  {
    year: "FY 2023-24",
    title: "Record Breaking Performance",
    highlights: [
      { type: "Production", text: "Highest ever Bauxite excavation & transportation" },
      { type: "Sales", text: "Net profit Rs 2,060 crore (33% YoY increase)" },
      { type: "HR", text: "MSE procurement Rs. 1,060 Cr (30.64% of total)" }
    ]
  },
  {
    year: "FY 2022-23",
    title: "Operational Excellence",
    highlights: [
      { type: "Production", text: "Highest ever Bauxite excavation 75.51 lakh tonne" },
      { type: "Sales", text: "Revenue Rs. 14,255 Crore, PAT Rs. 1,544 crore" },
      { type: "HR", text: "960 pots operation for 2nd consecutive year" }
    ]
  },
  {
    year: "FY 2021-22",
    title: "Capacity Milestones",
    highlights: [
      { type: "Production", text: "100% capacity utilisation in Smelter & Refinery" },
      { type: "Sales", text: "Highest ever PAT Rs. 2,952 crore achieved" },
      { type: "HR", text: "960 pots operating first time in 41 years" }
    ]
  },
  {
    year: "2020-21",
    title: "Innovation & Growth",
    highlights: [
      { type: "Production", text: "New products: AA8011 cookware, AA6062 alloy billets" },
      { type: "Sales", text: "Second highest Net Foreign Exchange Earning CPSE" },
      { type: "HR", text: "40 kWp Rooftop Solar Project commissioned" }
    ]
  }
];

export default function UpdatesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % updatesData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="updates-carousel">
      <h4 className="updates-title">Recent Updates</h4>
      
      <div className="updates-card">
        <div className="card-year">{updatesData[currentIndex].year}</div>
        <div className="card-title">{updatesData[currentIndex].title}</div>
        
        <div className="highlights-list">
          {updatesData[currentIndex].highlights.map((highlight, idx) => (
            <div key={idx} className={`highlight-item ${highlight.type.toLowerCase()}`}>
              <span className="highlight-type">{highlight.type}:</span>
              <span className="highlight-text">{highlight.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-indicators">
        {updatesData.map((_, idx) => (
          <button
            key={idx}
            className={`indicator ${currentIndex === idx ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

      <button className="play-pause-btn" onClick={togglePlayPause}>
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}
