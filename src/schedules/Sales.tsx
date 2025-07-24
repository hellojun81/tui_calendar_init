import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PRODUCTION
        : process.env.REACT_APP_API_URL_LOCAL;
// 데이터 구조를 정의


interface CheckViewProps {
    currentMonth: number;
    currentYear: number;
}

const TotalSales: React.FC<CheckViewProps> = ({
    currentMonth,
    currentYear
}) => {
    const currentMonthFormatted = String(currentMonth).padStart(2, '0');
    const [sales, setSales] = useState<number>(0);
    const [ADsales, setADSales] = useState<number>(0);
    const [RentCnt, setRentCnt] = useState<number>(0);
    const [ARPC, setARPC] = useState<number>(0); //객단가
const formatMillionCut = (num: number) => {
  return Math.floor(num / 10_000);
};

    useEffect(() => {
        const GetSales = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/setup/sales?SearchMonth=${currentYear}-${currentMonthFormatted}`);
                console.log('resdata',res)
                setSales(res.data.TOTALSALES); // res.data의 타입을 지정
                setADSales(formatMillionCut(res.data.TOTALADCOST)); // res.data의 타입을 지정
                setRentCnt(formatMillionCut(res.data.TOTALRENTCNT)); // res.data의 타입을 지정
                setARPC(res.data.TOTALSALES/res.data.TOTALRENTCNT)
            } catch { }
        }
        GetSales()
    }, [currentMonth]); // 첫 렌더링 시에만 실행

    // 체크박스 렌더링
    return (
        <div>
            <div style={{padding:'10px',textAlign:'center'}}>
                매출:{sales}만원 / 광고비{ADsales}만원 /객단가{Math.floor(ARPC)}만원
            </div>
        </div>
    );
};

export default TotalSales;
