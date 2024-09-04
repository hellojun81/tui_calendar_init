import React, { useEffect, useState } from "react";
import "./Calendar";
import { ScheduleModalProps } from './schedule'
import { ClassNames } from "@emotion/react";
import RentPlaceSelector from './RentPlaceSelector'; // RentPlaceSelector 컴포넌트 import

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  id,
  newStart,
  newEnd,
  newTitle,
  customerName,
  rentPlace,
  gubun,
  userInt,
  estPrice,
  setNewStart,
  setNewEnd,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  setNewTitle,
  setCustomerName,
  setRentPlace,
  openJexcelModal,
  setGubun,
  setUserInt,
  setEstprice
}) => {
  const [selrentPlace, setSelRentPlace] = useState<string[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const openSelector = () => setIsSelectorOpen(true);
  const closeSelector = () => setIsSelectorOpen(false);



  const formatToKoreanTimeString = (date: Date): string => {
    if (!date) return "";
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleHourChange = (date: Date | null, hour: string, setDate: (date: Date | null) => void) => {
    if (date) {
      const updatedDate = new Date(date);
      updatedDate.setHours(parseInt(hour, 10));
      setDate(updatedDate);
    }
  };

  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => (
      <option key={i} value={i}>
        {i.toString().padStart(2, '0')}
      </option>
    ));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{modalMode === "edit" ? "스케줄 수정" : "새 스케줄 추가"}</h2>
        <div className="date-time-item">
          <label>고객명:</label>
          <div className="input-with-button">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <button onClick={() => openJexcelModal(customerName)} className="search-button">검색</button>
          </div>
        </div>
        <div className="date-time-container">
          <div className="date-time-item-row">
            <div className="box">
              <label>시작일:</label>
              <input
                type="date"
                value={newStart ? formatToKoreanTimeString(newStart) : ""}
                onChange={(e) => setNewStart(new Date(e.target.value))}
                className="date-view"
              />

              <select
                value={newStart ? newStart.getHours() : "00"}
                onChange={(e) => handleHourChange(newStart, e.target.value, setNewStart)}
                className="time-view"
              >
                {generateHourOptions()}
              </select>
            </div>
            <div className="box">
              <label>종료일:</label>
              <input
                type="date"
                value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
                onChange={(e) => setNewEnd(new Date(e.target.value))}
                className="date-view"
              />
              <select
                value={newEnd ? newEnd.getHours() : "00"}
                onChange={(e) => handleHourChange(newEnd, e.target.value, setNewEnd)}
                className="time-view"
              >
                {generateHourOptions()}
              </select>
            </div>
          </div>
        </div>

        <div className="date-time-item">
          <label>제목:</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
            }}
          />
        </div>


        <div className="date-time-item">
          <label>촬영구분:</label>
          <input
            type="text"
            value={gubun}
            onChange={(e) => {
              setGubun(e.target.value);
            }}
          />
        </div>

        <div className="date-time-item">
          <label>대관장소:</label>
          <input
            type="text"
            value={selrentPlace.join(", ")}
            readOnly
            onClick={openSelector}
            className="selected-values-input"
          />
          {isSelectorOpen && (
            <RentPlaceSelector
              selectedPlaces={selrentPlace}
              onChange={setSelRentPlace}
              onClose={closeSelector}
            />
          )}
        </div>
        <div className="date-time-item">
          <label>인원:</label>
          <input
            type="text"
            value={userInt}
            onChange={(e) => {
              setUserInt(e.target.value);
            }}
          />
        </div>
        <div className="date-time-item">
          <label>견적가:</label>
          <input
            type="text"
            value={estPrice}
            onChange={(e) => {
              setEstprice(e.target.value);
            }}
          />
        </div>



        <div className="modal-buttons">
          <button className="save-button" onClick={onSaveSchedule}>
            저장
          </button>
          {modalMode === "edit" && (
            <button className="delete-button" onClick={() => onDeleteSchedule(id)}>
              삭제
            </button>
          )}
          <button className="cancel-button" onClick={closeModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;