import type { DesignElement, Folder } from '../types/gardenDesigner';

export function generateId(): string {
  return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateFolderId(): string {
  return `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function incrementName(name: string): string {
  // Extract number from name (e.g., "Muur 1" -> 1, "Plant 42" -> 42)
  const match = name.match(/(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return name.replace(/\d+$/, String(num + 1));
  }
  // If no number found, add " 2"
  return `${name} 2`;
}

export function copyElement(element: DesignElement, offset: number = 20): DesignElement {
  return {
    ...element,
    id: generateId(),
    name: incrementName(element.name),
    x: element.x + offset,
    y: element.y + offset
  };
}

export function getElementsInFolder(
  elements: DesignElement[],
  folderId: string
): DesignElement[] {
  return elements.filter(el => el.folderId === folderId);
}

export function getFolderPath(
  folders: Folder[],
  folderId: string
): Folder[] {
  const path: Folder[] = [];
  let currentId: string | undefined = folderId;
  
  while (currentId) {
    const folder = folders.find(f => f.id === currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parentId;
  }
  
  return path;
}

export function getAllChildFolders(
  folders: Folder[],
  parentId: string
): Folder[] {
  const children: Folder[] = [];
  const directChildren = folders.filter(f => f.parentId === parentId);
  
  directChildren.forEach(child => {
    children.push(child);
    children.push(...getAllChildFolders(folders, child.id));
  });
  
  return children;
}

export function getAllElementsInFolderHierarchy(
  elements: DesignElement[],
  folders: Folder[],
  folderId: string
): DesignElement[] {
  const folder = folders.find(f => f.id === folderId);
  if (!folder) return [];
  
  const result: DesignElement[] = [];
  
  // Add direct elements
  result.push(...getElementsInFolder(elements, folderId));
  
  // Add elements from child folders
  const childFolders = getAllChildFolders(folders, folderId);
  childFolders.forEach(childFolder => {
    result.push(...getElementsInFolder(elements, childFolder.id));
  });
  
  return result;
}

export function isElementVisible(
  element: DesignElement,
  folders: Folder[],
  layerVisibility: Record<string, boolean>
): boolean {
  // Check element visibility
  if (!element.visible) return false;
  
  // Check layer visibility
  if (!layerVisibility[element.layer]) return false;
  
  // Check folder visibility
  if (element.folderId) {
    const folder = folders.find(f => f.id === element.folderId);
    if (folder && !folder.visible) return false;
    
    // Check parent folders
    const path = getFolderPath(folders, element.folderId);
    if (path.some(f => !f.visible)) return false;
  }
  
  return true;
}
