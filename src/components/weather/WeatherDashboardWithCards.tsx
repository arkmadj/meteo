/**
 * Weather Dashboard with Cards
 * Example showing how to use the Card component for weather dashboard
 */

import React, { useState } from 'react';

import { Button, Card, CardBody, CardFooter, CardHeader } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';

const WeatherDashboardWithCards: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string>('current');
  const { theme } = useTheme();

  // Mock weather data
  const currentWeather = {
    location: 'San Francisco, CA',
    temperature: 72,
    condition: 'Sunny',
    icon: '☀️',
    feelsLike: 75,
    humidity: 65,
    windSpeed: 8,
    windDirection: 'NW',
    uvIndex: 6,
    visibility: 10,
    pressure: 30.12,
  };

  const forecast = [
    { day: 'Today', icon: '☀️', high: 75, low: 62, condition: 'Sunny' },
    { day: 'Tomorrow', icon: '⛅', high: 73, low: 60, condition: 'Partly Cloudy' },
    { day: 'Wednesday', icon: '🌧️', high: 68, low: 55, condition: 'Rainy' },
    { day: 'Thursday', icon: '☁️', high: 70, low: 58, condition: 'Cloudy' },
    { day: 'Friday', icon: '🌤️', high: 74, low: 61, condition: 'Mostly Sunny' },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Heat Advisory',
      description:
        'Temperatures may reach 85°F today. Stay hydrated and avoid prolonged sun exposure.',
      time: '8:00 AM - 8:00 PM',
    },
  ];

  const hourlyForecast = [
    { time: 'Now', temp: 72, icon: '☀️', precip: 0 },
    { time: '1 PM', temp: 74, icon: '☀️', precip: 0 },
    { time: '2 PM', temp: 75, icon: '☀️', precip: 0 },
    { time: '3 PM', temp: 76, icon: '☀️', precip: 5 },
    { time: '4 PM', temp: 75, icon: '⛅', precip: 10 },
    { time: '5 PM', temp: 73, icon: '🌧️', precip: 20 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--theme-text)] mb-2">Weather Dashboard</h1>
        <p className="text-[var(--theme-text-secondary)]">
          Comprehensive weather information at a glance
        </p>
      </div>

      {/* Navigation Cards - Theme-aware */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { id: 'current', label: 'Current Weather', icon: '🌤️' },
          { id: 'forecast', label: '5-Day Forecast', icon: '📅' },
          { id: 'hourly', label: 'Hourly Forecast', icon: '🕐' },
        ].map(view => (
          <Card
            key={view.id}
            className="text-center cursor-pointer transition-all duration-200"
            clickable={true}
            selected={selectedView === view.id}
            onClick={() => setSelectedView(view.id)}
          >
            <div className="text-3xl mb-2">{view.icon}</div>
            <h3 className="font-medium text-[var(--theme-text)]">{view.label}</h3>
          </Card>
        ))}
      </div>

      {/* Current Weather Card - Theme-aware */}
      {selectedView === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Weather Card */}
          <Card className="lg:col-span-2" shadow="lg" variant="primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{currentWeather.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--theme-text)]">
                      {currentWeather.condition}
                    </h2>
                    <p className="text-[var(--theme-text-secondary)]">{currentWeather.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-light text-[var(--theme-text)]">
                    {currentWeather.temperature}°
                  </div>
                  <div className="text-sm text-[var(--theme-text-secondary)]">
                    Feels like {currentWeather.feelsLike}°
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-sm text-[var(--theme-text-secondary)]">Humidity</div>
                  <div className="text-xl font-semibold text-[var(--theme-text)]">
                    {currentWeather.humidity}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💨</div>
                  <div className="text-sm text-[var(--theme-text-secondary)]">Wind</div>
                  <div className="text-xl font-semibold text-[var(--theme-text)]">
                    {currentWeather.windSpeed} mph
                  </div>
                  <div className="text-xs text-[var(--theme-text-secondary)]">
                    {currentWeather.windDirection}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">☀️</div>
                  <div className="text-sm text-[var(--theme-text-secondary)]">UV Index</div>
                  <div className="text-xl font-semibold text-[var(--theme-text)]">
                    {currentWeather.uvIndex}
                  </div>
                  <div className="text-xs text-[var(--theme-text-secondary)]">Moderate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">👁️</div>
                  <div className="text-sm text-[var(--theme-text-secondary)]">Visibility</div>
                  <div className="text-xl font-semibold text-[var(--theme-text)]">
                    {currentWeather.visibility} mi
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--theme-text-secondary)]">
                  Last updated: 12:45 PM
                </span>
                <Button size="sm" variant="ghost">
                  Refresh
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Weather Alerts - Theme-aware */}
          <div className="space-y-4">
            <Card shadow="md" variant="warning">
              <CardHeader>
                <h3 className="text-lg font-semibold text-[var(--theme-text)]">Weather Alerts</h3>
              </CardHeader>
              <CardBody>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div
                        key={alert.id}
                        className="p-3 rounded-lg border"
                        style={{
                          backgroundColor: theme.isDark
                            ? 'var(--theme-warning-bg)'
                            : 'var(--theme-warning-bg)',
                          borderColor: theme.isDark
                            ? 'rgba(251, 191, 36, 0.3)'
                            : 'rgba(251, 191, 36, 0.4)',
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">⚠️</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-[var(--theme-text)]">{alert.title}</h4>
                            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-[var(--theme-text-secondary)] mt-2">
                              {alert.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">✅</span>
                    <p className="text-[var(--theme-text)] font-medium">No active alerts</p>
                    <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
                      Weather conditions are normal
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Air Quality - Theme-aware */}
            <Card shadow="md" variant="success">
              <CardHeader>
                <h3 className="text-lg font-semibold text-[var(--theme-text)]">Air Quality</h3>
              </CardHeader>
              <CardBody>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: theme.isDark
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(34, 197, 94, 0.1)',
                    }}
                  >
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: 'var(--theme-semantic-success)' }}
                    >
                      42
                    </div>
                    <div className="text-sm text-[var(--theme-text-secondary)]">Good</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[var(--theme-text-secondary)]">
                  Air quality is satisfactory, and air pollution poses little or no risk.
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* 5-Day Forecast - Theme-aware */}
      {selectedView === 'forecast' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-[var(--theme-text)]">5-Day Forecast</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {forecast.map(day => (
                  <Card key={day.day} className="text-center" variant="outlined">
                    <div className="text-3xl mb-2">{day.icon}</div>
                    <h3 className="font-medium text-[var(--theme-text)] mb-1">{day.day}</h3>
                    <p className="text-sm text-[var(--theme-text-secondary)] mb-2">
                      {day.condition}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--theme-text-secondary)]">H: {day.high}°</span>
                      <span className="text-[var(--theme-text-secondary)]">L: {day.low}°</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Hourly Forecast - Theme-aware */}
      {selectedView === 'hourly' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-[var(--theme-text)]">Hourly Forecast</h2>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {hourlyForecast.map(hour => (
                    <Card
                      key={hour.time}
                      className="text-center min-w-[100px] flex-shrink-0"
                      variant="outlined"
                    >
                      <div className="text-lg font-medium text-[var(--theme-text)] mb-1">
                        {hour.time}
                      </div>
                      <div className="text-2xl mb-1">{hour.icon}</div>
                      <div className="text-lg font-semibold text-[var(--theme-text)] mb-1">
                        {hour.temp}°
                      </div>
                      <div className="text-xs text-[var(--theme-text-secondary)]">
                        {hour.precip > 0 ? `${hour.precip}%` : 'No rain'}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Additional Info Cards - Theme-aware */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card shadow="sm" variant="info">
          <CardBody className="text-center">
            <div className="text-2xl mb-2">🌅</div>
            <h3 className="font-medium text-[var(--theme-text)] mb-1">Sunrise</h3>
            <p className="text-lg font-semibold text-[var(--theme-text)]">6:42 AM</p>
          </CardBody>
        </Card>

        <Card shadow="sm" variant="info">
          <CardBody className="text-center">
            <div className="text-2xl mb-2">🌇</div>
            <h3 className="font-medium text-[var(--theme-text)] mb-1">Sunset</h3>
            <p className="text-lg font-semibold text-[var(--theme-text)]">7:28 PM</p>
          </CardBody>
        </Card>

        <Card shadow="sm" variant="secondary">
          <CardBody className="text-center">
            <div className="text-2xl mb-2">🌡️</div>
            <h3 className="font-medium text-[var(--theme-text)] mb-1">Dew Point</h3>
            <p className="text-lg font-semibold text-[var(--theme-text)]">58°F</p>
          </CardBody>
        </Card>

        <Card shadow="sm" variant="secondary">
          <CardBody className="text-center">
            <div className="text-2xl mb-2">🏔️</div>
            <h3 className="font-medium text-[var(--theme-text)] mb-1">Elevation</h3>
            <p className="text-lg font-semibold text-[var(--theme-text)]">52 ft</p>
          </CardBody>
        </Card>
      </div>

      {/* Footer */}
      <Card className="text-center" variant="outlined">
        <CardBody>
          <p className="text-gray-600">
            Weather data provided by OpenWeatherMap • Last updated: 12:45 PM PST
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button size="sm" variant="ghost">
              Report Issue
            </Button>
            <Button size="sm" variant="ghost">
              Feedback
            </Button>
            <Button size="sm" variant="ghost">
              Settings
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default WeatherDashboardWithCards;
