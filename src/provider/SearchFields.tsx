import React, { useState, useEffect } from 'react';
import { Box, Button, TextField } from '@mui/material';
import GetCsKind from "../schedules/Get_csKind";
interface FieldsOption {
    label: string;
    name: string;
    type: string;
}

const SearchFields: React.FC<{ 
    prarentComponent: string, 
    formData: any, 
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    handleSearch: () => void, 
    onCsKindChange: (value: number) => void // 부모 컴포넌트로 csKind 값을 넘기기 위한 prop 추가
}> = ({ prarentComponent, formData, handleChange, handleSearch, onCsKindChange }) => {

    const [csKind, setCsKind] = useState<number>(0);
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

        const handleCsKindChange = (value: number) => {
            setCsKind(value);
            onCsKindChange(value); // 부모에게 csKind 전달
        };

        

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '10px',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // margin: '0 0 10px 0',
                    // paddingBottom:'100px',
                    // backgroundColor:'red'
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
                    {/* GetCsKind의 너비를 20%로 설정 */}
                    {prarentComponent !== 'provider' && (
                        <Box sx={{  width:'100%',maxWidth: '30%', display: 'flex', alignItems: 'center' }}>
                            <GetCsKind  onValueChange={handleCsKindChange} csKind={csKind} 
                            />
                        </Box>
                    )}
      
                    <TextField
                        label="고객명"
                        name="customerName"
                        type="text"
                        value={formData.customerName}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        sx={{ flexShrink: 0 }}
                    >
                        검색
                    </Button>
                </Box>

            </Box>
        );
    };

export default SearchFields;

