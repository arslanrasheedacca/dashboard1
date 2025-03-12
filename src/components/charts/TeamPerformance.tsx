import React, { useState } from 'react';
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
import { Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import styled from 'styled-components';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ControlsContainer = styled.div`
  margin-bottom: 1.5rem;
  padding: 0 1rem;

  .controls-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .team-select {
    flex: 0 0 300px;
  }

  .targets-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    align-items: center;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: ${props => props.theme.darkMode ? '#e0e0e0' : '#666'};
    margin-bottom: 0.75rem;
  }
`;

const ChartContainer = styled.div`
  height: calc(100% - 120px);
  padding: 0 1rem;
`;

interface TeamPerformanceProps {
  data: any[];
  darkMode: boolean;
}

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ data, darkMode }) => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [targets, setTargets] = useState<{ [key: string]: number }>({});

  const teamOptions = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.Team)))
      .map(team => ({ value: team, label: team }))
  , [data]);

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      background: darkMode ? '#1a1a1a' : '#f8f9fa',
      borderColor: darkMode ? '#444' : '#e0e0e0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#4a3b7c'
      }
    }),
    menu: (base: any) => ({
      ...base,
      background: darkMode ? '#2d2d2d' : '#fff',
      border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }),
    option: (base: any, state: any) => ({
      ...base,
      background: state.isFocused 
        ? darkMode ? '#3d3d3d' : '#f0f0f0'
        : 'transparent',
      color: darkMode ? '#fff' : '#333',
      '&:hover': {
        background: darkMode ? '#3d3d3d' : '#f0f0f0'
      }
    }),
    multiValue: (base: any) => ({
      ...base,
      background: darkMode ? '#3d3d3d' : '#f0f0f0'
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: darkMode ? '#fff' : '#333'
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: darkMode ? '#999' : '#666',
      '&:hover': {
        background: darkMode ? '#444' : '#e0e0e0',
        color: darkMode ? '#fff' : '#333'
      }
    })
  };

  const chartData = React.useMemo(() => {
    const teamsToShow = selectedTeams.length > 0 ? selectedTeams : teamOptions.map(t => t.value);
    const teamPerformance = teamsToShow.map(team => {
      const teamSales = data
        .filter(item => item.Team === team)
        .reduce((sum, item) => sum + item['Sale Value'], 0);
      const target = targets[team] || 0;
      const achievement = target > 0 ? (teamSales / target) * 100 : 0;
      
      return {
        team,
        sales: teamSales,
        target,
        achievement
      };
    });

    return {
      labels: teamPerformance.map(t => t.team),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Sales',
          data: teamPerformance.map(t => t.sales),
          backgroundColor: '#36D7B7',
          borderRadius: 4,
          maxBarThickness: 35,
          order: 2
        },
        {
          type: 'line' as const,
          label: 'Target',
          data: teamPerformance.map(t => t.target),
          borderColor: darkMode ? '#fff' : '#000',
          borderWidth: 2,
          pointStyle: 'line',
          pointBorderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          order: 1
        }
      ]
    };
  }, [data, selectedTeams, targets, teamOptions, darkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: darkMode ? '#fff' : '#666',
          padding: 20,
          font: { size: 12 },
          usePointStyle: true
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
            const team = context.label;
            const target = targets[team] || 0;
            const achievement = target > 0 ? ((value / target) * 100).toFixed(1) : 'N/A';
            
            if (label === 'Sales') {
              return `${label}: ${value.toLocaleString()} (${achievement}% of target)`;
            }
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? '#333' : '#f0f0f0',
        },
        ticks: {
          color: darkMode ? '#999' : '#666',
          callback: (value: any) => value.toLocaleString()
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

  const handleTargetChange = (team: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTargets(prev => ({
      ...prev,
      [team]: numValue
    }));
  };

  return (
    <div style={{ height: '100%', padding: '1rem' }}>
      <ControlsContainer theme={{ darkMode }}>
        <div className="controls-row">
          <div className="team-select">
            <div className="section-title">Select Teams</div>
            <Select
              isMulti
              options={teamOptions}
              value={teamOptions.filter(option => selectedTeams.includes(option.value))}
              onChange={(selected: any) => setSelectedTeams(selected.map((s: any) => s.value))}
              styles={selectStyles}
              placeholder="Select teams to display"
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="section-title">Set Targets</div>
            <div className="targets-row">
              {(selectedTeams.length > 0 ? selectedTeams : teamOptions.map(t => t.value)).map(team => (
                <InputGroup key={team} size="sm">
                  <InputGroup.Text style={{
                    background: darkMode ? '#2d2d2d' : '#f8f9fa',
                    border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
                    color: darkMode ? '#fff' : '#666',
                    minWidth: '100px'
                  }}>
                    {team}
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={targets[team] || ''}
                    onChange={(e) => handleTargetChange(team, e.target.value)}
                    placeholder="Set target"
                    style={{
                      background: darkMode ? '#1a1a1a' : '#fff',
                      border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
                      color: darkMode ? '#fff' : '#333'
                    }}
                  />
                </InputGroup>
              ))}
            </div>
          </div>
        </div>
      </ControlsContainer>
      <ChartContainer>
        <Bar data={chartData} options={options} />
      </ChartContainer>
    </div>
  );
};

export default TeamPerformance; 