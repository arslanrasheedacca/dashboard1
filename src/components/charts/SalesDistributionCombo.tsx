import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styled from 'styled-components';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 20px;
  
  .chart-section {
    flex: 1;
    position: relative;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
`;

interface SalesDistributionComboProps {
  data: any[];
  darkMode: boolean;
}

const SalesDistributionCombo: React.FC<SalesDistributionComboProps> = ({ data, darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Process data for pie chart
  const categoryData = React.useMemo(() => {
    const categories = data.reduce((acc, item) => {
      const category = item['Plot Category'];
      acc[category] = (acc[category] || 0) + item['Sale Value'];
      return acc;
    }, {});

    return {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 0,
      }]
    };
  }, [data]);

  // Process data for bar chart
  const barData = React.useMemo(() => {
    if (!selectedCategory) return null;

    const categoryTeams = data
      .filter(item => item['Plot Category'] === selectedCategory)
      .reduce((acc, item) => {
        const team = item.Team;
        acc[team] = (acc[team] || 0) + item['Sale Value'];
        return acc;
      }, {});

    return {
      labels: Object.keys(categoryTeams),
      datasets: [{
        label: `${selectedCategory} Sales by Team`,
        data: Object.values(categoryTeams),
        backgroundColor: '#36A2EB',
        borderRadius: 8,
      }]
    };
  }, [data, selectedCategory]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#fff' : '#666',
          padding: 20,
        }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedCategory(categoryData.labels[index]);
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: selectedCategory ? `${selectedCategory} Sales Distribution` : 'Select a category',
        color: darkMode ? '#fff' : '#666',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#444' : '#f0f0f0',
        },
        ticks: {
          color: darkMode ? '#fff' : '#666',
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: darkMode ? '#fff' : '#666',
        }
      }
    },
    animation: {
      duration: 500,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <ChartContainer>
      <div className="chart-section">
        <Pie data={categoryData} options={pieOptions} />
      </div>
      <div className="chart-section">
        {barData && <Bar data={barData} options={barOptions} />}
      </div>
    </ChartContainer>
  );
};

export default SalesDistributionCombo; 