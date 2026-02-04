import React, { useState } from 'react';
import type { DesignElement, Folder } from '../../types/gardenDesigner';
import { Eye, EyeOff, Folder as FolderIcon, FolderOpen, ChevronRight, ChevronDown, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { getFolderPath } from '../../utils/designUtils';

interface ObjectsPanelProps {
  elements: DesignElement[];
  folders: Folder[];
  selectedElementIds: string[];
  onElementSelect: (elementId: string) => void;
  onElementVisibilityToggle: (elementId: string) => void;
  onFolderVisibilityToggle: (folderId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onElementMoveToFolder: (elementId: string, folderId: string | undefined) => void;
  onFolderCreate: (name: string, parentId?: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onFolderDelete: (folderId: string) => void;
  onElementDelete: (elementId: string) => void;
}

export const ObjectsPanel: React.FC<ObjectsPanelProps> = ({
  elements,
  folders,
  selectedElementIds,
  onElementSelect,
  onElementVisibilityToggle,
  onFolderVisibilityToggle,
  onFolderToggle,
  onElementMoveToFolder,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  onElementDelete
}) => {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'folder' | 'element'; id: string } | null>(null);

  const rootElements = elements.filter(el => !el.folderId);
  const rootFolders = folders.filter(f => !f.parentId);

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedElementId(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFolderDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolderId(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, _folderId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault();
    
    if (draggedElementId) {
      onElementMoveToFolder(draggedElementId, targetFolderId);
      setDraggedElementId(null);
    } else if (draggedFolderId) {
      // Prevent dropping folder into itself or its children
      if (targetFolderId && targetFolderId !== draggedFolderId) {
        const path = getFolderPath(folders, targetFolderId);
        if (!path.some(f => f.id === draggedFolderId)) {
          // Update folder parent (would need onFolderMoveToFolder prop)
          // For now, we'll skip this to keep it simple
        }
      }
      setDraggedFolderId(null);
    }
  };

  const handleNewFolder = (parentId?: string) => {
    const name = prompt('Map naam:');
    if (name) {
      onFolderCreate(name.trim(), parentId);
    }
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
  };

  const handleRenameSubmit = (folderId: string) => {
    if (editingFolderName.trim()) {
      onFolderRename(folderId, editingFolderName.trim());
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'element', id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id });
  };

  const renderFolder = (folder: Folder, depth: number = 0): React.ReactNode => {
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const folderElements = elements.filter(el => el.folderId === folder.id);
    // const allVisible = getAllElementsInFolderHierarchy(elements, folders, folder.id)
    //   .every(el => el.visible);

    return (
      <div key={folder.id} className="select-none">
        <div
          draggable
          onDragStart={(e) => handleFolderDragStart(e, folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDrop={(e) => handleDrop(e, folder.id)}
          className={`flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors ${
            depth > 0 ? 'ml-4' : ''
          }`}
          onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
        >
          <button
            onClick={() => onFolderToggle(folder.id)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {folder.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {folder.expanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500" />
          ) : (
            <FolderIcon className="w-4 h-4 text-amber-500" />
          )}
          
          {editingFolderId === folder.id ? (
            <input
              type="text"
              value={editingFolderName}
              onChange={(e) => setEditingFolderName(e.target.value)}
              onBlur={() => handleRenameSubmit(folder.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit(folder.id);
                if (e.key === 'Escape') {
                  setEditingFolderId(null);
                  setEditingFolderName('');
                }
              }}
              className="flex-1 px-2 py-1 bg-dark-bg border border-white/20 rounded text-white text-sm"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-white/80 text-sm">{folder.name}</span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFolderVisibilityToggle(folder.id);
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={folder.visible ? 'Verberg map' : 'Toon map'}
          >
            {folder.visible ? (
              <Eye className="w-4 h-4 text-white/60" />
            ) : (
              <EyeOff className="w-4 h-4 text-white/30" />
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e, 'folder', folder.id);
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-white/40" />
          </button>
        </div>
        
        {folder.expanded && (
          <div className="ml-4">
            {childFolders.map(childFolder => renderFolder(childFolder, depth + 1))}
            {folderElements.map(element => renderElement(element, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderElement = (element: DesignElement, depth: number = 0): React.ReactNode => {
    const isSelected = selectedElementIds.includes(element.id);
    const icon = getElementIcon(element);

    return (
      <div
        key={element.id}
        draggable
        onDragStart={(e) => handleDragStart(e, element.id)}
        onClick={() => onElementSelect(element.id)}
        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-neon-green/20 border border-neon-green/50' : 'hover:bg-white/5'
        } ${depth > 0 ? 'ml-4' : ''}`}
        onContextMenu={(e) => handleContextMenu(e, 'element', element.id)}
      >
        <span className="text-lg">{icon}</span>
        <span className={`flex-1 text-sm ${isSelected ? 'text-neon-green' : 'text-white/70'}`}>
          {element.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onElementVisibilityToggle(element.id);
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title={element.visible ? 'Verberg object' : 'Toon object'}
        >
          {element.visible ? (
            <Eye className="w-4 h-4 text-white/60" />
          ) : (
            <EyeOff className="w-4 h-4 text-white/30" />
          )}
        </button>
      </div>
    );
  };

  const getElementIcon = (element: DesignElement): string => {
    if (element.type === 'freehand') return '✏️';
    if (element.type === 'circle') return '⭕';
    if (element.type === 'line') return '➖';
    if (element.type === 'polygon') return '⬡';
    if (element.layer === 'building') return '🧱';
    if (element.layer === 'plants') return '🌿';
    if (element.layer === 'water') return '💧';
    return '⬜';
  };

  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Objecten</h3>
        <button
          onClick={() => handleNewFolder()}
          className="p-1.5 bg-neon-green/20 border border-neon-green/50 rounded text-neon-green hover:bg-neon-green/30 transition-all"
          title="Nieuwe map"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {rootFolders.map(folder => renderFolder(folder))}
        {rootElements.map(element => renderElement(element))}
        {rootFolders.length === 0 && rootElements.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">
            Geen objecten. Begin met tekenen!
          </p>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-dark-secondary border border-white/20 rounded-lg shadow-2xl py-2 min-w-[150px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === 'folder' ? (
              <>
                <button
                  onClick={() => {
                    const folder = folders.find(f => f.id === contextMenu.id);
                    if (folder) {
                      handleRenameFolder(folder.id, folder.name);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Hernoemen
                </button>
                <button
                  onClick={() => {
                    const folder = folders.find(f => f.id === contextMenu.id);
                    if (folder) {
                      handleNewFolder(folder.id);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nieuwe submap
                </button>
                <button
                  onClick={() => {
                    onFolderDelete(contextMenu.id);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Verwijderen
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onElementDelete(contextMenu.id);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Verwijderen
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
