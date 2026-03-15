/**
 * Side Drawer Usage Examples
 * 
 * Demonstrates various configurations and use cases for the SideDrawer component
 */

import React, { useState } from 'react';

import SideDrawer from './SideDrawer';

/**
 * Example 1: Basic Right Drawer
 */
export const BasicDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Basic Drawer</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        header={<h2>Basic Drawer</h2>}
      >
        <p>This is a basic right-side drawer with default settings.</p>
        <p>Click the backdrop or press Escape to close.</p>
      </SideDrawer>
    </div>
  );
};

/**
 * Example 2: Left Drawer with Custom Size
 */
export const LeftDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Left Drawer</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="left"
        size="large"
        header={<h2>Navigation Menu</h2>}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button onClick={() => setIsOpen(false)}>Save</button>
          </div>
        }
      >
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0' }}>
              <a href="#home">Home</a>
            </li>
            <li style={{ padding: '0.5rem 0' }}>
              <a href="#about">About</a>
            </li>
            <li style={{ padding: '0.5rem 0' }}>
              <a href="#services">Services</a>
            </li>
            <li style={{ padding: '0.5rem 0' }}>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
      </SideDrawer>
    </div>
  );
};

/**
 * Example 3: Bottom Drawer (Mobile-style)
 */
export const BottomDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Bottom Sheet</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="bottom"
        size="medium"
        header={<h2>Filter Options</h2>}
        showCloseButton={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            <input type="checkbox" /> Option 1
          </label>
          <label>
            <input type="checkbox" /> Option 2
          </label>
          <label>
            <input type="checkbox" /> Option 3
          </label>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Apply Filters
          </button>
        </div>
      </SideDrawer>
    </div>
  );
};

/**
 * Example 4: Settings Drawer with Callbacks
 */
export const SettingsDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Settings</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        size="medium"
        header={<h2>Settings</h2>}
        onOpen={() => addLog('Drawer opening')}
        onOpened={() => addLog('Drawer opened')}
        onClosing={() => addLog('Drawer closing')}
        onClosed={() => addLog('Drawer closed')}
        ariaLabel="Settings drawer"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Preferences</h3>
          <label>
            <input type="checkbox" /> Enable notifications
          </label>
          <label>
            <input type="checkbox" /> Dark mode
          </label>
          <label>
            <input type="checkbox" /> Auto-save
          </label>

          <h3>Event Log</h3>
          <div
            style={{
              background: '#f3f4f6',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            {logs.map((log, index) => (
              <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </SideDrawer>
    </div>
  );
};

/**
 * Example 5: Form Drawer with No Backdrop Click Close
 */
export const FormDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Form</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        size="medium"
        closeOnBackdropClick={false}
        closeOnEscape={false}
        header={<h2>Contact Form</h2>}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '0.5rem 1rem',
                background: '#e5e7eb',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
              required
            />
          </div>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
              required
            />
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Note: This drawer won't close when clicking the backdrop or pressing Escape.
            Use the Cancel or Submit buttons.
          </p>
        </form>
      </SideDrawer>
    </div>
  );
};

/**
 * Example 6: Full-Width Drawer
 */
export const FullWidthDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Full-Width Drawer</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        size="full"
        header={<h2>Full-Width Content</h2>}
        animationDuration={400}
      >
        <div style={{ padding: '2rem' }}>
          <h3>Full-Width Drawer</h3>
          <p>This drawer takes up the full width of the screen.</p>
          <p>Useful for immersive experiences or detailed content.</p>
        </div>
      </SideDrawer>
    </div>
  );
};

/**
 * Example 7: Custom Styled Drawer
 */
export const CustomStyledDrawerExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Custom Drawer</button>

      <SideDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        size="medium"
        backdropOpacity={0.8}
        animationDuration={500}
        className="custom-drawer"
        backdropClassName="custom-backdrop"
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎨</span>
            <h2 style={{ margin: 0 }}>Custom Styled</h2>
          </div>
        }
        closeButtonContent={<span style={{ fontSize: '1.5rem' }}>×</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>This drawer has custom styling:</p>
          <ul>
            <li>Higher backdrop opacity (0.8)</li>
            <li>Slower animation (500ms)</li>
            <li>Custom close button</li>
            <li>Custom header with emoji</li>
          </ul>
        </div>
      </SideDrawer>
    </div>
  );
};

/**
 * All Examples Component
 */
export const AllDrawerExamples: React.FC = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1>Side Drawer Examples</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <BasicDrawerExample />
        <LeftDrawerExample />
        <BottomDrawerExample />
        <SettingsDrawerExample />
        <FormDrawerExample />
        <FullWidthDrawerExample />
        <CustomStyledDrawerExample />
      </div>
    </div>
  );
};

export default AllDrawerExamples;

