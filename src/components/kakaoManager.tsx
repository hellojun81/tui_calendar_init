import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import KakaoMessageSender from "./kakaoSender";
import KakaoHistory from "./kakaoHistory";

interface KakaoManagerProps {
  sendApiUrl: string;
  defaultID?: number;
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

/** TabPanel 대체 컴포넌트 (TabContext 없이 사용) */
function TabPanel(props: { children?: React.ReactNode; value: string; index: string; sx?: any }) {
  const { children, value, index, sx } = props;
  const hidden = value !== index;
  return (
    <div role="tabpanel" hidden={hidden} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {!hidden && <Box sx={{ p: 0, pt: 2, ...sx }}>{children}</Box>}
    </div>
  );
}

/** a11y helper */
const a11yProps = (index: string) => ({
  id: `tab-${index}`,
  "aria-controls": `tabpanel-${index}`,
});

const KakaoManager: React.FC<KakaoManagerProps> = (props) => {
  // 'sender' = 발송, 'history' = 이력
  const [value, setValue] = useState<"sender" | "history">("sender");

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    // Tabs의 value는 string이므로 그대로 반영
    setValue(newValue as "sender" | "history");
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* 탭 헤더 */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="kakao message tabs" variant="fullWidth">
          <Tab label="알림톡 발송" value="sender" sx={{ fontSize: "0.9rem", fontWeight: 600 }} {...a11yProps("sender")} />
          <Tab label="발송 이력" value="history" sx={{ fontSize: "0.9rem", fontWeight: 600 }} {...a11yProps("history")} />
        </Tabs>
      </Box>

      {/* 탭 패널 */}
      <TabPanel value={value} index="sender" sx={{ p: 0, pt: 2 }}>
        <KakaoMessageSender {...props} />
      </TabPanel>

      <TabPanel value={value} index="history" sx={{ p: 0, pt: 2 }}>
        <KakaoHistory id={props.defaultID ?? 0} />
      </TabPanel>
    </Box>
  );
};

export default KakaoManager;
