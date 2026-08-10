import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Upload, ChevronLeft, ChevronRight, Settings, Package, FileImage, FileText, Home } from 'lucide-react';
import { DesignCanvas } from '../components/gardenDesigner/DesignCanvas';
import { Toolbar } from '../components/gardenDesigner/Toolbar';
import { LayersPanel } from '../components/gardenDesigner/LayersPanel';
import { ObjectsPanel } from '../components/gardenDesigner/ObjectsPanel';
import { PropertiesPanel } from '../components/gardenDesigner/PropertiesPanel';
import { ObjectLibrary } from '../components/gardenDesigner/ObjectLibrary';
import { NameInputDialog } from '../components/gardenDesigner/NameInputDialog';
import type { DesignElement, DesignData, ToolType, LayerType, Folder, LibraryItem, ViewState, ViewMode, PlanProjection } from '../types/gardenDesigner';
import { generateId, generateFolderId, copyElement, incrementName } from '../utils/designUtils';
// import { isElementVisible } from '../utils/designUtils';
import { updateElementDimensions } from '../utils/dimensionCalculation';
import { ScalePanel } from '../components/gardenDesigner/ScalePanel';
import { ZoomControls } from '../components/gardenDesigner/ZoomControls';
import { CanvasStatusBar } from '../components/gardenDesigner/CanvasStatusBar';
import { PlanAxisOverlay } from '../components/gardenDesigner/PlanAxisOverlay';
import { Garden3DViewport } from '../components/gardenDesigner/Garden3DViewport';
import { ViewModeToggle } from '../components/gardenDesigner/ViewModeToggle';
import { PlanProjectionToggle } from '../components/gardenDesigner/PlanProjectionToggle';
import { usePlantCatalog } from '../hooks/usePlantCatalog';
import { DEFAULT_VIEW, zoomToBounds, getElementsBounds, stepZoomAtPoint } from '../utils/viewUtils';
import { getDefaultElevation } from '../utils/elevationUtils';
import { getVisibleElementsForView, getProjectionBounds } from '../utils/planProjectionUtils';
import { DEFAULT_SCALE, normalizeScale, unitToPixels } from '../utils/unitUtils';
import {
  autosaveHasWork,
  clearGardenAutosave,
  formatAutosaveLabel,
  readGardenAutosave,
  writeGardenAutosave,
  type GardenAutosavePayload
} from '../utils/gardenAutosave';
import { DEFAULT_WALL_THICKNESS_CM } from '../utils/wallUtils';
import { DEFAULT_DOOR_WIDTH_CM, DEFAULT_WINDOW_WIDTH_CM } from '../utils/openingUtils';
import { downloadPlanPng, printPlanPdf } from '../utils/gardenExport';

const DESIGN_VERSION = '1.1';

// Navigation header is 64px (h-16), page header is 48px (h-12), status bar is 40px
const NAV_HEIGHT = 64;
const PAGE_HEADER_HEIGHT = 48;
const STATUS_BAR_HEIGHT = 40;
const TOTAL_HEADER_HEIGHT = NAV_HEIGHT + PAGE_HEADER_HEIGHT + STATUS_BAR_HEIGHT;

