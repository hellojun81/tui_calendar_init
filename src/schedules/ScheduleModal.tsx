import React, { useEffect, useState, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
// import "./Calendar";
import RentPlaceSelector from './RentPlaceSelector'; // RentPlaceSelector 컴포넌트 import
import { ScheduleModalProps, openJexcelModalUtil } from '../utils/scheduleUtils';
import JexcelModal from "./JexcelModal";
import GetCsKind from "./Get_CsKind";
const TimePicker = ({ label, value, onChange, options }) => (
  <FormControl fullWidth>
    <InputLabel>{label}</InputLabel>
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  id,
  newStart,
  newEnd,
  customerName,
  gubun,
  userInt,
  estPrice,
  etc,
  rentPlace,
  csKind,
  startTime,
  endTime,
  setNewStart,
  setNewEnd,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  setCustomerName,
  setRentPlace,
  setGubun,
  setUserInt,
  setEstprice,
  setEtc,
  setCsKind,
  setStartTime,
  setEndTime,
}) => {
  const [selrentPlace, setSelRentPlace] = useState<string[]>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가
  const [customerEtc, setCustomerEtc] = useState<string>(""); // 검색어 상태 추가
  const [customerName2, setCustomerName2] = useState<string>(""); // 검색어 상태 추가
  // const [startTime, setStartTime] = useState("00:00");
  // const [endTime, setEndTime] = useState("00:00");


  const openSelector = () => setIsSelectorOpen(true);
  const closeSelector = () => setIsSelectorOpen(false);

  const formatToKoreanTimeString = (date: Date): string => {
    if (!date) return "";
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };


  const openJexcelModal = useCallback((customerName: string) => {
    openJexcelModalUtil(customerName, setSearchQuery, setIsJexcelModalOpen); // 유틸리티 함수 호출
  }, []);

  const closeJexcelModal = useCallback(() => {
    setIsJexcelModalOpen(false);
  }, []);

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
    console.log({ 'selected': selected, selrentPlace: selrentPlace })
    const newSelected = selected.join(',')///대관장소를 []받아서 string으로 변경
    setRentPlace(newSelected); //부모창에 대관장소 업데이트
  };


  useEffect(() => {
    if (isOpen) {
      console.log('rentplace', rentPlace)
      const arr = rentPlace   //대관장소 를 텍스트로 받아와서 배열로 변경후 업데이트
      const arrToArray = arr.split(',');
      // console.log(arrToArray)
      setSelRentPlace(arrToArray)
    }
  }, [isOpen]);



  const formatNumber = (num: number | string) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ''); // 콤마 제거
    const numericValue = Number(value); // 숫자 변환
    if (!isNaN(numericValue)) {
      setEstprice(numericValue);
    }
  };
  const onSelectCustomer = useCallback((selectedCustomer: string, customerName2: string, etc: string) => {
    console.log({ 'selectedCustomer': selectedCustomer, selectedCustomer2: customerName2, etc: etc })
    setCustomerName(selectedCustomer); // 선택된 고객명 설정
    setCustomerName2(customerName2);
    setEtc(etc);
  }, []);



  if (!isOpen) {
    return null;
  }

  const generateHourOptions = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = `${i < 10 ? "0" : ""}${i}:00`;
      hours.push(hour);
    }
    return hours;
  };

  const hourOptions = generateHourOptions();


  return (

    <Dialog open={isOpen} onClose={closeModal} maxWidth="md" fullWidth sx={{ fontSize: '12px', maxWidth: '700px', margin: '0 auto' }}>
      <DialogTitle>{modalMode === "edit" ? `수정 [ID:${id}]` : "추가"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>


          <GetCsKind onValueChange={setCsKind} csKind={csKind} />

          <FormControl fullWidth>
            <InputLabel>촬영구분</InputLabel>
            <Select value={gubun} onChange={(e) => setGubun(e.target.value)}>
              <MenuItem value="사진">사진</MenuItem>
              <MenuItem value="영상">영상</MenuItem>
              <MenuItem value="행사">행사</MenuItem>
              <MenuItem value="전시">전시</MenuItem>
              <MenuItem value="비영리">비영리</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>인원</InputLabel>
            <Select value={userInt} onChange={(e) => setUserInt(e.target.value)}>
              <MenuItem value="10인이하">10인이하</MenuItem>
              <MenuItem value="11~15인">11~15인</MenuItem>
              <MenuItem value="16~20인">16~20인</MenuItem>
              <MenuItem value="21~25인">21~25인</MenuItem>
              <MenuItem value="26~30인">26~30인</MenuItem>
              <MenuItem value="31인이상">31인이상</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="고객명"
            fullWidth
            value={customerName}
            required
            onChange={(e) => setCustomerName(e.target.value)}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button onClick={() => openJexcelModal(customerName)}>검색</Button>
              ),
            }}
          />
          <Box>{`담당자명:${customerName2} 비고:${etc}`}</Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="시작일"
              type="date"
              value={newStart ? formatToKoreanTimeString(newStart) : ""}
              onChange={(e) => setNewStart(new Date(e.target.value))}
              fullWidth
            />
            <TimePicker
              label="시작 시간"
              value={startTime}
              onChange={setStartTime}
              options={hourOptions}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="종료일"
              type="date"
              value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
              onChange={(e) => setNewEnd(new Date(e.target.value))}
              fullWidth
            />
            <TimePicker
              label="종료 시간"
              value={endTime}
              onChange={setEndTime}
              options={hourOptions}
            />
          </Box>

          <TextField
            label="대관장소"
            fullWidth
            value={selrentPlace}
            onClick={openSelector}
            InputProps={{
              readOnly: true,
            }}
          />
          {isSelectorOpen && (
            <RentPlaceSelector
              selectedPlaces={selrentPlace}
              onChange={handleSelectorChange}
              onClose={closeSelector}
            />
          )}

          <TextField
            label="견적가"
            fullWidth
            value={formatNumber(estPrice)}
            onChange={handlePriceChange}
          />

          <TextField
            label="비고"
            fullWidth
            value={etc}
            onChange={(e) => setEtc(e.target.value)}
            multiline
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSaveSchedule} color="primary" variant="outlined">저장</Button>
        {modalMode === "edit" && (
          <Button onClick={() => onDeleteSchedule(Number(id))} variant="outlined">
            삭제
          </Button>
        )}
        <Button onClick={closeModal} color="primary" variant="contained">
          취소
        </Button>
      </DialogActions>

      <JexcelModal
        isOpen={isJexcelModalOpen}
        onClose={closeJexcelModal}
        onSelect={onSelectCustomer}
        searchQuery={searchQuery}
      />
    </Dialog>

  );
};

export default ScheduleModal;  