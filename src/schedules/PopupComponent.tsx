import React, { useState, useEffect } from 'react';
import "./PopupComponent"

interface PopupComponentProps {
  isOpen: boolean;
  onClose: () => void;
  value: any;
  isMulti: boolean;
  onSelect: (selectedValues: string[]) => void;
}

const PopupComponent: React.FC<PopupComponentProps> = ({
  isOpen,
  onClose,
  value,
  isMulti,
  onSelect,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 팝업이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedValues([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleCheckboxChange = (val: string) => {
    if (isMulti) {
      setSelectedValues((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
      );
    } else {
      setSelectedValues([val]);
    }
  };

  const handleApply = () => {
    onSelect(selectedValues);
    onClose();
  };

  const filteredValues = Object.values(value).filter((val) =>
    val.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <input
            type="text"
            placeholder="검색어를 입력하세요."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="popup-content">
          <ul>
            {filteredValues.map((val) => (
              <li key={val}>
                <input
                  type="checkbox"
                  checked={selectedValues.includes(val)}
                  onChange={() => handleCheckboxChange(val)}
                />
                <label>{val}</label>
              </li>
            ))}
          </ul>
        </div>
        <div className="popup-footer">
          <button onClick={handleApply}>적용</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default PopupComponent;
