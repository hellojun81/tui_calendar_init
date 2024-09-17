import React, { useState, useEffect } from 'react';
import { Box, Button, TextField } from '@mui/material';

interface FieldsOption {
    label: string;
    name: string;
    type: string;
}

const SearchFields: React.FC<{ prarentComponent: string, formData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleSearch: () => void }> =
    ({ prarentComponent, formData, handleChange, handleSearch }) => {

        const [fields, setFields] = useState<FieldsOption[]>([
            { label: '시작일', name: 'startDate', type: 'date' },
            { label: '종료일', name: 'endDate', type: 'date' },
            { label: '고객명', name: 'customerName', type: 'text' }
        ]);

        useEffect(() => {
            if (prarentComponent === 'provider') {
                setFields([{ label: '고객명', name: 'customerName', type: 'text' }]);
            } else if (prarentComponent === 'cs') {
                setFields([
                    { label: '등록시작일', name: 'startDate', type: 'date' },
                    { label: '등록종료일', name: 'endDate', type: 'date' },
                    { label: '고객명', name: 'customerName', type: 'text' }
                ]);
            }
        }, [prarentComponent]);

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '20px',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 auto'
                }}
                className='search-fields-container'
            >
                {/* 시작일과 종료일을 provider일 경우 숨김 */}
                {prarentComponent !== 'provider' && (
                    <Box sx={{ display: 'flex', width: '100%', gap: '12px' }}>
                        <TextField
                            label="등록시작일"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1 }}  // 50% 너비 설정
                        />
                        <TextField
                            label="등록종료일"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1 }}  // 50% 너비 설정
                        />
                    </Box>
                )}

                {/* 고객명과 검색 버튼을 다음 줄에 배치 */}
                <Box sx={{ display: 'flex', width: '100%', gap: '12px', alignItems: 'center' }}>
                    <TextField
                        label="고객명"
                        name="customerName"
                        type="text"
                        value={formData.customerName}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        // sx={{ padding: '12px 16px', whiteSpace: 'nowrap', height: '35px' }}  // 버튼 크기 줄이기
                    >
                        검색
                    </Button>
                </Box>
            </Box>
        );
    };

export default SearchFields;
