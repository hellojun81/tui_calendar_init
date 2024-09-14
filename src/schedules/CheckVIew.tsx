import React, { useState, useEffect } from 'react';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;

// 데이터 구조를 정의
interface CheckboxItem {
  id: string;
  title: string;
  calView: string;
}

interface CheckViewProps {
  reloadSchedule: () => void; 
  currentMonth:number;
  currentYear:number;
}

const CheckView: React.FC<CheckViewProps> = ({
  reloadSchedule,
  currentMonth,
  currentYear
}) => {

  const [checkboxes, setCheckboxes] = useState<CheckboxItem[]>([]); // CheckboxItem[] 타입으로 지정
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [isInitialRender, setIsInitialRender] = useState(true);
  let i=0
  useEffect(() => {
    i++
    console.log(i)

    if (!isInitialRender) {
      UpdateCsKind(selectedCheckboxes);
     
    }
  }, [selectedCheckboxes, isInitialRender]);

  const UpdateCsKind = async (ids: string[]) => {
    console.log({currentYear:currentYear,currentMonth:currentMonth})
    const res = await axios.put(`${apiUrl}/api/schedules/getCsKind?update_ID=${ids.join(',')}&SearchMonth=${currentYear}-${currentMonth}`);
    reloadSchedule();
  }

  useEffect(() => {

    const GetCsKind = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/schedules/getCsKind`);
        const data: CheckboxItem[] = res.data; // res.data의 타입을 지정
        setCheckboxes(data);
        // calView 값이 1인 항목들을 자동으로 선택
        const filteredIds = data
          .filter(item => item.calView === "1") // CheckboxItem 타입의 item
          .map(item => item.id); // 필터된 항목들의 id만 추출

        setSelectedCheckboxes(filteredIds);
        setIsInitialRender(false); // API 호출 후 최초 렌더링 완료로 설정
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };

    GetCsKind();
  }, []); // 첫 렌더링 시에만 실행

  // 체크박스 변경 처리 함수
  const handleCheckboxChange = (id: string) => {
    if (selectedCheckboxes.includes(id)) {
      setSelectedCheckboxes(selectedCheckboxes.filter(item => item !== id));
    } else {
      setSelectedCheckboxes([...selectedCheckboxes, id]);
    }
  };

  // 체크박스 렌더링
  return (
    <div>
      <div
        style={{
          display: 'flex',
          verticalAlign: 'center',
          fontSize: '0.9em',
          marginTop: '10px',
          gap: '10px'
        }}
      >
        <div>유형별 일정보기</div>
        {checkboxes.map((checkbox) => (
          <div key={checkbox.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedCheckboxes.includes(checkbox.id)}
                onChange={() => handleCheckboxChange(checkbox.id)}
              />
              {checkbox.title}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckView;
