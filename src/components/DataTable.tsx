import React, { useState, useMemo } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { Download, FileText, Search, ChevronUp, ChevronDown } from 'react-feather';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const TableContainer = styled.div`
  background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h6 {
    margin: 0;
    font-weight: 600;
    color: ${props => props.theme.darkMode ? '#fff' : '#333'};
  }
`;

const TableControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SearchInput = styled(InputGroup)`
  width: 300px;

  .form-control {
    background: ${props => props.theme.darkMode ? '#1a1a1a' : '#f8f9fa'};
    border: 1px solid ${props => props.theme.darkMode ? '#444' : '#e0e0e0'};
    color: ${props => props.theme.darkMode ? '#fff' : '#333'};

    &:focus {
      box-shadow: none;
      border-color: #4a3b7c;
    }
  }
`;

const StyledTable = styled(Table)`
  margin: 0;
  width: 100%;

  .table-container {
    max-height: 400px;
    overflow-y: auto;
    overflow-x: auto;
    border: 1px solid ${props => props.theme.darkMode ? '#444' : '#e0e0e0'};
    border-radius: 4px;
    width: 100%;
  }

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  thead th {
    position: sticky;
    top: 0;
    background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
    color: ${props => props.theme.darkMode ? '#fff' : '#333'};
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.75rem;
    border-bottom: 2px solid ${props => props.theme.darkMode ? '#444' : '#e0e0e0'};
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    z-index: 2;

    &:hover {
      background: ${props => props.theme.darkMode ? '#3d3d3d' : '#f8f9fa'};
    }

    .sort-icon {
      margin-left: 0.5rem;
      vertical-align: middle;
    }
  }

  tbody td {
    font-size: 0.875rem;
    color: ${props => props.theme.darkMode ? '#e0e0e0' : '#666'};
    padding: 0.75rem;
    border-bottom: 1px solid ${props => props.theme.darkMode ? '#444' : '#e0e0e0'};
    white-space: nowrap;
  }

  tbody tr:hover {
    background: ${props => props.theme.darkMode ? '#3d3d3d' : '#f8f9fa'};
  }
`;

const ExportButton = styled(Button)`
  background: #4a3b7c;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;

  &:hover, &:focus {
    background: #5a4b8c;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface DataTableProps {
  data: any[];
  darkMode: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (searchTerm) {
      sortableData = sortableData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sortConfig) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const ws = XLSXUtils.json_to_sheet(data);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'Sales Data');
    const excelBuffer = XLSXWrite(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales_data.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [columns],
      body: sortedData.map(row => columns.map(col => row[col])),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [74, 59, 124] }
    });
    doc.save('sales_data.pdf');
  };

  return (
    <TableContainer theme={{ darkMode }}>
      <TableHeader theme={{ darkMode }}>
        <h6>Sales Data</h6>
        <TableControls>
          <SearchInput theme={{ darkMode }}>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>
          <ExportButton onClick={exportToExcel}>
            <Download size={16} />
            Export Excel
          </ExportButton>
          <ExportButton onClick={exportToPDF}>
            <FileText size={16} />
            Export PDF
          </ExportButton>
        </TableControls>
      </TableHeader>

      <div className="table-container">
        <StyledTable theme={{ darkMode }}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column} onClick={() => handleSort(column)}>
                  {column}
                  {sortConfig?.key === column && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'ascending' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>
    </TableContainer>
  );
};

export default DataTable; 