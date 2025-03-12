import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styled from 'styled-components';
import { SheetData } from '../../services/googleSheets';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ChartContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 20px;
  padding: 1rem;
  
  .chart-section {
    flex: 1;
    position: relative;
  }

  .chart-title {
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 1rem;
    color: ${props => props.theme.darkMode ? '#fff' : '#333'};
  }
`;

interface DistributionChartsProps {
  data: SheetData[];
  darkMode: boolean;
}

const DistributionCharts: React.FC<DistributionChartsProps> = ({ data, darkMode }) => {
  const processData = (key: string) => {
    const distribution = data.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + item['Sale Value'];
      return acc;
    }, {});

    const sortedData = Object.entries(distribution)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .reduce((acc, [key, value]) => {
        acc.labels.push(key);
        acc.data.push(value);
        return acc;
      }, { labels: [], data: [] });

    return {
      labels: sortedData.labels,
      datasets: [{
        data: sortedData.data,
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
  };

  const teamData = processData('Team');
  const projectData = processData('Project/ Block');

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
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}% (${value.toLocaleString()})`;
          }
        }
      },
      datalabels: {
        color: darkMode ? '#fff' : '#333',
        formatter: (value: number, ctx: any) => {
          const total = ctx.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${ctx.chart.data.labels[ctx.dataIndex]}\n${percentage}%`;
        },
        font: { size: 11 },
        textAlign: 'center',
        display: 'auto',
        offset: 8,
        anchor: 'end',
        align: 'start'
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <ChartContainer theme={{ darkMode }}>
      <div className="chart-section">
        <div className="chart-title">Team-wise Distribution</div>
        <Doughnut data={teamData} options={options} />
      </div>
      <div className="chart-section">
        <div className="chart-title">Project-wise Distribution</div>
        <Doughnut data={projectData} options={options} />
      </div>
    </ChartContainer>
  );
};

export default DistributionCharts; 