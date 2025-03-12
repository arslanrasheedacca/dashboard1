import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendsChartProps {
  data: any[];
  darkMode: boolean;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, darkMode }) => {
  const chartData = React.useMemo(() => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    // Get date range
    const startDate = new Date(sortedData[0]?.Date);
    const endDate = new Date(sortedData[sortedData.length - 1]?.Date);
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();

    // Determine grouping (monthly or yearly)
    const useYearlyGrouping = monthsDiff > 12;

    // Group data
    const groupedData = sortedData.reduce((acc: { [key: string]: number }, item) => {
      const date = new Date(item.Date);
      const key = useYearlyGrouping
        ? date.getFullYear().toString()
        : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      acc[key] = (acc[key] || 0) + item['Sale Value'];
      return acc;
    }, {});

    // Create labels and data arrays
    const labels = Object.keys(groupedData).sort();
    const values = labels.map(label => groupedData[label]);

    return {
      labels: labels.map(label => useYearlyGrouping ? label : new Date(label).toLocaleDateString('default', { month: 'short', year: 'numeric' })),
      datasets: [{
        label: 'Sales Value',
        data: values,
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4BC0C0',
        pointBorderColor: darkMode ? '#2d2d2d' : '#fff',
        pointBorderWidth: 2,
      }]
    };
  }, [data, darkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: darkMode ? '#2d2d2d' : '#fff',
        titleColor: darkMode ? '#fff' : '#333',
        bodyColor: darkMode ? '#e0e0e0' : '#666',
        borderColor: darkMode ? '#444' : '#e0e0e0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: (context: any) => {
            return `Sales: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: darkMode ? '#999' : '#666',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
          padding: 8,
        },
        border: {
          color: darkMode ? '#444' : '#e0e0e0'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#333' : '#f0f0f0',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? '#999' : '#666',
          padding: 8,
          callback: (value: any) => value.toLocaleString()
        },
        border: {
          color: darkMode ? '#444' : '#e0e0e0'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    animation: {
      duration: 1000
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 20
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', padding: '1rem' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TrendsChart; 