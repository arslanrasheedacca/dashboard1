import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopPerformersProps {
  data: any[];
  darkMode: boolean;
}

const TopPerformers: React.FC<TopPerformersProps> = ({ data, darkMode }) => {
  const chartData = React.useMemo(() => {
    const teamPerformance = data.reduce((acc, item) => {
      const team = item.Team;
      acc[team] = (acc[team] || 0) + item['Sale Value'];
      return acc;
    }, {});

    const sortedTeams = Object.entries(teamPerformance)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    return {
      labels: sortedTeams.map(([team]) => team),
      datasets: [{
        label: 'Sales Value',
        data: sortedTeams.map(([, value]) => value),
        backgroundColor: '#FFB6C1',
        borderRadius: 8,
        maxBarThickness: 50
      }]
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
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
          padding: 8,
          autoSkip: false
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopPerformers; 