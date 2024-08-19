import React, { useCallback, useRef } from "react";
import { render } from "react-dom";

import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule, ICalendarInfo } from "tui-calendar";

import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";

import "./styles.css";

const start = new Date("2024-08-01");
const end = new Date(new Date().setMinutes(start.getMinutes() + 15));
const schedules: ISchedule[] = [
  {
    calendarId: "1",
    category: "allday",
    isVisible: true,
    title: "Launch - Sentinel-6",
    id: "1",
    body: "Test",
    start,
    end
  },
  {
    calendarId: "2",
    category: "allday",
    isVisible: true,
    title: "Static Fire - NROL-64",
    id: "2",
    body: "Description",
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2))
  },
  {
    calendarId: "3",
    category: "allday",
    isVisible: true,
    title: "Launch - NROL-44",
    id: "3",
    body: "Description",
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2))
  },
  {
    calendarId: "1",
    category: "allday",
    isVisible: true,
    title: "LRR - NROL-44",
    id: "4",
    body: "Description",
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2))
  },
  {
    calendarId: "2",
    category: "allday",
    isVisible: true,
    title: "LRR - NROL-44",
    id: "4",
    body: "Description",
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2))
  }
];

const calendars: ICalendarInfo[] = [
  {
    id: "1",
    name: "Sentinel-6",
    color: "#FFFFFF",
    bgColor: "#FF9800",
    dragBgColor: "#FF9800",
    borderColor: "#FF9800"
  },
  {
    id: "2",
    name: "NROL-64",
    color: "#ffffff",
    bgColor: "#034E77",
    dragBgColor: "#034E77",
    borderColor: "#034E77"
  },
  {
    id: "3",
    name: "NROL-44",
    color: "#ffffff",
    bgColor: "#388E3C",
    borderColor: "#388E3C"
  },
  {
    id: "4",
    name: "NROL-44",
    color: "#ffffff",
    bgColor: "#388E3C",
    borderColor: "#388E3C"
  }
];

function App() {
  const cal = useRef(null);
  const onClickSchedule = useCallback((e) => {
    console.log('onClickSchedule')
    const { calendarId, id } = e.schedule;
    const el = cal.current.calendarInst.getElement(id, calendarId);

    console.log(e, el.getBoundingClientRect());
  }, []);

  const onBeforeCreateSchedule = useCallback((scheduleData) => {
    console.log('onBeforeCreateSchedule');
    const schedule = {
      id: String(Math.random()),
      title: scheduleData.title,
      isAllDay: scheduleData.isAllDay,
      start: scheduleData.start,
      end: scheduleData.end,
      category: scheduleData.isAllDay ? "allday" : "time",
      dueDateClass: "",
      location: scheduleData.location,
      raw: {
        class: scheduleData.raw["class"]
      },
      state: scheduleData.state
    };

    cal.current.calendarInst.createSchedules([schedule]);
  }, []);

  const onBeforeDeleteSchedule = useCallback((res) => {
    console.log('onBeforeDeleteSchedule')
    console.log(res);

    const { id, calendarId } = res.schedule;

    cal.current.calendarInst.deleteSchedule(id, calendarId);
  }, []);

  const onBeforeUpdateSchedule = useCallback((e) => {
    console.log(e);

    const { schedule, changes } = e;

    cal.current.calendarInst.updateSchedule(
      schedule.id,
      schedule.calendarId,
      changes
    );
  }, []);
  const onClickNextButton = () => {
    cal.current.calendarInst.next();
  };



  function _getFormattedTime(time) {
    const date = new Date("2024-09-01");
    const h = date.getHours();
    const m = date.getMinutes();

    return `${h}:${m}`;
  }

  function _getTimeTemplate(schedule, isAllDay) {
   console.log('_getTimeTemplate')
    var html = [];

    if (!isAllDay) {
      html.push("<strong>" + _getFormattedTime(schedule.start) + "</strong> ");
    }
    if (schedule.isPrivate) {
      html.push('<span class="calendar-font-icon ic-lock-b"></span>');
      html.push(" Private");
    } else {
      if (schedule.isReadOnly) {
        html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
      } else if (schedule.recurrenceRule) {
        html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
      } else if (schedule.attendees.length) {
        html.push('<span class="calendar-font-icon ic-user-b"></span>');
      } else if (schedule.location) {
        html.push('<span class="calendar-font-icon ic-location-b"></span>');
      }
      html.push(" " + schedule.title);
    }

    return html.join("");
  }

  const templates = {
    time: function (schedule) {
      console.log('templates')
      console.log(schedule);
      return _getTimeTemplate(schedule, false);
    }
  };

  return (
    <div className="App">
      <h1>PlanIt</h1>
      <button onClick={onClickNextButton}>다음 달로 이동</button>
      <TUICalendar
        ref={cal}
        height="1000px"
        view="month"
        useCreationPopup={true}
        useDetailPopup={true}
        // template={templates}
        calendars={calendars}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeDeleteSchedule={onBeforeDeleteSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
