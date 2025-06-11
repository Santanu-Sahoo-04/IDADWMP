import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';

export default function OperationCard({ operation }) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <div 
      className="operation-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="operation-image-container">
        <img 
          src={operation.image} 
          alt={operation.name}
          className="operation-image"
        />
        
        {/* Hover Overlay */}
        {isHovered && (
          <div className={`operation-overlay ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="overlay-content">
              <h3 className="overlay-title">{operation.hoverInfo.title}</h3>
              <p className="overlay-location">{operation.hoverInfo.location}</p>
              <p className="overlay-description">{operation.hoverInfo.description}</p>
            </div>
          </div>
        )}
      </div>
      
      <h3 className="operation-name">{operation.name}</h3>
    </div>
  );
}
