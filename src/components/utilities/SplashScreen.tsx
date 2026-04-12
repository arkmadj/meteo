import React, { useEffect, useState } from 'react';

import { useTheme } from '@/design-system/theme';

export interface SplashScreenProps {
  /** Minimum duration to show splash screen in milliseconds (handled by parent) */
  minDuration?: number;
  /** Callback when splash screen is ready to hide */
  onComplete?: () => void;
  /** Show splash screen */
  show: boolean;
}

/**
 * Engaging splash screen with weather-themed animations
 * Displays during initial app loading
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  minDuration: _minDuration = 2000,
  onComplete,
  show,
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(show);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Get actual theme mode (resolve 'auto' to 'light' or 'dark')
  const themeMode =
    theme.mode === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme.mode;

  useEffect(() => {
    if (!show && isVisible) {
      // Start fade out animation
      setIsFadingOut(true);
      const fadeOutTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 600); // Match CSS transition duration

      return () => clearTimeout(fadeOutTimer);
    } else if (show && !isVisible) {
      setIsVisible(true);
      setIsFadingOut(false);
    }
  }, [show, isVisible, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}
      role="status"
      aria-label="Loading weather application"
      aria-live="polite"
    >
      <div className="splash-content">
        {/* Animated weather icon */}
        <div className="splash-icon-container">
          <div className="sun-icon">
            <div className="sun-core" />
            <div className="sun-rays">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
              ))}
            </div>
          </div>
          <div className="cloud-icon cloud-1">
            <div className="cloud-part cloud-part-1" />
            <div className="cloud-part cloud-part-2" />
            <div className="cloud-part cloud-part-3" />
          </div>
          <div className="cloud-icon cloud-2">
            <div className="cloud-part cloud-part-1" />
            <div className="cloud-part cloud-part-2" />
            <div className="cloud-part cloud-part-3" />
          </div>
        </div>

        {/* App title */}
        <h1 className="splash-title">
          <span className="splash-title-text">Weather</span>
          <span className="splash-title-accent">App</span>
        </h1>

        {/* Loading indicator */}
        <div className="splash-loading">
          <div className="splash-loading-bar">
            <div className="splash-loading-progress" />
          </div>
          <p className="splash-loading-text">Loading your weather forecast...</p>
        </div>

        {/* Animated weather particles */}
        <div className="splash-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="splash-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: linear-gradient(
            135deg,
            ${themeMode === 'dark' ? '#1a1a2e 0%, #16213e 100%' : '#4facfe 0%, #00f2fe 100%'}
          );
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 0.6s ease-out;
          overflow: hidden;
          overscroll-behavior: none;
        }

        .splash-screen.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .splash-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 2rem;
          animation: splash-fade-in 0.8s ease-out;
        }

        @keyframes splash-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Weather Icon Animation */
        .splash-icon-container {
          position: relative;
          width: 120px;
          height: 120px;
          animation: splash-float 3s ease-in-out infinite;
        }

        @keyframes splash-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Sun */
        .sun-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 50px;
          height: 50px;
          animation: splash-rotate 20s linear infinite;
        }

        @keyframes splash-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .sun-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background: ${themeMode === 'dark' ? '#ffd700' : '#ffeb3b'};
          border-radius: 50%;
          box-shadow: 0 0 20px ${themeMode === 'dark' ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 235, 59, 0.6)'};
          animation: splash-pulse 2s ease-in-out infinite;
        }

        @keyframes splash-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        .sun-rays {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
        }

        .sun-ray {
          position: absolute;
          top: -10px;
          left: 50%;
          width: 3px;
          height: 12px;
          background: ${themeMode === 'dark' ? '#ffd700' : '#ffeb3b'};
          border-radius: 2px;
          transform-origin: 50% 25px;
          opacity: 0.8;
        }

        /* Clouds */
        .cloud-icon {
          position: absolute;
          display: flex;
          align-items: flex-end;
        }

        .cloud-1 {
          bottom: 20px;
          left: 0;
          animation: splash-cloud-drift-1 8s ease-in-out infinite;
        }

        .cloud-2 {
          bottom: 35px;
          right: 5px;
          animation: splash-cloud-drift-2 10s ease-in-out infinite;
          opacity: 0.8;
        }

        @keyframes splash-cloud-drift-1 {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }

        @keyframes splash-cloud-drift-2 {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-8px);
          }
        }

        .cloud-part {
          background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
          border-radius: 50%;
        }

        .cloud-part-1 {
          width: 25px;
          height: 15px;
        }

        .cloud-part-2 {
          width: 20px;
          height: 18px;
          margin-left: -8px;
        }

        .cloud-part-3 {
          width: 22px;
          height: 16px;
          margin-left: -8px;
        }

        /* Title */
        .splash-title {
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
          text-align: center;
          animation: splash-title-appear 1s ease-out 0.3s both;
        }

        @keyframes splash-title-appear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .splash-title-text {
          color: ${themeMode === 'dark' ? '#ffffff' : '#ffffff'};
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .splash-title-accent {
          color: ${themeMode === 'dark' ? '#ffd700' : '#ffeb3b'};
          margin-left: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Loading */
        .splash-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          max-width: 300px;
          animation: splash-loading-appear 1s ease-out 0.6s both;
        }

        @keyframes splash-loading-appear {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .splash-loading-bar {
          width: 100%;
          height: 4px;
          background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'};
          border-radius: 2px;
          overflow: hidden;
        }

        .splash-loading-progress {
          height: 100%;
          background: ${themeMode === 'dark' ? '#ffd700' : '#ffeb3b'};
          border-radius: 2px;
          animation: splash-loading-progress 2s ease-in-out infinite;
        }

        @keyframes splash-loading-progress {
          0% {
            width: 0%;
            transform: translateX(0);
          }
          50% {
            width: 70%;
            transform: translateX(0);
          }
          100% {
            width: 100%;
            transform: translateX(0);
          }
        }

        .splash-loading-text {
          color: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* Particles */
        .splash-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .splash-particle {
          position: absolute;
          top: -10px;
          width: 4px;
          height: 4px;
          background: ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
          border-radius: 50%;
          animation: splash-particle-fall linear infinite;
        }

        @keyframes splash-particle-fall {
          from {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .splash-title {
            font-size: 2.5rem;
          }

          .splash-icon-container {
            width: 100px;
            height: 100px;
          }

          .splash-loading {
            max-width: 250px;
          }
        }

        @media (max-width: 480px) {
          .splash-title {
            font-size: 2rem;
          }

          .splash-icon-container {
            width: 80px;
            height: 80px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .splash-screen,
          .splash-content,
          .splash-icon-container,
          .sun-icon,
          .sun-core,
          .cloud-1,
          .cloud-2,
          .splash-title,
          .splash-loading,
          .splash-particle {
            animation: none !important;
            transition: none !important;
          }

          .splash-loading-progress {
            animation: splash-loading-progress-simple 2s linear infinite;
          }

          @keyframes splash-loading-progress-simple {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
