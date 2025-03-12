import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Form } from 'react-bootstrap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: any[];
  darkMode: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, darkMode }) => {
  const [groupBy, setGroupBy] = useState('date');

  const chartData = React.useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    
    const groupedData = sortedData.reduce((acc, item) => {
      const date = new Date(item.Date);
      let key;
      switch (groupBy) {
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }
      acc[key].total += item['Sale Value'];
      acc[key].count += 1;
      return acc;
    }, {});

    const labels = Object.keys(groupedData).sort();
    
    return {
      labels: labels.map(label => {
        switch (groupBy) {
          case 'month':
            return new Date(label).toLocaleDateString('default', { month: 'short', year: 'numeric' });
          case 'year':
            return label;
          default:
            return new Date(label).toLocaleDateString();
        }
      }),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Sales Value',
          data: labels.map(key => groupedData[key].total),
          backgroundColor: '#4BC0C0',
          yAxisID: 'y',
          order: 2
        },
        {
          type: 'line' as const,
          label: 'Transactions',
          data: labels.map(key => groupedData[key].count),
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          yAxisID: 'y1',
          order: 1,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [data, groupBy, darkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? '#fff' : '#666',
          usePointStyle: true,
          padding: 20,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
        titleColor: darkMode ? '#fff' : '#333',
        bodyColor: darkMode ? '#e0e0e0' : '#666',
        borderColor: darkMode ? '#444' : '#e0e0e0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label;
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Sales Value',
          color: darkMode ? '#999' : '#666'
        },
        grid: {
          color: darkMode ? '#333' : '#f0f0f0',
        },
        ticks: {
          color: darkMode ? '#999' : '#666',
          callback: (value: any) => value.toLocaleString()
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Transactions',
          color: darkMode ? '#999' : '#666'
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: darkMode ? '#999' : '#666',
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: darkMode ? '#999' : '#666',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Form.Check
          inline
          type="radio"
          label="Daily"
          name="groupBy"
          checked={groupBy === 'date'}
          onChange={() => setGroupBy('date')}
        />
        <Form.Check
          inline
          type="radio"
          label="Monthly"
          name="groupBy"
          checked={groupBy === 'month'}
          onChange={() => setGroupBy('month')}
        />
        <Form.Check
          inline
          type="radio"
          label="Yearly"
          name="groupBy"
          checked={groupBy === 'year'}
          onChange={() => setGroupBy('year')}
        />
      </div>
      <Chart type='bar' data={chartData} options={options} />
    </div>
  );
};

export default SalesChart; 