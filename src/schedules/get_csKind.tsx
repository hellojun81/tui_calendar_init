import React, { useCallback,useState, useEffect } from 'react';
import axios from 'axios';



interface GetCsKindProps {
  onValueChange: (value: string) => void;
  cskind: (value: string) => void;
}




const GetCsKind: React.FC<GetCsKindProps> = ({ onValueChange,cskind }) => {

  const [options, setOptions] = useState([]); // 서버에서 가져올 옵션 리스트
  const [selectedOption, setSelectedOption] = useState(''); // 선택한 옵션 상태

  // 서버에서 데이터를 가져오는 함수
  const fetchOptions = async () => {
    try {
      axios
        .get(`http://localhost:3001/api/setup/csKind`)
        .then((res) => {
          const fetchedData = res.data.map(
            (cskindsetup: { id: number; title: string; calView: boolean }) => [
              cskindsetup.id,
              cskindsetup.title,
              cskindsetup.calView,
            ]
          );
          console.log(fetchedData);
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
  }, []); // 빈 배열을 넣어서 컴포넌트가 처음 렌더링될 때만 호출

  useEffect(() => {
    // 기본값을 '단순 문의'로 설정
    const defaultOption = options.find((option) => option[1] === '단순문의');
    if (defaultOption) {
      setSelectedOption(defaultOption[1]);
    }
  }, [options]); // 옵션이 업데이트될 때 실행

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const selectedValue = e.target.value;
    
    setSelectedOption(selectedValue);
    onValueChange(selectedValue)
    console.log('선택된 키 값:', selectedValue);
  };

  return (
    <div>
      <label htmlFor="selectBox">CS유형:</label>
      <select id="selectBox" value={selectedOption} onChange={handleSelectChange}>
        <option value="">옵션을 선택하세요</option>
        {options.map((option) => (
          <option key={option[0]} value={option[0]}>
   
            {option[1]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GetCsKind;
