/**
 * Card Example Component
 * Demonstrates usage of the Card atom component
 */

import React, { useState } from 'react';

import { Card, CardHeader, CardBody, CardFooter, Button } from './index';

const CardExample: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [_likedCards, _setLikedCards] = useState<Set<string>>(new Set());

  const handleCardClick = (cardId: string) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const _handleLike = (cardId: string) => {
    _setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Card Component</h1>
        <p className="text-gray-600">
          A versatile container component for grouping related content and actions with consistent
          styling
        </p>
      </div>

      {/* Basic Usage */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Basic Usage</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Simple Card</h3>
            <p className="text-gray-600">This is a basic card with default styling and padding.</p>
          </Card>

          <Card variant="outlined">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined Card</h3>
            <p className="text-gray-600">
              This card uses the outlined variant with a stronger border.
            </p>
          </Card>

          <Card variant="filled">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filled Card</h3>
            <p className="text-gray-600">
              This card uses the filled variant with a subtle background.
            </p>
          </Card>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Variants</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Default</h3>
            <p className="text-xs text-gray-600">Standard card styling</p>
          </Card>

          <Card variant="primary">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Primary</h3>
            <p className="text-xs text-blue-700">Primary color theme</p>
          </Card>

          <Card variant="success">
            <h3 className="text-sm font-medium text-green-900 mb-1">Success</h3>
            <p className="text-xs text-green-700">Success color theme</p>
          </Card>

          <Card variant="warning">
            <h3 className="text-sm font-medium text-yellow-900 mb-1">Warning</h3>
            <p className="text-xs text-yellow-700">Warning color theme</p>
          </Card>
        </div>
      </div>

      {/* Shadows */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Shadows/Elevation</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card shadow="none">
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Shadow</h3>
            <p className="text-xs text-gray-600">Flat appearance</p>
          </Card>

          <Card shadow="sm">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Small</h3>
            <p className="text-xs text-gray-600">Subtle elevation</p>
          </Card>

          <Card shadow="md">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Medium</h3>
            <p className="text-xs text-gray-600">Default elevation</p>
          </Card>

          <Card shadow="lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Large</h3>
            <p className="text-xs text-gray-600">Prominent elevation</p>
          </Card>

          <Card shadow="xl">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Extra Large</h3>
            <p className="text-xs text-gray-600">Maximum elevation</p>
          </Card>
        </div>
      </div>

      {/* Padding Options */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Padding Options</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card className="bg-gray-50" padding="none">
            <div className="p-4 bg-white rounded-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-1">No Padding</h3>
              <p className="text-xs text-gray-600">Content controls padding</p>
            </div>
          </Card>

          <Card padding="sm">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Small</h3>
            <p className="text-xs text-gray-600">Compact spacing</p>
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Medium</h3>
            <p className="text-xs text-gray-600">Balanced spacing</p>
          </Card>

          <Card padding="lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Large</h3>
            <p className="text-xs text-gray-600">Generous spacing</p>
          </Card>

          <Card padding="xl">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Extra Large</h3>
            <p className="text-xs text-gray-600">Maximum spacing</p>
          </Card>
        </div>
      </div>

      {/* Card with Header, Body, Footer */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Structured Cards</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Weather Summary</h3>
                <span className="text-sm text-gray-500">Today</span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-medium">72°F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humidity</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind Speed</span>
                  <span className="font-medium">8 mph</span>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button className="w-full" size="sm" variant="ghost">
                View Details
              </Button>
            </CardFooter>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Air Quality Index</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">42</div>
                  <div className="text-sm text-gray-600">Good</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Air quality is satisfactory, and air pollution poses little or no risk.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Interactive Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Interactive Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'card1', title: 'Current Weather', icon: '🌤️', temp: '72°F' },
            { id: 'card2', title: '7-Day Forecast', icon: '📅', temp: 'High: 75°F' },
            { id: 'card3', title: 'Weather Alerts', icon: '⚠️', temp: 'No alerts' },
          ].map(card => (
            <Card
              key={card.id}
              className="cursor-pointer transition-all duration-200"
              clickable={true}
              selected={selectedCard === card.id}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{card.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-gray-600">{card.temp}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Selected: {selectedCard ? selectedCard.replace('card', 'Card ') : 'None'}
          </p>
        </div>
      </div>

      {/* Weather App Specific Examples */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Weather App Examples</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Card */}
          <Card shadow="lg" variant="primary">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">☀️</span>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Sunny</h3>
                  <p className="text-sm text-blue-700">San Francisco, CA</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="text-5xl font-light text-blue-900 mb-2">72°</div>
                <p className="text-blue-700">Feels like 75°</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <div className="text-sm text-blue-700">Humidity</div>
                  <div className="font-medium text-blue-900">65%</div>
                </div>
                <div>
                  <div className="text-sm text-blue-700">Wind</div>
                  <div className="font-medium text-blue-900">8 mph</div>
                </div>
                <div>
                  <div className="text-sm text-blue-700">UV Index</div>
                  <div className="font-medium text-blue-900">6</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Forecast Cards */}
          <div className="space-y-4">
            {[
              { day: 'Today', icon: '☀️', high: 75, low: 62 },
              { day: 'Tomorrow', icon: '⛅', high: 73, low: 60 },
              { day: 'Wednesday', icon: '🌧️', high: 68, low: 55 },
            ].map(forecast => (
              <Card key={forecast.day} padding="sm" variant="outlined">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{forecast.icon}</span>
                    <span className="font-medium text-gray-900">{forecast.day}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{forecast.high}°</div>
                    <div className="text-sm text-gray-600">{forecast.low}°</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Usage Guidelines</h2>
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">✅ When to Use</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Group related content and actions</li>
                <li>• Display information in organized sections</li>
                <li>• Create interactive dashboard elements</li>
                <li>• Show weather data and forecasts</li>
                <li>• Present settings and configuration options</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-3">🎨 Best Practices</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Use consistent variants across similar content</li>
                <li>• Choose appropriate shadows for hierarchy</li>
                <li>• Make clickable cards clearly interactive</li>
                <li>• Use CardHeader/CardBody/CardFooter for structure</li>
                <li>• Consider responsive behavior on mobile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardExample;
