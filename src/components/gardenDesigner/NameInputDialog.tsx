import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { DesignElement, ScaleConfig } from '../../types/gardenDesigner';
import { formatDimension, formatArea } from '../../utils/unitUtils';
import { calculateLineLength, calculateCircleArea, calculateCircleDiameter, calculateRectangleArea, calculatePolygonArea, calculatePerimeter } from '../../utils/areaUtils';

interface NameInputDialogProps {
  isOpen: boolean;
  initialName?: string;
  element?: Omit<DesignElement, 'id' | 'name'>;
  scale?: ScaleConfig;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  title?: string;
}

export const NameInputDialog: React.FC<NameInputDialogProps> = ({
  isOpen,
  initialName = '',
  element,
  scale,
  onConfirm,
  onCancel,
  title = 'Geef object een naam'
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const getDimensionsText = (): string => {
    if (!element || !scale) return '';

    const parts: string[] = [];

    switch (element.type) {
      case 'line':
        const length = calculateLineLength(
          element.x,
          element.y,
          element.x + element.width,
          element.y + element.height
        );
        parts.push(`Lengte: ${formatDimension(length, scale)}`);
        break;

      case 'rectangle':
      case 'library-item':
        parts.push(`Breedte: ${formatDimension(element.width, scale)}`);
        parts.push(`Hoogte: ${formatDimension(element.height, scale)}`);
        const rectArea = calculateRectangleArea(element.width, element.height);
        parts.push(`Opp: ${formatArea(rectArea, scale)}`);
        break;

      case 'circle':
        const radius = Math.max(element.width, element.height) / 2;
        const diameter = calculateCircleDiameter(element.width, element.height);
        parts.push(`Diameter: ${formatDimension(diameter, scale)}`);
        const circleArea = calculateCircleArea(radius);
        parts.push(`Opp: ${formatArea(circleArea, scale)}`);
        break;

      case 'polygon':
        if (element.properties.points && element.properties.points.length >= 3) {
          const area = calculatePolygonArea(element.properties.points);
          const perimeter = calculatePerimeter(element.properties.points);
          parts.push(`Opp: ${formatArea(area, scale)}`);
          parts.push(`Omtrek: ${formatDimension(perimeter, scale)}`);
        }
        break;
    }

    return parts.join(' | ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-dark-secondary border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button
                  onClick={onCancel}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 bg-dark-bg border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all duration-300"
                  placeholder="Bijv. Muur 1, Plant, Vijver..."
                  autoFocus
                />
                
                {element && scale && (
                  <div className="mt-4 p-3 bg-dark-bg/50 border border-neon-green/30 rounded-lg">
                    <p className="text-neon-green text-sm font-medium mb-1">Afmetingen:</p>
                    <p className="text-white/80 text-sm">{getDimensionsText()}</p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-dark-bg border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex-1 px-4 py-2 bg-neon-green/20 border border-neon-green/50 rounded-lg text-neon-green hover:bg-neon-green/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Bevestigen
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
