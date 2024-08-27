import React, { useState } from "react";
import PopupComponent from './PopupComponent';

interface RawDataFormProps {
  rawData: { [key: string]: any };
  onRawDataChange: (key: string, value: string) => void;
}

const RawDataForm: React.FC<RawDataFormProps> = ({ rawData, onRawDataChange }) => {
  const [isMultiPopupOpen, setIsMultiPopupOpen] = useState(false);
  const [isSinglePopupOpen, setIsSinglePopupOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("선택");

  const handleSelectValues = (values: string[]) => {
    setSelectedLabel(values.join(", "));
    // rawData 상태 업데이트 로직 추가 가능
  };

  return (
    <div className="raw-data">
      <h3>추가 정보 (raw):</h3>
      {Object.entries(rawData).map(([key, value]) => (
        <div key={key}>
          <label>{key}:</label>
          {typeof value === 'object' && !Array.isArray(value) && value !== null ? (
            key.includes('멀티') ? (
              <div>
                <button
                  onClick={() => setIsMultiPopupOpen(true)}
                  className="open-popup-button"
                >
                  {selectedLabel}
                </button>

                <PopupComponent
                  isOpen={isMultiPopupOpen}
                  onClose={() => setIsMultiPopupOpen(false)}
                  value={rawData["장비 목록 (멀티)"]}
                  isMulti={true}
                  onSelect={handleSelectValues}
                />
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setIsSinglePopupOpen(true)}
                  className="open-popup-button"
                >
                  {selectedLabel}
                </button>

                <PopupComponent
                  isOpen={isSinglePopupOpen}
                  onClose={() => setIsSinglePopupOpen(false)}
                  value={rawData["단일 선택 장비"]}
                  isMulti={false}
                  onSelect={handleSelectValues}
                />
              </div>
            )
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onRawDataChange(key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default RawDataForm;
