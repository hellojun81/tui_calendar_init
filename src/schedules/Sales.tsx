import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';

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
    MONTHBOOKEDDAYCOUNT: number | string | null;
    MONTHAVAILABLESALESDAYS: number | string | null;
    BOOKEDDAYCOUNT: number | string | null;
    AVAILABLESALESDAYS: number | string | null;
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
    const [monthBookedDayCount, setMonthBookedDayCount] = useState<number>(0);
    const [monthAvailableSalesDays, setMonthAvailableSalesDays] = useState<number | null>(null);
    const [bookedDayCount, setBookedDayCount] = useState<number>(0);
    const [availableSalesDays, setAvailableSalesDays] = useState<number | null>(null);

    useEffect(() => {
        const GetSales = async () => {
            try {
                const res = await axios.get<SalesSummaryResponse>(`${apiUrl}/api/setup/sales?SearchMonth=${currentYear}-${currentMonthFormatted}`);
                const monthlySales = Number(res.data.TOTALSALES) || 0;
                const adCost = Number(res.data.TOTALADCOST) || 0;
                const rentCount = Number(res.data.TOTALRENTCNT) || 0;
                const yearlySales = Number(res.data.TOTALYEARSALES) || 0;
                const previousSales = Number(res.data.PREVIOUSYEARSALES) || 0;
                const monthBookedDays = Number(res.data.MONTHBOOKEDDAYCOUNT) || 0;
                const monthAvailableDays = Number(res.data.MONTHAVAILABLESALESDAYS);
                const bookedDays = Number(res.data.BOOKEDDAYCOUNT) || 0;
                const availableDays = Number(res.data.AVAILABLESALESDAYS);

                setSales(monthlySales);
                setADSales(formatMillionCut(adCost));
                setARPC(rentCount > 0 ? monthlySales / rentCount : 0);
                setYearSales(yearlySales);
                setPreviousYearSales(previousSales);
                setMonthBookedDayCount(monthBookedDays);
                setMonthAvailableSalesDays(Number.isFinite(monthAvailableDays) ? monthAvailableDays : null);
                setBookedDayCount(bookedDays);
                setAvailableSalesDays(Number.isFinite(availableDays) ? availableDays : null);
            } catch { }
        }
        GetSales()
    }, [currentMonth, currentYear]);

    const difference = sales - previousYearSales;
    const differenceRate = previousYearSales > 0 ? (difference / previousYearSales) * 100 : null;
    const comparisonColor = difference > 0 ? '#d32f2f' : difference < 0 ? '#1976d2' : '#616161';
    const comparisonSymbol = difference > 0 ? '▲' : difference < 0 ? '▼' : '―';
    const today = dayjs().startOf('day');
    const monthSalesWindowDays = (monthAvailableSalesDays || 0) + monthBookedDayCount;
    const monthBookingRate = monthAvailableSalesDays === null || monthSalesWindowDays === 0
        ? null
        : (monthBookedDayCount / monthSalesWindowDays) * 100;
    const remainingSalesWeeks = availableSalesDays === null ? 0 : Math.floor(availableSalesDays / 7);
    const remainingSalesExtraDays = availableSalesDays === null ? 0 : availableSalesDays % 7;

    const cards = [
        {
            label: `${currentYear}년 ${currentMonth}월 매출`,
            value: `${formatAmount(sales)}만원`,
            color: '#0f5faf',
            strong: true,
            highlight: true,
            tint: '#f2f7fc',
        },
        { label: `${currentYear - 1}년 동월 매출`, value: `${formatAmount(previousYearSales)}만원`, color: '#455a64' },
        {
            label: '전년 대비',
            value: `${comparisonSymbol} ${formatAmount(Math.abs(difference))}만원`,
            detail: differenceRate === null ? '전년도 실적 없음' : `${differenceRate >= 0 ? '+' : ''}${differenceRate.toFixed(1)}%`,
            color: comparisonColor,
            strong: true,
        },
        { label: '연 예상 매출', value: `${formatAmount(yearSales)}만원`, color: '#e65100', strong: true },
        { label: '광고비', value: `${formatAmount(ADsales)}만원`, color: '#6a1b9a' },
        { label: '객단가', value: `${formatAmount(ARPC)}만원`, color: '#00695c' },
        {
            label: `${currentMonth}월 판매 가능일`,
            value: monthAvailableSalesDays === null ? '계산 중' : `${monthAvailableSalesDays.toLocaleString('ko-KR')}일`,
            detail: monthAvailableSalesDays === null
                ? undefined
                : `대관 ${monthBookedDayCount}일 제외 · 대관률 ${monthBookingRate === null ? '―' : `${monthBookingRate.toFixed(1)}%`}`,
            color: '#00796b',
            strong: true,
            highlight: true,
            tint: '#f0f8f7',
        },
        {
            label: `${today.year()}년 남은 판매가능일`,
            value: availableSalesDays === null ? '계산 중' : `${availableSalesDays.toLocaleString('ko-KR')}일`,
            detail: availableSalesDays === null ? undefined : `${remainingSalesWeeks}주 ${remainingSalesExtraDays}일 · 대관 ${bookedDayCount}일 제외`,
            color: '#2e7d32',
            strong: true,
            highlight: true,
            tint: '#f2f8f3',
        },
    ];

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 0.75 }}>
            <Paper
                variant="outlined"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(4, minmax(0, 1fr))',
                        md: 'repeat(8, minmax(0, 1fr))',
                    },
                    maxWidth: 1180,
                    mx: 'auto',
                    borderRadius: 2,
                    borderColor: '#dde3e8',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
            >
                {cards.map((card, index) => (
                    <Box
                        key={card.label}
                        sx={{
                            px: { xs: 1.1, sm: 1.25 },
                            py: 0.8,
                            minHeight: 58,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            bgcolor: card.highlight ? card.tint : '#fff',
                            borderRight: {
                                xs: index % 2 === 0 ? '1px solid #edf0f2' : 0,
                                sm: index % 4 !== 3 && index !== cards.length - 1 ? '1px solid #edf0f2' : 0,
                                md: index !== cards.length - 1 ? '1px solid #edf0f2' : 0,
                            },
                            borderBottom: {
                                xs: index < cards.length - 2 ? '1px solid #edf0f2' : 0,
                                sm: index < 4 ? '1px solid #edf0f2' : 0,
                                md: 0,
                            },
                        }}
                    >
                        <Typography
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                lineHeight: 1.25,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {card.label}
                        </Typography>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    mt: 0.15,
                                    color: card.color,
                                    fontSize: { xs: '0.95rem', sm: card.strong ? '1.08rem' : '1rem' },
                                    fontWeight: card.strong ? 900 : 800,
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {card.value}
                            </Typography>
                            {card.detail && (
                                <Typography
                                    sx={{
                                        mt: 0.15,
                                        color: card.color,
                                        fontSize: '0.63rem',
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {card.detail}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};

export default TotalSales;
