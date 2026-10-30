import React, { useState } from 'react';
import { calculateNightHonorScore } from '../utils/score.js';

export default function ViewingWindowTimeline({ hourlyTonight = [], timezone = 'UTC' }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!hourlyTonight || hourlyTonight.length === 0) {
    return null;
  }

  // Compute Night Honor Score for each hour
  const slotsWithScores = hourlyTonight.map((slot) => {
    const scoreObj = calculateNightHonorScore({
      cloudCover: slot.cloudCover,
      visibilityMeters: slot.visibility,
      humidity: slot.humidity,
    });

    const dateObj = new Date(slot.time);
    let hourDisplay = `${slot.hourNumber}:00`;
    try {
      hourDisplay = dateObj.toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
        timeZone: timezone || 'UTC',
      });
    } catch {
      // fallback
    }

    return {
      ...slot,
      dateObj,
      hourDisplay,
      score: scoreObj ? scoreObj.score : 0,
      label: scoreObj ? scoreObj.label : 'Unknown',
      color: scoreObj ? scoreObj.color : '#8a8a9e',
    };
  });

  // Identify the optimal contiguous window (2 or 3 consecutive hours with highest combined score)
  let bestWindowStartIndex = 0;
  let maxScoreSum = -1;
  const windowSize = Math.min(3, slotsWithScores.length);

  for (let i = 0; i <= slotsWithScores.length - windowSize; i++) {
    let currentSum = 0;
    for (let j = 0; j < windowSize; j++) {
      currentSum += slotsWithScores[i + j].score;
    }
    if (currentSum > maxScoreSum) {
      maxScoreSum = currentSum;
      bestWindowStartIndex = i;
    }
  }

  const bestSlots = slotsWithScores.slice(bestWindowStartIndex, bestWindowStartIndex + windowSize);
  const avgBestScore = Math.round(maxScoreSum / windowSize);
  const bestStartDisplay = bestSlots[0]?.hourDisplay || '';
  const bestEndDisplay = bestSlots[bestSlots.length - 1]?.hourDisplay || '';

  const activeSlot = selectedSlot || bestSlots[0];

  return (
    <div
      style={{
        background: 'var(--bg-card, #12121a)',
        border: '1px solid var(--border-color, #2a2a38)',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header and Recommendation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color, #2a2a38)',
          paddingBottom: '0.75rem',
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              color: 'var(--accent-gold, #d4af37)',
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
            }}
          >
            TONIGHT'S VIEWING TIMELINE
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #8a8a9e)' }}>
            Hour-by-hour astronomical condition forecast (Dusk to Dawn)
          </span>
        </div>

        <div
          style={{
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid var(--accent-gold, #d4af37)',
            borderRadius: '6px',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1rem' }}>⛩️</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #8a8a9e)', textTransform: 'uppercase' }}>
              Prime Window
            </span>
            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
              {bestStartDisplay} – {bestEndDisplay} ({avgBestScore}/100)
            </strong>
          </div>
        </div>
      </div>

      {/* Hourly Strip Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${slotsWithScores.length}, minmax(0, 1fr))`,
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        {slotsWithScores.map((slot, index) => {
          const isPrime = index >= bestWindowStartIndex && index < bestWindowStartIndex + windowSize;
          const isSelected = activeSlot && activeSlot.time === slot.time;

          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              style={{
                background: isSelected
                  ? 'rgba(212, 175, 55, 0.2)'
                  : isPrime
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.3)',
                border: isSelected
                  ? '1px solid var(--accent-gold, #d4af37)'
                  : isPrime
                  ? '1px solid rgba(212, 175, 55, 0.4)'
                  : '1px solid var(--border-color, #2a2a38)',
                borderRadius: '6px',
                padding: '0.5rem 0.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #8a8a9e)', whiteSpace: 'nowrap' }}>
                {slot.hourDisplay}
              </span>

              {/* Vertical Score Bar */}
              <div
                style={{
                  width: '8px',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${slot.score}%`,
                    background: slot.color,
                    borderRadius: '4px',
                  }}
                />
              </div>

              <strong style={{ fontSize: '0.75rem', color: slot.color }}>
                {slot.score}
              </strong>

              {isPrime && (
                <span
                  style={{
                    fontSize: '0.6rem',
                    color: 'var(--accent-gold, #d4af37)',
                    lineHeight: 1,
                  }}
                >
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Hour Details */}
      {activeSlot && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-color, #2a2a38)',
            borderRadius: '6px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted, #8a8a9e)' }}>Details for </span>
            <strong style={{ color: '#fff' }}>{activeSlot.hourDisplay}</strong>
            <span style={{ marginLeft: '0.5rem', color: activeSlot.color, fontWeight: 600 }}>
              • {activeSlot.label} ({activeSlot.score}/100)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted, #8a8a9e)' }}>
            <span>Clouds: <strong style={{ color: '#fff' }}>{activeSlot.cloudCover}%</strong></span>
            <span>Humidity: <strong style={{ color: '#fff' }}>{activeSlot.humidity}%</strong></span>
            <span>Rain Risk: <strong style={{ color: '#fff' }}>{activeSlot.precipitationProbability}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}