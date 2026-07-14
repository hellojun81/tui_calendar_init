import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button, // 🚨 Button import 추가
} from "@mui/material";
// import GetCsKind from "../schedules/get_csKind"; // 🚨 GetCsKind는 직접 렌더링으로 대체

// 은행 거래 유형 옵션
const TRADE_TYPE_OPTIONS = [
  { value: 0, label: "전체" },
  { value: 1, label: "입금" },
  { value: 2, label: "출금" },
];

// CS 유형 옵션 (GetCsKind를 대체하여 직접 정의하거나, 별도 상수 파일에서 가져와야 함)
// 임시로 기본 옵션을 정의합니다.
const CS_KIND_OPTIONS = [
  { value: 0, label: "전체" },
  { value: 1, label: "단순문의" },
  { value: 2, label: "대관" },
  { value: 3, label: "답사" },
  { value: 4, label: "가부킹" },
  { value: 5, label: "기타" },
  // ... 필요한 CS 유형을 여기에 추가하세요.
];

interface SearchFieldsProps {
  prarentComponent: "cs" | "bank" | "provider"; // 부모 컴포넌트 타입을 명시
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
  onCsKindChange: (value: number | string) => void;
  onTradeTypeChange?: (value: number | string) => void;
  accountOptions?: Array<{ label: string; value: string; accountIDs: string[] }>;
  onAccountChange?: (value: string) => void;
}

// 🚨 interface와 실제 컴포넌트 props 타입을 일치시켰습니다.
const SearchFields: React.FC<SearchFieldsProps> = ({
  prarentComponent,
  formData,
  handleChange,
  handleSearch,
  onCsKindChange,
  onTradeTypeChange, // BankTransactions 컴포넌트에서 전달받음
  accountOptions = [],
  onAccountChange,
}) => {
  // 1. 현재 컴포넌트 유형에 맞는 옵션, 값, 핸들러, 라벨을 결정합니다.
  const isBank = prarentComponent === "bank";
  const isCs = prarentComponent === "cs";

  // 렌더링할 드롭다운의 옵션 목록
  const options = isBank ? TRADE_TYPE_OPTIONS : CS_KIND_OPTIONS;
  // 드롭다운 라벨
  const selectLabel = isBank ? "거래 유형" : "CS 유형";
  // formData에서 접근할 값의 키 ('tradeType' 또는 'csKind')
  const selectValueKey = isBank ? "tradeType" : "csKind";
  // Select 변경 시 호출할 핸들러
  // bank 컴포넌트에서 onTradeTypeChange를 넘겨줬을 경우 그것을 사용하고,
  // cs 컴포넌트에서는 onCsKindChange를 사용합니다.
  const changeHandler = isBank ? onTradeTypeChange : onCsKindChange;

  // 텍스트 검색 필드의 라벨 및 키
  const searchFieldLabel = isBank ? "적요" : "고객명";
  const searchFieldKey = isBank ? "description" : "customerName";

  if (isBank) {
    return (
      <Box
        className="search-fields-container"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "minmax(150px, 0.8fr) minmax(175px, 1fr) minmax(175px, 1fr) minmax(130px, 0.7fr) minmax(220px, 1.4fr) 72px",
          },
          gap: 1.5,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <FormControl fullWidth>
          <InputLabel>계좌</InputLabel>
          <Select value={formData.accountID || ""} label="계좌" onChange={(e) => onAccountChange?.(String(e.target.value))}>
            <MenuItem value="">전체 계좌</MenuItem>
            {accountOptions.map((account) => (
              <MenuItem key={account.value} value={account.value}>
                {account.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{selectLabel}</InputLabel>
          <Select
            value={formData[selectValueKey] || 0}
            label={selectLabel}
            onChange={(e) => changeHandler?.(e.target.value)}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="시작일"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="종료일"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label={searchFieldLabel}
          name={searchFieldKey}
          type="text"
          value={formData[searchFieldKey] || ""}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch} fullWidth sx={{ minHeight: 56 }}>
          검색
        </Button>
      </Box>
    );
  }

  // *필수: CS컴포넌트에서 CS유형을 별도의 상태로 관리해야 하는 경우를 위해
  // onCsKindChange는 그대로 유지하지만, 내부 로직은 formData 기반으로 변경되었습니다.

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: "10px",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="search-fields-container"
    >
      {/* 1. 시작일과 종료일 필드 */}
      {(isBank || isCs) && ( // Bank와 CS일 때만 표시
        <Box sx={{ display: "flex", width: "100%", gap: "12px" }}>
          <TextField
            label={isCs ? "등록시작일" : "시작일"} // CS일 때 '등록시작일'로 라벨 변경
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
          <TextField
            label={isCs ? "등록종료일" : "종료일"} // CS일 때 '등록종료일'로 라벨 변경
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1 }}
          />
        </Box>
      )}

      {/* 2. 드롭다운, 검색어 필드, 검색 버튼 */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: "12px",
          alignItems: "center",
        }}
      >
        {/* CS 유형 또는 거래 유형 드롭다운 */}
        {(isBank || isCs) && (
          <FormControl sx={{ flexShrink: 0, minWidth: 100 }}>
            <InputLabel>{selectLabel}</InputLabel>
            <Select
              // ⚠️ formData에서 동적 키로 값을 가져옴 (csKind 또는 tradeType)
              value={formData[selectValueKey] || 0}
              label={selectLabel}
              onChange={(e) => changeHandler && changeHandler(e.target.value)}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* 검색어 필드 (고객명 또는 계좌번호) */}
        <TextField
          label={searchFieldLabel}
          // ⚠️ formData에서 동적 키로 값을 가져옴 (customerName 또는 accountNumber)
          name={searchFieldKey}
          type="text"
          value={formData[searchFieldKey] || ""}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ flexGrow: 1 }}
        />

        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ flexShrink: 0 }}>
          검색
        </Button>
      </Box>
    </Box>
  );
};

export default SearchFields;
