import React, { useState ,useEffect} from 'react';

interface RentPlaceSelectorProps {
  selectedPlaces: string;
  onChange: (selected: string[]) => void;
  onClose: () => void;
}

const RentPlaceSelector: React.FC<RentPlaceSelectorProps> = ({
  selectedPlaces,
  onChange,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filteredArray = selectedPlaces.filter((item) => item.length !== 0);
    selectedPlaces=filteredArray
    console.log('filteredArray',selectedPlaces)
  }, );



  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim(); // 공백 제거
    console.log('handleCheckbox', value);
      // value가 비어있지 않은 경우에만 추가
    if (value === "") {
      return; // value가 비어있으면 아무것도 하지 않음
    }
      if (e.target.checked) {
      onChange([...selectedPlaces, value]); // 선택된 값 추가
    } else {
      onChange(selectedPlaces.filter((item) => item !== value)); // 선택된 값 제거
    }
  };
  


  const filteredPlaces = ['1층', '2층', '3층', '별채'].filter((place) =>
    place.trim().includes(searchTerm.trim()) // 공백 제거
  );
  

  return (
    <div className="modal-rentplace-overlay">
      <div className="modal-rentplace-content">
        <h3>대관장소 선택</h3>
        {/* <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색"
        /> */}
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
