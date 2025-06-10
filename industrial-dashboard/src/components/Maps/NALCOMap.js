import React, { useState } from 'react';
import './Maps.css';

const nalcoLocations = [
  {
    id: 1,
    name: "Panchpatmali Bauxite Mines",
    location: "Koraput, Odisha",
    type: "Mining",
    capacity: "6.825 million TPA",
    coordinates: { top: "65%", left: "75%" }
  },
  {
    id: 2,
    name: "Alumina Refinery",
    location: "Damanjodi, Odisha",
    type: "Refinery",
    capacity: "2.1 million TPA",
    coordinates: { top: "63%", left: "73%" }
  },
  {
    id: 3,
    name: "Aluminium Smelter",
    location: "Angul, Odisha",
    type: "Smelter",
    capacity: "0.46 million TPA",
    coordinates: { top: "60%", left: "72%" }
  },
  {
    id: 4,
    name: "Captive Power Plant",
    location: "Angul, Odisha",
    type: "Power",
    capacity: "1200 MW",
    coordinates: { top: "60%", left: "72.5%" }
  },
  {
    id: 5,
    name: "Corporate Office",
    location: "Bhubaneswar, Odisha",
    type: "Corporate",
    capacity: "Headquarters",
    coordinates: { top: "58%", left: "71%" }
  }
];

export default function NALCOMap() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="nalco-map-container">
      <h3 className="map-title">NALCO Operations in India</h3>
      <div className="map-wrapper">
        <div className="india-map">
          <svg viewBox="0 0 1000 800" className="india-svg">
            {/* Simplified India outline - you can replace with detailed SVG */}
            <path
              d="M200,150 L800,150 L850,200 L820,400 L800,600 L700,650 L500,680 L300,650 L200,500 Z"
              fill="#e3f2fd"
              stroke="#1976d2"
              strokeWidth="2"
            />
            <text x="500" y="400" textAnchor="middle" className="country-label">INDIA</text>
          </svg>
          
          {nalcoLocations.map(location => (
            <div
              key={location.id}
              className="location-marker"
              style={{
                top: location.coordinates.top,
                left: location.coordinates.left
              }}
              onClick={() => setSelectedLocation(location)}
              onMouseEnter={() => setSelectedLocation(location)}
            >
              <div className={`marker ${location.type.toLowerCase()}`}>
                <div className="marker-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedLocation && (
          <div className="location-info">
            <h4>{selectedLocation.name}</h4>
            <p><strong>Location:</strong> {selectedLocation.location}</p>
            <p><strong>Type:</strong> {selectedLocation.type}</p>
            <p><strong>Capacity:</strong> {selectedLocation.capacity}</p>
          </div>
        )}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <div className="marker mining small"></div>
          <span>Mining</span>
        </div>
        <div className="legend-item">
          <div className="marker refinery small"></div>
          <span>Refinery</span>
        </div>
        <div className="legend-item">
          <div className="marker smelter small"></div>
          <span>Smelter</span>
        </div>
        <div className="legend-item">
          <div className="marker power small"></div>
          <span>Power</span>
        </div>
        <div className="legend-item">
          <div className="marker corporate small"></div>
          <span>Corporate</span>
        </div>
      </div>
    </div>
  );
}
