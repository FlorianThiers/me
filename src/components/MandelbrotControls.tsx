import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Palette, ZoomIn, RotateCw } from 'lucide-react';

interface MandelbrotControlsProps {
  onUpdateParams: (params: {
    iterations: number;
    zoom: number;
    rotation: number;
    colorSpeed: number;
    glowIntensity: number;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
  }) => void;
  isOpen: boolean;
  onToggle: () => void;
  currentParams?: {
    iterations: number;
    zoom: number;
    rotation: number;
    colorSpeed: number;
    glowIntensity: number;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
  };
}

export const MandelbrotControls: React.FC<MandelbrotControlsProps> = ({
  onUpdateParams,
  isOpen,
  onToggle,
  currentParams
}) => {
  // Gebruik de parameters van de parent component in plaats van lokale state
  const [localParams, setLocalParams] = useState({
    iterations: 200,
    zoom: 0.05,
    rotation: 0.05,
    colorSpeed: 0.3,
    glowIntensity: 0.15,
    color1: '#00ff88',
    color2: '#ff0088',
    color3: '#0088ff',
    color4: '#8800ff'
  });

  // Synchroniseer lokale state met parent parameters
  useEffect(() => {
    if (currentParams) {
      console.log('Controls: Syncing with parent params:', currentParams);
      setLocalParams(currentParams);
    }
  }, [currentParams]);

  const handleParamChange = (key: string, value: number | string) => {
    const newParams = { ...localParams, [key]: value };
    console.log('Controls: Updating param', key, 'to', value); // Debug log
    setLocalParams(newParams);
    
    // Zorg ervoor dat de parent component de nieuwe parameters ontvangt
    onUpdateParams(newParams);
  };

  const resetToDefaults = () => {
    const defaults = {
      iterations: 200,
      zoom: 0.05,
      rotation: 0.05,
      colorSpeed: 0.3,
      glowIntensity: 0.15,
      color1: '#00ff88',
      color2: '#ff0088',
      color3: '#0088ff',
      color4: '#8800ff'
    };
    setLocalParams(defaults);
    onUpdateParams(defaults);
  };

    return (
    <>
             {/* Toggle Button */}
       <motion.button
         onClick={onToggle}
         className="fixed top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg"
         whileHover={{ scale: 1.1 }}
         whileTap={{ scale: 0.95 }}
       >
         <Settings className="w-4 h-4 text-white" />
       </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {isOpen && (
                     <motion.div
             initial={{ opacity: 0, x: 300 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 300 }}
             className="fixed top-20 right-4 h-auto max-h-96 w-72 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg z-40 overflow-y-auto shadow-2xl"
           >
                         <div className="p-4">
               {/* Header */}
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                   <Settings className="w-4 h-4" />
                   Mandelbrot Controls
                 </h2>
                 <button
                   onClick={onToggle}
                   className="p-1 hover:bg-white/10 rounded-full transition-colors"
                 >
                   <X className="w-4 h-4 text-white" />
                 </button>
               </div>

                             {/* Reset Button */}
               <button
                 onClick={resetToDefaults}
                 className="w-full mb-4 px-3 py-2 bg-neon-green/20 border border-neon-green/50 text-neon-green rounded-lg hover:bg-neon-green/30 transition-all duration-300 text-sm"
               >
                 Reset to Defaults
               </button>

               {/* Iterations Control */}
               <div className="mb-4">
                                 <label className="block text-sm font-medium text-white mb-2">
                   Iterations: {localParams.iterations}
                 </label>
                 <input
                   type="range"
                   min="50"
                   max="500"
                   step="10"
                   value={localParams.iterations}
                   onChange={(e) => handleParamChange('iterations', parseInt(e.target.value))}
                   className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                 />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>50</span>
                  <span>500</span>
                </div>
              </div>

                             {/* Zoom Control */}
               <div className="mb-4">
                                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                     <ZoomIn className="w-4 h-4" />
                     Zoom Speed: {localParams.zoom.toFixed(2)}
                   </label>
                   <input
                     type="range"
                     min="0.01"
                     max="0.2"
                     step="0.01"
                     value={localParams.zoom}
                     onChange={(e) => handleParamChange('zoom', parseFloat(e.target.value))}
                     className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                   />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0.01</span>
                  <span>0.2</span>
                </div>
              </div>

                             {/* Rotation Control */}
               <div className="mb-4">
                                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                     <RotateCw className="w-4 h-4" />
                     Rotation Speed: {localParams.rotation.toFixed(3)}
                   </label>
                   <input
                     type="range"
                     min="0"
                     max="0.2"
                     step="0.01"
                     value={localParams.rotation}
                     onChange={(e) => handleParamChange('rotation', parseFloat(e.target.value))}
                     className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                   />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0</span>
                  <span>0.2</span>
                </div>
              </div>

                             {/* Color Speed Control */}
               <div className="mb-4">
                                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                     <Palette className="w-4 h-4" />
                     Color Speed: {localParams.colorSpeed.toFixed(2)}
                   </label>
                   <input
                     type="range"
                     min="0.1"
                     max="1.0"
                     step="0.1"
                     value={localParams.colorSpeed}
                     onChange={(e) => handleParamChange('colorSpeed', parseFloat(e.target.value))}
                     className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                   />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0.1</span>
                  <span>1.0</span>
                </div>
              </div>

                             {/* Glow Intensity Control */}
               <div className="mb-4">
                                    <label className="block text-sm font-medium text-white mb-2">
                     Glow Intensity: {localParams.glowIntensity.toFixed(2)}
                   </label>
                   <input
                     type="range"
                     min="0.05"
                     max="0.3"
                     step="0.05"
                     value={localParams.glowIntensity}
                     onChange={(e) => handleParamChange('glowIntensity', parseFloat(e.target.value))}
                     className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                   />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>0.05</span>
                  <span>0.3</span>
                </div>
              </div>

                             {/* Color Picker Section */}
               <div className="space-y-3">
                 <h3 className="text-base font-semibold text-white mb-3">Color Palette</h3>
                 
                 <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Color 1</label>
                                         <input
                       type="color"
                       value={localParams.color1}
                       onChange={(e) => handleParamChange('color1', e.target.value)}
                       className="w-full h-8 rounded-lg border border-white/20 cursor-pointer"
                     />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Color 2</label>
                                         <input
                       type="color"
                       value={localParams.color2}
                       onChange={(e) => handleParamChange('color2', e.target.value)}
                       className="w-full h-8 rounded-lg border border-white/20 cursor-pointer"
                     />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Color 3</label>
                                         <input
                       type="color"
                       value={localParams.color3}
                       onChange={(e) => handleParamChange('color3', e.target.value)}
                       className="w-full h-8 rounded-lg border border-white/20 cursor-pointer"
                     />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Color 4</label>
                                         <input
                       type="color"
                       value={localParams.color4}
                       onChange={(e) => handleParamChange('color4', e.target.value)}
                       className="w-full h-8 rounded-lg border border-white/20 cursor-pointer"
                     />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
