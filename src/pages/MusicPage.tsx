import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Square, RotateCcw, Volume2, Music, Mic, Guitar, Piano, Headphones, Code, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MusicPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWaitingForLoop, setIsWaitingForLoop] = useState(false);
  const [pendingCodeExecution, setPendingCodeExecution] = useState<{ patterns: any, soundParams: any } | null>(null);
  const [currentCode, setCurrentCode] = useState(`// 🎵 Algorave Live Coding
// Maak je eigen beats en loops!
// Gebruik 1 voor een hit, 0 voor stilte

// Sound Design Parameters
kick_freq: 60      // Frequency in Hz
kick_dur: 0.1      // Duration in seconds
kick_type: "sine"  // Waveform: sine, square, triangle, sawtooth

snare_freq: 200
snare_dur: 0.1
snare_type: "triangle"

hihat_freq: 800
hihat_dur: 0.05
hihat_type: "square"

bass_freq: 40
bass_dur: 0.2
bass_type: "sawtooth"

// Patterns
kick: [1, 0, 1, 0, 1, 0, 1, 0]
snare: [0, 0, 1, 0, 0, 0, 1, 0]
hihat: [1, 1, 1, 1, 1, 1, 1, 1]
bass: [1, 0, 0, 1, 0, 0, 1, 0]

// Klik op "Execute" om je eigen patronen af te spelen!
// Gebruik Ctrl+S om te saven, Ctrl+Enter om uit te voeren`);
  const [output, setOutput] = useState('🎵 Ready to create music...');
  const [bpm, setBpm] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const loopIntervalRef = useRef<number | null>(null);
  const currentBpmRef = useRef(120); // For real-time BPM changes
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Initialize audio context and BPM ref
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    currentBpmRef.current = bpm;
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bpm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (!isWaitingForLoop) {
              executeCode();
              setOutput('🎵 Code executed via Ctrl+S shortcut!');
            } else {
              setOutput('🎵 Please wait for current loop to finish...');
            }
            break;
          case 'Enter':
            e.preventDefault();
            if (!isWaitingForLoop) {
              executeCode();
              setOutput('🎵 Code executed via Ctrl+Enter shortcut!');
            } else {
              setOutput('🎵 Please wait for current loop to finish...');
            }
            break;
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        // Exit fullscreen with Escape key
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentCode, isFullscreen, isWaitingForLoop]);

  // Simple sound generation
  const generateSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);

    return oscillator;
  };

  // Play pattern
  const playPattern = () => {
    if (!audioContextRef.current) return;

    setIsPlaying(true);
    setOutput('🎵 Playing pattern...');
    startVisualizer();

    const playOnePattern = () => {
      const beatDuration = 60 / currentBpmRef.current;

      // Kick drum (low frequency)
      [0, 2, 4, 6].forEach(beat => {
        setTimeout(() => {
          generateSound(60, 0.1, 'sine');
          setCurrentBeat(beat);
        }, beat * beatDuration * 1000);
      });

      // Snare (mid frequency)
      [2, 6].forEach(beat => {
        setTimeout(() => {
          generateSound(200, 0.1, 'triangle');
          setCurrentBeat(beat);
        }, beat * beatDuration * 1000);
      });

      // Hi-hat (high frequency)
      [0, 1, 2, 3, 4, 5, 6, 7].forEach(beat => {
        setTimeout(() => {
          generateSound(800, 0.05, 'square');
          setCurrentBeat(beat);
        }, beat * beatDuration * 1000);
      });

      // Bass (very low frequency)
      [0, 3, 6].forEach(beat => {
        setTimeout(() => {
          generateSound(40, 0.2, 'sawtooth');
          setCurrentBeat(beat);
        }, beat * beatDuration * 1000);
      });
    };

    // Play first pattern immediately
    playOnePattern();

    // If looping is enabled, set up the loop
    if (isLooping) {
      const patternDuration = (8 * 60) / currentBpmRef.current; // 8 beats in seconds
      loopIntervalRef.current = setInterval(() => {
        playOnePattern();
      }, patternDuration * 1000);
    } else {
      // Stop after 8 beats if not looping
      const patternDuration = (8 * 60) / currentBpmRef.current;
      setTimeout(() => {
        setIsPlaying(false);
        setOutput('🎵 Pattern finished! Try editing the code above.');
        stopVisualizer();
      }, patternDuration * 1000);
    }
  };

  // Helper function for default pattern playback
  const playOnePattern = () => {
    const beatDuration = 60 / currentBpmRef.current;

    // Kick drum (low frequency)
    [0, 2, 4, 6].forEach(beat => {
      setTimeout(() => {
        generateSound(60, 0.1, 'sine');
        setCurrentBeat(beat);
      }, beat * beatDuration * 1000);
    });

    // Snare (mid frequency)
    [2, 6].forEach(beat => {
      setTimeout(() => {
        generateSound(200, 0.1, 'triangle');
        setCurrentBeat(beat);
      }, beat * beatDuration * 1000);
    });

    // Hi-hat (high frequency)
    [0, 1, 2, 3, 4, 5, 6, 7].forEach(beat => {
      setTimeout(() => {
        generateSound(800, 0.05, 'square');
        setCurrentBeat(beat);
      }, beat * beatDuration * 1000);
    });

    // Bass (very low frequency)
    [0, 3, 6].forEach(beat => {
      setTimeout(() => {
        generateSound(40, 0.2, 'sawtooth');
        setCurrentBeat(beat);
      }, beat * beatDuration * 1000);
    });
  };

  // Stop audio playback only (internal use)
  const stopAudioOnly = () => {
    setIsPlaying(false);
    setIsLooping(false);
    stopVisualizer();
    
    // Clear the loop interval if it exists
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  };

  // Stop playback and handle pending execution
  const stopPlayback = () => {
    // If there's pending code execution, it will be handled in the next loop iteration
    if (isWaitingForLoop && pendingCodeExecution) {
      setOutput('🎵 Pending code will execute at next loop iteration...');
    } else {
      stopAudioOnly();
      setOutput('🎵 Playback stopped.');
    }
  };

  // Reset code
  const resetCode = () => {
    setCurrentCode(`// 🎵 Algorave Live Coding
// Maak je eigen beats en loops!
// Gebruik 1 voor een hit, 0 voor stilte

// Sound Design Parameters
kick_freq: 60      // Frequency in Hz
kick_dur: 0.1      // Duration in seconds
kick_type: "sine"  // Waveform: sine, square, triangle, sawtooth

snare_freq: 200
snare_dur: 0.1
snare_type: "triangle"

hihat_freq: 800
hihat_dur: 0.05
hihat_type: "square"

bass_freq: 40
bass_dur: 0.2
bass_type: "sawtooth"

// Patterns
kick: [1, 0, 1, 0, 1, 0, 1, 0]
snare: [0, 0, 1, 0, 0, 0, 1, 0]
hihat: [1, 1, 1, 1, 1, 1, 1, 1]
bass: [1, 0, 0, 1, 0, 0, 1, 0]

// Klik op "Execute" om je eigen patronen af te spelen!
// Gebruik Ctrl+S om te saven, Ctrl+Enter om uit te voeren`);
    setOutput('🎵 Code reset! Ready to create new music...');
    
    // Also reset loop state and visualizer
    setIsLooping(false);
    stopVisualizer();
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  };

  // Parse and execute code
  const executeCode = () => {
    setOutput('🎵 Parsing code...');
    
    try {
      // Parse the code to extract patterns and sound parameters
      const result = parseCode(currentCode);
      
      if (result && result.patterns) {
        // Check if currently playing and looping
        if (isPlaying && isLooping) {
          setOutput('🎵 Waiting for current loop to finish...');
          setIsWaitingForLoop(true);
          setPendingCodeExecution(result);
        } else {
          // Not looping, execute immediately
          setOutput('🎵 Code parsed successfully! Playing custom patterns...');
          playCustomPattern(result.patterns, result.soundParams);
        }
      } else {
        setOutput('🎵 Error: Could not parse patterns. Check your syntax.');
      }
    } catch (error) {
      setOutput(`🎵 Error parsing code: ${error}`);
    }
  };

  // Parse the code to extract patterns and sound parameters
  const parseCode = (code: string) => {
    const patterns: { [key: string]: number[] } = {};
    const soundParams: { [key: string]: any } = {};
    
    // Extract sound parameters
    const paramRegex = /(\w+_freq|w+_dur|w+_type):\s*([^\n]+)/g;
    let paramMatch;
    
    while ((paramMatch = paramRegex.exec(code)) !== null) {
      const [, param, value] = paramMatch;
      const cleanValue = value.trim().replace(/\/\/.*$/, '').trim();
      
      if (param.endsWith('_freq') || param.endsWith('_dur')) {
        const numValue = parseFloat(cleanValue);
        if (!isNaN(numValue)) {
          soundParams[param] = numValue;
        }
      } else if (param.endsWith('_type')) {
        const typeValue = cleanValue.replace(/"/g, '').replace(/'/g, '');
        if (['sine', 'square', 'triangle', 'sawtooth'].includes(typeValue)) {
          soundParams[param] = typeValue;
        }
      }
    }
    
    // Extract pattern definitions
    const patternRegex = /(\w+):\s*\[([^\]]+)\]/g;
    let match;
    
    while ((match = patternRegex.exec(code)) !== null) {
      const [, instrument, values] = match;
      const pattern = values.split(',').map(v => parseInt(v.trim()));
      
      if (pattern.some(isNaN)) {
        throw new Error(`Invalid pattern for ${instrument}: ${values}`);
      }
      
      patterns[instrument] = pattern;
    }
    
    // Check if we have valid patterns
    if (Object.keys(patterns).length === 0) {
      return null;
    }
    
    return { patterns, soundParams };
  };

  // Play custom patterns from parsed code
  const playCustomPattern = (patterns: { [key: string]: number[] }, soundParams: { [key: string]: any } = {}) => {
    if (!audioContextRef.current) return;

    // Reset waiting state
    setIsWaitingForLoop(false);
    setPendingCodeExecution(null);

    // Stop any existing playback to prevent overlap
    stopAudioOnly();
    
    setIsPlaying(true);
    startVisualizer();
    setOutput('🎵 Playing custom patterns...');

    const maxBeats = Math.max(...Object.values(patterns).map(p => p.length));

    const playOneCustomPattern = () => {
      const beatDuration = 60 / currentBpmRef.current;

      // Play each instrument based on its pattern
      Object.entries(patterns).forEach(([instrument, pattern]) => {
        pattern.forEach((hit, beatIndex) => {
          if (hit === 1) {
            setTimeout(() => {
              // Get custom sound parameters or use defaults
              const freq = soundParams[`${instrument}_freq`] || 
                (instrument === 'kick' ? 60 : 
                 instrument === 'snare' ? 200 : 
                 instrument === 'hihat' ? 800 : 
                 instrument === 'bass' ? 40 : 200);
              
              const dur = soundParams[`${instrument}_dur`] || 
                (instrument === 'kick' ? 0.1 : 
                 instrument === 'snare' ? 0.1 : 
                 instrument === 'hihat' ? 0.05 : 
                 instrument === 'bass' ? 0.2 : 0.1);
              
              const type = soundParams[`${instrument}_type`] || 
                (instrument === 'kick' ? 'sine' : 
                 instrument === 'snare' ? 'triangle' : 
                 instrument === 'hihat' ? 'square' : 
                 instrument === 'bass' ? 'sawtooth' : 'sine') as OscillatorType;

              generateSound(freq, dur, type);
              setCurrentBeat(beatIndex % 8);
            }, beatIndex * beatDuration * 1000);
          }
        });
      });
    };

    // Play first pattern immediately
    playOneCustomPattern();

    // If looping is enabled, set up the loop
    if (isLooping) {
      const patternDuration = (maxBeats * 60) / currentBpmRef.current;
      loopIntervalRef.current = setInterval(() => {
        // Check if there's pending code to execute
        if (pendingCodeExecution) {
          // Execute pending code instead of current pattern
          const pending = pendingCodeExecution;
          setPendingCodeExecution(null);
          setIsWaitingForLoop(false);
          
          // Update the patterns and sound params for next iteration
          const newPatterns = pending.patterns as { [key: string]: number[] };
          const newSoundParams = pending.soundParams as { [key: string]: any };
          
          Object.entries(newPatterns).forEach(([instrument, pattern]) => {
            (pattern as number[]).forEach((hit: number, beatIndex: number) => {
              if (hit === 1) {
                setTimeout(() => {
                  const freq = newSoundParams[`${instrument}_freq`] || 
                    (instrument === 'kick' ? 60 : 
                     instrument === 'snare' ? 200 : 
                     instrument === 'hihat' ? 800 : 
                     instrument === 'bass' ? 40 : 200);
                  
                  const dur = newSoundParams[`${instrument}_dur`] || 
                    (instrument === 'kick' ? 0.1 : 
                     instrument === 'snare' ? 0.1 : 
                     instrument === 'hihat' ? 0.05 : 
                     instrument === 'bass' ? 0.2 : 0.1);
                  
                  const type = newSoundParams[`${instrument}_type`] || 
                    (instrument === 'kick' ? 'sine' : 
                     instrument === 'snare' ? 'triangle' : 
                     instrument === 'hihat' ? 'square' : 
                     instrument === 'bass' ? 'sawtooth' : 'sine') as OscillatorType;

                  generateSound(freq, dur, type);
                  setCurrentBeat(beatIndex % 8);
                }, beatIndex * (60 / currentBpmRef.current) * 1000);
              }
            });
          });
          
          setOutput('🎵 New code executed at next loop iteration!');
        } else {
          // Play current pattern normally
          playOneCustomPattern();
        }
      }, patternDuration * 1000);
    } else {
      // Stop after pattern duration if not looping
      const patternDuration = (maxBeats * 60) / currentBpmRef.current;
      setTimeout(() => {
        setIsPlaying(false);
        setOutput('🎵 Custom pattern finished! Try editing the code above.');
        stopVisualizer();
      }, patternDuration * 1000);
    }
  };

  // Toggle loop
  const toggleLoop = () => {
    setIsLooping(!isLooping);
    setOutput(isLooping ? '🎵 Loop disabled' : '🎵 Loop enabled - pattern will repeat continuously');
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setOutput(isFullscreen ? '🎵 Exited fullscreen mode' : '🎵 Entered fullscreen mode');
  };

  // Handle BPM changes
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    currentBpmRef.current = newBpm;
    
    // If currently looping, restart the loop with new BPM
    if (isLooping && loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      
              // Check if we're playing custom patterns or default patterns
        try {
          const result = parseCode(currentCode);
          if (result && result.patterns) {
            // Custom patterns - use a safer approach
            const maxBeats = Math.max(...Object.values(result.patterns).map(p => p.length));
            const newPatternDuration = (maxBeats * 60) / newBpm;
            loopIntervalRef.current = setInterval(() => {
              // Don't call playCustomPattern here to avoid recursion
              // Just play the pattern directly
              const patterns = result.patterns;
              const soundParams = result.soundParams;
              
              if (audioContextRef.current) {
                const beatDuration = 60 / currentBpmRef.current;
                
                Object.entries(patterns).forEach(([instrument, pattern]) => {
                  pattern.forEach((hit, beatIndex) => {
                    if (hit === 1) {
                      setTimeout(() => {
                        const freq = soundParams[`${instrument}_freq`] || 
                          (instrument === 'kick' ? 60 : 
                           instrument === 'snare' ? 200 : 
                           instrument === 'hihat' ? 800 : 
                           instrument === 'bass' ? 40 : 200);
                        
                        const dur = soundParams[`${instrument}_dur`] || 
                          (instrument === 'kick' ? 0.1 : 
                           instrument === 'snare' ? 0.1 : 
                           instrument === 'hihat' ? 0.05 : 
                           instrument === 'bass' ? 0.2 : 0.1);
                        
                        const type = soundParams[`${instrument}_type`] || 
                          (instrument === 'kick' ? 'sine' : 
                           instrument === 'snare' ? 'triangle' : 
                           instrument === 'hihat' ? 'square' : 
                           instrument === 'bass' ? 'sawtooth' : 'sine') as OscillatorType;

                        generateSound(freq, dur, type);
                        setCurrentBeat(beatIndex % 8);
                      }, beatIndex * beatDuration * 1000);
                    }
                  });
                });
              }
            }, newPatternDuration * 1000);
          } else {
            // Default patterns
            const newPatternDuration = (8 * 60) / newBpm;
            loopIntervalRef.current = setInterval(() => {
              playOnePattern();
            }, newPatternDuration * 1000);
          }
        } catch (error) {
          // Fallback to default patterns
          const newPatternDuration = (8 * 60) / newBpm;
          loopIntervalRef.current = setInterval(() => {
            playOnePattern();
          }, newPatternDuration * 1000);
        }
      
      setOutput(`🎵 BPM changed to ${newBpm} - loop restarted with new tempo!`);
    } else {
      setOutput(`🎵 BPM set to ${newBpm}`);
    }
  };

  // Generate visualizer data
  const generateVisualizerData = () => {
    const data = [];
    for (let i = 0; i < 32; i++) {
      data.push(Math.random() * 0.5 + 0.1);
    }
    setVisualizerData(data);
  };

  // Update visualizer animation
  const updateVisualizer = () => {
    if (isPlaying) {
      generateVisualizerData();
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    }
  };

  // Start visualizer
  const startVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    updateVisualizer();
  };

  // Stop visualizer
  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setVisualizerData([]);
    setCurrentBeat(0);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            🎵 Muziek & Live Coding
          </h1>
          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Verken de wereld van muziekproductie, live coding en algoritmische compositie. 
            Van traditionele instrumenten tot cutting-edge algorave technologie.
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-neon-green hover:text-neon-blue transition-colors duration-300 text-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Terug naar Home</span>
          </Link>
        </motion.div>

        {/* Live Coding Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Code className="w-6 h-6 mr-3 text-neon-green" />
                Algorave Live Coding Panel
              </h2>
                             <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                   <label className="text-white/70 text-sm">BPM:</label>
                   <input
                     type="range"
                     min="60"
                     max="200"
                     value={bpm}
                     onChange={(e) => handleBpmChange(Number(e.target.value))}
                     className="w-20"
                   />
                   <span className="text-white text-sm w-12">{bpm}</span>
                 </div>
                 
                 {/* Fullscreen Toggle Button */}
                 <button
                   onClick={toggleFullscreen}
                   className="flex items-center space-x-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300"
                   title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                 >
                   {isFullscreen ? (
                     <Minimize2 className="w-4 h-4" />
                   ) : (
                     <Maximize2 className="w-4 h-4" />
                   )}
                   <span className="hidden sm:inline">
                     {isFullscreen ? "Exit" : "Fullscreen"}
                   </span>
                 </button>
               </div>
            </div>

                                                   {/* Enhanced Code Editor with Visualizers */}
              <div className={`mb-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-dark-bg' : ''}`}>
                <div className={`bg-dark-bg rounded-lg p-4 border border-white/10 ${isFullscreen ? 'h-full overflow-y-auto max-h-screen' : ''}`}>
                 {/* Beat Grid Visualizer */}
                 <div className="mb-4">
                   <div className="flex items-center space-x-2 mb-2">
                     <span className="text-white/70 text-sm">Beat Grid:</span>
                     <div className="flex space-x-1">
                       {Array.from({ length: 8 }, (_, i) => (
                         <div
                           key={i}
                           className={`w-3 h-3 rounded-full transition-all duration-200 ${
                             currentBeat === i && isPlaying
                               ? 'bg-neon-green scale-125 shadow-lg shadow-neon-green/50'
                               : 'bg-white/20'
                           }`}
                         />
                       ))}
                     </div>
                   </div>
                 </div>

                 {/* Sound Wave Visualizer */}
                 <div className="mb-4">
                   <div className="flex items-center space-x-2 mb-2">
                     <span className="text-white/70 text-sm">Sound Waves:</span>
                   </div>
                   <div className="flex items-end space-x-1 h-16">
                     {visualizerData.map((height, i) => (
                       <motion.div
                         key={i}
                         className="bg-gradient-to-t from-neon-green to-neon-blue rounded-sm"
                         style={{ width: '4px' }}
                         animate={{
                           height: isPlaying ? `${height * 100}%` : '8px',
                           opacity: isPlaying ? 0.8 : 0.3
                         }}
                         transition={{
                           duration: 0.1,
                           ease: "easeOut"
                         }}
                       />
                     ))}
                   </div>
                 </div>

                                   {/* Code Editor */}
                  <div className="relative">
                    {/* Shortcuts Info */}
                    <div className="absolute top-2 right-2 z-20 text-xs text-white/50 bg-black/20 px-2 py-1 rounded">
                      <div>Ctrl+S / Ctrl+Enter</div>
                      {isFullscreen && <div>ESC to exit</div>}
                    </div>
                    
                                         <textarea
                       value={currentCode}
                       onChange={(e) => setCurrentCode(e.target.value)}
                       className={`w-full bg-transparent text-green-400 font-mono text-sm resize-none outline-none relative z-10 ${
                         isFullscreen ? 'h-96' : 'h-48'
                       }`}
                       placeholder="Schrijf je algorave code hier..."
                     />
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded">
                      <div className="absolute inset-0 opacity-5">
                        {Array.from({ length: 20 }, (_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-neon-green rounded-full"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`
                            }}
                            animate={{
                              y: isPlaying ? [0, -20, 0] : 0,
                              opacity: isPlaying ? [0.3, 1, 0.3] : 0.3
                            }}
                            transition={{
                              duration: 2,
                              repeat: isPlaying ? Infinity : 0,
                              delay: i * 0.1
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                                   {/* Pattern Blocks */}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-white/70 text-sm">Pattern Blocks:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['Kick', 'Snare', 'HiHat', 'Bass'].map((instrument, i) => (
                        <motion.div
                          key={instrument}
                          className={`p-2 rounded text-center text-xs font-mono ${
                            i === 0 ? 'bg-red-500/20 border border-red-500/30' :
                            i === 1 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            i === 2 ? 'bg-blue-500/20 border border-blue-500/30' :
                            'bg-purple-500/20 border border-purple-500/30'
                          }`}
                          animate={{
                            scale: isPlaying && currentBeat % 2 === i % 2 ? 1.05 : 1,
                            borderColor: isPlaying && currentBeat % 2 === i % 2 ? 
                              (i === 0 ? '#ef4444' : i === 1 ? '#eab308' : i === 2 ? '#3b82f6' : '#a855f7') : 
                              'rgba(255, 255, 255, 0.3)'
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {instrument}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Sound Design Info */}
                  <div className="mt-4 p-3 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                    <div className="text-center mb-2">
                      <span className="text-neon-green text-sm font-medium">🎛️ Sound Design Tips</span>
                    </div>
                    <div className="text-xs text-white/70 space-y-1">
                      <div>• <strong>Frequency:</strong> 20-20000 Hz (bass: 20-200, treble: 2000+)</div>
                      <div>• <strong>Duration:</strong> 0.01-1.0 seconds (kicks: 0.1, hihats: 0.05)</div>
                      <div>• <strong>Waveforms:</strong> sine (smooth), square (harsh), triangle (warm), sawtooth (bright)</div>
                      <div>• <strong>Shortcuts:</strong> Ctrl+S of Ctrl+Enter om code uit te voeren</div>
                    </div>
                  </div>
               </div>
             </div>

                         {/* Controls */}
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-4">
                 <button
                   onClick={playPattern}
                   disabled={isPlaying}
                   className="flex items-center space-x-2 bg-neon-green hover:bg-neon-green/80 disabled:opacity-50 text-dark-bg px-4 py-2 rounded-lg font-medium transition-all duration-300"
                 >
                   <Play className="w-4 h-4" />
                   <span>Play Pattern</span>
                 </button>
                 <button
                   onClick={stopPlayback}
                   className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                 >
                   <Square className="w-4 h-4" />
                   <span>Stop</span>
                 </button>
                 <button
                   onClick={toggleLoop}
                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                     isLooping 
                       ? 'bg-neon-purple hover:bg-neon-purple/80 text-white' 
                       : 'bg-gray-600 hover:bg-gray-700 text-white'
                   }`}
                 >
                   <RotateCcw className="w-4 h-4" />
                   <span>{isLooping ? 'Loop On' : 'Loop Off'}</span>
                 </button>
                 <button
                   onClick={executeCode}
                   disabled={isWaitingForLoop}
                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                     isWaitingForLoop 
                       ? 'bg-orange-500 cursor-not-allowed opacity-70' 
                       : 'bg-neon-blue hover:bg-neon-blue/80'
                   } text-white`}
                 >
                   <Zap className="w-4 h-4" />
                   <span>{isWaitingForLoop ? 'Waiting...' : 'Execute'}</span>
                 </button>
                 <button
                   onClick={resetCode}
                   className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                 >
                   <RotateCcw className="w-4 h-4" />
                   <span>Reset</span>
                 </button>
                 
                 {/* Fullscreen Close Button (only visible in fullscreen) */}
                 {isFullscreen && (
                   <button
                     onClick={toggleFullscreen}
                     className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                     title="Exit Fullscreen"
                   >
                     <Minimize2 className="w-4 h-4" />
                     <span>Exit Fullscreen</span>
                   </button>
                 )}
               </div>
             </div>

            {/* Output */}
            <div className="bg-dark-bg rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-neon-green" />
                <span className="text-white/70 text-sm">Output:</span>
              </div>
              <div className="text-green-400 font-mono text-sm">
                {output}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Music Skills Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              🎼 Muzikale Vaardigheden
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Van traditionele instrumenten tot moderne productiesoftware - 
              ontdek de verschillende aspecten van muziekcreatie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* DAW Software */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                  <Music className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  DAW Software
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Professionele muziekproductie met FL Studio, Ableton Live en andere digitale audio workstations.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                    <span>FL Studio - Beat making & arrangement</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                    <span>Ableton Live - Live performance & looping</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
                    <span>Logic Pro - Professional recording</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analog & Hardware */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                  <Piano className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  Analog & Hardware
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Warme analoge geluiden en hands-on hardware synthesizers voor authentieke muziekproductie.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                    <span>Analog synthesizers & modules</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                    <span>Hardware drum machines</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
                    <span>Vintage effect processors</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Acoustic & Live */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                  <Guitar className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  Acoustic & Live
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Traditionele instrumenten en live jamming voor organische muziekcreatie en performance.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                    <span>Guitar & bass playing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                    <span>Live jamming & improvisatie</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
                    <span>Acoustic percussion</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vocals & Sound Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  Vocals & Sound Design
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Vocale technieken en creatieve sound design voor unieke muzikale texturen.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                    <span>Vocal recording & processing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                    <span>Sound design & synthesis</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
                    <span>Creative audio manipulation</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Coding & Algorave */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  Live Coding & Algorave
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Algoritmische muziekcreatie en live coding voor experimentele elektronische muziek.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                    <span>Algorithmic composition</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                    <span>Live coding performance</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
                    <span>Generative music systems</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Music Theory & Production */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                  Theory & Production
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Muziektheorie, arrangement en professionele productietechnieken.
                </p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-green rounded-full"></span>
                    <span>Music theory & composition</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                    <span>Arrangement & orchestration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/80">
                    <span className="w-2 h-2 bg-neon-purple rounded-full"></span>
                    <span>Mixing & mastering</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
