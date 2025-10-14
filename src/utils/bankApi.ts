export type BankRow = {
  id: number;
  tx_datetime: string; // e.g. '2025-09-03 13:35:28'
  deposit_amount: number | null;
  withdraw_amount: number | null;
  balance: number | null;
  summary: string | null;
  memo: string | null;
  bank_name: string | null;
  account_no: string | null;
  channel?: string | null;
  flow_type?: string | null;
  customer_name?: string | null; // savePayTypes에서 사용
  pay_type?: string | null;       // jspreadsheet의 '구분' 값 (DB 저장 값)
  payment_type?: string | null;   // 백엔드 호환성을 위해 추가 (getPayType에서 참조)
  tag?: string | null;            // 백엔드 호환성을 위해 추가 (getPayType에서 참조)
};

export interface FetchBankParams {
  start?: string; // 'YYYY-MM-DD'
  end?: string; // 'YYYY-MM-DD'
  keyword?: string;
  onlyDeposit?: boolean;
  baseUrl?: string; // e.g. 'http://localhost:8001'
  path?: string; // e.g. '/api/bank'
}

export async function fetchBankTransactions({
  start,
  end,
  keyword,
  onlyDeposit = true,
  baseUrl = "http://localhost:8001",
  path = "/api/bank",
}: FetchBankParams): Promise<BankRow[]> {
  const params = new URLSearchParams();
  console.log('keyword', keyword)
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  if (keyword) params.set("keyword", keyword);
  if (onlyDeposit) params.set("onlyDeposit", "1");

  const res = await fetch(`${baseUrl}${path}?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? [];
}
