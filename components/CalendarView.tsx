import React, { useState, useMemo } from 'react';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import { getColorClass } from '../utils/colors';
import { CalendarEvent } from '../types';
import FlagIcon from './icons/FlagIcon';
import SparklesIcon from './icons/SparklesIcon';

const CalendarView: React.FC = () => {
  const { projects } = useProjectData();
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = useMemo((): CalendarEvent[] => {
    if (!currentUser) return [];

    const allEvents: CalendarEvent[] = [];

    // 1. Add Sprints
    projects.forEach(p => {
        p.sprints.forEach(s => {
            if (s.startDate && s.endDate) {
                allEvents.push({
                    id: s.id,
                    title: `${p.title} - Sprint ${s.sprintNumber}`,
                    start: new Date(s.startDate),
                    end: new Date(s.endDate),
                    type: 'sprint',
                    colorTheme: p.colorTheme,
                    isFuture: s.status === 'planning'
                });
            }
        });
    });

    // 2. Add Retrospectives
    if (currentUser.settings.retrospectiveEnabled) {
        projects.forEach(p => {
            p.sprints.filter(s => s.status !== 'planning').forEach(s => {
                if (s.endDate) {
                     const retroDate = new Date(s.endDate);
                     retroDate.setUTCHours(18, 0, 0, 0); // Set time for the event
                     allEvents.push({
                         id: `retro-${s.id}`,
                         title: `Retrospektif: ${p.title}`,
                         start: retroDate,
                         end: retroDate,
                         type: 'retrospective',
                         colorTheme: p.colorTheme
                     })
                }
            });
        });
    }

    // 3. Add Daily Check-ins for the visible month
    if (currentUser.settings.dailyCheckinEnabled) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const [hours, minutes] = currentUser.settings.dailyCheckinTime.split(':').map(Number);

        for (let day = new Date(startOfMonth); day <= endOfMonth; day.setDate(day.getDate() + 1)) {
            // Add check-in for weekdays only (Monday to Friday)
            if (day.getDay() >= 1 && day.getDay() <= 5) {
                const checkinDate = new Date(day);
                checkinDate.setHours(hours, minutes);
                allEvents.push({
                    id: `checkin-${day.toISOString().split('T')[0]}`,
                    title: 'Günlük Check-in',
                    start: checkinDate,
                    end: checkinDate,
                    type: 'check-in'
                });
            }
        }
    }

    return allEvents;
  }, [projects, currentUser, currentDate]);


  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cuma', 'Cmt', 'Paz'];
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const startDate = new Date(startOfMonth);
  const dayOfWeek = startDate.getDay();
  const firstDayOffset = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); 
  startDate.setDate(startDate.getDate() - firstDayOffset);

  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const EventPill: React.FC<{event: CalendarEvent}> = ({ event }) => {
    switch (event.type) {
        case 'sprint':
            const solidBg = getColorClass(event.colorTheme!, 'bg');
            const lightBg = getColorClass(event.colorTheme!, 'bgLight');
            const border = getColorClass(event.colorTheme!, 'border');
            const textDark = getColorClass(event.colorTheme!, 'textDark');
            
            const baseClasses = `px-2 py-0.5 text-xs rounded truncate transition-colors duration-300 border`;
            const activeCompletedClasses = `${solidBg} text-white ${border}`;
            const futureClasses = `${lightBg} ${textDark} ${border} dark:bg-opacity-20`;

            return (
                <div title={event.title} className={`${baseClasses} ${event.isFuture ? futureClasses : activeCompletedClasses}`}>
                    {event.title}
                </div>
            );
        case 'retrospective':
            return (
                <div title={event.title} className="flex items-center space-x-1.5 px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <FlagIcon className="w-3 h-3"/>
                    <span>{event.title}</span>
                </div>
            )
        case 'check-in':
             return (
                <div title={event.title} className="flex items-center space-x-1.5 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800 border border-purple-300">
                    <SparklesIcon className="w-3 h-3"/>
                    <span>{event.title}</span>
                </div>
            )
        default:
            return null;
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">&lt;</button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">&gt;</button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-semibold py-2 bg-gray-100 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300">{day}</div>
        ))}

        {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());
            
            const dayEvents = events.filter(e => {
                const start = new Date(e.start);
                const end = new Date(e.end);
                start.setHours(0,0,0,0);
                end.setHours(23,59,59,999);
                return day >= start && day <= end;
            }).sort((a,b) => a.type.localeCompare(b.type)); // Sprints first

            return (
                <div key={index} className={`relative min-h-[120px] bg-white dark:bg-gray-800 p-2 ${isCurrentMonth ? '' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <span className={`absolute top-2 right-2 text-xs font-semibold ${isToday ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-500'}`}>
                        {day.getDate()}
                    </span>
                    <div className="mt-6 space-y-1">
                        {dayEvents.map(event => <EventPill key={event.id} event={event} />)}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default CalendarView;