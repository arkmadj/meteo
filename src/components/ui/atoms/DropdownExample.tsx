/**
 * Dropdown Component Examples
 * Demonstrates various use cases and configurations of the Dropdown component
 */

import React, { useState } from 'react';

import type { DropdownItem } from './Dropdown';
import Dropdown from './Dropdown';

const DropdownExample: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [controlledOpen, setControlledOpen] = useState(false);

  // Sample dropdown items
  const basicItems: DropdownItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      onClick: () => setSelectedAction('Edit'),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      onClick: () => setSelectedAction('Duplicate'),
    },
    {
      id: 'divider-1',
      label: 'Divider',
      divider: true,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      onClick: () => setSelectedAction('Archive'),
    },
    {
      id: 'divider-2',
      label: 'Divider',
      divider: true,
    },
    {
      id: 'delete',
      label: 'Delete',
      danger: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ),
      onClick: () => setSelectedAction('Delete'),
    },
  ];

  const userMenuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      onClick: () => setSelectedAction('Profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      onClick: () => setSelectedAction('Settings'),
    },
    {
      id: 'divider',
      label: 'Divider',
      divider: true,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      danger: true,
      onClick: () => setSelectedAction('Logout'),
    },
  ];

  const disabledItems: DropdownItem[] = [
    {
      id: 'enabled',
      label: 'Enabled Action',
      onClick: () => setSelectedAction('Enabled'),
    },
    {
      id: 'disabled',
      label: 'Disabled Action',
      disabled: true,
      onClick: () => setSelectedAction('Disabled'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dropdown Component Examples
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore various configurations and use cases of the Dropdown component
          </p>
          {selectedAction && (
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg">
              Last Action: <strong>{selectedAction}</strong>
            </div>
          )}
        </div>

        {/* Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Default</h3>
              <Dropdown items={basicItems} trigger="Default" variant="default" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary</h3>
              <Dropdown items={basicItems} trigger="Primary" variant="primary" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary</h3>
              <Dropdown items={basicItems} trigger="Secondary" variant="secondary" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ghost</h3>
              <Dropdown items={basicItems} trigger="Ghost" variant="ghost" />
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Dropdown items={basicItems} size="xs" trigger="Extra Small" />
            <Dropdown items={basicItems} size="sm" trigger="Small" />
            <Dropdown items={basicItems} size="md" trigger="Medium" />
            <Dropdown items={basicItems} size="lg" trigger="Large" />
            <Dropdown items={basicItems} size="xl" trigger="Extra Large" />
          </div>
        </section>

        {/* Placements */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Placements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bottom Start</h3>
              <Dropdown items={basicItems} placement="bottom-start" trigger="Bottom Start" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bottom End</h3>
              <Dropdown items={basicItems} placement="bottom-end" trigger="Bottom End" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Start</h3>
              <Dropdown items={basicItems} placement="top-start" trigger="Top Start" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top End</h3>
              <Dropdown items={basicItems} placement="top-end" trigger="Top End" />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Menu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Common user account actions
              </p>
              <Dropdown items={userMenuItems} trigger="My Account" variant="default" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actions Menu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Document or item actions</p>
              <Dropdown items={basicItems} trigger="Actions" variant="secondary" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Disabled Items</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Some items can be disabled</p>
              <Dropdown items={disabledItems} trigger="Mixed States" variant="default" />
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Advanced Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Controlled State
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Programmatically control open state
              </p>
              <div className="space-y-3">
                <Dropdown
                  items={basicItems}
                  open={controlledOpen}
                  trigger="Controlled"
                  onOpenChange={setControlledOpen}
                />
                <button
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  type="button"
                  onClick={() => setControlledOpen(!controlledOpen)}
                >
                  Toggle Externally
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Auto-Close</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep dropdown open after selection
              </p>
              <Dropdown closeOnItemClick={false} items={basicItems} trigger="Stay Open" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Disabled</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disabled dropdown state</p>
              <Dropdown disabled items={basicItems} trigger="Disabled" />
            </div>
          </div>
        </section>

        {/* Custom Styling */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Custom Styling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Custom Max Height
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Control dropdown scroll height
              </p>
              <Dropdown items={basicItems} maxHeight="150px" trigger="Short Dropdown" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Trigger Icon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hide the dropdown chevron</p>
              <Dropdown items={basicItems} showTriggerIcon={false} trigger="No Icon" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DropdownExample;
