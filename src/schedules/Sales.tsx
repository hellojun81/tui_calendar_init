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

interface SalesSummaryResponse {
    TOTALSALES: number | string | null;
    TOTALADCOST: number | string | null;
    TOTALRENTCNT: number | string | null;
    TOTALYEARSALES: number | string | null;
}

const formatMillionCut = (num: number) => Math.floor(num / 10_000);

const TotalSales: React.FC<CheckViewProps> = ({
    currentMonth,
    currentYear
}) => {
    const currentMonthFormatted = String(currentMonth).padStart(2, '0');
    const [sales, setSales] = useState<number>(0);
    const [ADsales, setADSales] = useState<number>(0);
    const [ARPC, setARPC] = useState<number>(0); //객단가
    const [yearSales, setYearSales] = useState<number>(0);

    useEffect(() => {
        const GetSales = async () => {
            try {
                const res = await axios.get<SalesSummaryResponse>(`${apiUrl}/api/setup/sales?SearchMonth=${currentYear}-${currentMonthFormatted}`);
                const monthlySales = Number(res.data.TOTALSALES) || 0;
                const adCost = Number(res.data.TOTALADCOST) || 0;
                const rentCount = Number(res.data.TOTALRENTCNT) || 0;
                const yearlySales = Number(res.data.TOTALYEARSALES) || 0;

                setSales(monthlySales);
                setADSales(formatMillionCut(adCost));
                setARPC(rentCount > 0 ? monthlySales / rentCount : 0);
                setYearSales(yearlySales);
            } catch { }
        }
        GetSales()
    }, [currentMonth, currentYear]);

    // 체크박스 렌더링
    return (
        <div>
            <div style={{padding:'10px',textAlign:'center'}}>
                <div>매출:{sales}만원 / 광고비{ADsales}만원 /객단가{Math.floor(ARPC)}만원</div>
                <div style={{ marginTop: '6px', fontWeight: 700 }}>
                    년 예상 매출: {yearSales.toLocaleString('ko-KR')}만원
                </div>
            </div>
        </div>
    );
};

export default TotalSales;
