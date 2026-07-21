import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper, Typography } from '@mui/material';

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
    PREVIOUSYEARSALES: number | string | null;
}

const formatMillionCut = (num: number) => Math.floor(num / 10_000);
const formatAmount = (num: number) => Math.floor(num).toLocaleString('ko-KR');

const TotalSales: React.FC<CheckViewProps> = ({
    currentMonth,
    currentYear
}) => {
    const currentMonthFormatted = String(currentMonth).padStart(2, '0');
    const [sales, setSales] = useState<number>(0);
    const [ADsales, setADSales] = useState<number>(0);
    const [ARPC, setARPC] = useState<number>(0); //객단가
    const [yearSales, setYearSales] = useState<number>(0);
    const [previousYearSales, setPreviousYearSales] = useState<number>(0);

    useEffect(() => {
        const GetSales = async () => {
            try {
                const res = await axios.get<SalesSummaryResponse>(`${apiUrl}/api/setup/sales?SearchMonth=${currentYear}-${currentMonthFormatted}`);
                const monthlySales = Number(res.data.TOTALSALES) || 0;
                const adCost = Number(res.data.TOTALADCOST) || 0;
                const rentCount = Number(res.data.TOTALRENTCNT) || 0;
                const yearlySales = Number(res.data.TOTALYEARSALES) || 0;
                const previousSales = Number(res.data.PREVIOUSYEARSALES) || 0;

                setSales(monthlySales);
                setADSales(formatMillionCut(adCost));
                setARPC(rentCount > 0 ? monthlySales / rentCount : 0);
                setYearSales(yearlySales);
                setPreviousYearSales(previousSales);
            } catch { }
        }
        GetSales()
    }, [currentMonth, currentYear]);

    const difference = sales - previousYearSales;
    const differenceRate = previousYearSales > 0 ? (difference / previousYearSales) * 100 : null;
    const comparisonColor = difference > 0 ? '#d32f2f' : difference < 0 ? '#1976d2' : '#616161';
    const comparisonSymbol = difference > 0 ? '▲' : difference < 0 ? '▼' : '―';

    const cards = [
        { label: `${currentYear}년 ${currentMonth}월 매출`, value: `${formatAmount(sales)}만원`, color: '#1565c0', strong: true },
        { label: `${currentYear - 1}년 동월 매출`, value: `${formatAmount(previousYearSales)}만원`, color: '#455a64' },
        {
            label: '전년 대비',
            value: `${comparisonSymbol} ${formatAmount(Math.abs(difference))}만원`,
            detail: differenceRate === null ? '전년도 실적 없음' : `${differenceRate >= 0 ? '+' : ''}${differenceRate.toFixed(1)}%`,
            color: comparisonColor,
            strong: true,
        },
        { label: '광고비', value: `${formatAmount(ADsales)}만원`, color: '#6a1b9a' },
        { label: '객단가', value: `${formatAmount(ARPC)}만원`, color: '#00695c' },
        { label: '연 예상 매출', value: `${formatAmount(yearSales)}만원`, color: '#e65100', strong: true },
    ];

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 1.5 }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 1,
                    maxWidth: 980,
                    mx: 'auto',
                }}
            >
                {cards.map((card) => (
                    <Paper
                        key={card.label}
                        variant="outlined"
                        sx={{
                            px: { xs: 1.25, sm: 2 },
                            py: 1.2,
                            borderRadius: 2,
                            borderLeft: `4px solid ${card.color}`,
                            bgcolor: '#fff',
                            minWidth: 0,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                            {card.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    color: card.color,
                                    fontSize: { xs: '1rem', sm: card.strong ? '1.35rem' : '1.15rem' },
                                    fontWeight: card.strong ? 900 : 800,
                                    lineHeight: 1.25,
                                }}
                            >
                                {card.value}
                            </Typography>
                            {card.detail && (
                                <Typography variant="caption" sx={{ color: card.color, fontWeight: 800 }}>
                                    {card.detail}
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

export default TotalSales;
