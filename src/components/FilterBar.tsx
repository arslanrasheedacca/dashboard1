import React from 'react';
import { Form, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { Filter, X, ChevronDown } from 'react-feather';
import Select from 'react-select';

const FilterSidebar = styled.div<{ isOpen: boolean; darkMode: boolean }>`
  position: fixed;
  top: 0;
  left: ${props => props.isOpen ? '0' : '-320px'};
  width: 320px;
  height: 100vh;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: left 0.3s ease;
  z-index: 1200;
  display: flex;
  flex-direction: column;

  .filter-header {
    background: #4a3b7c;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h5 {
      margin: 0;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .filter-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .filter-section {
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .filter-section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    user-select: none;

    svg {
      transition: transform 0.2s;
      &.expanded {
        transform: rotate(-180deg);
      }
    }
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #333;
    background: #f8f9fa;

    &:focus {
      outline: none;
      border-color: #4a3b7c;
      box-shadow: 0 0 0 1px #4a3b7c20;
    }

    &::placeholder {
      color: #999;
    }
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-check {
    margin: 0;
    padding-left: 1.75rem;

    .form-check-input {
      margin-left: -1.75rem;
      border-color: #ccc;
      
      &:checked {
        background-color: #4a3b7c;
        border-color: #4a3b7c;
      }

      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(74, 59, 124, 0.25);
      }
    }

    .form-check-label {
      font-size: 0.875rem;
      color: #666;
      user-select: none;
    }
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-select {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    color: #333;
    background-color: #f8f9fa;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #4a3b7c;
      box-shadow: 0 0 0 1px #4a3b7c20;
    }
  }
`;

const CloseButton = styled(Button)`
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  
  &:hover, &:focus {
    color: #fff;
    background: transparent;
  }
`;

const ToggleButton = styled(Button)<{ isOpen: boolean }>`
  position: fixed;
  left: ${props => props.isOpen ? '320px' : '0'};
  top: 85px;
  z-index: 1201;
  padding: 0.5rem;
  border-radius: 0 6px 6px 0;
  transition: left 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #4a3b7c;
  border: none;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);

  &:hover, &:focus {
    background: #5a4b8c;
  }
`;

interface FilterBarProps {
  dateRange: string;
  setDateRange: (value: string) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedTeam: string;
  setSelectedTeam: (value: string) => void;
  data: any[];
  darkMode: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedTeam,
  setSelectedTeam,
  data
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState({
    search: true,
    checkboxes: true,
    select: true,
    radio: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const categoryOptions = React.useMemo(() => 
    Array.from(new Set(data.map(item => item['Plot Category'])))
      .map(category => ({ value: category, label: category }))
  , [data]);

  const statusOptions = React.useMemo(() => 
    Array.from(new Set(data.map(item => item['Clearance Status'])))
      .map(status => ({ value: status, label: status }))
  , [data]);

  const teamOptions = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.Team)))
      .map(team => ({ value: team, label: team }))
  , [data]);

  return (
    <>
      <FilterSidebar isOpen={isOpen}>
        <div className="filter-header">
          <h5>
            <Filter size={18} />
            FILTERS
          </h5>
          <CloseButton onClick={() => setIsOpen(false)}>
            <X size={18} />
          </CloseButton>
        </div>

        <div className="filter-content">
          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('search')}
            >
              <ChevronDown 
                size={16} 
                className={expandedSections.search ? 'expanded' : ''}
              />
              SEARCH
            </div>
            {expandedSections.search && (
              <input
                type="text"
                className="search-input"
                placeholder="Try color-1..."
              />
            )}
          </div>

          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('checkboxes')}
            >
              <ChevronDown 
                size={16}
                className={expandedSections.checkboxes ? 'expanded' : ''}
              />
              CHECK BOXES
            </div>
            {expandedSections.checkboxes && (
              <div className="checkbox-group">
                <Form.Check
                  type="checkbox"
                  id="option1"
                  label="Option 1"
                />
                <Form.Check
                  type="checkbox"
                  id="option2"
                  label="Option 2"
                />
                <Form.Check
                  type="checkbox"
                  id="option3"
                  label="Option 3"
                />
              </div>
            )}
          </div>

          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('select')}
            >
              <ChevronDown 
                size={16}
                className={expandedSections.select ? 'expanded' : ''}
              />
              SELECT
            </div>
            {expandedSections.select && (
              <Form.Select>
                <option value="">Choose an option</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </Form.Select>
            )}
          </div>

          <div className="filter-section">
            <div 
              className="filter-section-header"
              onClick={() => toggleSection('radio')}
            >
              <ChevronDown 
                size={16}
                className={expandedSections.radio ? 'expanded' : ''}
              />
              RADIO BUTTONS
            </div>
            {expandedSections.radio && (
              <div className="radio-group">
                <Form.Check
                  type="radio"
                  name="radioGroup"
                  id="radio1"
                  label="All"
                  defaultChecked
                />
                <Form.Check
                  type="radio"
                  name="radioGroup"
                  id="radio2"
                  label="Choice 2"
                />
                <Form.Check
                  type="radio"
                  name="radioGroup"
                  id="radio3"
                  label="Choice 3"
                />
              </div>
            )}
          </div>
        </div>
      </FilterSidebar>

      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      >
        <Filter size={16} />
      </ToggleButton>
    </>
  );
};

export default FilterBar; 