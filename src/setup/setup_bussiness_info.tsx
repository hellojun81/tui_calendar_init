import React, { useState } from 'react';
import { Layout, Menu, Form, Input, Button, Tag, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import SetupLink from './setup_link';

const { Sider, Content } = Layout;
const GeneralSettings = () => {
  const [tags, setTags] = useState<string[]>(['할일', '법인(행사)', '비영리(대관)', '기타']);
  const [inputValue, setInputValue] = useState('');
  const [inputVisible, setInputVisible] = useState(false);

  const handleClose = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
      <SetupLink/>
      </Sider>
      <Layout>
        <Content style={{ padding: '0 24px', minHeight: 280 }}>
          <h2>일반 설정</h2>
          <Form layout="vertical">
            <Form.Item label="비즈니스 이름" required>
              <Input defaultValue="(주) 타울" />
            </Form.Item>
            <Form.Item label="비즈니스 표시 컬러" required>
              <Input type="color" defaultValue="#E5E7EC" />
            </Form.Item>
            <Form.Item label="의뢰 업무">
              <div>
                {tags.map((tag, index) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleClose(tag)}
                    style={{ marginBottom: 8 }}
                  >
                    {tag}
                  </Tag>
                ))}
                {inputVisible ? (
                  <Input
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                  />
                ) : (
                  <Tag onClick={() => setInputVisible(true)} style={{ background: '#fff', borderStyle: 'dashed' }}>
                    <PlusOutlined /> 추가
                  </Tag>
                )}
              </div>
            </Form.Item>
            <Button type="primary">저장하기</Button>
          </Form>
        </Content>
      </Layout>
    </Layout>
  );
};

export default GeneralSettings;
