import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, ChevronLeft, ChevronRight, Settings, Package } from 'lucide-react';
import { DesignCanvas } from '../components/gardenDesigner/DesignCanvas';
import { Toolbar } from '../components/gardenDesigner/Toolbar';
import { LayersPanel } from '../components/gardenDesigner/LayersPanel';
import { ObjectsPanel } from '../components/gardenDesigner/ObjectsPanel';
import { PropertiesPanel } from '../components/gardenDesigner/PropertiesPanel';
import { ObjectLibrary } from '../components/gardenDesigner/ObjectLibrary';
import { NameInputDialog } from '../components/gardenDesigner/NameInputDialog';
import type { DesignElement, DesignData, ToolType, LayerType, Folder, LibraryItem } from '../types/gardenDesigner';
import { generateId, generateFolderId, copyElement, incrementName } from '../utils/designUtils';
// import { isElementVisible } from '../utils/designUtils';
import { updateElementDimensions } from '../utils/dimensionCalculation';
import { ScalePanel } from '../components/gardenDesigner/ScalePanel';

// Navigation header is 64px (h-16), page header is 48px (h-12), status bar is 40px
const NAV_HEIGHT = 64;
const PAGE_HEADER_HEIGHT = 48;
const STATUS_BAR_HEIGHT = 40;
const TOTAL_HEADER_HEIGHT = NAV_HEIGHT + PAGE_HEADER_HEIGHT + STATUS_BAR_HEIGHT;

export const GardenDesignPage: React.FC = () => {
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
    version: '1.0',
    name: 'Nieuw Ontwerp',
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
    scale: {
      pixelsPerUnit: 10,
      unit: 'cm',
      displayFormat: 'auto'
    }
  });

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeLayer, setActiveLayer] = useState<LayerType>('ground');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [pendingElement, setPendingElement] = useState<Omit<DesignElement, 'id' | 'name'> | null>(null);
  const [copiedElements, setCopiedElements] = useState<DesignElement[]>([]);
  
  // Panel visibility states
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      // Delete/Backspace: Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
        e.preventDefault();
        handleDeleteElements(selectedElementIds);
      }
      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedElementIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, copiedElements]);

  const handleElementCreate = (elementData: Omit<DesignElement, 'id' | 'name'>) => {
    setPendingElement(elementData);
    setNameDialogOpen(true);
  };

  const handleNameConfirm = (name: string) => {
    if (pendingElement) {
      let newElement: DesignElement = {
        ...pendingElement,
        id: generateId(),
        name
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
        name: incrementName(el.name)
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

  const handleLibraryItemSelect = (item: LibraryItem) => {
    const elementData: Omit<DesignElement, 'id' | 'name'> = {
      type: 'library-item',
      layer: item.defaultLayer,
      x: canvasSize.width / 2 - item.defaultSize.width / 2,
      y: canvasSize.height / 2 - item.defaultSize.height / 2,
      width: item.defaultSize.width,
      height: item.defaultSize.height,
      visible: true,
      locked: false,
      properties: {
        ...item.defaultProperties,
        fillColor: item.defaultProperties.fillColor || '#00ff88',
        strokeColor: item.defaultProperties.strokeColor || '#00ff88',
        strokeWidth: item.defaultProperties.strokeWidth || 2
      }
    };
    handleElementCreate(elementData);
  };

  const handleSave = () => {
    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${designData.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string) as DesignData;
        setDesignData(loadedData);
        setSelectedElementIds([]);
      } catch (error) {
        alert('Fout bij het laden van het bestand. Controleer of het een geldig JSON bestand is.');
      }
    };
    reader.readAsText(file);
  };

  const selectedElements = designData.elements.filter(el => selectedElementIds.includes(el.id));

  return (
    <div className="h-screen flex flex-col bg-dark-bg overflow-hidden pt-16">
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
            <h1 className="text-xl font-bold text-white">
              🏡 {designData.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
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
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-neon-green/20 border border-neon-green/50 rounded-lg text-neon-green hover:bg-neon-green/30 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Opslaan
          </button>
        </div>
      </div>

      {/* Main Layout - Full Screen Canvas with Overlay Panels */}
      <div className="flex-1 relative overflow-hidden" style={{ height: `calc(100vh - ${NAV_HEIGHT + PAGE_HEADER_HEIGHT}px)` }}>
        {/* Canvas - Full Screen */}
        <div className="absolute inset-0 bg-dark-bg">
          <DesignCanvas
            width={canvasSize.width}
            height={canvasSize.height}
            elements={designData.elements}
            selectedElementIds={selectedElementIds}
            activeTool={activeTool}
            activeLayer={activeLayer}
            layerVisibility={designData.layerVisibility}
            scale={designData.scale}
            onElementCreate={handleElementCreate}
            onElementSelect={handleElementSelect}
            onElementMove={handleElementMove}
            onElementResize={handleElementResize}
          />
        </div>

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
                  onToolChange={setActiveTool}
                  onLayerChange={setActiveLayer}
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
                />
                <ObjectLibrary onItemSelect={handleLibraryItemSelect} />
                <PropertiesPanel
                  selectedElements={selectedElements}
                  scale={designData.scale}
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

        {/* Status Bar - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-dark-secondary/80 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-20">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-neon-green">Laag:</span>{' '}
                {activeLayer === 'ground' ? 'Platte Grond' :
                 activeLayer === 'building' ? 'Bouw' :
                 activeLayer === 'plants' ? 'Planten' : 'Water'}
              </div>
              <div>
                <span className="text-neon-green">Tool:</span>{' '}
                {activeTool === 'select' ? 'Selecteren' :
                 activeTool === 'rectangle' ? 'Rechthoek' :
                 activeTool === 'circle' ? 'Cirkel' :
                 activeTool === 'line' ? 'Lijn' :
                 activeTool === 'polygon' ? 'Polygoon' : 'Vrijhand'}
              </div>
            </div>
            <div className="text-white/40">
              {designData.elements.length} objecten
            </div>
          </div>
        </div>
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
