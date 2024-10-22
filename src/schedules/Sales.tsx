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

    useEffect(() => {
        const GetSales = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/setup/sales?SearchMonth=${currentYear}-${currentMonthFormatted}`);
                console.log(res.data.TOTALSALES)
                setSales(res.data.TOTALSALES); // res.data의 타입을 지정
            } catch { }
        }
        GetSales()
    }, [currentMonth]); // 첫 렌더링 시에만 실행

    // 체크박스 렌더링
    return (
        <div>
            <div style={{padding:'10px',textAlign:'center'}}>
                매출:{sales}만원
            </div>
        </div>
    );
};

export default TotalSales;
