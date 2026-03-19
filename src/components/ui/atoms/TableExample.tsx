/**
 * Table Component Examples
 * Demonstrates various use cases and configurations of the Table component
 */

import { useState } from 'react';

import type { TableColumn, TableRow } from './Table';
import Table from './Table';

// ============================================================================
// EXAMPLE DATA
// ============================================================================

interface WeatherForecast {
  date: string;
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

const weatherData: WeatherForecast[] = [
  {
    date: '2025-10-08',
    city: 'London',
    temperature: 15,
    condition: 'Cloudy',
    humidity: 75,
    windSpeed: 12,
    precipitation: 20,
  },
  {
    date: '2025-10-08',
    city: 'Paris',
    temperature: 18,
    condition: 'Sunny',
    humidity: 60,
    windSpeed: 8,
    precipitation: 0,
  },
  {
    date: '2025-10-08',
    city: 'Tokyo',
    temperature: 22,
    condition: 'Rainy',
    humidity: 85,
    windSpeed: 15,
    precipitation: 80,
  },
  {
    date: '2025-10-08',
    city: 'New York',
    temperature: 12,
    condition: 'Partly Cloudy',
    humidity: 70,
    windSpeed: 10,
    precipitation: 10,
  },
  {
    date: '2025-10-08',
    city: 'Sydney',
    temperature: 25,
    condition: 'Sunny',
    humidity: 55,
    windSpeed: 6,
    precipitation: 0,
  },
];

// ============================================================================
// EXAMPLE 1: BASIC TABLE
// ============================================================================

export function BasicTableExample() {
  const columns: TableColumn<WeatherForecast>[] = [
    {
      id: 'city',
      label: 'City',
      accessor: 'city',
      scope: 'col',
    },
    {
      id: 'temperature',
      label: 'Temperature',
      accessor: 'temperature',
      align: 'right',
      render: value => `${value}°C`,
    },
    {
      id: 'condition',
      label: 'Condition',
      accessor: 'condition',
    },
  ];

  const rows: TableRow<WeatherForecast>[] = weatherData.map((data, index) => ({
    id: index,
    data,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h2>Basic Table</h2>
      <Table
        columns={columns as TableColumn<unknown>[]}
        rows={rows as TableRow<unknown>[]}
        caption="Weather Forecast"
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: SORTABLE TABLE
// ============================================================================

export function SortableTableExample() {
  const [sortColumn, setSortColumn] = useState<string>('city');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const columns: TableColumn<WeatherForecast>[] = [
    {
      id: 'city',
      label: 'City',
      accessor: 'city',
      sortable: true,
      scope: 'col',
    },
    {
      id: 'temperature',
      label: 'Temperature',
      accessor: 'temperature',
      align: 'right',
      sortable: true,
      render: value => `${value}°C`,
    },
    {
      id: 'humidity',
      label: 'Humidity',
      accessor: 'humidity',
      align: 'right',
      sortable: true,
      render: value => `${value}%`,
    },
  ];

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  // Sort data
  const sortedData = [...weatherData].sort((a, b) => {
    const aValue = a[sortColumn as keyof WeatherForecast];
    const bValue = b[sortColumn as keyof WeatherForecast];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const rows: TableRow<WeatherForecast>[] = sortedData.map((data, index) => ({
    id: index,
    data,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sortable Table</h2>
      <p>Click column headers to sort</p>
      <Table
        columns={columns as TableColumn<unknown>[]}
        rows={rows as TableRow<unknown>[]}
        caption="Sortable Weather Forecast"
        sortable={true}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: SELECTABLE TABLE
// ============================================================================

export function SelectableTableExample() {
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  const columns: TableColumn<WeatherForecast>[] = [
    {
      id: 'city',
      label: 'City',
      accessor: 'city',
      scope: 'col',
    },
    {
      id: 'temperature',
      label: 'Temperature',
      accessor: 'temperature',
      align: 'right',
      render: value => `${value}°C`,
    },
    {
      id: 'condition',
      label: 'Condition',
      accessor: 'condition',
    },
  ];

  const rows: TableRow<WeatherForecast>[] = weatherData.map((data, index) => ({
    id: index,
    data,
  }));

  const handleSelectRow = (rowId: string | number) => {
    setSelectedRows(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? rows.map(row => row.id) : []);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Selectable Table</h2>
      <p>Selected rows: {selectedRows.length}</p>
      <Table
        columns={columns as TableColumn<unknown>[]}
        rows={rows as TableRow<unknown>[]}
        caption="Selectable Weather Forecast"
        selectable={true}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: STRIPED AND HOVERABLE TABLE
// ============================================================================

export function StripedHoverableTableExample() {
  const columns: TableColumn<WeatherForecast>[] = [
    {
      id: 'city',
      label: 'City',
      accessor: 'city',
      scope: 'col',
    },
    {
      id: 'temperature',
      label: 'Temperature',
      accessor: 'temperature',
      align: 'right',
      render: value => `${value}°C`,
    },
    {
      id: 'condition',
      label: 'Condition',
      accessor: 'condition',
    },
    {
      id: 'humidity',
      label: 'Humidity',
      accessor: 'humidity',
      align: 'right',
      render: value => `${value}%`,
    },
  ];

  const rows: TableRow<WeatherForecast>[] = weatherData.map((data, index) => ({
    id: index,
    data,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h2>Striped & Hoverable Table</h2>
      <Table
        columns={columns as TableColumn<unknown>[]}
        rows={rows as TableRow<unknown>[]}
        caption="Weather Forecast with Striped Rows"
        striped={true}
        hoverable={true}
        bordered={true}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: COMPACT TABLE
// ============================================================================

export function CompactTableExample() {
  const columns: TableColumn<WeatherForecast>[] = [
    {
      id: 'city',
      label: 'City',
      accessor: 'city',
      scope: 'col',
    },
    {
      id: 'temp',
      label: 'Temp',
      accessor: 'temperature',
      align: 'right',
      render: value => `${value}°`,
    },
    {
      id: 'condition',
      label: 'Condition',
      accessor: 'condition',
    },
  ];

  const rows: TableRow<WeatherForecast>[] = weatherData.map((data, index) => ({
    id: index,
    data,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h2>Compact Table</h2>
      <Table
        columns={columns as TableColumn<unknown>[]}
        rows={rows as TableRow<unknown>[]}
        caption="Compact Weather Forecast"
        density="compact"
        size="sm"
      />
    </div>
  );
}

// ============================================================================
// EXPANDABLE TABLE EXAMPLE
// ============================================================================

export function ExpandableTableExample() {
  const [expandedRows, setExpandedRows] = useState<(string | number)[]>([]);

  const columns: TableColumn<WeatherForecast>[] = [
    {
      id: 'city',
      label: 'City',
      accessor: 'city',
      scope: 'col',
    },
    {
      id: 'temperature',
      label: 'Temperature',
      accessor: 'temperature',
      align: 'right',
      render: value => `${value}°C`,
    },
    {
      id: 'condition',
      label: 'Condition',
      accessor: 'condition',
    },
  ];

  const rows: TableRow<WeatherForecast>[] = weatherData.map((data, index) => ({
    id: index,
    data,
    expandable: true,
    expanded: expandedRows.includes(index),
    expandedContent: (
      <div style={{ padding: '16px 0' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
          Detailed Weather Information for {data.city}
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <strong>Humidity:</strong> {data.humidity}%
          </div>
          <div>
            <strong>Wind Speed:</strong> {data.windSpeed} km/h
          </div>
          <div>
            <strong>Precipitation:</strong> {data.precipitation}%
          </div>
          <div>
            <strong>Date:</strong> {new Date(data.date).toLocaleDateString()}
          </div>
        </div>
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
          }}
        >
          <small style={{ color: '#6b7280' }}>
            💡 Use Enter or Space keys to expand/collapse rows when focused
          </small>
        </div>
      </div>
    ),
  }));

  const handleExpandRow = (rowId: string | number) => {
    setExpandedRows(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleExpandAll = (expanded: boolean) => {
    if (expanded) {
      setExpandedRows(rows.map(row => row.id));
    } else {
      setExpandedRows([]);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Expandable Table with Keyboard Navigation</h2>
      <p style={{ marginBottom: '16px', color: '#6b7280' }}>
        Click the arrow buttons or use Enter/Space keys to expand rows for detailed information. Try
        using Tab to navigate and Enter/Space to expand rows.
      </p>
      <Table
        columns={columns as TableColumn<unknown>[]}
        rows={rows as TableRow<unknown>[]}
        caption="Expandable Weather Forecast"
        expandable={true}
        expandedRows={expandedRows}
        onExpandRow={handleExpandRow}
        onExpandAll={handleExpandAll}
        hoverable={true}
        expansionAriaLabel={(data, expanded) =>
          expanded
            ? `Collapse detailed weather information for ${(data as WeatherForecast).city}`
            : `Expand detailed weather information for ${(data as WeatherForecast).city}`
        }
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: ALL EXAMPLES COMBINED
// ============================================================================

export function AllTableExamples() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Table Component Examples</h1>

      <div style={{ marginBottom: '40px' }}>
        <BasicTableExample />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <SortableTableExample />
      </div>

      {/* TODO: Implement SortableTableDemo */}
      {/* <div style={{ marginBottom: '40px' }}>
        <SortableTableDemo />
      </div> */}

      {/* TODO: Implement EnhancedFocusTableDemo */}
      {/* <div style={{ marginBottom: '40px' }}>
        <EnhancedFocusTableDemo />
      </div> */}

      <div style={{ marginBottom: '40px' }}>
        <SelectableTableExample />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <StripedHoverableTableExample />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <CompactTableExample />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <ExpandableTableExample />
      </div>
    </div>
  );
}

export default function TableExamples() {
  return (
    <div>
      <h1 style={{ padding: '20px' }}>Table Component Examples</h1>
      <BasicTableExample />
      <hr />
      <SortableTableExample />
      <hr />
      <SelectableTableExample />
      <hr />
      <StripedHoverableTableExample />
      <hr />
      <CompactTableExample />
    </div>
  );
}
