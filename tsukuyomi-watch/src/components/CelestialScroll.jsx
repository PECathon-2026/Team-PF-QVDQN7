import React, { useState, useEffect, useMemo } from 'react';
import { getMoonDetails } from '../utils/astronomy.js';
import { CELESTIAL_EVENTS } from '../data/celestialEvents.js';
import { getUpcomingLaunches } from '../services/launches.js';

export default function CelestialScroll({ location, observedEventIds = [], onObserveEvent }) {
  const [filter, setFilter] = useState('all');
  const [launches, setLaunches] = useState([]);
  const [launchesLoading, setLaunchesLoading] = useState(true);

  // Selected date state for the lunar calendar (defaults to today's local YYYY-MM-DD)
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Convert selected string to a valid Date object set at noon to prevent timezone date-rollover
  const activeDate = useMemo(() => {
    if (!selectedDateStr) return new Date();
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }, [selectedDateStr]);

  // Recalculates dynamically when coordinates, timezone, or selected date change
  const moon = useMemo(() => {
    return getMoonDetails(activeDate, location.latitude, location.longitude, location.timezone);
  }, [activeDate, location.latitude, location.longitude, location.timezone]);

  // Generate a mini 7-day strip preview around the chosen date
  const weekStrip = useMemo(() => {
    const days = [];
    const base = new Date(activeDate);
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const mInfo = getMoonDetails(d, location.latitude, location.longitude, location.timezone);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${dayNum}`;

      days.push({
        dateKey,
        dayLabel: d.toLocaleDateString([], { weekday: 'short' }),
        dayDisplay: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        icon: mInfo.icon,
        phaseName: mInfo.phaseName,
        fraction: mInfo.fraction,
        isCurrent: dateKey === selectedDateStr,
      });
    }
    return days;
  }, [activeDate, location.latitude, location.longitude, location.timezone, selectedDateStr]);

  useEffect(() => {
    let active = true;
    getUpcomingLaunches().then((data) => {
      if (active) {
        setLaunches(data);
        setLaunchesLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return CELESTIAL_EVENTS;
    return CELESTIAL_EVENTS.filter((ev) => ev.type === filter);
  }, [filter]);

  const handleResetToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${year}-${month}-${day}`);
  };

  const formattedSelectedDisplay = activeDate.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="celestial-scroll-container">
      {/* Date Picker & Lunar Calendar Toolbar */}
      <div className="calendar-control-card">
        <div className="calendar-header-cluster">
          <div className="calendar-title-group">
            <span className="cal-icon">📅</span>
            <div>
              <h4 className="cal-title">LUNAR EPHEMERIS CALENDAR</h4>
              <p className="cal-sub">Select any date to project historical or future moon phases</p>
            </div>
          </div>

          <div className="cal-input-group">
            <input
              type="date"
              className="lunar-date-picker"
              value={selectedDateStr}
              onChange={(e) => {
                if (e.target.value) setSelectedDateStr(e.target.value);
              }}
            />
            <button className="cal-today-btn" onClick={handleResetToday}>
              Reset to Today
            </button>
          </div>
        </div>

        {/* 7-Day Moon Phase Horizon Strip */}
        <div className="lunar-strip-wrapper">
          {weekStrip.map((day) => (
            <button
              key={day.dateKey}
              onClick={() => setSelectedDateStr(day.dateKey)}
              className={`lunar-strip-item ${day.isCurrent ? 'selected-day' : ''}`}
            >
              <span className="strip-weekday">{day.dayLabel}</span>
              <span className="strip-icon">{day.icon}</span>
              <span className="strip-date">{day.dayDisplay}</span>
              <span className="strip-fraction">{day.fraction}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Moon Phase & Ephemeris Card */}
      <div className="moon-banner-card">
        <div className="moon-graphic">
          <span className="moon-icon">{moon.icon}</span>
        </div>
        <div className="moon-details">
          <div className="moon-header">
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {moon.phaseName}
            </h3>
            <span className="moon-tag">{moon.fraction}% ILLUMINATED</span>
          </div>

          <p style={{ margin: '0.2rem 0 0.8rem 0', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
            {moon.jpName} • <span style={{ color: '#fff' }}>{formattedSelectedDisplay}</span>
          </p>

          <div className="moon-ephemeris-grid">
            <div className="ephemeris-item">
              <span className="ephemeris-label">Moonrise</span>
              <span className="ephemeris-value">{moon.moonrise}</span>
            </div>
            <div className="ephemeris-item">
              <span className="ephemeris-label">Moonset</span>
              <span className="ephemeris-value">{moon.moonset}</span>
            </div>
            <div className="ephemeris-item">
              <span className="ephemeris-label">Hemisphere</span>
              <span className="ephemeris-value">{moon.hemisphere}</span>
            </div>
            <div className="ephemeris-item">
              <span className="ephemeris-label">Target Zone</span>
              <span className="ephemeris-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                {location.timezone || 'UTC'}
              </span>
            </div>
          </div>

          <p className="moon-disclaimer">
            * Ephemeris calculated locally via SunCalc for <strong>{location.name}, {location.country}</strong> ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°) on <strong>{selectedDateStr}</strong>.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="event-filters-bar">
        <h4>CELESTIAL SCROLL & EVENTS</h4>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button
            className={`filter-btn ${filter === 'meteor_shower' ? 'active' : ''}`}
            onClick={() => setFilter('meteor_shower')}
          >
            Meteor Showers
          </button>
          <button
            className={`filter-btn ${filter === 'eclipse' ? 'active' : ''}`}
            onClick={() => setFilter('eclipse')}
          >
            Eclipses
          </button>
        </div>
      </div>

      {/* Curated Events List */}
      <div className="events-grid">
        {filteredEvents.map((event) => {
          const isObserved = observedEventIds.includes(event.id);

          return (
            <div key={event.id} className="event-card">
              <div className="event-card-top">
                <span className="event-type-badge">{event.badge}</span>
                <span className="event-date">{event.dateDisplay}</span>
              </div>
              <h4 className="event-title">{event.title}</h4>
              <p className="event-summary">{event.summary}</p>
              <div className="event-viewing-tip">
                <strong>Observation Note:</strong> {event.visibilityTip}
              </div>

              <div className="event-footer-action">
                <span className="event-source">Source: {event.source}</span>
                <button
                  className={`observe-action-btn ${isObserved ? 'observed' : ''}`}
                  disabled={isObserved}
                  onClick={() => onObserveEvent(event.id, event.honorValue || 10)}
                >
                  {isObserved ? '✓ Recorded in Dojo' : '⚔️ I Observed This (+10 Pts)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Rocket Launches Section */}
      <div className="launches-section-container">
        <div className="section-title-wrap">
          <h4>ROCKET LAUNCHES & ORBITAL ASCENTS</h4>
          <span className="section-subtitle">
            {launchesLoading ? 'Tracking telemetry...' : 'Global Spaceflight Manifest'}
          </span>
        </div>

        {launchesLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Retrieving upcoming launch trajectories...</p>
        ) : (
          <div className="launches-grid">
            {launches.map((launch) => (
              <div key={launch.id} className="launch-card">
                <div className="launch-card-header">
                  <span className="launch-agency">{launch.agency}</span>
                  <span className="launch-status-pill">{launch.status}</span>
                </div>
                <h5 className="launch-title">{launch.name}</h5>
                <div className="launch-meta">
                  <div><strong>T-NET:</strong> {launch.formattedDate}</div>
                  <div><strong>Pad:</strong> {launch.location}</div>
                </div>
                <div className="launch-source-tag">
                  {launch.isLiveAPI ? 'Live Launch Library 2 Telemetry' : 'Cached Regional Schedule'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}