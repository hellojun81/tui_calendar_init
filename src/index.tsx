import React, { useCallback, useRef, useState, useEffect } from "react";
import { render } from "react-dom";
import TUICalendar from "@toast-ui/react-calendar";
// import { ISchedule, ICalendarInfo } from "tui-calendar";

import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import Menu from './menu'
import "./styles.css";
function App(){
  return (
    <div className="App">
<Menu/>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
