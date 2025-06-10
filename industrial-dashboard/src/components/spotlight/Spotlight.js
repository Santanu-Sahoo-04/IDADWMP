import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './Spotlight.css';

const spotlightData = [
  {
    id: 1,
    title: "NALCO Achieves Record Production",
    description: "Highest ever bauxite excavation and aluminium production in FY 2024-25",
    image: "/images/spotlight/slide1.jpg",
    date: "June 2025"
  },
  {
    id: 2,
    title: "Green Energy Initiative",
    description: "Leading PSU in renewable energy generation with 198 MW wind power",
    image: "/images/spotlight/slide2.jpg",
    date: "May 2025"
  },
  {
    id: 3,
    title: "Digital Transformation",
    description: "Advanced analytics and dashboard system for enhanced decision making",
    image: "/images/spotlight/slide3.jpg",
    date: "June 2025"
  }
];

export default function Spotlight({ autoOpen = true }) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % spotlightData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % spotlightData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + spotlightData.length) % spotlightData.length);
  };

  if (!isOpen) return null;

  return (
    <div className="spotlight-overlay">
      <div className="spotlight-container">
        <button className="spotlight-close" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
        
        <div className="spotlight-content">
          <button className="spotlight-nav prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="spotlight-slide">
            <div className="spotlight-image">
              <img src={spotlightData[currentSlide].image} alt={spotlightData[currentSlide].title} />
            </div>
            <div className="spotlight-info">
              <h3>{spotlightData[currentSlide].title}</h3>
              <p>{spotlightData[currentSlide].description}</p>
              <span className="spotlight-date">{spotlightData[currentSlide].date}</span>
            </div>
          </div>
          
          <button className="spotlight-nav next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="spotlight-indicators">
          {spotlightData.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
