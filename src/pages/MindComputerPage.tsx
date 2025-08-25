import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Cpu,
    Brain,
    HardDrive,
    Network,
    ArrowLeft,
    BookOpen,
    Users,
    Zap,
    Atom
} from 'lucide-react';

export const MindComputerPage: React.FC = () => {
    const [currentDiagram, setCurrentDiagram] = useState(0);

    const computerComponents = [
        {
            icon: <Cpu className="w-full h-full" />,
            title: 'CPU (Meditatie & Focus)',
            description: 'De centrale verwerkingseenheid van je mind die gedachten verwerkt en controleert.',
            details: [
                'Executive control en besluitvorming',
                'Aandacht en focus management',
                'Gedachtepatronen sturen',
                'Emotionele regulatie'
            ],
            computerEquivalent: [
                'Processor met meerdere cores',
                'Task scheduler en priority management',
                'Cache en instruction pipeline',
                'Thermal management en throttling'
            ],
            research: 'Gebaseerd op moderne neurowetenschap en cognitieve psychologie. Meditatie traint letterlijk de prefrontale cortex, vergelijkbaar met CPU-training.'
        },
        {
            icon: <HardDrive className="w-full h-full" />,
            title: 'RAM & Cache (Kortetermijngeheugen)',
            description: 'Werkgeheugen voor actieve gedachten en snelle toegang tot recente informatie.',
            details: [
                'Actieve gedachten en herinneringen',
                'Kortetermijnassociaties',
                'Werkruimte voor problemen',
                'Context en focus behoud'
            ],
            computerEquivalent: [
                'Random Access Memory (RAM)',
                'L1, L2, L3 cache levels',
                'Memory bandwidth en latency',
                'Virtual memory en paging'
            ],
            research: 'Gebaseerd op werkgeheugen theorieën van Baddeley en Cowan. Vergelijkbaar met computer RAM dat constant wordt bijgewerkt.'
        },
        {
            icon: <Brain className="w-full h-full" />,
            title: 'GPU (Verbeelding & Creativiteit)',
            description: 'Graphics processing voor creatieve output, droombeelden en visuele hallucinaties.',
            details: [
                'Visuele verbeelding en dromen',
                'Creatieve patronen en associaties',
                'Emotionele beelden en symbolen',
                'Spatiale verwerking en navigatie'
            ],
            computerEquivalent: [
                'Graphics Processing Unit (GPU)',
                'Parallel processing van beelden',
                'Texture mapping en rendering',
                'CUDA cores en shader units'
            ],
            research: 'Gebaseerd op visuele cortex onderzoek en creativiteit studies. De rechter hersenhelft is gespecialiseerd in visuele verwerking, net als een GPU.'
        },
        {
            icon: <HardDrive className="w-full h-full" />,
            title: 'Database (Onderbewustzijn)',
            description: 'Langetermijnopslag van herinneringen, ervaringen, trauma\'s en automatische patronen.',
            details: [
                'Langetermijnherinneringen en trauma\'s',
                'Automatische gewoontes en scripts',
                'Archetypen en collectieve patronen',
                'Verborgen verbanden en associaties'
            ],
            computerEquivalent: [
                'Hard disk drive (HDD) en SSD',
                'Database indexing en queries',
                'File system en data structuren',
                'Backup en recovery systemen'
            ],
            research: 'Gebaseerd op Jung\'s collectief onbewuste en moderne geheugen theorieën. Het onderbewustzijn werkt als een enorme database met complexe indexering.'
        },
        {
            icon: <Network className="w-full h-full" />,
            title: 'Network & Firewall (Ego & Filters)',
            description: 'Verbindingen met anderen, collectief bewustzijn en ego-filters die bepalen wat er binnenkomt.',
            details: [
                'Sociale verbindingen en empathie',
                'Collectief bewustzijn en cultuur',
                'Ego en persoonlijke filters',
                'Grenzen en bescherming'
            ],
            computerEquivalent: [
                'Network interface en protocols',
                'Firewall en security rules',
                'VPN en encrypted connections',
                'Bandwidth en connection pooling'
            ],
            research: 'Gebaseerd op sociale psychologie en netwerk theorieën. Mensen zijn sociale wezens die constant informatie uitwisselen, net als computers in een netwerk.'
        },
        {
            icon: <Zap className="w-full h-full" />,
            title: 'I/O System (Zintuigen & Gedrag)',
            description: 'Input/output van informatie via zintuigen en uiting van gedachten en emoties.',
            details: [
                'Zintuiglijke waarneming (input)',
                'Spraak en lichaamstaal (output)',
                'Emotionele expressie',
                'Motorische controle en actie'
            ],
            computerEquivalent: [
                'Input/Output controllers',
                'USB en peripheral devices',
                'Audio/video interfaces',
                'Device drivers en protocols'
            ],
            research: 'Gebaseerd op sensorische verwerking en motorische controle theorieën. Zintuigen zijn letterlijk input devices, net als een toetsenbord of microfoon.'
        }
    ];

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
                        Mind als Computer
                    </h1>
                    <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
                        Verken alle componenten van je mind-computer met gedetailleerde vergelijkingen
                        en wetenschappelijke referenties. Gebruik de controls om door de verschillende onderdelen te navigeren.
                    </p>
                </motion.div>

                {/* Interactive Component Diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="relative"
                >
                    <h3 className="text-2xl font-bold text-white text-center mb-8">
                        Interactief Mind-Computer Diagram
                    </h3>
                    <p className="text-white/70 text-center mb-12 max-w-3xl mx-auto">
                        Hover over de componenten om hun verbindingen en details te zien.
                        Elk onderdeel heeft zijn eigen rol in het grotere systeem.
                    </p>

                    {/* SVG Connections Layer */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                        style={{ minHeight: '100px' }}
                    >
                        {/* CPU to RAM connection (same height, left to center) - Hidden on mobile */}
                        <motion.line
                            x1="20%" y1="25%" x2="50%" y2="25%"
                            stroke="#10b981"
                            strokeWidth="4"
                            strokeDasharray="4,4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1.2 }}
                            className="hidden sm:block"
                        />

                        {/* CPU to GPU connection (same height, center to right) - Hidden on mobile */}
                        <motion.line
                            x1="50%" y1="25%" x2="80%" y2="25%"
                            stroke="#f59e0b"
                            strokeWidth="4"
                            strokeDasharray="4,4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1.4 }}
                            className="hidden sm:block"
                        />

                        {/* CPU to Database connection (top to bottom center) - Hidden on mobile */}
                        <motion.line
                            x1="50%" y1="25%" x2="50%" y2="70%"
                            stroke="#8b5cf6"
                            strokeWidth="4"
                            strokeDasharray="4,4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1.6 }}
                            className="hidden sm:block"
                        />

                        {/* RAM to I/O connection (left to bottom left) - Hidden on mobile */}
                        <motion.line
                            x1="20%" y1="25%" x2="20%" y2="70%"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="3,3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 1.8 }}
                            className="hidden sm:block"
                        />

                        {/* GPU to Network connection (right to bottom right) - Hidden on mobile */}
                        <motion.line
                            x1="80%" y1="25%" x2="80%" y2="70%"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            strokeDasharray="3,3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 2.0 }}
                            className="hidden sm:block"
                        />

                        {/* I/O to Database connection (bottom left to center) - Hidden on mobile */}
                        <motion.line
                            x1="20%" y1="70%" x2="50%" y2="70%"
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeDasharray="3,3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 2.2 }}
                            className="hidden sm:block"
                        />

                        {/* Network to Database connection (bottom right to center) - Hidden on mobile */}
                        <motion.line
                            x1="80%" y1="70%" x2="50%" y2="70%"
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeDasharray="3,3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 2.4 }}
                            className="hidden sm:block"
                        />

                        {/* Data flow arrows - Hidden on mobile */}
                        <motion.path
                            d="M 50% 70% Q 50% 85% 50% 85%"
                            stroke="#10b981"
                            strokeWidth="4"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 2.6 }}
                            className="hidden sm:block"
                        />

                        {/* Gradients for connections */}
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient5" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="gradient8" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                            </linearGradient>

                            {/* Arrow marker for data flow */}
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="8"
                                refY="3.5"
                                orient="auto"
                                className="hidden sm:block"
                            >
                                <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#10b981"
                                />
                            </marker>
                        </defs>
                    </svg>

                    {/* Component Grid - Mobile Friendly Layout */}
                    <div className="relative z-20">
                        {/* Top Row - CPU, RAM & GPU all at same height */}
                        <div className="flex justify-center sm:justify-between items-center mb-3 sm:mb-6 px-4 sm:px-8 md:px-16 lg:px-40 gap-4 sm:gap-0">
                            {/* RAM & Cache - Left */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: -100 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 1.2 }}
                                className="relative bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-lg p-2 sm:p-3 cursor-pointer transition-all duration-300 group hover:scale-110 hover:border-neon-blue/70 hover:shadow-2xl hover:shadow-neon-blue/20"
                                onClick={() => setCurrentDiagram(1)}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, 1, -1, 0],
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative z-10 text-center max-w-20 sm:max-w-28 md:max-w-36 mx-auto">
                                    <div className="text-lg sm:text-xl md:text-2xl mb-1 text-white/70 group-hover:text-neon-blue transition-all duration-300">
                                        {computerComponents[1].icon}
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-neon-blue transition-colors duration-300 mb-1 hidden sm:block">
                                        {computerComponents[1].title.split('(')[0].trim()}
                                    </h3>
                                    <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300 max-w-[80px] sm:max-w-[120px] hidden sm:block">
                                        {computerComponents[1].description}
                                    </p>

                                    {/* Connection indicators */}
                                    <div className="flex justify-center space-x-1 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 bg-white/30 group-hover:bg-neon-blue/70 rounded-full transition-all duration-300"
                                            />
                                        ))}
                                    </div>

                                    {/* Active indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: currentDiagram === 1 ? 1 : 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-neon-blue rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-dark-bg rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* CPU - Center */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: -50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.0 }}
                                className="relative bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-300 group hover:scale-110 hover:border-neon-green/70 hover:shadow-2xl hover:shadow-neon-green/20"
                                onClick={() => setCurrentDiagram(0)}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, 1, -1, 0],
                                    transition: { duration: 0.3 }
                                }}
                            >
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative z-10 text-center max-w-24 sm:max-w-32 md:max-w-36 mx-auto">
                                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-neon-green group-hover:scale-125 transition-all duration-300">
                                        {computerComponents[0].icon}
                                    </div>
                                    <h3 className="text-sm sm:text-lg font-bold text-neon-green mb-1 hidden sm:block">
                                        {computerComponents[0].title.split('(')[0].trim()}
                                    </h3>
                                    <p className="text-white/80 text-xs max-w-[100px] sm:max-w-xs hidden sm:block">
                                        {computerComponents[0].description}
                                    </p>

                                    {/* Connection indicators */}
                                    <div className="flex justify-center space-x-1 mt-1 sm:mt-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neon-green rounded-full animate-pulse"
                                            />
                                        ))}
                                    </div>

                                    {/* Active indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: currentDiagram === 0 ? 1 : 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-neon-green rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-dark-bg rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* GPU - Right */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 1.4 }}
                                className="relative bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-lg p-2 sm:p-3 cursor-pointer transition-all duration-300 group hover:scale-110 hover:border-orange-400/70 hover:shadow-2xl hover:shadow-orange-400/20"
                                onClick={() => setCurrentDiagram(2)}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, 1, -1, 0],
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative z-10 text-center max-w-20 sm:max-w-28 md:max-w-36 mx-auto">
                                    <div className="text-lg sm:text-xl md:text-2xl mb-1 text-white/70 group-hover:text-orange-400 transition-all duration-300">
                                        {computerComponents[2].icon}
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors duration-300 mb-1 hidden sm:block">
                                        {computerComponents[2].title.split('(')[0].trim()}
                                    </h3>
                                    <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300 max-w-[80px] sm:max-w-[120px] hidden sm:block">
                                        {computerComponents[2].description}
                                    </p>

                                    {/* Connection indicators */}
                                    <div className="flex justify-center space-x-1 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 bg-white/30 group-hover:bg-orange-400/70 rounded-full transition-all duration-300"
                                            />
                                        ))}
                                    </div>

                                    {/* Active indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: currentDiagram === 2 ? 1 : 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-dark-bg rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Bottom Row - Database Centered, I/O & Network on sides */}
                        <div className="flex justify-center sm:justify-between items-center px-4 sm:px-8 md:px-16 lg:px-40 gap-4 sm:gap-0">
                            {/* I/O System - Bottom Left */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: -100, y: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.6 }}
                                className="relative bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-lg p-2 sm:p-3 cursor-pointer transition-all duration-300 group hover:scale-110 hover:border-neon-purple/70 hover:shadow-2xl hover:shadow-neon-purple/20"
                                onClick={() => setCurrentDiagram(5)}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, 1, -1, 0],
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-pink-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative z-10 text-center max-w-20 sm:max-w-28 md:max-w-36 mx-auto">
                                    <div className="text-lg sm:text-xl md:text-2xl mb-1 text-white/70 group-hover:text-neon-purple transition-all duration-300">
                                        {computerComponents[5].icon}
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-neon-purple transition-colors duration-300 mb-1 hidden sm:block">
                                        {computerComponents[5].title.split('(')[0].trim()}
                                    </h3>
                                    <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300 max-w-[80px] sm:max-w-[120px] hidden sm:block">
                                        {computerComponents[5].description}
                                    </p>

                                    {/* Connection indicators */}
                                    <div className="flex justify-center space-x-1 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 bg-white/30 group-hover:bg-neon-purple/70 rounded-full transition-all duration-300"
                                            />
                                        ))}
                                    </div>

                                    {/* Active indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: currentDiagram === 5 ? 1 : 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-neon-purple rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-dark-bg rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Database - Bottom Center */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.8 }}
                                className="relative bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-lg p-2 sm:p-3 cursor-pointer transition-all duration-300 group hover:scale-110 hover:border-neon-purple/70 hover:shadow-2xl hover:shadow-neon-purple/20"
                                onClick={() => setCurrentDiagram(3)}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, 1, -1, 0],
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-pink-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative z-10 text-center max-w-20 sm:max-w-28 md:max-w-36 mx-auto">
                                    <div className="text-lg sm:text-xl md:text-2xl mb-1 text-white/70 group-hover:text-neon-purple transition-all duration-300">
                                        {computerComponents[3].icon}
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-neon-purple transition-colors duration-300 mb-1 hidden sm:block">
                                        {computerComponents[3].title.split('(')[0].trim()}
                                    </h3>
                                    <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300 max-w-[80px] sm:max-w-[120px] hidden sm:block">
                                        {computerComponents[3].description}
                                    </p>

                                    {/* Connection indicators */}
                                    <div className="flex justify-center space-x-1 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 bg-white/30 group-hover:bg-neon-purple/70 rounded-full transition-all duration-300"
                                            />
                                        ))}
                                    </div>

                                    {/* Active indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: currentDiagram === 3 ? 1 : 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-neon-purple rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-dark-bg rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Network & Firewall - Bottom Right */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 100, y: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.8, delay: 2.0 }}
                                className="relative bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-lg p-2 sm:p-3 cursor-pointer transition-all duration-300 group hover:scale-110 hover:border-orange-400/70 hover:shadow-2xl hover:shadow-orange-400/20"
                                onClick={() => setCurrentDiagram(4)}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, 1, -1, 0],
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                                <div className="relative z-10 text-center max-w-20 sm:max-w-28 md:max-w-36 mx-auto">
                                    <div className="text-lg sm:text-xl md:text-2xl mb-1 text-white/70 group-hover:text-orange-400 transition-all duration-300">
                                        {computerComponents[4].icon}
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors duration-300 mb-1 hidden sm:block">
                                        {computerComponents[4].title.split('(')[0].trim()}
                                    </h3>
                                    <p className="text-white/60 text-xs group-hover:text-white/80 transition-colors duration-300 max-w-[80px] sm:max-w-[120px] hidden sm:block">
                                        {computerComponents[4].description}
                                    </p>

                                    {/* Connection indicators */}
                                    <div className="flex justify-center space-x-1 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 bg-white/30 group-hover:bg-orange-400/70 rounded-full transition-all duration-300"
                                            />
                                        ))}
                                    </div>

                                    {/* Active indicator */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: currentDiagram === 4 ? 1 : 0 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-dark-bg rounded-full" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Legend - Hidden on mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.2 }}
                        className="mt-6 sm:mt-12 text-center hidden sm:block"
                    >
                        <div className="inline-flex items-center space-x-6 bg-dark-secondary/30 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-1 bg-neon-green rounded-full" />
                                <span className="text-white/70 text-sm">Data Flow</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-neon-purple rounded-full" />
                                <span className="text-white/70 text-sm">Active Component</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-white/30 rounded-full" />
                                <span className="text-white/70 text-sm">Connection Points</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Detailed Component View */}
                <motion.div
                    key={currentDiagram}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 sm:mt-16 bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-8"
                >
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 text-neon-green max-w-24 sm:max-w-36 mx-auto">
                            {computerComponents[currentDiagram].icon}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            {computerComponents[currentDiagram].title}
                        </h3>
                        <p className="text-white/70 mb-4 sm:mb-6 max-w-2xl mx-auto">
                            {computerComponents[currentDiagram].description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Mind Functions */}
                        <div className="bg-dark-bg/50 rounded-lg p-4 border border-white/10">
                            <h4 className="text-neon-green font-semibold mb-3 flex items-center">
                                <Brain className="w-4 h-4 mr-2" />
                                Mind Functies
                            </h4>
                            <ul className="space-y-2 text-white/80 text-sm">
                                {computerComponents[currentDiagram].details.map((detail, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <span className="text-neon-green mt-1">•</span>
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Computer Equivalent */}
                        <div className="bg-dark-bg/50 rounded-lg p-4 border border-white/10">
                            <h4 className="text-neon-blue font-semibold mb-3 flex items-center">
                                <Cpu className="w-4 h-4 mr-2" />
                                Computer Equivalent
                            </h4>
                            <div className="space-y-2 text-white/80 text-sm">
                                {computerComponents[currentDiagram].computerEquivalent.map((equivalent, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <span className="text-neon-blue mt-1">⚡</span>
                                        <span>{equivalent}</span>
                                    </div>
                                ))}
                                <div className="mt-3 p-2 bg-dark-secondary/30 rounded border border-white/10">
                                    <p className="text-xs text-white/60">
                                        <strong>Let op:</strong> Dit zijn moderne interpretaties, niet wat de filosofen zelf zeiden.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Research & References */}
                        <div className="bg-dark-bg/50 rounded-lg p-4 border border-white/10">
                            <h4 className="text-neon-purple font-semibold mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Onderzoek & Referenties
                            </h4>
                            <div className="text-white/80 text-sm">
                                <p className="mb-3">{computerComponents[currentDiagram].research}</p>
                                <div className="bg-dark-secondary/30 rounded p-2 border border-white/10">
                                    <p className="text-xs text-white/60">
                                        <strong>Tip:</strong> Deze vergelijkingen helpen om abstracte mentale processen
                                        concreet en begrijpelijk te maken.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>


                {/* Mind Map Schema - Voorlopige Overzicht */}
                <div className="max-w-6xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.4 }}
                        className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                                🧠 Voorlopig Volledig Schema
                            </h3>
                            <p className="text-white/70 mb-6 max-w-3xl mx-auto text-sm sm:text-base">
                                Dit is het voorlopige complete overzicht van hoe de menselijke geest werkt als computer.
                                De gedetailleerde uitleg en verdere uitwerking van elk onderdeel zal in de toekomst worden toegevoegd.
                                Voor nu geeft dit schema een visueel overzicht van alle componenten en hun onderlinge verbindingen.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <img
                                src="/Mind_Map-removebg-preview.png"
                                alt="Mind as Computer Schema - Volledig Overzicht"
                                className="max-w-full h-auto rounded-lg shadow-2xl border border-white/10 bg-white p-4"
                                style={{ maxHeight: '600px' }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Philosophers & Researchers Section */}
                <div id="philosophers" className="max-w-6xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Filosofen & Onderzoekers
                        </h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Ontdek hoe grote denkers door de geschiedenis onze kijk op bewustzijn en de geest hebben gevormd.
                            Elk heeft unieke inzichten die ons helpen begrijpen hoe de mind werkt.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Carl Jung',
                                title: 'Analytische Psychologie',
                                description: 'Grondlegger van de analytische psychologie, bekend om zijn werk over archetypen, het collectief onbewuste en persoonlijkheidstypen.',
                                image: <Users className="w-12 h-12 text-neon-green" />,
                                href: '/philosopher/carl-jung'
                            },
                            {
                                name: 'William James',
                                title: 'Pragmatische Filosofie',
                                description: 'Amerikaanse filosoof en psycholoog die baanbrekend werk deed op het gebied van bewustzijn, religie en pragmatisme.',
                                image: <Users className="w-12 h-12 text-neon-blue" />,
                                href: '/philosopher/william-james'
                            },
                            {
                                name: 'Sigmund Freud',
                                title: 'Psychoanalyse',
                                description: 'Oostenrijkse neuroloog en grondlegger van de psychoanalyse, bekend om zijn theorieën over het onbewuste en droominterpretatie.',
                                image: <Users className="w-12 h-12 text-neon-purple" />,
                                href: '/philosopher/sigmund-freud'
                            },
                            {
                                name: 'Alan Turing',
                                title: 'Computerwetenschap & AI',
                                description: 'Britse wiskundige en computerwetenschapper die de basis legde voor moderne computers en kunstmatige intelligentie.',
                                image: <Users className="w-12 h-12 text-orange-400" />,
                                href: '/philosopher/alan-turing'
                            },
                            {

                                name: 'Itzhak Bentov',
                                title: 'Bewustzijn & Realiteit',
                                description: 'Israëlische uitvinder en bewustzijnsonderzoeker die baanbrekend werk deed op het gebied van bewustzijn en realiteitscreatie.',
                                image: <Users className="w-12 h-12 text-pink-400" />,
                                href: '/philosopher/itzhak-bentov'
                            }
                        ].map((philosopher, index) => (
                            <motion.div
                                key={philosopher.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
                            >
                                <div className="text-center mb-4">
                                    <div className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                        {philosopher.image}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                                        {philosopher.name}
                                    </h3>
                                    <p className="text-neon-green text-sm font-medium mb-3">
                                        {philosopher.title}
                                    </p>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        {philosopher.description}
                                    </p>
                                </div>
                                <Link
                                    to={philosopher.href}
                                    className="inline-flex items-center space-x-2 text-neon-green hover:text-neon-blue transition-colors duration-300 text-sm font-medium w-full justify-center py-2 bg-dark-bg/30 rounded-lg hover:bg-dark-bg/50"
                                >
                                    <span>Lees Meer</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Topics & Research Areas */}
                <div className="max-w-6xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.4 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Onderzoeksgebieden & Topics
                        </h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Verken verschillende aspecten van bewustzijn, technologie en hun onderlinge verbanden.
                            Elk topic heeft zijn eigen gedetailleerde pagina met interactieve content.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: 'Substances & Bewustzijn',
                                description: 'Onderzoek naar hoe verschillende stoffen het bewustzijn beïnvloeden en de bandbreedte van perceptie verbreden.',
                                icon: <Atom className="w-8 h-8" />,
                                href: '/topics/substances'
                            },
                            {
                                name: 'Meditatie & CPU Training',
                                description: 'Technieken en methoden om de mentale processen te trainen en de executive control te versterken.',
                                icon: <Brain className="w-8 h-8" />,
                                href: '/topics/meditation'
                            },
                            {
                                name: 'Bewustzijnsverruiming',
                                description: 'Methoden en technieken om het bewustzijn te verruimen en nieuwe perspectieven te ontdekken.',
                                icon: <Zap className="w-8 h-8" />,
                                href: '/topics/consciousness-expansion'
                            },
                            {
                                name: 'AI & Bewustzijn',
                                description: 'De relatie tussen kunstmatige intelligentie en menselijk bewustzijn, en wat dit ons leert over onszelf.',
                                icon: <Cpu className="w-8 h-8" />,
                                href: '/topics/ai-consciousness'
                            },
                            {
                                name: 'Neurale Netwerken',
                                description: 'Hoe het brein functioneert als een complex netwerk en wat dit betekent voor bewustzijn en leren.',
                                icon: <Network className="w-8 h-8" />,
                                href: '/topics/neural-networks'
                            },
                            {
                                name: 'Quantum Bewustzijn',
                                description: 'Verkenning van de grens tussen bewustzijn en quantum fysica, en hoe deze elkaar beïnvloeden.',
                                icon: <Atom className="w-8 h-8" />,
                                href: '/topics/quantum'
                            },
                        ].map((topic, index) => (
                            <motion.div
                                key={topic.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
                                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 group"
                            >
                                <div className="text-center mb-4">
                                    <div className="mx-auto mb-3 text-neon-green group-hover:scale-110 transition-transform duration-300">
                                        {topic.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-green transition-colors duration-300">
                                        {topic.name}
                                    </h3>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        {topic.description}
                                    </p>
                                </div>
                                <Link
                                    to={topic.href}
                                    className="inline-flex items-center space-x-2 text-neon-green hover:text-neon-blue transition-colors duration-300 text-sm font-medium w-full justify-center py-2 bg-dark-bg/30 rounded-lg hover:bg-dark-bg/50"
                                >
                                    <span>Verken {topic.name}</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
