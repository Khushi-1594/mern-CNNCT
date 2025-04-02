import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useAuthStore } from "../store/authStore"
import { toZonedTime } from 'date-fns-tz';
import TimezoneSelect from 'react-timezone-select';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { enUS } from 'date-fns/locale';
import { CalendarCheck2, List } from 'lucide-react';
import '../styles/Availability.css';
import AvailabilityView from '../components/AvailabilityView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Availability = () => {
  const [activeTab, setActiveTab] = useState('availability');
  const [meetings, setMeetings] = useState([]);
  const [view, setView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState({
    value: 'Asia/Kolkata',
    label: 'Indian Standard Time (IST)',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const {user} = useAuthStore();
  const locales = {
    'en-US': enUS
  };
  const userId = user._id;
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchMeetings();
    }
  }, [activeTab, selectedTimezone]);

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const executeSearch = () => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      setView('day');
      fetchMeetings(searchQuery);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const fetchMeetings = async (query = searchQuery) => {
    try {
      console.log("Fetching meetings for query:", query);
      const response = await axios.get(`${API_BASE_URL}/api/availability/calendar-view`, {
        params: {
          timezone: selectedTimezone.value,
          searchQuery: query
        },
        withCredentials: true
      });

      const data = response.data;
      
      if (data.success) {
        const formattedEvents = data.meetings.map(meeting => {
          const startDate = new Date(meeting.date);
          const endDate = new Date(startDate.getTime() + meeting.duration * 3600000);
   
          const start = toZonedTime(startDate, selectedTimezone.value);
          const end = toZonedTime(endDate, selectedTimezone.value);
          console.log(meeting.participants);
          const currentUserStatus = meeting.participants?.find(
            (p) => p.user === userId
          )?.status;

          console.log(currentUserStatus);

          let backgroundColor;
          if (currentUserStatus === "rejected") {
            backgroundColor = "gray";
          } else {
            backgroundColor = Math.random() > 0.5 ? "#ADD8E6" : "#D8BFD8"; 
          }
          
          return {
            id: meeting._id,
            title: meeting.title || "Untitled Meeting",
            start,
            end,
            backgroundColor,
            formattedDate: meeting.formattedDate,
            formattedTime: meeting.formattedTime,
            participantStatus: meeting.participants ? meeting.participants.map(p => ({ 
            id: p._id, 
            status: p.status 
          })) : []
          };
        });

        setMeetings(formattedEvents)
  
        if (isSearching && formattedEvents.length > 0) {
          setView('day');
          setSelectedDate(formattedEvents[0].start);
          setIsSearching(false);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setIsSearching(false);
    }
  };


  const YearView = () => {
    const now = new Date(selectedDate);
    const year = now.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  
    const yearMeetings = meetings.filter(meeting => 
      meeting.start.getFullYear() === year
    );
    
    const meetingsByMonth = months.map(month => {
      const monthIndex = month.getMonth();
      const monthName = format(month, 'MMMM');
      const monthMeetings = yearMeetings.filter(meeting => 
        meeting.start.getMonth() === monthIndex
      );
      
      return { monthName, monthIndex, meetings: monthMeetings };
    });
    return (
      <div className="year-view">
        <h2>{year} Calendar</h2>
        <div className="months-grid">
          {meetingsByMonth.map(month => (
            <div className="month-card" key={month.monthIndex}>
              <h3>{month.monthName}</h3>
              <div className="month-meetings">
                {month.meetings.length > 0 ? (
                  <ul>
                    {month.meetings.slice(0, 5).map(meeting => (
                      <li key={meeting.id} style={{ backgroundColor: meeting.backgroundColor }}>
                        {format(meeting.start, 'MMM d')} - {meeting.title}
                      </li>
                    ))}
                    {month.meetings.length > 5 && (
                      <li className="more-meetings">
                        +{month.meetings.length - 5} more meetings
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="no-meetings">No meetings</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleViewChange = (newView) => {
    console.log("Changing view to:", newView);
  console.log("Meetings data:", meetings);
    setView(newView);
  };

  const handleNavigate = (action) => {
    let newDate = new Date(selectedDate);
  
    if (action === "NEXT") {
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else if (view === "day") {
        newDate.setDate(newDate.getDate() + 1);
      } else if (view === "year") {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    } else if (action === "PREV") {
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else if (view === "day") {
        newDate.setDate(newDate.getDate() - 1);
      } else if (view === "year") {
        newDate.setFullYear(newDate.getFullYear() - 1);
      }
    } else if (action === "TODAY") {
      newDate = new Date(); 
    } else {
      newDate = new Date(action); 
    }
  
    console.log("Navigating to:", newDate);
    setSelectedDate(newDate);
  };
  

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor
      }
    };
  };

  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const label = () => {
      if (view === 'day') {
        return format(toolbar.date, 'EEEE, MMMM d');
      } else if (view === 'week') {
        return `Week`;
      } else if (view === 'month') {
        return format(toolbar.date, 'MMMM yyyy');
      } else {
        return format(toolbar.date, 'yyyy');
      }
    };

    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group">
          <button type="button" onClick={goToPrev}>
            &lt;
          </button>
          <button type="button" onClick={goToToday}>
            Today
          </button>
          <button type="button" onClick={goToNext}>
            &gt;
          </button>
        </div>
        <div className="rbc-toolbar-label">{label()}</div>
        <div className="rbc-btn-group">
          <button
            type="button"
            className={view === 'day' ? 'rbc-active' : ''}
            onClick={() => handleViewChange('day')}
          >
            Day
          </button>
          <button
            type="button"
            className={view === 'week' ? 'rbc-active' : ''}
            onClick={() => handleViewChange('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={view === 'month' ? 'rbc-active' : ''}
            onClick={() => handleViewChange('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={view === 'year' ? 'rbc-active' : ''}
            onClick={() => handleViewChange('year')}
          >
            Year
          </button>
        </div>
        <div className="rbc-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              name='searchQuery'
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button 
              type="button" 
              className="search-button" 
              onClick={executeSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAvailabilityView = () => {
    return (
      <div className="avail-view">
      <div className="calendar-header">
          <div className="activity-section">
            <h3>Activity</h3>
            <div className="event-types">
              <span>Event Types</span>
            </div>
          </div>
          <div className="timezone-section">
            <h3>Time Zone</h3>
            <TimezoneSelect
              value={selectedTimezone}
              onChange={setSelectedTimezone}
              className="timezone-select"
            />
          </div>
        </div>

        <AvailabilityView userTimezone={selectedTimezone.value}/>
      </div>
    );
  };

  const renderCalendarView = () => {
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="activity-section">
            <h3>Activity</h3>
            <div className="event-types">
              <span>Event Types</span>
            </div>
          </div>
          <div className="timezone-section">
            <h3>Time Zone</h3>
            <TimezoneSelect
              value={selectedTimezone}
              onChange={setSelectedTimezone}
              className="timezone-select"
            />
          </div>
        </div>

        <CustomToolbar 
        date={selectedDate} 
        onNavigate={handleNavigate}
        view={view}
        onView={handleViewChange}
      />
        <div className="calendar-body">
        {view === 'year' ? (
            <YearView />
          ) : (
          <Calendar
            localizer={localizer}
            events={meetings}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={handleViewChange}
            date={selectedDate}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: ()=>null
            }}
            defaultView="week"
          />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='dash-right-side'>
      <div className="cont1-left">
        <h2 className="dashboard-title">Availability</h2>
        <p>Configure times when you are available for bookings</p>
      </div>

      <div className='avail-tabs'>
        <button 
          className={activeTab === 'availability' ? 'active' : ''}
          onClick={() => setActiveTab('availability')}
        >
        <List size={16}/>
          Availability View
        </button>
        <button 
          className={activeTab === 'calendar' ? 'active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
        <CalendarCheck2 size={16}/>
          Calendar View
        </button>
      </div>

      <div className={`avail-main-content ${activeTab === 'availability' ? 'availability-view' : 'calendar-view'}`}>
        {activeTab === 'availability' ? renderAvailabilityView() : renderCalendarView()}
      </div>
    </div>
  );
};

export default Availability;