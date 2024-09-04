import React, { useState } from 'react';

interface RentPlaceSelectorProps {
  selectedPlaces: string[];
  onChange: (selected: string[]) => void;
  onClose: () => void;
}

const RentPlaceSelector: React.FC<RentPlaceSelectorProps> = ({ selectedPlaces, onChange, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      onChange([...selectedPlaces, value]);
    } else {
      onChange(selectedPlaces.filter((item) => item !== value));
    }
  };

  const filteredPlaces = ["1층", "2층", "3층", "별채"].filter((place) =>
    place.includes(searchTerm)
  );

  return (
    <div className="modal-rentplace-overlay">
      <div className="modal-rentplace-content">
        <h3>대관장소 선택</h3>
  
        <div className="checkbox-list">
          {filteredPlaces.map((place) => (
            <label key={place}>
              <input
                type="checkbox"
                value={place}
                checked={selectedPlaces.includes(place)}
                onChange={handleCheckboxChange}
              />
              {place}
            </label>
          ))}
        </div>
        <button onClick={onClose} className="close-button">
          확인
        </button>
      </div>
    </div>
  );
};

export default RentPlaceSelector;
