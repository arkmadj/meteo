import React from 'react';

import { CardBody } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';
import AnimatedCard from './AnimatedCard';

export interface WeatherDetailCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: string;
  iconColor?: string; // Made optional for theme-aware defaults
  bgColor?: string; // Made optional for theme-aware defaults
  borderColor?: string; // Made optional for theme-aware defaults
  textColor?: string; // Made optional for theme-aware defaults
  animationDelay?: number;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' | 'fadeInRotate';
  animationDuration?: number;
  children?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  subtitle?: string;
  // New theme-aware props
  themeAware?: boolean; // Whether to use theme-aware styling
  accentColor?:
    | 'blue'
    | 'cyan'
    | 'purple'
    | 'yellow'
    | 'indigo'
    | 'slate'
    | 'green'
    | 'orange'
    | 'red'; // Accent color for theme-aware cards
}

const WeatherDetailCard: React.FC<WeatherDetailCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  bgColor,
  borderColor,
  textColor,
  animationDelay = 0,
  animationType = 'fadeInUp',
  animationDuration = 600,
  children,
  className = '',
  valueClassName = '',
  subtitle,
  themeAware = false,
  accentColor = 'blue',
}) => {
  const { theme } = useTheme();

  // Theme-aware color mapping
  const getThemeAwareColors = () => {
    if (!themeAware) {
      return {
        bgColor: bgColor || 'bg-white',
        borderColor: borderColor || 'border-gray-200',
        iconColor: iconColor || 'bg-gray-500',
        textColor: textColor || 'text-gray-900',
      };
    }

    const colorMap = {
      blue: {
        light: {
          bg: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          icon: 'bg-blue-500',
          text: 'text-blue-600',
        },
        dark: {
          bg: 'from-blue-900/20 to-blue-800/20',
          border: 'border-blue-700/50',
          icon: 'bg-blue-600',
          text: 'text-blue-400',
        },
      },
      cyan: {
        light: {
          bg: 'from-cyan-50 to-cyan-100',
          border: 'border-cyan-200',
          icon: 'bg-cyan-500',
          text: 'text-cyan-600',
        },
        dark: {
          bg: 'from-cyan-900/20 to-cyan-800/20',
          border: 'border-cyan-700/50',
          icon: 'bg-cyan-600',
          text: 'text-cyan-400',
        },
      },
      purple: {
        light: {
          bg: 'from-purple-50 to-purple-100',
          border: 'border-purple-200',
          icon: 'bg-purple-500',
          text: 'text-purple-600',
        },
        dark: {
          bg: 'from-purple-900/20 to-purple-800/20',
          border: 'border-purple-700/50',
          icon: 'bg-purple-600',
          text: 'text-purple-400',
        },
      },
      yellow: {
        light: {
          bg: 'from-yellow-50 to-orange-100',
          border: 'border-yellow-200',
          icon: 'bg-yellow-500',
          text: 'text-yellow-600',
        },
        dark: {
          bg: 'from-yellow-900/20 to-orange-800/20',
          border: 'border-yellow-700/50',
          icon: 'bg-yellow-600',
          text: 'text-yellow-400',
        },
      },
      indigo: {
        light: {
          bg: 'from-indigo-50 to-indigo-100',
          border: 'border-indigo-200',
          icon: 'bg-indigo-500',
          text: 'text-indigo-600',
        },
        dark: {
          bg: 'from-indigo-900/20 to-indigo-800/20',
          border: 'border-indigo-700/50',
          icon: 'bg-indigo-600',
          text: 'text-indigo-400',
        },
      },
      slate: {
        light: {
          bg: 'from-slate-50 to-blue-50',
          border: 'border-slate-200',
          icon: 'bg-gradient-to-br from-slate-500 to-blue-600',
          text: 'text-gray-900',
        },
        dark: {
          bg: 'from-slate-800/20 to-blue-800/20',
          border: 'border-slate-600/50',
          icon: 'bg-gradient-to-br from-slate-400 to-blue-500',
          text: 'text-slate-300',
        },
      },
      green: {
        light: {
          bg: 'from-green-50 to-green-100',
          border: 'border-green-200',
          icon: 'bg-green-500',
          text: 'text-green-600',
        },
        dark: {
          bg: 'from-green-900/20 to-green-800/20',
          border: 'border-green-700/50',
          icon: 'bg-green-600',
          text: 'text-green-400',
        },
      },
      orange: {
        light: {
          bg: 'from-orange-50 to-orange-100',
          border: 'border-orange-200',
          icon: 'bg-orange-500',
          text: 'text-orange-600',
        },
        dark: {
          bg: 'from-orange-900/20 to-orange-800/20',
          border: 'border-orange-700/50',
          icon: 'bg-orange-600',
          text: 'text-orange-400',
        },
      },
      red: {
        light: {
          bg: 'from-red-50 to-red-100',
          border: 'border-red-200',
          icon: 'bg-red-500',
          text: 'text-red-600',
        },
        dark: {
          bg: 'from-red-900/20 to-red-800/20',
          border: 'border-red-700/50',
          icon: 'bg-red-600',
          text: 'text-red-400',
        },
      },
    };

    const themeColors = colorMap[accentColor][theme.isDark ? 'dark' : 'light'];

    return {
      bgColor: `bg-gradient-to-br ${themeColors.bg}`,
      borderColor: themeColors.border,
      iconColor: themeColors.icon,
      textColor: themeColors.text,
    };
  };

  const colors = getThemeAwareColors();
  return (
    <div data-weather-detail-card-root className="h-full">
      <AnimatedCard
        animationType={animationType}
        className={`${colors.bgColor} ${colors.borderColor} h-full ${className}`}
        delay={animationDelay}
        duration={animationDuration}
        variant="outlined"
      >
        <CardBody className="p-4 sm:p-6 h-full">
          <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
            {/* Header with Icon and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 ${colors.iconColor} rounded-full flex items-center justify-center text-white text-xl sm:text-2xl`}
                >
                  {icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm sm:text-lg font-semibold ${themeAware ? 'text-[var(--theme-text)]' : 'text-gray-900'} mb-1 truncate`}
                >
                  {title}
                </h4>
                <p
                  className={`text-2xl sm:text-3xl font-bold ${colors.textColor} truncate ${valueClassName}`}
                >
                  {value}
                </p>
                {subtitle && (
                  <p
                    className={`text-xs sm:text-sm ${themeAware ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'} truncate`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Content Area */}
            {children && <div className="mt-3 sm:mt-4 flex-1">{children}</div>}
          </div>
        </CardBody>
      </AnimatedCard>
    </div>
  );
};

export default WeatherDetailCard;
