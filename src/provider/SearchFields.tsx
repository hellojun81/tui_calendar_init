import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Fields configuration
const fields = [
    { label: '시작일', name: 'startDate', type: 'date' },
    { label: '종료일', name: 'endDate', type: 'date' },
    { label: '고객명', name: 'customerName', type: 'text' }
];

interface FilterOption {
    label: string;
    value: string;
}

const SearchFields: React.FC<{ prarentComponent: string, formData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleSearch: () => void }> =
    ({ formData, handleChange, handleSearch }) => {


        const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
            { label: '등록일', value: '등록일' },
            { label: '대관시작일', value: '대관시작일' },
            { label: '대관종료일', value: '대관종료일' },
            { label: '수정일', value: '수정일' },
        ]);




        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: '4px',   // 간격 조정
                    marginBottom: '20px',
                    width: '100%',      // 박스가 부모 요소의 100%만 차지하도록 설정
                    justifyContent: 'space-between',  // 자식 요소 사이의 간격 균등 분배
                    alignItems: 'center',      // 수직 중앙 정렬
                    margin: '0 auto'           // 박스 자체를 부모 안에서 중앙으로 정렬
                }}
                className='search-fields-container'
            >
                <FormControl fullWidth
                    sx={{ maxHeight: '30px', height: '30px' }}
                >
                    <InputLabel id="filter-label">검색 옵션</InputLabel>
                    <Select
                        labelId="filter-label"
                        name="filterOption"
                        value={formData.filterOption || '등록일'}  // 초기값을 '등록일'로 설정
                        onChange={handleChange}
                        label="검색 옵션"
                        sx={{ maxHeight: '30px', height: '30px', fontSize: '0.9em' }}
                    >
                        {filterOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>


                {fields.map((field) => (
                    <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        className='customer-dialog-field'
                        sx={{
                            '& .MuiInputBase-root': {
                                height: field.multiline ? 'auto' : '30px',  // 멀티라인 필드는 자동 높이
                                fontSize: '0.9rem',
                            },
                            '& .MuiInputLabel-root': { fontSize: '0.9rem' },  // 라벨의 폰트 크기
                            '& .MuiInputBase-inputMultiline': {
                                height: field.rows ? `${field.rows * 10 + 10}px` : '10px',  // 멀티라인 필드의 줄 맞춤
                                paddingTop: '10px',
                            },
                            marginBottom: '1px',  // TextField들 사이의 간격을 추가로 조정 (필요한 경우)
                        }}

                    />
                ))}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    sx={{ padding: '12px 16px', whiteSpace: 'nowrap', height: '40px' }}  // 버튼 크기 줄이기
                >
                    검색
                </Button>
            </Box>
        );
    };

export default SearchFields;
