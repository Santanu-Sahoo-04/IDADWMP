import React, { useState } from "react";
import "./NALCOMap.css";
const nalcoUnits = [
  {
    id: 1,
    name: "Panchpatmali Bauxite Mines",
    type: "mining",
    location: "Koraput, Odisha",
    coordinates: { left: "50%", top: "62%" } // ≈50 km east of Damanjodi
  },
  {
    id: 2,
    name: "Alumina Refinery",
    type: "refinery",
    location: "Damanjodi, Odisha",
    coordinates: { left: "49.5%", top: "62.5%" } // Reference point
  },
  {
    id: 3,
    name: "Aluminium Smelter & CPP",
    type: "smelter",
    location: "Angul, Odisha",
    coordinates: { left: "54.5%", top: "56.5%" } // ≈260 km northeast of Damanjodi
  },
  {
    id: 4,
    name: "Corporate Office",
    type: "corporate",
    location: "Bhubaneswar, Odisha",
    coordinates: { left: "57%", top: "58.5%" } // ≈400 km east of Damanjodi
  },
  {
    id: 5,
    name: "Utkal-D Coal Mine",
    type: "mining",
    location: "Jharsuguda, Odisha",
    coordinates: { left: "53%", top: "54%" } // ≈200 km northwest of Damanjodi
  }
];




export default function NALCOMap() {
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [clickedUnit, setClickedUnit] = useState(null);

  const handleMarkerClick = (unit) => {
    setClickedUnit(clickedUnit?.id === unit.id ? null : unit);
  };

  return (
    <div className="nalco-map">
      <div className="map-header">
        <h4 className="map-title">NALCO Units Across India</h4>
        <div className="map-subtitle">Strategic locations for integrated operations</div>
      </div>
      
      <div className="map-container">
        <img
          src="/assets/maps/india.svg"
          alt="India Map"
          className="india-svg"
          draggable={false}
        />
        
        {/* Unit Markers */}
        {nalcoUnits.map(unit => (
          <div
            key={unit.id}
            className="unit-marker"
            style={{
              left: unit.coordinates.left,
              top: unit.coordinates.top
            }}
            onMouseEnter={() => setHoveredUnit(unit)}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => handleMarkerClick(unit)}
          >
            <div className={`marker ${unit.type} ${clickedUnit?.id === unit.id ? 'clicked' : ''}`}>
              <div className="marker-pulse"></div>
              <div className="marker-icon">
                {unit.type === 'mining' && '⛏️'}
                {unit.type === 'refinery' && '🏭'}
                {unit.type === 'smelter' && '🔥'}
                {unit.type === 'corporate' && '🏢'}
              </div>
            </div>
          </div>
        ))}

        {/* Hover Tooltip */}
        {hoveredUnit && !clickedUnit && (
          <div
            className="unit-tooltip hover-tooltip"
            style={{
              left: hoveredUnit.coordinates.left,
              top: `calc(${hoveredUnit.coordinates.top} + 25px)`
            }}
          >
            <div className="tooltip-title">{hoveredUnit.name}</div>
            <div className="tooltip-location">{hoveredUnit.location}</div>
          </div>
        )}

        {/* Click Popup */}
        {clickedUnit && (
          <div
            className="unit-popup"
            style={{
              left: clickedUnit.coordinates.left,
              top: `calc(${clickedUnit.coordinates.top} - 80px)`
            }}
          >
            <div className="popup-header">
              <div className="popup-title">{clickedUnit.name}</div>
              <button 
                className="popup-close"
                onClick={() => setClickedUnit(null)}
              >
                ×
              </button>
            </div>
            <div className="popup-content">
              <div className="popup-location">📍 {clickedUnit.location}</div>
              <div className="popup-description">{clickedUnit.description}</div>
              <div className={`popup-type ${clickedUnit.type}`}>
                {clickedUnit.type.charAt(0).toUpperCase() + clickedUnit.type.slice(1)} Unit
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-header">Unit Types</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="marker mining legend-marker">⛏️</div>
            <span>Mining</span>
          </div>
          <div className="legend-item">
            <div className="marker refinery legend-marker">🏭</div>
            <span>Refinery</span>
          </div>
          <div className="legend-item">
            <div className="marker smelter legend-marker">🔥</div>
            <span>Smelter</span>
          </div>
          <div className="legend-item">
            <div className="marker corporate legend-marker">🏢</div>
            <span>Corporate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
