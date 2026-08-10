import React, { useRef, useEffect, useState } from 'react';
import type { DesignElement, ToolType, LayerType, ScaleConfig, ViewState, PlanProjection } from '../../types/gardenDesigner';
import { isPointInElement, snapToGrid, GRID_SIZE } from '../../utils/canvasUtils';
import { drawElement } from '../../utils/canvasUtils';
import { isPointNear, calculateLineLength, calculateCircleArea, calculateRectangleArea, calculatePolygonArea, calculatePerimeter } from '../../utils/areaUtils';
import { formatDimension, formatArea } from '../../utils/unitUtils';
import { screenToWorld, worldToScreen, applyWheelNavigation } from '../../utils/viewUtils';
import { getAdaptiveGridStep } from '../../utils/canvasUtils';
import {
  createWallElementData,
  DEFAULT_WALL_THICKNESS_CM,
  resolveWallEnd,
  thicknessToPixels,
  wallLengthPx,
  wallPolygonFromCenterline
} from '../../utils/wallUtils';
import {
  createOpeningElementData,
  createRoomElementData,
  findNearestWallHitInElevation,
  metersToElevationCanvasY,
  openingPreviewPoints,
  type WallHit
} from '../../utils/openingUtils';
import { unitToPixels } from '../../utils/unitUtils';

