import React, { useRef, useEffect } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";

interface JexcelComponentProps {
  data: string[][];
  columns: any[];
  onEdit: (rowIndex: number) => void;
}

// 간단 타입 (필요 시 확장)
type JSSInstance = {
  setData: (d: any[][]) => void;
  getData: () => any[][];
  destroy: () => void;
  options?: any;
};

const JexcelComponent: React.FC<JexcelComponentProps> = ({ data, columns, onEdit }) => {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<JSSInstance | null>(null);

  useEffect(() => {
    // 기존 인스턴스 제거
    instanceRef.current?.destroy();

    if (tableRef.current) {
      const instance = jspreadsheet(tableRef.current, {
        data: data.length ? data : [[]],
        columns,
        oneditionstart: (instance: any, cell: HTMLTableCellElement, x: number, y: number) => {
          onEdit(y);
        },
      } as any);

      instanceRef.current = instance as unknown as JSSInstance;
    }

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [data, columns, onEdit]);

  return <div ref={tableRef} className="jexcel" />;
};

export default JexcelComponent;
