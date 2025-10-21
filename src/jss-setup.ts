// src/jss-setup.ts
// 1) CSS를 가장 먼저
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";

// 2) jSuites를 안전하게 가져와서 전역 주입
// 일부 번들러/타입 상황에서 default가 없을 수 있으므로 ns fallback
import * as jSuitesNS from "jsuites";
const jSuites = (jSuitesNS as any).default ?? (jSuitesNS as any);
(window as any).jSuites = jSuites;

// 3) jspreadsheet import (이 줄은 jSuites 주입 뒤!)
import jspreadsheet from "jspreadsheet-ce";
(window as any).jspreadsheet = jspreadsheet; // 선택(디버깅/플러그인용)

// 디버깅 로그
console.log("[JSS SETUP] window.jSuites =", (window as any).jSuites);
console.log("[JSS SETUP] typeof jspreadsheet =", typeof jspreadsheet);