interface DesignCanvasProps {
  width: number;
  height: number;
  elements: DesignElement[];
  /** Unprojected design elements — used for wall/opening hit tests */
  sourceElements?: DesignElement[];
  selectedElementIds: string[];
  activeTool: ToolType;
  activeLayer: LayerType;
  layerVisibility: Record<string, boolean>;
  scale: ScaleConfig;
  viewState: ViewState;
  planProjection?: PlanProjection;
  readOnly?: boolean;
  wallThicknessCm?: number;
  doorWidthCm?: number;
  windowWidthCm?: number;
  onViewStateChange: (view: ViewState) => void;
  onCursorWorldMove?: (pos: { x: number; y: number } | null) => void;
  onElementCreate: (element: Omit<DesignElement, 'id' | 'name'>) => void;
  onElementSelect: (elementId: string | null, multiSelect?: boolean) => void;
  onElementMove: (elementId: string, dx: number, dy: number) => void;
  onElementResize: (elementId: string, x: number, y: number, width: number, height: number) => void;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  width,
  height,
  elements,
  sourceElements,
  selectedElementIds,
  activeTool,
  activeLayer,
  layerVisibility,
  scale,
  viewState,
  planProjection = 'top',
  readOnly = false,
  wallThicknessCm = DEFAULT_WALL_THICKNESS_CM,
  doorWidthCm = 90,
  windowWidthCm = 120,
  onViewStateChange,
  onCursorWorldMove,
  onElementCreate,
  onElementSelect,
  onElementMove,
  onElementResize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef(viewState);
  viewRef.current = viewState;
  const onViewChangeRef = useRef(onViewStateChange);
  onViewChangeRef.current = onViewStateChange;
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // World coordinates
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]); // World coordinates
  const [polygonPoints, setPolygonPoints] = useState<Array<{x: number, y: number}>>([]); // World coordinates
  const [isDragging, setIsDragging] = useState(false);
  const lastDragWorldRef = useRef<{ x: number; y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<number | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 }); // World coordinates
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [altPressed, setAltPressed] = useState(false);
  const [openingHover, setOpeningHover] = useState<WallHit | null>(null);

  const isPanMode = activeTool === 'hand' || spacePressed;
  const hitElements = sourceElements ?? elements;
  const openingsAllowedInElevation = activeTool === 'door' || activeTool === 'window';
  const blockDrawing = readOnly && !openingsAllowedInElevation;

  const resolveOpeningHit = (worldX: number, worldY: number): WallHit | null => {
    const kind = activeTool === 'window' ? 'window' : 'door';
    const maxDist = Math.max(28 / viewState.zoom, thicknessToPixels(30, scale));
    return findNearestWallHitInElevation(
      hitElements,
      planProjection,
      scale,
      worldX,
      worldY,
      maxDist,
      kind
    );
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSpacePressed(true);
      }
      if (e.key === 'Alt') setAltPressed(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePressed(false);
      if (e.key === 'Alt') setAltPressed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const wallEndPos = (raw: { x: number; y: number }) =>
    resolveWallEnd(startPos, raw, { freeAngle: altPressed });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      const next = applyWheelNavigation(e, viewRef.current, mouseX, mouseY);
      onViewChangeRef.current(next);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [width, height]);

  useEffect(() => {
    redrawCanvas();
  }, [elements, selectedElementIds, activeTool, layerVisibility, polygonPoints, currentMousePos, isDrawing, viewState, planProjection, readOnly, wallThicknessCm, doorWidthCm, windowWidthCm, altPressed, startPos, openingHover]);

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
    
    const gridStep = getAdaptiveGridStep(viewState.zoom, GRID_SIZE);
    const majorEvery = gridStep >= GRID_SIZE * 10 ? 5 : 1;

    const padding = gridStep * 2;
    const gridStartX = Math.floor((worldTopLeft.x - padding) / gridStep) * gridStep;
    const gridStartY = Math.floor((worldTopLeft.y - padding) / gridStep) * gridStep;
    const gridEndX = Math.ceil((worldBottomRight.x + padding) / gridStep) * gridStep;
    const gridEndY = Math.ceil((worldBottomRight.y + padding) / gridStep) * gridStep;

    ctx.lineWidth = 1 / viewState.zoom;

    let lineIndex = 0;
    for (let x = gridStartX; x <= gridEndX; x += gridStep, lineIndex++) {
      const isMajor = lineIndex % majorEvery === 0;
      ctx.strokeStyle = isMajor ? '#444' : '#2a2a2a';
      ctx.beginPath();
      ctx.moveTo(x, gridStartY);
      ctx.lineTo(x, gridEndY);
      ctx.stroke();
    }

    lineIndex = 0;
    for (let y = gridStartY; y <= gridEndY; y += gridStep, lineIndex++) {
      const isMajor = lineIndex % majorEvery === 0;
      ctx.strokeStyle = isMajor ? '#444' : '#2a2a2a';
      ctx.beginPath();
      ctx.moveTo(gridStartX, y);
      ctx.lineTo(gridEndX, y);
      ctx.stroke();
    }

    if (planProjection !== 'top') {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2 / viewState.zoom;
      ctx.setLineDash([10 / viewState.zoom, 8 / viewState.zoom]);
      ctx.beginPath();
      ctx.moveTo(gridStartX, 0);
      ctx.lineTo(gridEndX, 0);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw elements
    elements.forEach(element => {
      const isSelected = selectedElementIds.includes(element.id);
      const layerVisible = layerVisibility[element.layer] ?? true;
      drawElement(ctx, element, isSelected, layerVisible, scale);
    });

    // Draw preview for current drawing (in world coordinates)
    if (isDrawing && activeTool !== 'select') {
      drawPreview(ctx);
    }

    // Opening hover preview
    if ((activeTool === 'door' || activeTool === 'window') && openingHover) {
      const widthCm = activeTool === 'door' ? doorWidthCm : windowWidthCm;
      const kind = activeTool === 'door' ? 'door' : 'window';
      if (planProjection === 'top') {
        const pts = openingPreviewPoints(openingHover, widthCm, scale, kind);
        if (pts && pts.length >= 3) {
          ctx.fillStyle = kind === 'door' ? 'rgba(146, 64, 14, 0.45)' : 'rgba(147, 197, 253, 0.45)';
          ctx.strokeStyle = kind === 'door' ? '#f59e0b' : '#60a5fa';
          ctx.lineWidth = 2 / viewState.zoom;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else {
        const wallProj = elements.find(el => el.id === openingHover.wall.id);
        const sillM = openingHover.sillM ?? (kind === 'door' ? 0 : 0.9);
        const heightM = openingHover.openingHeightM ?? (kind === 'door' ? 2.1 : 1.2);
        if (wallProj) {
          const openingW = Math.min(
            wallProj.width * 0.9,
            unitToPixels(widthCm, 'cm', scale)
          );
          const ox = wallProj.x + openingHover.t * wallProj.width - openingW / 2;
          const yTop = metersToElevationCanvasY(sillM + heightM, scale);
          const yBot = metersToElevationCanvasY(sillM, scale);
          ctx.fillStyle = kind === 'door' ? 'rgba(146, 64, 14, 0.5)' : 'rgba(147, 197, 253, 0.55)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2 / viewState.zoom;
          ctx.fillRect(ox, yTop, openingW, yBot - yTop);
          ctx.strokeRect(ox, yTop, openingW, yBot - yTop);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(wallProj.x, wallProj.y, wallProj.width, wallProj.height);
        }
        ctx.fillStyle = '#7dd3fc';
        ctx.font = `${11 / viewState.zoom}px system-ui`;
        ctx.fillText(
          `Dorpel ${Math.round(sillM * 100)} cm · H ${Math.round(heightM * 100)} cm`,
          currentMousePos.x + 10 / viewState.zoom,
          currentMousePos.y
        );
      }
    }

    // Draw polygon / room points (in world coordinates)
    if (polygonPoints.length > 0) {
      drawPolygonPreview(ctx);
    }

    // Restore transform for dimension labels (they should be in screen space)
    ctx.restore();

    // Draw dimension labels during drawing (in screen space)
    if (isDrawing || ((activeTool === 'polygon' || activeTool === 'room') && polygonPoints.length > 0)) {
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
    } else if (activeTool === 'line' || activeTool === 'contour') {
      const isContour = activeTool === 'contour';
      if (isContour) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3 / viewState.zoom;
      }
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
    } else if (activeTool === 'wall') {
      const end = wallEndPos(currentMousePos);
      const thicknessPx = thicknessToPixels(wallThicknessCm, scale);
      const pts = wallPolygonFromCenterline(startPos.x, startPos.y, end.x, end.y, thicknessPx);
      ctx.fillStyle = 'rgba(209, 213, 219, 0.55)';
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.5 / viewState.zoom;
      ctx.setLineDash([]);
      if (pts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // Centerline guide
      ctx.strokeStyle = '#f97316';
      ctx.setLineDash([6 / viewState.zoom, 4 / viewState.zoom]);
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(end.x, end.y);
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

    const isRoom = activeTool === 'room';
    ctx.strokeStyle = isRoom ? '#818cf8' : '#00ff88';
    ctx.fillStyle = isRoom ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 255, 136, 0.2)';
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
    } else if ((activeTool === 'line' || activeTool === 'contour') && isDrawing) {
      const length = calculateLineLength(
        startPos.x,
        startPos.y,
        currentMousePos.x,
        currentMousePos.y
      );
      const lengthFormatted = formatDimension(length, scale);
      if (activeTool === 'contour') {
        label = `Hoogtelijn 0.00 m · ${lengthFormatted}`;
      } else {
        label = `Lengte: ${lengthFormatted}`;
      }
      const screenPos = worldToScreen((startPos.x + currentMousePos.x) / 2, (startPos.y + currentMousePos.y) / 2, viewState);
      labelX = screenPos.x;
      labelY = screenPos.y;
    } else if (activeTool === 'wall' && isDrawing) {
      const end = wallEndPos(currentMousePos);
      const length = wallLengthPx(startPos.x, startPos.y, end.x, end.y);
      const lengthFormatted = formatDimension(length, scale);
      label = `Muur ${lengthFormatted} · dikte ${wallThicknessCm} cm${altPressed ? ' (vrij)' : ' (90°)'}`;
      const screenPos = worldToScreen((startPos.x + end.x) / 2, (startPos.y + end.y) / 2, viewState);
      labelX = screenPos.x;
      labelY = screenPos.y - 18;
    } else if ((activeTool === 'polygon' || activeTool === 'room') && polygonPoints.length > 0) {
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    if (e.button === 1 || (e.button === 0 && isPanMode)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewState.panX, y: e.clientY - viewState.panY });
      e.preventDefault();
      return;
    }

    if (activeTool === 'hand') return;

    const screenPos = getPointerCoords(e, canvas);
    const worldPos = screenToWorld(screenPos.x, screenPos.y, viewState);
    const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) };

    // readOnly elevation: select only (door/window allowed via openingsAllowedInElevation)
    if (readOnly && !openingsAllowedInElevation) {
      if (activeTool === 'select') {
        const clickedElement = findElementAt(snappedPos.x, snappedPos.y);
        if (clickedElement) {
          onElementSelect(clickedElement.id, e.shiftKey || e.ctrlKey || e.metaKey);
        } else {
          onElementSelect(null, false);
        }
      }
      return;
    }

    if (activeTool === 'select') {
      const selectedElement = elements.find(el => selectedElementIds.includes(el.id));
      if (selectedElement) {
        const handle = getResizeHandle(selectedElement, snappedPos.x, snappedPos.y);
        if (handle !== null) {
          setResizeHandle(handle);
          setIsDragging(true);
          lastDragWorldRef.current = worldPos;
          return;
        }
      }

      const clickedElement = findElementAt(snappedPos.x, snappedPos.y);
      if (clickedElement) {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          onElementSelect(clickedElement.id, true);
        } else {
          onElementSelect(clickedElement.id, false);
        }
        setIsDragging(true);
        lastDragWorldRef.current = worldPos;
        return;
      }
      onElementSelect(null, false);
    } else if (activeTool === 'door' || activeTool === 'window') {
      const hit = resolveOpeningHit(snappedPos.x, snappedPos.y);
      if (hit) {
        const kind = activeTool === 'door' ? 'door' : 'window';
        const widthCm = activeTool === 'door' ? doorWidthCm : windowWidthCm;
        const opening = createOpeningElementData(hit, kind, widthCm, scale, {
          sillM: hit.sillM,
          heightM: hit.openingHeightM
        });
        if (opening) onElementCreate(opening);
      }
      return;
    } else if (activeTool === 'polygon' || activeTool === 'room') {
      if (polygonPoints.length >= 3 && polygonPoints.length > 0) {
        const firstPoint = polygonPoints[0];
        if (isPointNear(snappedPos, firstPoint, 10 / viewState.zoom)) {
          handlePolygonClose();
          return;
        }
      }
      setPolygonPoints([...polygonPoints, snappedPos]);
    } else {
      setIsDrawing(true);
      setStartPos(snappedPos);
      if (activeTool === 'freehand') {
        setCurrentPath([snappedPos]);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Legacy mouse fallback only when pointer events are unavailable
    if (window.PointerEvent) return;
    handlePointerDown(e as unknown as React.PointerEvent<HTMLCanvasElement>);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      onViewStateChange({
        ...viewState,
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y
      });
      return;
    }

    const screenPos = getPointerCoords(e, canvas);
    const worldPos = screenToWorld(screenPos.x, screenPos.y, viewState);
    const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) };
    setCurrentMousePos(snappedPos);
    onCursorWorldMove?.(snappedPos);

    if (activeTool === 'door' || activeTool === 'window') {
      setOpeningHover(resolveOpeningHit(snappedPos.x, snappedPos.y));
    } else if (openingHover) {
      setOpeningHover(null);
    }

    if (isDragging && activeTool === 'select' && !blockDrawing) {
      if (resizeHandle !== null && selectedElementIds.length === 1) {
        const element = elements.find(el => el.id === selectedElementIds[0]);
        if (element) handleResize(element, worldPos);
      } else if (selectedElementIds.length > 0 && lastDragWorldRef.current) {
        const dx = worldPos.x - lastDragWorldRef.current.x;
        const dy = worldPos.y - lastDragWorldRef.current.y;
        if (dx !== 0 || dy !== 0) {
          selectedElementIds.forEach(id => onElementMove(id, dx, dy));
          lastDragWorldRef.current = worldPos;
        }
      }
    } else if (isDrawing) {
      if (activeTool === 'freehand') {
        setCurrentPath(prev => [...prev, snappedPos]);
      }
      redrawCanvas();
    } else if (activeTool === 'polygon' || activeTool === 'room') {
      redrawCanvas();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (window.PointerEvent) return;
    handlePointerMove(e as unknown as React.PointerEvent<HTMLCanvasElement>);
  };

  const endPointerInteraction = () => {
    setIsDrawing(false);
    setIsDragging(false);
    setIsPanning(false);
    setResizeHandle(null);
    lastDragWorldRef.current = null;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    handleMouseUp();
  };

  const handleMouseUp = () => {
    if (isDrawing && activeTool !== 'select' && activeTool !== 'polygon') {
      // All coordinates are already in world space
      const width = Math.abs(currentMousePos.x - startPos.x);
      const height = Math.abs(currentMousePos.y - startPos.y);
      const wallEnd = activeTool === 'wall' ? wallEndPos(currentMousePos) : null;
      const wallLen = wallEnd
        ? wallLengthPx(startPos.x, startPos.y, wallEnd.x, wallEnd.y)
        : 0;

      if (width > 5 || height > 5 || activeTool === 'freehand' || wallLen > 5) {
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
        } else if (activeTool === 'line' || activeTool === 'contour') {
          elementData = {
            type: 'line',
            layer: activeTool === 'contour' ? 'ground' : activeLayer,
            x: startPos.x,
            y: startPos.y,
            width: currentMousePos.x - startPos.x,
            height: currentMousePos.y - startPos.y,
            visible: true,
            locked: false,
            properties: activeTool === 'contour'
              ? {
                  isContour: true,
                  contourElevation: 0,
                  strokeColor: '#f59e0b',
                  strokeWidth: 3
                }
              : {
                  strokeColor: '#00ff88',
                  strokeWidth: 2
                }
          };
        } else if (activeTool === 'wall') {
          const end = wallEndPos(currentMousePos);
          const wall = createWallElementData(startPos, end, wallThicknessCm, scale);
          if (!wall) {
            setIsDrawing(false);
            return;
          }
          elementData = wall;
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
    lastDragWorldRef.current = null;
  };

  const handlePolygonClose = () => {
    if (polygonPoints.length >= 3) {
      if (activeTool === 'room') {
        const room = createRoomElementData(polygonPoints);
        if (room) onElementCreate(room);
        setPolygonPoints([]);
        return;
      }
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
    if ((activeTool === 'polygon' || activeTool === 'room') && polygonPoints.length >= 3) {
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

  const getPathBounds = (path: Array<{ x: number; y: number }>) => {
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

  const getPointerCoords = (
    e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const cursorClass = isPanning
    ? 'cursor-grabbing'
    : isPanMode
      ? 'cursor-grab'
      : activeTool === 'select'
        ? 'cursor-default'
        : 'cursor-crosshair';

  return (
    <div className="w-full h-full touch-none select-none" style={{ touchAction: 'none' }}>
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`w-full h-full block ${cursorClass}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={endPointerInteraction}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => {
        if (window.PointerEvent) return;
        handleMouseUp();
      }}
      onDoubleClick={handleDoubleClick}
      onMouseLeave={() => {
        onCursorWorldMove?.(null);
        if (isPanning) return;
        endPointerInteraction();
      }}
      onContextMenu={(e) => e.preventDefault()}
    />
    </div>
  );
};