export const GardenDesignPage: React.FC = () => {
  const { t } = useTranslation();
  const { catalog, libraryItems, loading: catalogLoading } = usePlantCatalog();
  // Dynamic canvas size based on viewport
  const [canvasSize, setCanvasSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight - TOTAL_HEADER_HEIGHT 
  });
  
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ 
        width: window.innerWidth, 
        height: window.innerHeight - TOTAL_HEADER_HEIGHT 
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [designData, setDesignData] = useState<DesignData>({
    version: DESIGN_VERSION,
    name: t('gardenDesign.newDesign'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight - TOTAL_HEADER_HEIGHT,
    elements: [],
    folders: [],
    layerVisibility: {
      ground: true,
      building: true,
      plants: true,
      water: true
    },
    scale: { ...DEFAULT_SCALE },
    terrain: { referenceElevation: 0 },
    viewMode: 'split'
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [planProjection, setPlanProjection] = useState<PlanProjection>('top');

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeLayer, setActiveLayer] = useState<LayerType>('ground');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW);
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [pendingElement, setPendingElement] = useState<Omit<DesignElement, 'id' | 'name'> | null>(null);
  const [copiedElements, setCopiedElements] = useState<DesignElement[]>([]);
  const [pendingAutosave, setPendingAutosave] = useState<GardenAutosavePayload | null>(null);
  const [autosaveHint, setAutosaveHint] = useState<string | null>(null);
  const [wallThicknessCm, setWallThicknessCm] = useState(DEFAULT_WALL_THICKNESS_CM);
  const [doorWidthCm, setDoorWidthCm] = useState(DEFAULT_DOOR_WIDTH_CM);
  const [windowWidthCm, setWindowWidthCm] = useState(DEFAULT_WINDOW_WIDTH_CM);
  const [exportOpen, setExportOpen] = useState(false);
  const skipNextAutosave = useRef(true);
  const hydratedRef = useRef(false);

  // Offer restore from localStorage once on mount
  useEffect(() => {
    const draft = readGardenAutosave();
    if (autosaveHasWork(draft)) {
      setPendingAutosave(draft);
    }
    hydratedRef.current = true;
  }, []);

  // Debounced autosave
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (pendingAutosave) return; // wait until user accepts/discards
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const payload: GardenAutosavePayload = {
        savedAt: new Date().toISOString(),
        designData: {
          ...designData,
          version: DESIGN_VERSION,
          view: viewState,
          viewMode,
          planProjection,
          updatedAt: new Date().toISOString()
        },
        viewState,
        viewMode,
        planProjection
      };
      writeGardenAutosave(payload);
      setAutosaveHint(`Autosave ${formatAutosaveLabel(payload.savedAt)}`);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [designData, viewState, viewMode, planProjection, pendingAutosave]);

  const applyLoadedDesign = useCallback(
    (loadedData: DesignData, opts?: { viewState?: ViewState }) => {
      const projection = loadedData.planProjection ?? 'top';
      const scale = normalizeScale(loadedData.scale, loadedData.version);
      const normalized: DesignData = {
        ...loadedData,
        version: DESIGN_VERSION,
        scale,
        folders: loadedData.folders ?? []
      };
      setDesignData(normalized);
      setViewMode(loadedData.viewMode ?? 'split');
      setPlanProjection(projection);
      setSelectedElementIds([]);

      const planW =
        (loadedData.viewMode ?? 'split') === 'split'
          ? Math.floor(canvasSize.width / 2)
          : canvasSize.width;

      if (opts?.viewState) {
        setViewState(opts.viewState);
        return;
      }
      if (loadedData.view) {
        setViewState(loadedData.view);
        return;
      }
      const bounds = getProjectionBounds(
        normalized.elements,
        normalized.folders,
        normalized.layerVisibility,
        projection,
        normalized.scale
      );
      if (bounds) {
        setViewState(zoomToBounds(bounds, planW, canvasSize.height));
      }
    },
    [canvasSize.width, canvasSize.height]
  );

  const handleRestoreAutosave = () => {
    if (!pendingAutosave) return;
    skipNextAutosave.current = true;
    applyLoadedDesign(pendingAutosave.designData, {
      viewState: pendingAutosave.viewState
    });
    setPendingAutosave(null);
    setAutosaveHint(`Hersteld · ${formatAutosaveLabel(pendingAutosave.savedAt)}`);
  };

  const handleDiscardAutosave = () => {
    clearGardenAutosave();
    setPendingAutosave(null);
    setAutosaveHint(null);
  };
  
  // Panel visibility states
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const showPlan = viewMode === 'plan' || viewMode === 'split';
  const show3D = viewMode === 'iso' || viewMode === 'split';
  const planWidth = viewMode === 'split' ? Math.floor(canvasSize.width / 2) : canvasSize.width;
  const planHeight = canvasSize.height;
  const planReadOnly = planProjection !== 'top';

  const displayElements = useMemo(
    () =>
      getVisibleElementsForView(
        designData.elements,
        designData.folders,
        designData.layerVisibility,
        planProjection,
        designData.scale
      ),
    [designData.elements, designData.folders, designData.layerVisibility, planProjection, designData.scale]
  );

  const fitPlanView = (projection: PlanProjection = planProjection) => {
    const bounds = getProjectionBounds(
      designData.elements,
      designData.folders,
      designData.layerVisibility,
      projection,
      designData.scale
    );
    if (bounds) {
      setViewState(zoomToBounds(bounds, planWidth, planHeight));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        setSpacePressed(true);
      }

      // Tool hotkeys (Figma / Illustrator style)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const toolMap: Record<string, ToolType> = {
          v: 'select',
          h: 'hand',
          r: 'rectangle',
          o: 'circle',
          l: 'line',
          p: 'polygon',
          n: 'freehand',
          c: 'contour',
          w: 'wall',
          m: 'room',
          d: 'door',
          i: 'window'
        };
        const tool = toolMap[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          setActiveTool(tool);
          return;
        }
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElementIds.length > 0) {
        e.preventDefault();
        handleCopy();
      }
      // Ctrl/Cmd + V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedElements.length > 0) {
        e.preventDefault();
        handlePaste();
      }
      // Zoom shortcuts (Figma)
      if (e.ctrlKey || e.metaKey) {
        const pw = viewMode === 'split' ? Math.floor(canvasSize.width / 2) : canvasSize.width;
        const ph = canvasSize.height;
        const centerX = pw / 2;
        const centerY = ph / 2;
        if (e.key === '0') {
          e.preventDefault();
          const bounds = getProjectionBounds(
            designData.elements,
            designData.folders,
            designData.layerVisibility,
            planProjection,
            designData.scale
          );
          if (bounds) setViewState(zoomToBounds(bounds, pw, ph));
        } else if (e.key === '1') {
          e.preventDefault();
          setViewState({ zoom: 1, panX: centerX, panY: centerY });
        } else if (e.key === '2' && selectedElementIds.length > 0) {
          e.preventDefault();
          const selected = designData.elements.filter(el => selectedElementIds.includes(el.id));
          const bounds = getElementsBounds(selected);
          if (bounds) setViewState(zoomToBounds(bounds, pw, ph));
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setViewState(prev => stepZoomAtPoint(prev, centerX, centerY, 'in'));
        } else if (e.key === '-') {
          e.preventDefault();
          setViewState(prev => stepZoomAtPoint(prev, centerX, centerY, 'out'));
        }
      }
      // Delete/Backspace: Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
        e.preventDefault();
        handleDeleteElements(selectedElementIds);
      }
      // Escape: Deselect / cancel
      if (e.key === 'Escape') {
        setSelectedElementIds([]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElementIds, copiedElements, designData.elements, designData.folders, designData.layerVisibility, designData.scale, canvasSize, viewMode, planProjection, selectedElementIds.length]);

  const handleElementCreate = (elementData: Omit<DesignElement, 'id' | 'name'>) => {
    if (elementData.properties?.isContour) {
      const elev = elementData.properties.contourElevation ?? 0;
      const sign = elev >= 0 ? '+' : '';
      const autoName = `Contour ${sign}${elev.toFixed(2)} m`;
      let newElement: DesignElement = {
        ...elementData,
        id: generateId(),
        name: autoName,
        elevation: elementData.elevation ?? getDefaultElevation(elementData)
      };
      newElement = updateElementDimensions(newElement);
      setDesignData(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
        updatedAt: new Date().toISOString()
      }));
      setSelectedElementIds([newElement.id]);
      return;
    }
    if (elementData.properties?.isWall) {
      const wallCount = designData.elements.filter(el => el.properties.isWall).length + 1;
      let newElement: DesignElement = {
        ...elementData,
        id: generateId(),
        name: `Muur ${wallCount}`,
        elevation: elementData.elevation ?? getDefaultElevation(elementData)
      };
      newElement = updateElementDimensions(newElement);
      setDesignData(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
        layerVisibility: { ...prev.layerVisibility, building: true },
        updatedAt: new Date().toISOString()
      }));
      setActiveLayer('building');
      setSelectedElementIds([newElement.id]);
      return;
    }
    if (elementData.properties?.isRoom) {
      const roomCount = designData.elements.filter(el => el.properties.isRoom).length + 1;
      let newElement: DesignElement = {
        ...elementData,
        id: generateId(),
        name: `Kamer ${roomCount}`,
        elevation: elementData.elevation ?? getDefaultElevation(elementData)
      };
      newElement = updateElementDimensions(newElement);
      setDesignData(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
        layerVisibility: { ...prev.layerVisibility, building: true },
        updatedAt: new Date().toISOString()
      }));
      setActiveLayer('building');
      setSelectedElementIds([newElement.id]);
      return;
    }
    if (elementData.properties?.isOpening) {
      const kind = elementData.properties.openingKind === 'window' ? 'Raam' : 'Deur';
      const count =
        designData.elements.filter(
          el => el.properties.openingKind === elementData.properties.openingKind
        ).length + 1;
      let newElement: DesignElement = {
        ...elementData,
        id: generateId(),
        name: `${kind} ${count}`,
        elevation: elementData.elevation ?? getDefaultElevation(elementData)
      };
      newElement = updateElementDimensions(newElement);
      setDesignData(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
        layerVisibility: { ...prev.layerVisibility, building: true },
        updatedAt: new Date().toISOString()
      }));
      setActiveLayer('building');
      setSelectedElementIds([newElement.id]);
      return;
    }
    setPendingElement(elementData);
    setNameDialogOpen(true);
  };

  const handleNameConfirm = (name: string) => {
    if (pendingElement) {
      let newElement: DesignElement = {
        ...pendingElement,
        id: generateId(),
        name,
        elevation: pendingElement.elevation ?? getDefaultElevation(pendingElement)
      };
      
      // Calculate dimensions
      newElement = updateElementDimensions(newElement);
      
      setDesignData(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
        updatedAt: new Date().toISOString()
      }));
      
      setSelectedElementIds([newElement.id]);
    }
    setNameDialogOpen(false);
    setPendingElement(null);
  };

  const handleElementSelect = (elementId: string | null, multiSelect: boolean = false) => {
    if (elementId === null) {
      setSelectedElementIds([]);
      return;
    }

    if (multiSelect) {
      setSelectedElementIds(prev => {
        if (prev.includes(elementId)) {
          return prev.filter(id => id !== elementId);
        }
        return [...prev, elementId];
      });
    } else {
      setSelectedElementIds([elementId]);
    }
  };

  const handleElementMove = (elementId: string, dx: number, dy: number) => {
    setDesignData(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id === elementId && !el.locked) {
          return { ...el, x: el.x + dx, y: el.y + dy };
        }
        return el;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleElementResize = (elementId: string, x: number, y: number, width: number, height: number) => {
    setDesignData(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id === elementId && !el.locked) {
          const updated = { ...el, x, y, width, height };
          return updateElementDimensions(updated);
        }
        return el;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleElementUpdate = (elementId: string, updates: Partial<DesignElement>) => {
    setDesignData(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id === elementId) {
          const updated = { ...el, ...updates };
          // Recalculate dimensions if size/position changed
          if (updates.width !== undefined || updates.height !== undefined || 
              updates.x !== undefined || updates.y !== undefined ||
              updates.properties?.points !== undefined || updates.properties?.path !== undefined) {
            return updateElementDimensions(updated);
          }
          return updated;
        }
        return el;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleElementDelete = (elementId: string) => {
    setDesignData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    }));
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
  };

  const handleDeleteElements = (elementIds: string[]) => {
    setDesignData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !elementIds.includes(el.id)),
      updatedAt: new Date().toISOString()
    }));
    setSelectedElementIds([]);
  };

  const handleCopy = () => {
    const elementsToCopy = designData.elements.filter(el => selectedElementIds.includes(el.id));
    setCopiedElements(elementsToCopy);
  };

  const handlePaste = () => {
    if (copiedElements.length === 0) return;

    const newElements = copiedElements.map(el => {
      const copied = copyElement(el, 20);
      const withName = {
        ...copied,
        name: incrementName(el.name),
        elevation: el.elevation ?? getDefaultElevation(el)
      };
      return updateElementDimensions(withName);
    });

    setDesignData(prev => ({
      ...prev,
      elements: [...prev.elements, ...newElements],
      updatedAt: new Date().toISOString()
    }));

    setSelectedElementIds(newElements.map(el => el.id));
  };

  const handleLayerVisibilityToggle = (layer: LayerType) => {
    setDesignData(prev => ({
      ...prev,
      layerVisibility: {
        ...prev.layerVisibility,
        [layer]: !prev.layerVisibility[layer]
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleElementVisibilityToggle = (elementId: string) => {
    handleElementUpdate(elementId, {
      visible: !designData.elements.find(el => el.id === elementId)?.visible
    });
  };

  const handleFolderVisibilityToggle = (folderId: string) => {
    setDesignData(prev => ({
      ...prev,
      folders: prev.folders.map(f => {
        if (f.id === folderId) {
          return { ...f, visible: !f.visible };
        }
        return f;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleFolderToggle = (folderId: string) => {
    setDesignData(prev => ({
      ...prev,
      folders: prev.folders.map(f => {
        if (f.id === folderId) {
          return { ...f, expanded: !f.expanded };
        }
        return f;
      })
    }));
  };

  const handleElementMoveToFolder = (elementId: string, folderId: string | undefined) => {
    handleElementUpdate(elementId, { folderId });
  };

  const handleFolderCreate = (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: generateFolderId(),
      name,
      parentId,
      visible: true,
      expanded: true,
      elementIds: []
    };

    setDesignData(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleFolderRename = (folderId: string, newName: string) => {
    setDesignData(prev => ({
      ...prev,
      folders: prev.folders.map(f => {
        if (f.id === folderId) {
          return { ...f, name: newName };
        }
        return f;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleFolderDelete = (folderId: string) => {
    setDesignData(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f.id !== folderId),
      elements: prev.elements.map(el => {
        if (el.folderId === folderId) {
          return { ...el, folderId: undefined };
        }
        return el;
      }),
      updatedAt: new Date().toISOString()
    }));
  };

  const handleFolderExpandAll = () => {
    setDesignData(prev => ({
      ...prev,
      folders: prev.folders.map(f => ({ ...f, expanded: true }))
    }));
  };

  const handleFolderCollapseAll = () => {
    setDesignData(prev => ({
      ...prev,
      folders: prev.folders.map(f => ({ ...f, expanded: false }))
    }));
  };

  const handlePlanProjectionChange = (next: PlanProjection) => {
    setPlanProjection(next);
    const bounds = getProjectionBounds(
      designData.elements,
      designData.folders,
      designData.layerVisibility,
      next,
      designData.scale
    );
    if (bounds) {
      setViewState(zoomToBounds(bounds, planWidth, planHeight));
    }
  };

  const handleLibraryItemSelect = (item: LibraryItem) => {
    // Library footprints are centimeters → canvas pixels via current scale
    const width = unitToPixels(item.defaultSize.width, 'cm', designData.scale);
    const height = unitToPixels(item.defaultSize.height, 'cm', designData.scale);
    const elementData: Omit<DesignElement, 'id' | 'name'> = {
      type: 'library-item',
      layer: item.defaultLayer,
      x: canvasSize.width / 2 - width / 2,
      y: canvasSize.height / 2 - height / 2,
      width,
      height,
      visible: true,
      locked: false,
      properties: {
        ...item.defaultProperties,
        fillColor: item.defaultProperties.fillColor || '#00ff88',
        strokeColor: item.defaultProperties.strokeColor || '#00ff88',
        strokeWidth: item.defaultProperties.strokeWidth || 2,
        catalogSlug: item.defaultProperties.catalogSlug || item.id
      }
    };
    handleElementCreate(elementData);
  };

  const handleSave = () => {
    const dataToSave: DesignData = {
      ...designData,
      version: DESIGN_VERSION,
      view: viewState,
      viewMode,
      planProjection,
      updatedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(dataToSave, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${designData.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOpts = () => ({
    designData: {
      ...designData,
      version: DESIGN_VERSION,
      view: viewState,
      viewMode,
      planProjection
    },
    elements: designData.elements,
    title: designData.name
  });

  const handleExportPng = () => {
    const ok = downloadPlanPng(exportOpts());
    setExportOpen(false);
    if (!ok) alert('Geen objecten om te exporteren — teken eerst een plan.');
    else setAutosaveHint('PNG geëxporteerd');
  };

  const handleExportPdf = () => {
    const ok = printPlanPdf(exportOpts());
    setExportOpen(false);
    if (!ok) alert('Geen objecten om te exporteren — teken eerst een plan. (Popup geblokkeerd?)');
    else setAutosaveHint('Print/PDF geopend');
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string) as DesignData;
        skipNextAutosave.current = true;
        applyLoadedDesign(loadedData);
        setPendingAutosave(null);
      } catch (error) {
        alert(t('gardenDesign.errorLoading'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedElements = designData.elements.filter(el => selectedElementIds.includes(el.id));

  const handleZoomIn = () => {
    const cx = planWidth / 2;
    const cy = planHeight / 2;
    setViewState(prev => stepZoomAtPoint(prev, cx, cy, 'in'));
  };

  const handleZoomOut = () => {
    const cx = planWidth / 2;
    const cy = planHeight / 2;
    setViewState(prev => stepZoomAtPoint(prev, cx, cy, 'out'));
  };

  const handleZoomFit = () => {
    fitPlanView();
  };

  const handleZoomSelection = () => {
    const selected = designData.elements.filter(el => selectedElementIds.includes(el.id));
    const bounds = getElementsBounds(selected);
    if (bounds) setViewState(zoomToBounds(bounds, planWidth, planHeight));
  };

  const handleZoom100 = () => {
    setViewState({ zoom: 1, panX: planWidth / 2, panY: planHeight / 2 });
  };

  return (
    <div className="h-screen flex flex-col bg-dark-bg overflow-hidden pt-16">
      {pendingAutosave && (
        <div className="z-30 flex items-center justify-between gap-3 px-4 py-2 bg-neon-green/15 border-b border-neon-green/40 text-sm text-white">
          <span>
            Concept gevonden van{' '}
            <span className="text-neon-green font-medium">
              {formatAutosaveLabel(pendingAutosave.savedAt)}
            </span>
            {' '}({pendingAutosave.designData.elements.length} objecten). Herstellen?
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreAutosave}
              className="px-3 py-1 rounded-lg bg-neon-green text-dark-bg font-medium hover:bg-neon-green/90"
            >
              Herstellen
            </button>
            <button
              type="button"
              onClick={handleDiscardAutosave}
              className="px-3 py-1 rounded-lg border border-white/20 text-white/70 hover:bg-white/5"
            >
              Weggooien
            </button>
          </div>
        </div>
      )}

      {/* Compact Header - Starts below navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-secondary/80 backdrop-blur-sm border-b border-white/10 z-20 h-12">
        <div className="flex items-center gap-3">
          <Link
            to="/interests"
            className="p-2 rounded-lg bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-neon-green/80" />
              {designData.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {autosaveHint && !pendingAutosave && (
            <span className="text-white/40 text-xs hidden md:inline">{autosaveHint}</span>
          )}
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          {showPlan && (
            <PlanProjectionToggle projection={planProjection} onChange={handlePlanProjectionChange} />
          )}
          <label className="cursor-pointer px-3 py-1.5 bg-dark-secondary border border-white/20 rounded-lg text-white hover:border-neon-green/50 transition-all duration-300 flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            Openen
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
            />
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(v => !v)}
              className="px-3 py-1.5 bg-dark-secondary border border-white/20 rounded-lg text-white hover:border-neon-green/50 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <FileImage className="w-4 h-4" />
              Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 z-40 min-w-[180px] rounded-lg border border-white/15 bg-dark-secondary shadow-xl py-1">
                <button
                  type="button"
                  onClick={handleExportPng}
                  className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5 flex items-center gap-2"
                >
                  <FileImage className="w-4 h-4 text-neon-green" />
                  PNG met schaal
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-neon-green" />
                  PDF (print)
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-neon-green/20 border border-neon-green/50 rounded-lg text-neon-green hover:bg-neon-green/30 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            {t('gardenDesign.save')}
          </button>
        </div>
      </div>

      {/* Main Layout - Full Screen Canvas with Overlay Panels */}
      <div className="flex-1 relative overflow-hidden" style={{ height: `calc(100vh - ${NAV_HEIGHT + PAGE_HEADER_HEIGHT}px)` }}>
        <div className="absolute inset-0 flex bg-dark-bg">
          {showPlan && (
            <div
              className={`relative h-full ${show3D && viewMode === 'split' ? 'w-1/2 border-r border-white/10' : 'w-full'}`}
            >
              <DesignCanvas
                width={planWidth}
                height={planHeight}
                elements={displayElements}
                selectedElementIds={selectedElementIds}
                activeTool={activeTool}
                activeLayer={activeLayer}
                layerVisibility={designData.layerVisibility}
                scale={designData.scale}
                viewState={viewState}
                planProjection={planProjection}
                readOnly={planReadOnly}
                sourceElements={designData.elements}
                wallThicknessCm={wallThicknessCm}
                doorWidthCm={doorWidthCm}
                windowWidthCm={windowWidthCm}
                onViewStateChange={setViewState}
                onCursorWorldMove={setCursorWorld}
                onElementCreate={handleElementCreate}
                onElementSelect={handleElementSelect}
                onElementMove={handleElementMove}
                onElementResize={handleElementResize}
              />
              <PlanAxisOverlay className="absolute inset-0 z-10" projection={planProjection} />
              {planReadOnly && (
                <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded bg-amber-500/15 border border-amber-400/30 text-[10px] text-amber-200/90 max-w-[220px]">
                  Gevel: alleen bekijken — behalve <strong>Deur/Raam</strong> (klik op muur; Y = dorpelhoogte)
                </div>
              )}
            </div>
          )}
          {show3D && (
            <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
              <Garden3DViewport
                className="w-full h-full"
                elements={designData.elements}
                folders={designData.folders}
                scale={designData.scale}
                layerVisibility={designData.layerVisibility}
                selectedElementIds={selectedElementIds}
                onElementSelect={(id) => handleElementSelect(id, false)}
              />
            </div>
          )}
        </div>

        {/* Zoom controls — plan view only */}
        {showPlan && (
        <div className="absolute bottom-14 right-4 z-30">
          <ZoomControls
            zoom={viewState.zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomFit={handleZoomFit}
            onZoomSelection={handleZoomSelection}
            onZoom100={handleZoom100}
            hasSelection={selectedElementIds.length > 0}
          />
        </div>
        )}

        {/* Left Panel Overlay */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-dark-secondary/95 backdrop-blur-md border-r border-white/10 z-30 overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-neon-green" />
                    Tools & Settings
                  </h2>
                  <button
                    onClick={() => setLeftPanelOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white/60" />
                  </button>
                </div>
                <Toolbar
                  activeTool={activeTool}
                  activeLayer={activeLayer}
                  wallThicknessCm={wallThicknessCm}
                  doorWidthCm={doorWidthCm}
                  windowWidthCm={windowWidthCm}
                  onToolChange={setActiveTool}
                  onLayerChange={setActiveLayer}
                  onWallThicknessChange={setWallThicknessCm}
                  onDoorWidthChange={setDoorWidthCm}
                  onWindowWidthChange={setWindowWidthCm}
                />
                <LayersPanel
                  activeLayer={activeLayer}
                  layerVisibility={designData.layerVisibility}
                  onLayerSelect={setActiveLayer}
                  onLayerVisibilityToggle={handleLayerVisibilityToggle}
                />
                <ScalePanel
                  scale={designData.scale}
                  onScaleChange={(scale) => {
                    setDesignData(prev => ({
                      ...prev,
                      scale,
                      updatedAt: new Date().toISOString()
                    }));
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Panel Overlay */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-dark-secondary/95 backdrop-blur-md border-l border-white/10 z-30 overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-neon-green" />
                    Objects & Properties
                  </h2>
                  <button
                    onClick={() => setRightPanelOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  </button>
                </div>
                <ObjectsPanel
                  elements={designData.elements}
                  folders={designData.folders}
                  selectedElementIds={selectedElementIds}
                  onElementSelect={(id) => handleElementSelect(id, false)}
                  onElementVisibilityToggle={handleElementVisibilityToggle}
                  onFolderVisibilityToggle={handleFolderVisibilityToggle}
                  onFolderToggle={handleFolderToggle}
                  onElementMoveToFolder={handleElementMoveToFolder}
                  onFolderCreate={handleFolderCreate}
                  onFolderRename={handleFolderRename}
                  onFolderDelete={handleFolderDelete}
                  onElementDelete={handleElementDelete}
                  onFolderExpandAll={handleFolderExpandAll}
                  onFolderCollapseAll={handleFolderCollapseAll}
                />
                <ObjectLibrary
                  libraryItems={libraryItems}
                  catalog={catalog}
                  loading={catalogLoading}
                  onItemSelect={handleLibraryItemSelect}
                />
                <PropertiesPanel
                  selectedElements={selectedElements}
                  scale={designData.scale}
                  catalog={catalog}
                  onElementUpdate={handleElementUpdate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Buttons - Only show when panels are closed */}
        {!leftPanelOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setLeftPanelOpen(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-dark-secondary/90 backdrop-blur-sm border border-white/10 rounded-lg hover:border-neon-green/50 transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        )}

        {!rightPanelOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setRightPanelOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-dark-secondary/90 backdrop-blur-sm border border-white/10 rounded-lg hover:border-neon-green/50 transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>
        )}

        <CanvasStatusBar
          activeLayer={activeLayer}
          activeTool={activeTool}
          objectCount={designData.elements.length}
          zoom={viewState.zoom}
          cursorWorld={cursorWorld}
          scale={designData.scale}
          isSpacePan={spacePressed}
        />
      </div>

      {/* Name Input Dialog */}
      <NameInputDialog
        isOpen={nameDialogOpen}
        element={pendingElement || undefined}
        scale={designData.scale}
        onConfirm={handleNameConfirm}
        onCancel={() => {
          setNameDialogOpen(false);
          setPendingElement(null);
        }}
        title="Geef object een naam"
      />
    </div>
  );
};
