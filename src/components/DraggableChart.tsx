import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Card, Button } from 'react-bootstrap';
import { ChromePicker } from 'react-color';
import styled from 'styled-components';

const ChartContainer = styled(Card)`
  margin: 0;
  height: 100%;
  background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    z-index: 2;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid ${props => props.theme.darkMode ? '#444' : '#f0f0f0'};
    cursor: move;
    background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
    border-radius: 12px 12px 0 0;
    position: relative;
    z-index: 2;

    h5 {
      font-size: 1rem;
      font-weight: 600;
      color: ${props => props.theme.darkMode ? '#fff' : '#333'};
      margin: 0;
    }
  }

  .color-picker-popup {
    position: absolute;
    z-index: 1000;
    top: 45px;
    right: 10px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-body {
    height: calc(100% - 60px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    background: ${props => props.theme.darkMode ? '#2d2d2d' : '#fff'};
    border-radius: 0 0 12px 12px;
  }

  .chart-content {
    flex: 1;
    min-height: 0;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .resize-handle {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: ${props => props.theme.darkMode ? '#4a4a4a' : '#f0f0f0'};
    border-radius: 50%;
    cursor: se-resize;
    bottom: 8px;
    right: 8px;
    z-index: 3;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;

    &:hover {
      background-color: ${props => props.theme.darkMode ? '#666' : '#e0e0e0'};
      transform: scale(1.1);
    }

    &::before {
      content: '';
      width: 10px;
      height: 10px;
      border-right: 2px solid ${props => props.theme.darkMode ? '#666' : '#999'};
      border-bottom: 2px solid ${props => props.theme.darkMode ? '#666' : '#999'};
    }
  }

  &:hover .resize-handle {
    opacity: 1;
  }

  .customize-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: 6px;
    transition: all 0.2s;
    background: ${props => props.theme.darkMode ? '#3a3a3a' : '#f8f9fa'};
    border: 1px solid ${props => props.theme.darkMode ? '#555' : '#e0e0e0'};
    color: ${props => props.theme.darkMode ? '#fff' : '#666'};

    &:hover {
      background: ${props => props.theme.darkMode ? '#444' : '#f0f0f0'};
      border-color: ${props => props.theme.darkMode ? '#666' : '#ccc'};
    }
  }
`;

interface DraggableChartProps {
  title: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: string | number; height: number };
  children: React.ReactNode;
  onColorChange?: (color: string) => void;
  darkMode: boolean;
  onDragStop?: (e: any, d: { x: number; y: number }) => void;
  onResizeStop?: (e: any, direction: string, ref: HTMLElement, delta: any, position: { x: number; y: number }) => void;
  isDraggable?: boolean;
  isResizable?: boolean;
}

const DraggableChart: React.FC<DraggableChartProps> = ({
  title,
  defaultPosition,
  defaultSize,
  children,
  onColorChange,
  darkMode,
  onDragStop,
  onResizeStop,
  isDraggable = true,
  isResizable = true
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const content = (
    <ChartContainer theme={{ darkMode }} className="h-100">
      <div className="chart-header">
        <h5>{title}</h5>
        {onColorChange && (
          <div className="position-relative">
            <Button
              className="customize-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
            >
              Customize Colors
            </Button>
            {showColorPicker && (
              <div className="color-picker-popup" onClick={(e) => e.stopPropagation()}>
                <ChromePicker
                  onChange={(color) => onColorChange(color.hex)}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <Card.Body>
        <div className="chart-content">
          {children}
        </div>
      </Card.Body>
    </ChartContainer>
  );

  if (!isDraggable && !isResizable) {
    return <div style={{ height: '100%' }}>{content}</div>;
  }

  return (
    <Rnd
      default={{
        ...defaultPosition,
        ...defaultSize,
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="chart-header"
      enableResizing={isResizable}
      disableDragging={!isDraggable}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      resizeHandleComponent={isResizable ? {
        bottomRight: <div className="resize-handle" />
      } : undefined}
    >
      {content}
    </Rnd>
  );
};

export default DraggableChart; 