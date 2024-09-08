import React, { useEffect, useState } from "react";
import "./Calendar";
import { ClassNames } from "@emotion/react";
import RentPlaceSelector from './RentPlaceSelector'; // RentPlaceSelector 컴포넌트 import
import GetCsKind from './get_csKind'
import { ScheduleModalProps } from '../utils/scheduleUtils';

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  id,
  newStart,
  newEnd,
  startTime,
  endTime,
  customerName,
  gubun,
  userInt,
  estPrice,
  etc,
  rentPlace,
  setNewStart,
  setNewEnd,
  setStartTime,
  setEndTime,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  setCustomerName,
  setRentPlace,
  openJexcelModal,
  setGubun,
  setUserInt,
  setEstprice,
  setEtc,
  setCsKind,
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

  const handleHourChange = (hour: string, setDate: (time: number | null) => void) => {
    setDate(parseInt(hour, 10));
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
        closeSelector();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  const handleSelectorChange = (selected: string[]) => {
    setSelRentPlace(selected); //선택 대관장소 값을 업데이트
    const newSelected=selected.join(',')///대관장소를 []받아서 string으로 변경
    setRentPlace(newSelected); //부모창에 대관장소 업데이트
  };


  useEffect(() => {
    if (isOpen) {
      console.log('rentplace',rentPlace)
      const arr=rentPlace   //대관장소 를 텍스트로 받아와서 배열로 변경후 업데이트
      const arrToArray = arr.split(',');
      console.log(arrToArray)
      setSelRentPlace(arrToArray)
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" id="ScheduleModal">
      <div className="modal-content">
        <h2>{modalMode === "edit" ? "수정" : "추가"}</h2>

        <div className="date-time-container">
          <div className="date-time-item-row">
            <GetCsKind onValueChange={setCsKind} />
          </div>
          <div className="date-time-item-row">
            <label>고객명:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <button onClick={() => openJexcelModal(customerName)} className="search-button">검색</button>
          </div>
          <div className="date-time-item-row">
            <div className="date_box">
              <label>시작일:</label>
              <div>
                <input
                  type="date"
                  value={newStart ? formatToKoreanTimeString(newStart) : ""}
                  onChange={(e) => setNewStart(new Date(e.target.value))}
                  className="date-view"
                />

                <select
                  value={startTime ? startTime : "00"}
                  onChange={(e) => handleHourChange(e.target.value, setStartTime)} // setStartTime 함수 호출
                  className="time-view"
                >
                  {generateHourOptions()}
                </select>
              </div>
            </div>
            <div className="date_box" >
              <label>종료일:</label>
              <div>
                <input
                  type="date"
                  value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
                  onChange={(e) => setNewEnd(new Date(e.target.value))}
                  className="date-view"
                />
                <select
                  value={endTime ? endTime : "00"}
                  onChange={(e) => handleHourChange(e.target.value, setEndTime)}
                  className="time-view"
                >
                  {generateHourOptions()}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="date-time-item-row photoGubun">
          <div className="box">
            <label>촬영구분:</label>
            <select
              value={gubun}
              onChange={(e) => setGubun(e.target.value)}
            >
              <option value="사진">사진</option>
              <option value="영상">영상</option>
              <option value="행사">행사</option>
              <option value="전시">전시</option>
              <option value="비영리">비영리</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div className="box">
            <label>인원:</label>
            <select
              value={userInt}
              onChange={(e) => setUserInt(e.target.value)} >
              <option value="10인이하">10인이하</option>
              <option value="11~15인">11~15인</option>
              <option value="16~20인">16~20인</option>
              <option value="21~25인">21~25인</option>
              <option value="26~30인">26~30인</option>
              <option value="31인이상">31인이상</option>
            </select>
          </div>
        </div>


        <div className="date-time-item-row">
          <label>대관장소:</label>
          <input
            type="text"
            // value={selrentPlace.join(", ")}
            value={selrentPlace.join(", ")}
            // readOnly
            onClick={openSelector}
            className="selected-values-input"
          />
          {isSelectorOpen && (
            <RentPlaceSelector
              selectedPlaces={selrentPlace.join(',')}
              onChange={handleSelectorChange}
              onClose={closeSelector}
            // setSelRentPlace={setSelRentPlace}
            />
          )}
        </div>

        <div className="date-time-item-row">
          <label>견적가:</label>
          <input
            type="text"
            value={estPrice}
            onChange={(e) => {
              setEstprice(Number(e.target.value));
            }}
          />
        </div>
        <div className="date-time-item-row">
          <label>비고:</label>
          <input
            type="text"
            value={etc}
            onChange={(e) => {
              setEtc(e.target.value);
            }}
          />
        </div>

        <div className="modal-buttons">
          <button className="save-button" onClick={onSaveSchedule}>
            저장
          </button>
          {modalMode === "edit" && (
            <button className="delete-button" onClick={() => onDeleteSchedule(Number(id))}>
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