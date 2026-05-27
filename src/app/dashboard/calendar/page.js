"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_HACKATHONS } from "@/lib/mockData";
import styles from "./page.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isInRange(date, start, end) {
  return date >= start && date <= end;
}

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  }

  function goToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(null);
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays = [];

  // Empty slots before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Map hackathons to days
  const dayEvents = useMemo(() => {
    const map = {};
    MOCK_HACKATHONS.forEach((h) => {
      const start = new Date(h.start_date);
      const end = new Date(h.end_date);
      const deadline = new Date(h.registration_deadline);

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentYear, currentMonth, d);
        const key = d;
        if (!map[key]) map[key] = { events: [], deadlines: [] };

        if (isInRange(date, new Date(start.toDateString()), new Date(end.toDateString()))) {
          map[key].events.push(h);
        }
        if (isSameDay(date, deadline)) {
          map[key].deadlines.push(h);
        }
      }
    });
    return map;
  }, [currentMonth, currentYear, daysInMonth]);

  // Selected day's events
  const selectedEvents = selectedDay ? dayEvents[selectedDay] : null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>📅</span>
            Calendar
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.prompt}>&gt;_ </span>
            hackathon timeline view
          </p>
        </div>
        <Link href="/dashboard/hackathons" className={styles.browseLink}>
          🔍 Browse View
        </Link>
      </div>

      {/* Calendar Controls */}
      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prevMonth}>◀</button>
        <h2 className={styles.monthLabel}>
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button className={styles.navBtn} onClick={nextMonth}>▶</button>
        <button className={styles.todayBtn} onClick={goToday}>Today</button>
      </div>

      <div className={styles.calendarLayout}>
        {/* Calendar Grid */}
        <div className={styles.calendar}>
          {/* Day headers */}
          <div className={styles.dayHeaders}>
            {DAYS.map((d) => (
              <div key={d} className={styles.dayHeader}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className={styles.dayEmpty} />;
              }

              const isToday = isSameDay(
                new Date(currentYear, currentMonth, day),
                today
              );
              const events = dayEvents[day];
              const hasEvents = events?.events?.length > 0;
              const hasDeadlines = events?.deadlines?.length > 0;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  className={`${styles.dayCell} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""} ${hasEvents ? styles.hasEvents : ""}`}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  <div className={styles.dots}>
                    {hasEvents && <span className={styles.dotGreen} />}
                    {hasDeadlines && <span className={styles.dotGold} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Detail Sidebar */}
        <aside className={styles.eventSidebar}>
          {selectedEvents ? (
            <>
              <h3 className={styles.sidebarTitle}>
                {MONTHS[currentMonth]} {selectedDay}, {currentYear}
              </h3>
              {selectedEvents.events.length > 0 && (
                <div className={styles.eventGroup}>
                  <span className={styles.eventGroupLabel}>🟢 EVENTS</span>
                  {selectedEvents.events.map((h) => (
                    <Link
                      key={h.id}
                      href={`/dashboard/hackathons/${h.id}`}
                      className={styles.eventCard}
                    >
                      <span className={styles.eventTitle}>{h.title}</span>
                      <span className={styles.eventMeta}>
                        by {h.organizer} • {h.match_score}% match
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {selectedEvents.deadlines.length > 0 && (
                <div className={styles.eventGroup}>
                  <span className={styles.eventGroupLabel}>🟡 DEADLINES</span>
                  {selectedEvents.deadlines.map((h) => (
                    <Link
                      key={`d-${h.id}`}
                      href={`/dashboard/hackathons/${h.id}`}
                      className={`${styles.eventCard} ${styles.deadlineCard}`}
                    >
                      <span className={styles.eventTitle}>{h.title}</span>
                      <span className={styles.eventMeta}>Registration closes today</span>
                    </Link>
                  ))}
                </div>
              )}
              {selectedEvents.events.length === 0 && selectedEvents.deadlines.length === 0 && (
                <p className={styles.noEvents}>No events on this day</p>
              )}
            </>
          ) : (
            <div className={styles.sidebarEmpty}>
              <span className={styles.emptyIcon}>📅</span>
              <p>Click a day to see hackathon events</p>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.dotGreen} /> Hackathon event
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.dotGold} /> Registration deadline
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
