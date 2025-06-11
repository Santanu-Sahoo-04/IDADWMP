// CHANGED: Removed industrialBg import since we're using CSS gradients now
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import OperationCard from './OperationCard.js';
import { operationsData } from '../../data/operationsData.js';
import './OperationsSection.css';

export default function OperationsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const itemsPerView = 4;
  const maxIndex = operationsData.length - itemsPerView;

  const handleNext = () => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const visibleOperations = operationsData.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className={`operations-section-fullwidth ${isDarkMode ? 'dark' : 'light'}`}>
      {/* CHANGED: Removed background-overlay div since we're using CSS gradients */}
      <div className="operations-content-container">
        <div className="operations-header-fixed">
          <h2 className={`operations-title ${isDarkMode ? 'dark-text' : 'light-text'}`}>
            Our Operations
          </h2>
          <p className={`operations-subtitle ${isDarkMode ? 'dark-text' : 'light-text'}`}>
            As one of the largest integrated primary producer of aluminium in Asia, NALCO's presence encompasses the entire value chain
            <br />
            from bauxite mining, alumina refining, aluminium smelting, power generation to downstream products.
          </p>
        </div>

        <div className="operations-carousel-fullwidth">
          <div className="operations-grid">
            {visibleOperations.map((operation) => (
              <OperationCard key={operation.id} operation={operation} />
            ))}
          </div>
        </div>

        <div className="operations-navigation">
          <IconButton 
            onClick={handlePrevious}
            className={`nav-btn ${isDarkMode ? 'dark-nav' : 'light-nav'}`}
            disabled={currentIndex === 0 && operationsData.length <= itemsPerView}
          >
            <MdArrowBackIos />
          </IconButton>
          
          <IconButton 
            onClick={handleNext}
            className={`nav-btn ${isDarkMode ? 'dark-nav' : 'light-nav'}`}
            disabled={operationsData.length <= itemsPerView}
          >
            <MdArrowForwardIos />
          </IconButton>
        </div>
      </div>
    </section>
  );
}
