import React, { useCallback, useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem,SelectChangeEvent } from '@mui/material';
// import { SelectChangeEvent } from '@mui/material';


import axios from 'axios';
const apiUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_LOCAL;


interface GetCsKindProps {
  onValueChange: (value:number) => void;
  // csKind: (value: number) => void;
  csKind: number | undefined;
}




const GetCsKind: React.FC<GetCsKindProps> = ({ onValueChange,csKind }) => {

  const [options, setOptions] = useState([]); // 서버에서 가져올 옵션 리스트
  const [selectedOption, setSelectedOption] = useState(''); // 선택한 옵션 상태

  // 서버에서 데이터를 가져오는 함수
  const fetchOptions = async () => {
    try {
      axios
        .get(`${apiUrl}/api/setup/csKind`)
        .then((res) => {
          const fetchedData = res.data.map(
            (cskindsetup: { id: number; title: string; calView: boolean }) => [
              cskindsetup.id,
              cskindsetup.title,
              cskindsetup.calView,
            ]
          );
          setOptions(fetchedData); // 서버에서 받은 데이터를 상태에 저장
        })
        .catch((err) => console.error('Error fetching customers:', err));
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    }
  };

  // 컴포넌트가 처음 렌더링될 때 데이터를 가져옴
  useEffect(() => {
    fetchOptions();
    console.log('options',options)
  }, []); // 빈 배열을 넣어서 컴포넌트가 처음 렌더링될 때만 호출


useEffect(()=>{
 console.log('csKind',csKind) 
 if(csKind){
  setSelectedOption(String(csKind))
 }
})

const handleSelectChange = (event: SelectChangeEvent<string>) => {
  const selectedValue = event.target.value; // 선택된 값
  setSelectedOption(selectedValue); // 상태 업데이트
  onValueChange(parseInt(selectedValue)); // 선택된 값을 정수로 변환하여 전달
  console.log('선택된 키 값:', selectedValue);
};


  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   // const handleSelectChange = (event: SelectChangeEvent<string>) => {
  //   const selectedValue = e.target.value // JSON 문자열을 객체로 변환
  //   setSelectedOption(selectedValue); // 상태 업데이트
  //   onValueChange(parseInt(selectedValue))
  //   console.log('선택된 키 값:', selectedValue);
  // };

  return (
    <FormControl fullWidth>
    <InputLabel id="selectBox-label">CS유형</InputLabel>
    <Select
      labelId="selectBox-label"
      id="selectBox"
      value={selectedOption}
      label="CS유형"
      onChange={handleSelectChange}
    >
      {options.map((option) => (
        <MenuItem key={option[0]} value={option[0]}>
          {option[1]}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  );
};

export default GetCsKind;
