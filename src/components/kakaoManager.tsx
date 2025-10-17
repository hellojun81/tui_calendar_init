import React, { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";

// 기존 알림톡 발송 컴포넌트 (제공된 코드)
import KakaoMessageSender from "./kakaoSender";

// 새로 정의할 알림톡 이력 컴포넌트 (아래 2번 섹션 참고)
import KakaoHistory from "./kakaoHistory";

// KakaoMessageSender에 전달할 Props의 타입 정의를 가져옵니다.
interface KakaoManagerProps {
  sendApiUrl: string;
  defaultID?: number;
  // ... KakaoMessageSenderProps에 정의된 다른 Props들 ...
  defaultReceiver?: string;
  defaultCustomerName?: string;
  defaultReservationStartDate?: string;
  defaultReservationStartTime?: string;
  defaultReservationEndDate?: string;
  defaultReservationEndTime?: string;
  defaultUsagePersonnel?: string;
  defaultAmount?: string;
  defaultEtc1?: string;
  defaultRentPlace?: string;
}

const KakaoManager: React.FC<KakaoManagerProps> = (props) => {
  // 탭 상태 관리: 'sender'는 발송, 'history'는 이력
  const [value, setValue] = useState("sender");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TabContext value={value}>
        {/* 탭 헤더 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="kakao message tabs"
            // 너비가 컨테이너 전체를 채우도록 설정
            variant="fullWidth"
          >
            <Tab label="알림톡 발송" value="sender" sx={{ fontSize: "0.9rem", fontWeight: 600 }} />
            <Tab label="발송 이력" value="history" sx={{ fontSize: "0.9rem", fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* 탭 컨텐츠 - 알림톡 발송 (기존 코드 유지) */}
        <TabPanel value="sender" sx={{ p: 0, pt: 2 }}>
          {/* KakaoMessageSender에 모든 props를 그대로 전달합니다. */}
          <KakaoMessageSender {...props} />
        </TabPanel>

        {/* 탭 컨텐츠 - 발송 이력 (새로운 UI) */}
        <TabPanel value="history" sx={{ p: 0, pt: 2 }}>
          <KakaoHistory id={props.defaultID ?? 0} />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default KakaoManager;
