import React, { useState, useCallback } from 'react';

function Calendar({ selectedDate, onDateSelect, availableDates = [] }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Önceki ayın günleri (gri)
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDay = new Date(year, month, 1 - i);
      days.push({
        date: prevDay,
        isPrevMonth: true,
        dateKey: `${prevDay.getFullYear()}-${prevDay.getMonth() + 1}-${prevDay.getDate()}`
      });
    }
    
    // Bu ayın günleri
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateKey = `${year}-${month + 1}-${day}`;
      days.push({
        date,
        isPrevMonth: false,
        isNextMonth: false,
        dateKey,
        hasData: availableDates.includes(dateKey)
      });
    }
    
    // Sonraki ayın günleri (grid'i tamamlamak için)
    const remainingDays = 42 - days.length; // 6 hafta x 7 gün
    for (let day = 1; day <= remainingDays; day++) {
      const nextDay = new Date(year, month + 1, day);
      days.push({
        date: nextDay,
        isNextMonth: true,
        dateKey: `${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()}`
      });
    }
    
    return days;
  }, [availableDates]);

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (dateKey) => {
    return selectedDate === dateKey;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(formatDateKey(today));
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('tr-TR', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="calendar-widget card">
      <div className="calendar-header">
        <button className="btn xs" onClick={() => navigateMonth(-1)}>‹</button>
        <h3 className="calendar-month-title">{monthYear}</h3>
        <button className="btn xs" onClick={() => navigateMonth(1)}>›</button>
        <button className="btn xs primary" onClick={goToToday}>Bugün</button>
      </div>
      
      <div className="calendar-weekdays">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {days.map((dayObj, index) => {
          const { date, isPrevMonth, isNextMonth, dateKey, hasData } = dayObj;
          const isCurrentMonth = !isPrevMonth && !isNextMonth;
          
          return (
            <button
              key={index}
              className={`calendar-day ${
                !isCurrentMonth ? 'other-month' : ''
              } ${isToday(date) ? 'today' : ''} ${
                isSelected(dateKey) ? 'selected' : ''
              } ${hasData ? 'has-data' : ''}`}
              onClick={() => onDateSelect(dateKey)}
              disabled={!isCurrentMonth}
            >
              {date.getDate()}
              {hasData && <div className="data-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;