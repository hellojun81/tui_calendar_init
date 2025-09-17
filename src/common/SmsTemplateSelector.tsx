// src/components/SmsTemplateSelector.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";

type Template = {
  id: number;
  title: string;
  body: string;
};

interface Props {
  defaultUse?: "Y" | "N"; // 사용여부 필터 (기본 Y)
  onChangeBody?: (body: string) => void; // 외부 폼과 연동 필요 시
}

export default function SmsTemplateSelector({
  defaultUse = "Y",
  onChangeBody,
}: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [body, setBody] = useState("");

  const API_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL_PRODUCTION
      : process.env.REACT_APP_API_URL_LOCAL;

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await axios.get<Template[]>(`${API_URL}/api/sms`, {
          params: { use: defaultUse },
        });
        setTemplates(data || []);
        if (data && data.length > 0) {
          setSelectedId(data[0].id);
          setBody(data[0].body);
          onChangeBody?.(data[0].body);
        }
      } catch (e: any) {
        setErr(e?.message || "불러오기 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
    // defaultUse가 바뀌면 다시 로드
  }, [API_URL, defaultUse, onChangeBody]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedId),
    [templates, selectedId]
  );

  const handleSelectChange = (e: any) => {
    const id = e.target.value as number;
    setSelectedId(id);
    const t = templates.find((x) => x.id === id);
    const nextBody = t?.body || "";
    setBody(nextBody);
    onChangeBody?.(nextBody);
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : err ? (
        <Typography color="error">{err}</Typography>
      ) : (
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel id="sms-template-label">제목</InputLabel>
            <Select
              labelId="sms-template-label"
              label="제목"
              value={selectedId}
              onChange={handleSelectChange}
              displayEmpty
            >
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.title}
                </MenuItem>
              ))}
              {templates.length === 0 && (
                <MenuItem value="" disabled>
                  (템플릿 없음)
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="내용"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              onChangeBody?.(e.target.value);
            }}
            multiline
            minRows={5}
            fullWidth
          />
        </Stack>
      )}

      {/* 선택된 템플릿 정보가 필요하면 아래처럼 참조 가능 */}
      {/* <pre>{JSON.stringify(selectedTemplate, null, 2)}</pre> */}
    </Box>
  );
}
