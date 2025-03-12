import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Navbar, Form } from 'react-bootstrap';
import { Sun, Moon, MessageCircle } from 'react-feather';
import { SheetData, fetchSheetData, setupRealtimeUpdates } from './services/googleSheets';
import SalesChart from './components/charts/SalesChart';
import TrendsChart from './components/charts/TrendsChart';
import DistributionCharts from './components/charts/DistributionCharts';
import TopPerformers from './components/charts/TopPerformers';
import TeamPerformance from './components/charts/TeamPerformance';
import FilterBar from './components/FilterBar';
import DraggableChart from './components/DraggableChart';
import SalesDistributionCombo from './components/charts/SalesDistributionCombo';
import DataTable from './components/DataTable';
import ChatBot from './components/ChatBot';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding-top: 70px;
  min-height: 100vh;
  background: ${props => props.theme.darkMode ? '#1a1a1a' : '#f8f9fa'};
`;

const StyledNavbar = styled(Navbar)`
  background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'} !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  height: 70px;
  
  .navbar-brand {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.darkMode ? '#fff' : '#4a3b7c'};
  }

  .nav-link {
    color: ${props => props.theme.darkMode ? '#e0e0e0' : '#666'} !important;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: color 0.2s;

    &:hover {
      color: ${props => props.theme.darkMode ? '#fff' : '#4a3b7c'} !important;
    }
  }
`;

const StatsCard = styled(Card)`
  background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
  border: 1px solid ${props => props.theme.darkMode ? '#444' : '#e0e0e0'};
  border-radius: 12px;
  padding: 1.25rem;
  height: 100%;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card-body {
    padding: 0;
  }

  .card-title {
    font-size: 0.875rem;
    color: ${props => props.theme.darkMode ? '#999' : '#666'};
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 600;
    color: ${props => props.theme.darkMode ? '#fff' : '#333'};
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: ${props => props.theme.darkMode ? '#666' : '#999'};
  }
`;

const FilterSection = styled.div`
  background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
  padding: 1.5rem 2rem;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  z-index: 99;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .filter-row {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
  }

  .filter-group {
    flex: 1;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: ${props => props.theme.darkMode ? '#999' : '#666'};
    margin-bottom: 0.75rem;
  }

  .form-select {
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    background: ${props => props.theme.darkMode ? '#1a1a1a' : '#f8f9fa'};
    color: ${props => props.theme.darkMode ? '#fff' : '#333'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: ${props => props.theme.darkMode ? '#222' : '#f0f0f0'};
    }

    &:focus {
      box-shadow: none;
      background: ${props => props.theme.darkMode ? '#333' : '#fff'};
      outline: 1px solid ${props => props.theme.darkMode ? '#666' : '#e0e0e0'};
    }
  }
`;

const StatsSection = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: ${props => props.theme.darkMode ? '#1a1a1a' : '#f8f9fa'};
  padding: 1.5rem 2rem;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  height: auto;
`;

const MainContent = styled.div`
  margin-top: 220px;
  padding: 1rem 2rem;
  position: relative;
  z-index: 1;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  max-width: 100%;
  overflow-x: hidden;
  
  .chart-wrapper {
    background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    height: 400px;
    width: 100%;
    
    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    &.full-width {
      grid-column: 1 / -1;
      height: 600px;
    }
  }

  .data-table-wrapper {
    grid-column: 1 / -1;
    width: 100%;
    overflow-x: auto;
  }
`;

const StyledFilterBar = styled(FilterBar)`
  z-index: 100;
`;

const AssistantButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
  background: #4a3b7c;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;

  &:hover, &:focus {
    background: #5a4b8c;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [chartColors, setChartColors] = useState<{ [key: string]: string }>({});
  const [chartLayout] = useState({
    salesOverview: { w: '100%', h: 400 },
    salesTrends: { w: '100%', h: 400 },
    distribution: { w: '100%', h: 400 },
    topPerformers: { w: '100%', h: 400 },
    teamPerformance: { w: '100%', h: 500 }
  });
  const [showChatBot, setShowChatBot] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchSheetData();
        setData(result);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please check your API URL and try again.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const cleanup = setupRealtimeUpdates((newData) => setData(newData));
    return () => cleanup();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  // Filter data based on selected filters
  const filteredData = data.filter(item => {
    const now = new Date();
    const itemDate = new Date(item.Date);
    
    // Date range filter
    let dateMatch = true;
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      dateMatch = itemDate >= start && itemDate <= end;
    } else if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - daysAgo);
      dateMatch = itemDate >= cutoffDate;
    }

    // Category filter
    const categoryMatch = selectedCategory === 'all' || item['Plot Category'] === selectedCategory;

    // Status filter
    const statusMatch = selectedStatus === 'all' || item['Clearance Status'] === selectedStatus;

    // Team filter
    const teamMatch = selectedTeam === 'all' || item.Team === selectedTeam;

    return dateMatch && categoryMatch && statusMatch && teamMatch;
  });

  const totalSales = filteredData.reduce((sum, item) => sum + item['Sale Value'], 0);
  const averageSale = filteredData.length > 0 ? totalSales / filteredData.length : 0;

  const handleChartMove = (key: string, position: { x: number; y: number }) => {
    const newLayout = { ...chartLayout };
    newLayout[key] = { ...newLayout[key], x: position.x, y: position.y };

    // Find overlapping charts
    Object.entries(newLayout).forEach(([otherKey, otherChart]) => {
      if (otherKey !== key) {
        const overlap = checkOverlap(newLayout[key], otherChart);
        if (overlap) {
          // Adjust position to prevent overlap
          if (position.y + newLayout[key].h > otherChart.y) {
            otherChart.y = position.y + newLayout[key].h + 20;
          }
        }
      }
    });

    setChartLayout(newLayout);
  };

  const handleChartResize = (key: string, size: { width: number; height: number }) => {
    const newLayout = { ...chartLayout };
    newLayout[key] = {
      ...newLayout[key],
      w: Math.max(size.width, 300), // Minimum width
      h: Math.max(size.height, 200)  // Minimum height
    };

    // Adjust other charts if needed
    Object.entries(newLayout).forEach(([otherKey, otherChart]) => {
      if (otherKey !== key) {
        const overlap = checkOverlap(newLayout[key], otherChart);
        if (overlap) {
          otherChart.y = newLayout[key].y + newLayout[key].h + 20;
        }
      }
    });

    setChartLayout(newLayout);
  };

  const checkOverlap = (chart1: any, chart2: any) => {
    return !(
      chart1.x + chart1.w < chart2.x ||
      chart2.x + chart2.w < chart1.x ||
      chart1.y + chart1.h < chart2.y ||
      chart2.y + chart2.h < chart1.y
    );
  };

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      <StyledNavbar expand="lg" className="fixed-top" theme={{ darkMode }}>
        <Container fluid>
          <Navbar.Brand href="#home">Sales Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" active>Home</Nav.Link>
              <Nav.Link href="#analytics">Analytics</Nav.Link>
              <Nav.Link href="#settings">Settings</Nav.Link>
            </Nav>
            <AssistantButton
              onClick={() => setShowChatBot(true)}
              variant={darkMode ? 'outline-light' : 'outline-dark'}
            >
              <MessageCircle />
              <span>AI Assistant</span>
            </AssistantButton>
            <Button
              variant={darkMode ? 'outline-light' : 'outline-dark'}
              onClick={toggleDarkMode}
              className="d-flex align-items-center"
              style={{ borderRadius: '8px' }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="ms-2">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
          </Navbar.Collapse>
        </Container>
      </StyledNavbar>

      <StatsSection theme={{ darkMode }}>
        <Row className="g-4">
          <Col md={6} lg={3}>
            <StatsCard theme={{ darkMode }}>
              <Card.Body>
                <Card.Title>Total Sales</Card.Title>
                <div className="stat-value">
                  {totalSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="stat-label">
                  {filteredData.length} transactions
                </div>
              </Card.Body>
            </StatsCard>
          </Col>
          <Col md={6} lg={3}>
            <StatsCard theme={{ darkMode }}>
              <Card.Body>
                <Card.Title>Average Sale</Card.Title>
                <div className="stat-value">
                  {averageSale.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="stat-label">
                  Based on {filteredData.length} sales
                </div>
              </Card.Body>
            </StatsCard>
          </Col>
          <Col md={6} lg={3}>
            <StatsCard theme={{ darkMode }}>
              <Card.Body>
                <Card.Title>Projects</Card.Title>
                <div className="stat-value">
                  {new Set(filteredData.map(item => item['Project/ Block'])).size}
                </div>
                <div className="stat-label">
                  Active projects
                </div>
              </Card.Body>
            </StatsCard>
          </Col>
          <Col md={6} lg={3}>
            <StatsCard theme={{ darkMode }}>
              <Card.Body>
                <Card.Title>Teams</Card.Title>
                <div className="stat-value">
                  {new Set(filteredData.map(item => item.Team)).size}
                </div>
                <div className="stat-label">
                  Contributing teams
                </div>
              </Card.Body>
            </StatsCard>
          </Col>
        </Row>
      </StatsSection>

      <DashboardContainer theme={{ darkMode }}>
        <MainContent>
          <ChartsContainer>
            <div className="chart-wrapper">
              <DraggableChart
                title="Sales Overview"
                defaultPosition={{ x: 0, y: 0 }}
                defaultSize={{ width: chartLayout.salesOverview.w, height: chartLayout.salesOverview.h }}
                onColorChange={(color) => setChartColors({ ...chartColors, salesOverview: color })}
                darkMode={darkMode}
                isDraggable={false}
                isResizable={false}
              >
                {loading ? (
                  <p className="text-muted text-center">Loading chart data...</p>
                ) : (
                  <SalesChart data={filteredData} darkMode={darkMode} />
                )}
              </DraggableChart>
            </div>

            <div className="chart-wrapper">
              <DraggableChart
                title="Sales Distribution"
                defaultPosition={{ x: 0, y: 0 }}
                defaultSize={{ width: chartLayout.distribution.w, height: chartLayout.distribution.h }}
                onColorChange={(color) => setChartColors({ ...chartColors, distribution: color })}
                darkMode={darkMode}
                isDraggable={false}
                isResizable={false}
              >
                {loading ? (
                  <p className="text-muted text-center">Loading chart data...</p>
                ) : (
                  <DistributionCharts data={filteredData} darkMode={darkMode} />
                )}
              </DraggableChart>
            </div>

            <div className="chart-wrapper">
              <DraggableChart
                title="Sales Trends"
                defaultPosition={{ x: 0, y: 0 }}
                defaultSize={{ width: chartLayout.salesTrends.w, height: chartLayout.salesTrends.h }}
                onColorChange={(color) => setChartColors({ ...chartColors, salesTrends: color })}
                darkMode={darkMode}
                isDraggable={false}
                isResizable={false}
              >
                {loading ? (
                  <p className="text-muted text-center">Loading chart data...</p>
                ) : (
                  <TrendsChart data={filteredData} darkMode={darkMode} />
                )}
              </DraggableChart>
            </div>

            <div className="chart-wrapper">
              <DraggableChart
                title="Top Performers"
                defaultPosition={{ x: 0, y: 0 }}
                defaultSize={{ width: chartLayout.topPerformers.w, height: chartLayout.topPerformers.h }}
                onColorChange={(color) => setChartColors({ ...chartColors, topPerformers: color })}
                darkMode={darkMode}
                isDraggable={false}
                isResizable={false}
              >
                {loading ? (
                  <p className="text-muted text-center">Loading chart data...</p>
                ) : (
                  <TopPerformers data={filteredData} darkMode={darkMode} />
                )}
              </DraggableChart>
            </div>

            <div className="chart-wrapper full-width">
              <DraggableChart
                title="Sales Distribution Combo"
                defaultPosition={{ x: 0, y: 0 }}
                defaultSize={{ width: '100%', height: 500 }}
                darkMode={darkMode}
                isDraggable={false}
                isResizable={false}
              >
                {loading ? (
                  <p className="text-muted text-center">Loading chart data...</p>
                ) : (
                  <SalesDistributionCombo data={filteredData} darkMode={darkMode} />
                )}
              </DraggableChart>
            </div>

            <div className="chart-wrapper full-width">
              <DraggableChart
                title="Team Performance"
                defaultPosition={{ x: 0, y: 0 }}
                defaultSize={{ width: '100%', height: 600 }}
                onColorChange={(color) => setChartColors({ ...chartColors, teamPerformance: color })}
                darkMode={darkMode}
                isDraggable={false}
                isResizable={false}
              >
                {loading ? (
                  <p className="text-muted text-center">Loading chart data...</p>
                ) : (
                  <TeamPerformance data={filteredData} darkMode={darkMode} />
                )}
              </DraggableChart>
            </div>

            {/* Add the DataTable component */}
            {!loading && (
              <div className="data-table-wrapper">
                <DataTable data={filteredData} darkMode={darkMode} />
              </div>
            )}
          </ChartsContainer>
        </MainContent>
      </DashboardContainer>
      <ChatBot 
        darkMode={darkMode} 
        isOpen={showChatBot} 
        onClose={() => setShowChatBot(false)} 
      />
    </div>
  );
};

export default App; 