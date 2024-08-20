import React, { useState } from 'react';
import { Table, Layout, Collapse, Button, Modal, Form, Input, Select, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SetupLink from './setup_link';
import FieldTable from './FieldTable';
import ColumnTable from './ColumnTable';


const { Sider, Content } = Layout;
const { Option } = Select;
const { Panel } = Collapse;

type FieldData = {
  key: string;
  fieldName: string;
  dataType: string;
  fieldUse: boolean;
};

type DataStructure = {
  [key: string]: FieldData[];
};

const initialData: DataStructure = {
  스케쥴_관리: [
    { key: '1', fieldName: '거래처명', dataType: '텍스트 (String)', fieldUse: true },
    { key: '2', fieldName: '대관일', dataType: '텍스트 (String)', fieldUse: true },
    { key: '3', fieldName: '이메일', dataType: '텍스트 (String)', fieldUse: true },
    { key: '4', fieldName: '주소', dataType: '텍스트 (String)', fieldUse: false },
  ],
  거래처_관리: [
    { key: '1', fieldName: '거래처명', dataType: '텍스트 (String)', fieldUse: true },
    { key: '2', fieldName: '연락처', dataType: '텍스트 (String)', fieldUse: true },
    { key: '3', fieldName: '이메일', dataType: '텍스트 (String)', fieldUse: true },
    { key: '4', fieldName: '주소', dataType: '텍스트 (String)', fieldUse: false },
  ],
  CS_관리: [
    { key: '1', fieldName: '거래처명', dataType: '단수선택 리스트 (Single List)', fieldUse: true },
    { key: '2', fieldName: '대관일', dataType: '숫자 (Number)', fieldUse: true },
    { key: '3', fieldName: '의뢰 항목', dataType: '복수선택 리스트 (Multi List)', fieldUse: false },
    { key: '4', fieldName: '문의 일시', dataType: '날짜 (Date)', fieldUse: true },
  ],
};

const FieldSettings = () => {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldData | null>(null);
  const [form] = Form.useForm();

  const handleAddOrEditField = () => {
    form.validateFields().then((values) => {
      const newField: FieldData = {
        key: editingField ? editingField.key : (data[activeTab!].length + 1).toString(),
        fieldName: values.fieldName,
        dataType: values.dataType,
        fieldUse: values.fieldUse,
      };

      if (editingField) {
        const updatedData = data[activeTab!].map((item) =>
          item.key === editingField.key ? newField : item
        );
        setData({ ...data, [activeTab!]: updatedData });
      } else {
        setData({ ...data, [activeTab!]: [...data[activeTab!], newField] });
      }

      form.resetFields();
      setIsModalVisible(false);
      setEditingField(null);
    });
  };

  const handleEdit = (record: FieldData) => {
    setEditingField(record);
    form.setFieldsValue({
      fieldName: record.fieldName,
      dataType: record.dataType,
      fieldUse: record.fieldUse,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setData({
      ...data,
      [activeTab!]: data[activeTab!].filter((item) => item.key !== key),
    });
  };

  const handleAddField = () => {
    setIsModalVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const columns = [
    {
      title: '필드 이름',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: '데이터 타입',
      dataIndex: 'dataType',
      key: 'dataType',
    },
    {
      title: '필드 사용',
      dataIndex: 'fieldUse',
      key: 'fieldUse',
      render: (fieldUse: boolean) => (fieldUse ? 'Yes' : 'No'),
    },
    {
      title: '액션',
      key: 'action',
      render: (_: any, record: FieldData) => (
        <>
          <EditOutlined style={{ marginRight: 8 }} onClick={() => handleEdit(record)} />
          <DeleteOutlined onClick={() => handleDelete(record.key)} />
        </>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      <Sider width={200} className="site-layout-background">
        <SetupLink />
      </Sider>
      <Layout>
        <Content style={{ padding: '0 24px', minHeight: 280 }}>
          <div style={{ minHeight: 280 }}>
            <h2>필드 설정</h2>
            <Collapse accordion onChange={handleTabChange}>
            <Panel header={'거래처 관리'}>
            <ColumnTable tableName={'provider'} fieldName={'test'} typeName={''}/>
            </Panel>
            <Panel header={'CS 관리'}>>
            <ColumnTable tableName={'cs_table'} fieldName={'test'} typeName={''}/>
            </Panel>
              {/* {Object.keys(data).map((tab) => (
                <Panel header={tab} key={tab}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddField}
                    style={{ marginBottom: 16 }}
                  >
                    필드 추가하기
                  </Button>
                  <FieldTable dataSource={data[tab]} columns={columns} />
                </Panel>
              ))} */}
      
            </Collapse>
          </div>
          <Modal
            title={editingField ? '필드 수정하기' : '필드 추가하기'}
            visible={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              setEditingField(null);
              form.resetFields();
            }}
            onOk={handleAddOrEditField}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="fieldName"
                label="필드 이름"
                rules={[{ required: true, message: '필드 이름을 입력해주세요' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="dataType"
                label="데이터 타입"
                rules={[{ required: true, message: '데이터 타입을 선택해주세요' }]}
              >
                <Select>
                  <Option value="텍스트 (VARCHAR(255))">텍스트 (String)</Option>
                  <Option value="숫자 (INT)">숫자 (Number)</Option>
                  <Option value="날짜 (Date)">날짜 (Date)</Option>
                  <Option value="시간 (Time)">시간 (Time)</Option>
                  <Option value="토클 (Boolean)">토클 (Boolean)</Option>
                  <Option value="단수선택(ENUM)">단수선택 (Single List)</Option>
                  <Option value="복수선택 (Multi List)">복수선택 (Multi List)</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="fieldUse"
                label="필터 사용"
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default FieldSettings;
