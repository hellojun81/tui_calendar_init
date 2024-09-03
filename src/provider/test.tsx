import React, { useEffect, useRef, useState } from 'react';
import jexcel from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import { Button } from '@mui/material';

const Spreadsheet: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const jexcelInstance = useRef<any>(null);
  const [tableData, setTableData] = useState<string[][]>([
    ['Apple', '10'],
    ['Banana', '20'],
    ['Orange', '30'],
  ]);

  useEffect(() => {
    if (tableRef.current) {
      if (!jexcelInstance.current) {
        console.log("JSpreadsheet 초기화 시작");

        jexcelInstance.current = jexcel(tableRef.current, {
          data: tableData,
          columns: [
            { type: 'text', title: 'Item', width: 120 },
            { type: 'text', title: 'Quantity', width: 80 },
          ],
          // minDimensions: [2, 3],
          onselection: (instance, x1, y1, x2, y2) => {
            console.log('Selected Row Data:', y1);
          },
        });

        console.log("JSpreadsheet 초기화 완료");
      } else {
        // 기존 인스턴스에 데이터만 업데이트
        jexcelInstance.current.setData(tableData);
      }
    } else {
      console.error("tableRef.current가 null입니다.");
    }
  }, [tableData]);

  const handleSearch = () => {
    console.log('handleSearch');
    const formattedData = [
      ['Appl3e', '30'],
      ['Banan3a', '20'],
      ['Oran3ge', '30'],
    ];
    setTableData(formattedData);
  };

  return (
    <>
      <Button onClick={handleSearch}>검색</Button>
      <div ref={tableRef} style={{ width: '100%', height: '400px' }} />
    </>
  );
};

export default Spreadsheet;
