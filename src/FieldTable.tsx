import React from 'react';
import { Table, TableProps } from 'antd';

type FieldTableProps = {
  dataSource: TableProps<any>['dataSource'];
  columns: TableProps<any>['columns'];
};

const FieldTable: React.FC<FieldTableProps> = React.memo(({ dataSource, columns }) => (
  <Table dataSource={dataSource} columns={columns} pagination={false} />
));

export default FieldTable;
