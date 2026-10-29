import React, { useState, useRef } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { processAstroImage } from '../utils/imageProcessing.js';
import DojoDashboard from './DojoDashboard.jsx';

export default function SpiritLens() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid JPEG or PNG astronomical image.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('File size exceeds 8MB limit. Please select a smaller capture.');
      return;
    }

    setErrorMessage(null);
    setProcessedImage(null);
    setFileDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      try {
        const result = processAstroImage(img, {
          contrast: 1.25,
          brightness: 8,
          denoise: true,
          sharpen: true,
        });
        setProcessedImage(result);
      } catch (err) {
        setErrorMessage('Failed to process image. Preserving original file.');
      } finally {
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      setErrorMessage('Could not load image into processing canvas.');
      setIsProcessing(false);
    };
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setFileDetails(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="spirit-lens-container">
      {/* Dojo Controls Header */}
      <div className="spirit-lens-header">
        <div>
          <h3>SPIRIT LENS & DOJO DASHBOARD</h3>
          <p className="lens-sub">
            In-browser celestial image restoration, contrast normalization, and noise reduction.
          </p>
        </div>
        <div className="lens-actions">
          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="astro-file-upload"
          />
          <label htmlFor="astro-file-upload" className="spirit-btn">
            Select Photo
          </label>
          {originalImage && (
            <>
              <button
                className="spirit-btn primary"
                onClick={handleEnhance}
                disabled={isProcessing}
              >
                {isProcessing ? 'Sharpening...' : 'Enhance Sky Clarity'}
              </button>
              <button className="spirit-btn danger" onClick={handleReset}>
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {errorMessage && <p className="spirit-error">{errorMessage}</p>}

      {fileDetails && (
        <div className="file-info-badge">
          <span>Target: <strong>{fileDetails.name}</strong> ({fileDetails.size})</span>
          <span className="truthfulness-note">
            * Conventional light smoothing, contrast stretch & sharpening (strictly deterministic, non-generative).
          </span>
        </div>
      )}

      {/* Main Preview Arena */}
      <div className="slider-arena">
        {processedImage ? (
          <div className="slider-box">
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src={originalImage} alt="Original Raw" />}
              itemTwo={<ReactCompareSliderImage src={processedImage} alt="Enhanced Result" />}
              style={{ width: '100%', maxHeight: '520px', borderRadius: '8px' }}
            />
            <div className="slider-labels">
              <span>← Original Raw</span>
              <span>Enhanced View →</span>
            </div>
          </div>
        ) : originalImage ? (
          <div className="single-preview">
            <img src={originalImage} alt="Uploaded Raw" className="preview-img" />
            <p className="preview-hint">Image loaded. Click <strong>Enhance Sky Clarity</strong> to run the algorithm.</p>
          </div>
        ) : (
          <div className="dropzone-placeholder" onClick={() => fileInputRef.current?.click()}>
            <span className="drop-icon">📷</span>
            <p className="drop-title">No Astronomical Image Loaded</p>
            <p className="drop-sub">Click here or select a file to upload a night-sky photograph (JPEG/PNG up to 8MB).</p>
          </div>
        )}
      </div>

      {/* NEW: Dojo Object Finder (appears after the photo is enhanced) */}
      {processedImage && originalImage && (
        <DojoDashboard originalImage={originalImage} processedImage={processedImage} />
      )}
    </div>
  );
}
