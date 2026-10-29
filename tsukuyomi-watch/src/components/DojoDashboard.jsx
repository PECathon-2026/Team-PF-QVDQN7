import React, { useState, useEffect } from 'react';
import { detectBrightObjects } from '../utils/detectObjects.js';
import './DojoDashboard.css';

// Low sensitivity = stricter threshold = fewer points. High = looser = more points.
const SENSITIVITY_OPTIONS = [
  { key: 'low', label: 'Low', sigma: 5 },
  { key: 'medium', label: 'Medium', sigma: 3.5 },
  { key: 'high', label: 'High', sigma: 2.5 },
];

export default function DojoDashboard({ originalImage, processedImage }) {
  const [sensitivity, setSensitivity] = useState('medium');
  const [zoom, setZoom] = useState(1);
  const [showMarkers, setShowMarkers] = useState(true);
  const [results, setResults] = useState(null);
  const [originalCount, setOriginalCount] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectError, setDetectError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Re-run detection whenever the images or the sensitivity change
  useEffect(() => {
    let cancelled = false;
    const option = SENSITIVITY_OPTIONS.find((o) => o.key === sensitivity);

    setIsDetecting(true);
    setDetectError(null);
    setHoveredId(null);
    setSelectedId(null);

    Promise.all([
      detectBrightObjects(processedImage, { sigma: option.sigma }),
      detectBrightObjects(originalImage, { sigma: option.sigma }),
    ])
      .then(([enhanced, original]) => {
        if (cancelled) return;
        setResults(enhanced);
        setOriginalCount(original.totalFound);
        setIsDetecting(false);
      })
      .catch(() => {
        if (cancelled) return;
        setDetectError('Could not scan this image for bright points. Your original photo is untouched.');
        setIsDetecting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [processedImage, originalImage, sensitivity]);

  const activeId = hoveredId ?? selectedId;

  return (
    <div className="dojo-card">
      <div className="dojo-header">
        <h3>DOJO OBJECT FINDER</h3>
        <p>
          Scans your enhanced photo for bright points, circles them, and lists where they are.
        </p>
      </div>

      <div className="dojo-controls">
        <div className="dojo-control-group">
          <span>Sensitivity</span>
          {SENSITIVITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`dojo-seg-btn ${sensitivity === opt.key ? 'active' : ''}`}
              aria-pressed={sensitivity === opt.key}
              onClick={() => setSensitivity(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="dojo-control-group">
          <label htmlFor="dojo-zoom">Zoom</label>
          <input
            id="dojo-zoom"
            className="dojo-zoom-slider"
            type="range"
            min="1"
            max="4"
            step="0.5"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <strong className="dojo-zoom-value">{zoom.toFixed(1)}x</strong>
        </div>

        <label className="dojo-control-group dojo-check">
          <input
            type="checkbox"
            checked={showMarkers}
            onChange={(e) => setShowMarkers(e.target.checked)}
          />
          <span>Show markers</span>
        </label>
      </div>

      {detectError && <p className="spirit-error">{detectError}</p>}

      {!results && isDetecting && (
        <p className="dojo-status">Scanning the sky for bright points...</p>
      )}

      {results && (
        <>
          <div className="dojo-summary">
            <div className="dojo-stat">
              <span className="dojo-stat-label">Candidates (enhanced)</span>
              <span className="dojo-stat-value">{results.totalFound}</span>
            </div>
            <div className="dojo-stat">
              <span className="dojo-stat-label">Candidates (original)</span>
              <span className="dojo-stat-value">{originalCount === null ? '-' : originalCount}</span>
            </div>
            <div className="dojo-stat">
              <span className="dojo-stat-label">Median area</span>
              <span className="dojo-stat-value">{results.medianArea} px²</span>
            </div>
            <div className="dojo-stat">
              <span className="dojo-stat-label">Brightness cut-off</span>
              <span className="dojo-stat-value">{results.threshold} / 255</span>
            </div>
            {results.skippedLarge > 0 && (
              <div className="dojo-stat">
                <span className="dojo-stat-label">Large glows skipped</span>
                <span className="dojo-stat-value">{results.skippedLarge}</span>
              </div>
            )}
          </div>

          <div className="dojo-viewer">
            <div className="dojo-viewer-inner" style={{ width: `${zoom * 100}%` }}>
              <img
                src={processedImage}
                alt="Enhanced sky photo with detected bright points"
                draggable={false}
                style={{ imageRendering: zoom >= 2 ? 'pixelated' : 'auto' }}
              />
              {showMarkers && (
                <svg
                  className="dojo-overlay"
                  viewBox={`0 0 ${results.width} ${results.height}`}
                  aria-hidden="true"
                >
                  {results.objects.map((obj) => {
                    const isActive = obj.id === activeId;
                    const radius = Math.max(6, Math.sqrt(obj.area / Math.PI) + 5);
                    return (
                      <g key={obj.id}>
                        <circle
                          cx={obj.x}
                          cy={obj.y}
                          r={radius}
                          fill="none"
                          stroke={isActive ? '#d4af37' : '#ff6b6b'}
                          strokeWidth={isActive ? 3 : 1.5}
                          vectorEffect="non-scaling-stroke"
                        />
                        {isActive && (
                          <text
                            x={obj.x + radius + 3}
                            y={obj.y - radius}
                            fill="#d4af37"
                            fontSize={Math.max(12, results.height / 40)}
                            fontWeight="700"
                          >
                            #{obj.id}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          {results.objects.length === 0 ? (
            <p className="dojo-status">
              No bright points found at this sensitivity. Try High sensitivity, or a photo taken
              under a darker sky.
            </p>
          ) : (
            <>
              <p className="dojo-table-caption">
                Showing the {results.objects.length} brightest
                {results.totalFound > results.objects.length
                  ? ` of ${results.totalFound} candidates`
                  : ' candidates'}
                . Hover or click a row to highlight it on the photo.
              </p>
              <div className="dojo-table-wrap">
                <table className="dojo-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Position (x, y px)</th>
                      <th>Area (px²)</th>
                      <th>Relative intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.objects.map((obj) => (
                      <tr
                        key={obj.id}
                        className={`dojo-row ${obj.id === activeId ? 'active' : ''}`}
                        onMouseEnter={() => setHoveredId(obj.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedId(selectedId === obj.id ? null : obj.id)}
                      >
                        <td>{obj.id}</td>
                        <td>
                          {obj.x}, {obj.y}
                        </td>
                        <td>{obj.area}</td>
                        <td>{obj.intensity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="dojo-note">
            * These are <strong>candidate bright regions</strong>, not confirmed stars, planets or
            galaxies. Area is counted in image pixels (the view is scaled to at most 1200 px), not
            physical size. Relative intensity is peak brightness as a % of the maximum (255), not
            calibrated brightness. Single bright pixels are ignored as likely sensor noise, but
            counts can still include noise or hot pixels. Tip: in a well-focused photo, stars
            usually appear as small, tight points; large smeared blobs can suggest blur or camera
            shake.
          </p>
        </>
      )}
    </div>
  );
}
