import React, { useRef, useEffect, useState } from 'react';
import type { DesignElement, ToolType, LayerType, ScaleConfig } from '../../types/gardenDesigner';
import { getCanvasCoordinates, isPointInElement, snapToGrid, GRID_SIZE } from '../../utils/canvasUtils';
import { drawElement } from '../../utils/canvasUtils';
import { isPointNear, calculateLineLength, calculateCircleArea, calculateRectangleArea, calculatePolygonArea, calculatePerimeter } from '../../utils/areaUtils';
import { formatDimension, formatArea } from '../../utils/unitUtils';

interface DesignCanvasProps {
  width: number;
  height: number;
  elements: DesignElement[];
  selectedElementIds: string[];
  activeTool: ToolType;
  activeLayer: LayerType;
  layerVisibility: Record<string, boolean>;
  scale: ScaleConfig;
  onElementCreate: (element: Omit<DesignElement, 'id' | 'name'>) => void;
  onElementSelect: (elementId: string | null, multiSelect?: boolean) => void;
  onElementMove: (elementId: string, dx: number, dy: number) => void;
  onElementResize: (elementId: string, x: number, y: number, width: number, height: number) => void;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

// Helper functions for coordinate conversion
const screenToWorld = (screenX: number, screenY: number, viewState: ViewState): { x: number; y: number } => {
  return {
    x: (screenX - viewState.panX) / viewState.zoom,
    y: (screenY - viewState.panY) / viewState.zoom
  };
};

const worldToScreen = (worldX: number, worldY: number, viewState: ViewState): { x: number; y: number } => {
  return {
    x: worldX * viewState.zoom + viewState.panX,
    y: worldY * viewState.zoom + viewState.panY
  };
};

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  width,
  height,
  elements,
  selectedElementIds,
  activeTool,
  activeLayer,
  layerVisibility,
  scale,
  onElementCreate,
  onElementSelect,
  onElementMove,
  onElementResize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // World coordinates
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]); // World coordinates
  const [polygonPoints, setPolygonPoints] = useState<Array<{x: number, y: number}>>([]); // World coordinates
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Screen coordinates
  const [resizeHandle, setResizeHandle] = useState<number | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 }); // World coordinates
  const [viewState, setViewState] = useState<ViewState>({ zoom: 1, panX: 0, panY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    redrawCanvas();
  }, [elements, selectedElementIds, activeTool, layerVisibility, polygonPoints, currentMousePos, isDrawing, viewState]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Apply zoom and pan transform
    ctx.save();
    ctx.translate(viewState.panX, viewState.panY);
    ctx.scale(viewState.zoom, viewState.zoom);

    // Calculate visible world coordinates
    const worldTopLeft = screenToWorld(0, 0, viewState);
    const worldBottomRight = screenToWorld(width, height, viewState);
    // const worldWidth = worldBottomRight.x - worldTopLeft.x;
    // const worldHeight = worldBottomRight.y - worldTopLeft.y;
    
    // Draw grid covering the entire visible area with some padding
    const padding = GRID_SIZE * 2; // Extra padding to ensure full coverage
    const gridStartX = Math.floor((worldTopLeft.x - padding) / GRID_SIZE) * GRID_SIZE;
    const gridStartY = Math.floor((worldTopLeft.y - padding) / GRID_SIZE) * GRID_SIZE;
    const gridEndX = Math.ceil((worldBottomRight.x + padding) / GRID_SIZE) * GRID_SIZE;
    const gridEndY = Math.ceil((worldBottomRight.y + padding) / GRID_SIZE) * GRID_SIZE;
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1 / viewState.zoom; // Adjust line width for zoom
    
    // Vertical lines
    for (let x = gridStartX; x <= gridEndX; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, gridStartY);
      ctx.lineTo(x, gridEndY);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = gridStartY; y <= gridEndY; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(gridStartX, y);
      ctx.lineTo(gridEndX, y);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach(element => {
      const isSelected = selectedElementIds.includes(element.id);
      const layerVisible = layerVisibility[element.layer] ?? true;
      drawElement(ctx, element, isSelected, layerVisible);
    });

    // Draw preview for current drawing (in world coordinates)
    if (isDrawing && activeTool !== 'select') {
      drawPreview(ctx);
    }

    // Draw polygon points (in world coordinates)
    if (polygonPoints.length > 0) {
      drawPolygonPreview(ctx);
    }

    // Restore transform for dimension labels (they should be in screen space)
    ctx.restore();

    // Draw dimension labels during drawing (in screen space)
    if (isDrawing || (activeTool === 'polygon' && polygonPoints.length > 0)) {
      drawDimensionLabel(ctx);
    }
  };

  const drawPreview = (ctx: CanvasRenderingContext2D) => {
    // Preview is drawn in world coordinates (transform already applied)
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2 / viewState.zoom; // Adjust line width for zoom
    ctx.setLineDash([5 / viewState.zoom, 5 / viewState.zoom]);

    if (activeTool === 'rectangle') {
      const x = Math.min(startPos.x, currentMousePos.x);
      const y = Math.min(startPos.y, currentMousePos.y);
      const w = Math.abs(currentMousePos.x - startPos.x);
      const h = Math.abs(currentMousePos.y - startPos.y);
      ctx.strokeRect(x, y, w, h);
    } else if (activeTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(currentMousePos.x - startPos.x, 2) +
        Math.pow(currentMousePos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (activeTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
    } else if (activeTool === 'freehand' && currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawPolygonPreview = (ctx: CanvasRenderingContext2D) => {
    // Polygon preview is drawn in world coordinates (transform already applied)
    if (polygonPoints.length === 0) return;

    ctx.strokeStyle = '#00ff88';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.lineWidth = 2 / viewState.zoom; // Adjust line width for zoom

    // Draw lines between points
    if (polygonPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
      for (let i = 1; i < polygonPoints.length; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
      }
      // Draw line to current mouse position if polygon is not closed
      if (activeTool === 'polygon' && polygonPoints.length >= 2) {
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
      }
      ctx.stroke();
    }

    // Fill polygon if it has at least 3 points
    if (polygonPoints.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
      for (let i = 1; i < polygonPoints.length; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
      }
      // Close path to show preview
      ctx.closePath();
      ctx.fill();
    }

    // Draw points
    ctx.fillStyle = '#00ff88';
    const pointSize = 4 / viewState.zoom;
    const highlightSize = 8 / viewState.zoom;
    polygonPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight first point to show where to click to close
      if (index === 0 && polygonPoints.length >= 3) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2 / viewState.zoom;
        ctx.beginPath();
        ctx.arc(point.x, point.y, highlightSize, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  };

  const drawDimensionLabel = (ctx: CanvasRenderingContext2D) => {
    let label = '';
    let labelX = 0;
    let labelY = 0;

    // All calculations in world coordinates (pixels), then convert to screen for display
    if (activeTool === 'rectangle' && isDrawing) {
      const w = Math.abs(currentMousePos.x - startPos.x);
      const h = Math.abs(currentMousePos.y - startPos.y);
      const widthFormatted = formatDimension(w, scale);
      const heightFormatted = formatDimension(h, scale);
      // Area is in pixels², formatArea expects pixels²
      const area = calculateRectangleArea(w, h);
      const areaFormatted = formatArea(area, scale);
      label = `${widthFormatted} × ${heightFormatted} | Opp: ${areaFormatted}`;
      const screenPos = worldToScreen((startPos.x + currentMousePos.x) / 2, Math.min(startPos.y, currentMousePos.y), viewState);
      labelX = screenPos.x;
      labelY = screenPos.y - 15;
    } else if (activeTool === 'circle' && isDrawing) {
      const radius = Math.sqrt(
        Math.pow(currentMousePos.x - startPos.x, 2) +
        Math.pow(currentMousePos.y - startPos.y, 2)
      );
      const diameter = radius * 2;
      const diameterFormatted = formatDimension(diameter, scale);
      const area = calculateCircleArea(radius);
      const areaFormatted = formatArea(area, scale);
      label = `Dia: ${diameterFormatted} | Opp: ${areaFormatted}`;
      const screenPos = worldToScreen(startPos.x, startPos.y - radius, viewState);
      labelX = screenPos.x;
      labelY = screenPos.y - 20;
    } else if (activeTool === 'line' && isDrawing) {
      const length = calculateLineLength(
        startPos.x,
        startPos.y,
        currentMousePos.x,
        currentMousePos.y
      );
      const lengthFormatted = formatDimension(length, scale);
      label = `Lengte: ${lengthFormatted}`;
      const screenPos = worldToScreen((startPos.x + currentMousePos.x) / 2, (startPos.y + currentMousePos.y) / 2, viewState);
      labelX = screenPos.x;
      labelY = screenPos.y;
    } else if (activeTool === 'polygon' && polygonPoints.length > 0) {
      if (polygonPoints.length >= 3) {
        const area = calculatePolygonArea(polygonPoints);
        const perimeter = calculatePerimeter(polygonPoints);
        const areaFormatted = formatArea(area, scale);
        const perimeterFormatted = formatDimension(perimeter, scale);
        label = `Opp: ${areaFormatted} | Omtrek: ${perimeterFormatted}`;
      } else {
        const lastPoint = polygonPoints[polygonPoints.length - 1];
        const length = calculateLineLength(
          lastPoint.x,
          lastPoint.y,
          currentMousePos.x,
          currentMousePos.y
        );
        const lengthFormatted = formatDimension(length, scale);
        label = `Lengte: ${lengthFormatted}`;
      }
      // Position label near last point or mouse (in screen space)
      if (polygonPoints.length > 0) {
        const lastPoint = polygonPoints[polygonPoints.length - 1];
        const screenLast = worldToScreen(lastPoint.x, lastPoint.y, viewState);
        const screenCurrent = worldToScreen(currentMousePos.x, currentMousePos.y, viewState);
        labelX = (screenLast.x + screenCurrent.x) / 2;
        labelY = Math.min(screenLast.y, screenCurrent.y) - 15;
      }
    }

    if (label) {
      // Draw background
      const metrics = ctx.measureText(label);
      const textWidth = metrics.width;
      const padding = 8;
      const bgX = labelX - textWidth / 2 - padding;
      const bgY = labelY - 12;
      const bgWidth = textWidth + padding * 2;
      const bgHeight = 20;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

      // Draw border
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1;
      ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);

      // Draw text
      ctx.fillStyle = '#00ff88';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle middle mouse button or Shift+drag for panning
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewState.panX, y: e.clientY - viewState.panY });
      e.preventDefault();
      return;
    }

    const screenPos = getCanvasCoordinates(e, canvas);
    const worldPos = screenToWorld(screenPos.x, screenPos.y, viewState);
    const snappedPos = {
      x: snapToGrid(worldPos.x),
      y: snapToGrid(worldPos.y)
    };

    if (activeTool === 'select') {
      // Check if clicking on resize handle (in world coordinates)
      const selectedElement = elements.find(el => selectedElementIds.includes(el.id));
      if (selectedElement) {
        const handle = getResizeHandle(selectedElement, snappedPos.x, snappedPos.y);
        if (handle !== null) {
          setResizeHandle(handle);
          setIsDragging(true);
          setDragStart(screenPos);
          return;
        }
      }

      // Check if clicking on element (in world coordinates)
      const clickedElement = findElementAt(snappedPos.x, snappedPos.y);
      if (clickedElement) {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          // Multi-select
          onElementSelect(clickedElement.id, true);
        } else {
          onElementSelect(clickedElement.id, false);
        }
        setIsDragging(true);
        setDragStart(screenPos);
        return;
      } else {
        // Deselect
        onElementSelect(null, false);
      }
    } else if (activeTool === 'polygon') {
      // Check if clicking near first point to close polygon
      if (polygonPoints.length >= 3 && polygonPoints.length > 0) {
        const firstPoint = polygonPoints[0];
        if (isPointNear(snappedPos, firstPoint, 10 / viewState.zoom)) {
          // Close polygon
          handlePolygonClose();
          return;
        }
      }
      // Add point to polygon (in world coordinates)
      setPolygonPoints([...polygonPoints, snappedPos]);
    } else {
      // Start drawing (in world coordinates)
      setIsDrawing(true);
      setStartPos(snappedPos);
      if (activeTool === 'freehand') {
        setCurrentPath([snappedPos]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle panning
    if (isPanning) {
      setViewState(prev => ({
        ...prev,
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y
      }));
      return;
    }

    const screenPos = getCanvasCoordinates(e, canvas);
    const worldPos = screenToWorld(screenPos.x, screenPos.y, viewState);
    const snappedPos = {
      x: snapToGrid(worldPos.x),
      y: snapToGrid(worldPos.y)
    };
    setCurrentMousePos(snappedPos);

    if (isDragging && activeTool === 'select') {
      if (resizeHandle !== null && selectedElementIds.length === 1) {
        // Resizing (in world coordinates)
        const element = elements.find(el => el.id === selectedElementIds[0]);
        if (element) {
          handleResize(element, snappedPos);
        }
      } else if (selectedElementIds.length > 0) {
        // Moving (convert screen delta to world delta)
        const worldDragStart = screenToWorld(dragStart.x, dragStart.y, viewState);
        const dx = snappedPos.x - worldDragStart.x;
        const dy = snappedPos.y - worldDragStart.y;
        selectedElementIds.forEach(id => {
          onElementMove(id, dx, dy);
        });
        setDragStart(screenPos);
      }
    } else if (isDrawing) {
      if (activeTool === 'freehand') {
        setCurrentPath([...currentPath, snappedPos]);
      }
      redrawCanvas();
    } else if (activeTool === 'polygon' && polygonPoints.length > 0) {
      // Update preview during polygon drawing
      redrawCanvas();
    }
  };

  const handleMouseUp = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (isDrawing && activeTool !== 'select' && activeTool !== 'polygon') {
      // All coordinates are already in world space
      const width = Math.abs(currentMousePos.x - startPos.x);
      const height = Math.abs(currentMousePos.y - startPos.y);

      if (width > 5 || height > 5 || activeTool === 'freehand') {
        let elementData: Omit<DesignElement, 'id' | 'name'>;

        if (activeTool === 'freehand' && currentPath.length > 1) {
          const bounds = getPathBounds(currentPath);
          elementData = {
            type: 'freehand',
            layer: activeLayer,
            x: bounds.minX,
            y: bounds.minY,
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY,
            visible: true,
            locked: false,
            properties: {
              path: currentPath,
              strokeColor: '#00ff88',
              strokeWidth: 2
            }
          };
        } else if (activeTool === 'rectangle') {
          elementData = {
            type: 'rectangle',
            layer: activeLayer,
            x: Math.min(startPos.x, currentMousePos.x),
            y: Math.min(startPos.y, currentMousePos.y),
            width,
            height,
            visible: true,
            locked: false,
            properties: {
              fillColor: '#00ff88',
              strokeColor: '#00ff88',
              strokeWidth: 2
            }
          };
        } else if (activeTool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(currentMousePos.x - startPos.x, 2) +
            Math.pow(currentMousePos.y - startPos.y, 2)
          );
          elementData = {
            type: 'circle',
            layer: activeLayer,
            x: startPos.x - radius,
            y: startPos.y - radius,
            width: radius * 2,
            height: radius * 2,
            visible: true,
            locked: false,
            properties: {
              fillColor: '#00ff88',
              strokeColor: '#00ff88',
              strokeWidth: 2
            }
          };
        } else if (activeTool === 'line') {
          elementData = {
            type: 'line',
            layer: activeLayer,
            x: startPos.x,
            y: startPos.y,
            width: currentMousePos.x - startPos.x,
            height: currentMousePos.y - startPos.y,
            visible: true,
            locked: false,
            properties: {
              strokeColor: '#00ff88',
              strokeWidth: 2
            }
          };
        } else {
          setIsDrawing(false);
          return;
        }

        onElementCreate(elementData);
      }
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setIsDragging(false);
    setIsPanning(false);
    setResizeHandle(null);
  };

  const handlePolygonClose = () => {
    if (polygonPoints.length >= 3) {
      // Complete polygon (points are already in world coordinates)
      const bounds = getPathBounds(polygonPoints);
      const elementData: Omit<DesignElement, 'id' | 'name'> = {
        type: 'polygon',
        layer: activeLayer,
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        visible: true,
        locked: false,
        properties: {
          points: polygonPoints,
          fillColor: '#00ff88',
          strokeColor: '#00ff88',
          strokeWidth: 2
        }
      };
      onElementCreate(elementData);
      setPolygonPoints([]);
    }
  };

  const handleDoubleClick = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'polygon' && polygonPoints.length >= 3) {
      handlePolygonClose();
    }
  };

  const findElementAt = (worldX: number, worldY: number): DesignElement | null => {
    // Check in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      if (isPointInElement(worldX, worldY, elements[i])) {
        return elements[i];
      }
    }
    return null;
  };

  const getResizeHandle = (element: DesignElement, worldX: number, worldY: number): number | null => {
    const handles = [
      { x: element.x, y: element.y }, // 0: top-left
      { x: element.x + element.width, y: element.y }, // 1: top-right
      { x: element.x + element.width, y: element.y + element.height }, // 2: bottom-right
      { x: element.x, y: element.y + element.height }, // 3: bottom-left
    ];

    const handleSize = 8 / viewState.zoom; // Adjust handle size for zoom
    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      if (
        worldX >= handle.x - handleSize &&
        worldX <= handle.x + handleSize &&
        worldY >= handle.y - handleSize &&
        worldY <= handle.y + handleSize
      ) {
        return i;
      }
    }
    return null;
  };

  const handleResize = (element: DesignElement, worldPos: { x: number; y: number }) => {
    if (resizeHandle === null) return;

    let newX = element.x;
    let newY = element.y;
    let newWidth = element.width;
    let newHeight = element.height;

    switch (resizeHandle) {
      case 0: // top-left
        newX = worldPos.x;
        newY = worldPos.y;
        newWidth = element.x + element.width - worldPos.x;
        newHeight = element.y + element.height - worldPos.y;
        break;
      case 1: // top-right
        newY = worldPos.y;
        newWidth = worldPos.x - element.x;
        newHeight = element.y + element.height - worldPos.y;
        break;
      case 2: // bottom-right
        newWidth = worldPos.x - element.x;
        newHeight = worldPos.y - element.y;
        break;
      case 3: // bottom-left
        newX = worldPos.x;
        newWidth = element.x + element.width - worldPos.x;
        newHeight = worldPos.y - element.y;
        break;
    }

    if (newWidth > 10 / viewState.zoom && newHeight > 10 / viewState.zoom) {
      onElementResize(element.id, newX, newY, newWidth, newHeight);
    }
  };

  const getPathBounds = (path: Array<{x: number, y: number}>) => {
    if (path.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    
    let minX = path[0].x;
    let minY = path[0].y;
    let maxX = path[0].x;
    let maxY = path[0].y;

    path.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    return { minX, minY, maxX, maxY };
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onMouseLeave={() => {
        setIsDrawing(false);
        setIsDragging(false);
        setIsPanning(false);
        setResizeHandle(null);
      }}
      onWheel={(e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert mouse position to world coordinates before zoom
        const worldX = (mouseX - viewState.panX) / viewState.zoom;
        const worldY = (mouseY - viewState.panY) / viewState.zoom;
        
        // Calculate zoom
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, viewState.zoom * zoomDelta));
        
        // Adjust pan to zoom towards mouse position
        const newPanX = mouseX - worldX * newZoom;
        const newPanY = mouseY - worldY * newZoom;
        
        setViewState({
          zoom: newZoom,
          panX: newPanX,
          panY: newPanY
        });
      }}
      onContextMenu={(e) => {
        // Prevent context menu on right click
        e.preventDefault();
      }}
    />
  );
};
