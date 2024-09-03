import React, { useEffect, useRef } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';

const Spreadsheet: React.FC = () => {
  const spreadsheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spreadsheetRef.current) {
      jspreadsheet(spreadsheetRef.current, {
        data: [
          ['A1', 'B1', 'C1'],
          ['A2', 'B2', 'C2'],
          ['A3', 'B3', 'C3'],
        ],
        minDimensions: [3, 3],
        columns: [
          { type: 'text', title: 'Column A', width: 120 },
          { type: 'text', title: 'Column B', width: 120 },
          { type: 'text', title: 'Column C', width: 120 },
        ],
      });
    }
  }, []);

  return <div ref={spreadsheetRef}>234</div>;
};

export default Spreadsheet;
