import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { apiUrl } from "../utils/scheduleUtils";

interface ColumnData {
  displayName: string;
  fieldName: string;
  Type: string;
  id: number;
}

interface ColumnTableProps {
  tableName: string | null;
  fieldName: string | null;
  typeName: string | null;
}

const { Option } = Select;

const ColumnTable: React.FC<ColumnTableProps> = ({ tableName }) => {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false); // AntD v5면 open으로 바꾸세요
  const [editingColumn, setEditingColumn] = useState<ColumnData | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchColumns = async () => {
    if (!tableName) return;
    try {
      setLoading(true);
      const response = await axios.get<ColumnData[]>(`${apiUrl}/api/columns`, {
        params: { tableName },
      });
      setColumns(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
    // tableName이 바뀌면 새로 로드
  }, [tableName]);

  /** 추가 모달 열기 */
  const showAddModal = () => {
    form.resetFields();
    setEditingColumn(null);
    setSelectedType(null);
    setIsModalVisible(true);
  };

  /** 수정 모달 열기 */
  const showEditModal = (column: ColumnData) => {
    setEditingColumn(column);

    // VARCHAR(255) 같은 형태 파싱
    const typeMatch = column.Type.match(/^(\w+)\((.+)\)$/);
    if (typeMatch) {
      form.setFieldsValue({
        id: column.id,
        displayName: column.displayName,
        type: `${typeMatch[1]}(${typeMatch[2]})`,
        options: typeMatch[2],
      });
      setSelectedType(typeMatch[1]); // enum/set 감지용
    } else {
      form.setFieldsValue({
        id: column.id,
        displayName: column.displayName,
        type: column.Type,
        options: "",
      });
      setSelectedType(column.Type);
    }

    setIsModalVisible(true);
  };

  /** 타입 선택 변경 */
  const handleTypeChange = (value: string) => {
    setSelectedType(value.toLowerCase());
    // enum/set 선택 시 options는 사용자가 입력
    // VARCHAR(255) 등은 그대로 값 사용
  };

  const isEnumOrSet = selectedType === "enum" || selectedType === "set";

  /** onOk - 추가 */
  const handleOkAdd = async () => {
    if (!tableName) return;
    try {
      const values = await form.validateFields();
      // enum/set 이면 DB에 전달할 type을 enum(...) / set(...) 형태로 조합
      const typeToSend =
        values.type.toLowerCase() === "enum" || values.type.toLowerCase() === "set" ? `${values.type.toLowerCase()}(${values.options})` : values.type;

      const response = await axios.post<ColumnData>(`${apiUrl}/api/columns`, {
        tableName,
        displayName: values.displayName,
        type: typeToSend,
        options: values.options, // 서버에서 필요하다면 사용
      });

      setColumns((prev) => [...prev, response.data]);
      await fetchColumns();
      form.resetFields();
      setIsModalVisible(false);
      message.success("Column added successfully");
    } catch (err: any) {
      if (err?.errorFields) return; // form validation 실패
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  /** onOk - 수정 */
  const handleOkEdit = async () => {
    if (!tableName) return;
    try {
      const values = await form.validateFields();

      const baseType = (values.type as string).toLowerCase();
      const typeToSend = baseType === "enum" || baseType === "set" ? `${baseType}(${values.options})` : values.type;

      await axios.put<ColumnData>(`${apiUrl}/api/columns`, {
        tableName,
        id: values.id,
        newName: values.displayName,
        type: typeToSend,
        options: values.options,
      });

      await fetchColumns();
      form.resetFields();
      setIsModalVisible(false);
      setEditingColumn(null);
      message.success("Column updated successfully");
    } catch (err: any) {
      if (err?.errorFields) return;
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  /** 삭제 */
  const handleDeleteColumn = async (column: ColumnData) => {
    if (!tableName) return;
    try {
      await axios.delete(`${apiUrl}/api/columns/${tableName}?id=${column.id}`);
      await fetchColumns();
      message.success("Column deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const tableColumns: ColumnsType<ColumnData> = [
    { title: "디스플레이명", dataIndex: "displayName" },
    { title: "타입", dataIndex: "Type" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button onClick={() => showEditModal(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteColumn(record)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
        Add Column
      </Button>

      <Table dataSource={columns} columns={tableColumns} rowKey="id" />

      <Modal
        title={editingColumn ? "수정" : "추가"}
        // AntD v4
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={editingColumn ? handleOkEdit : handleOkAdd}
        // AntD v5를 쓰면 위의 두 줄을 아래처럼 바꾸세요:
        // open={isModalVisible}
        // onCancel={() => setIsModalVisible(false)}
        // onOk={editingColumn ? handleOkEdit : handleOkAdd}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" label="ID">
            <Input disabled />
          </Form.Item>

          <Form.Item name="displayName" label="Display Name" rules={[{ required: true, message: "Please enter the column name" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="type" label="Column Type" rules={[{ required: true, message: "Please select the column type" }]}>
            <Select placeholder="입력할 정보 타입을 선택하세요" onChange={handleTypeChange}>
              <Option value="VARCHAR(255)">텍스트(VARCHAR)</Option>
              <Option value="INT">숫자(INT)</Option>
              <Option value="DATE">날짜(DATE)</Option>
              <Option value="BOOLEAN">토글(BOOLEAN)</Option>
              <Option value="enum">enum</Option>
              <Option value="set">set</Option>
            </Select>
          </Form.Item>

          {isEnumOrSet && (
            <Form.Item name="options" label="옵션 정보" rules={[{ required: true, message: "Please enter the options for the ENUM or SET" }]}>
              <Input placeholder="예: 'A','B','C' 또는 '1','2','3'" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ColumnTable;
