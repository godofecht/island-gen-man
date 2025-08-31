'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Delaunay } from 'd3-delaunay';
import { createNoise2D } from 'simplex-noise';

interface IslandConfig {
    width: number;
    height: number;
    noiseScale: number;
    allowDebug: boolean;
    nbSites: number;
    sitesDistribution: string;
    sitesRandomisation: number;
    nbGraphRelaxation: number;
    cliffsThreshold: number;
    lakesThreshold: number;
    riverDensity: number;
    maxRiversSize: number;
    shading: number;
    shadeOcean: boolean;
    renderMode: string;
    seaLevel: number;
    seed: number;
}

interface IslandGeneratorProps {
    config: IslandConfig;
}

const DISPLAY_COLORS = {
    OCEAN: 0x82caff,
    BEACH: 0xffe98d,
    LAKE: 0x2f9ceb,
    RIVER: 0x369eea,
    SOURCE: 0x0000ff,
    MARSH: 0x2ac6d3,
    ICE: 0xb3deff,
    ROCK: 0x535353,
    LAVA: 0xe22222,
    SNOW: 0xf8f8f8,
    TUNDRA: 0xddddbb,
    BARE: 0xbbbbbb,
    SCORCHED: 0x999999,
    TAIGA: 0xccd4bb,
    SHRUBLAND: 0xc4ccbb,
    TEMPERATE_DESERT: 0xe4e8ca,
    TEMPERATE_RAIN_FOREST: 0xa4c4a8,
    TEMPERATE_DECIDUOUS_FOREST: 0xb4c9a9,
    GRASSLAND: 0xc4d4aa,
    TROPICAL_RAIN_FOREST: 0x9cbba9,
    TROPICAL_SEASONAL_FOREST: 0xa9cca4,
    SUBTROPICAL_DESERT: 0xe9ddc7
};

const Island = {
    config: {
        width: 500,
        height: 500,
        noiseScale: 0.02,
        allowDebug: false,
        nbSites: 10000,
        sitesDistribution: 'hexagon',
        sitesRandomisation: 80,
        nbGraphRelaxation: 0,
        cliffsThreshold: 0.15,
        lakesThreshold: 0.005,
        riverDensity: 50,
        maxRiversSize: 4,
        shading: 0.35,
        shadeOcean: true,
        renderMode: 'square',
        seaLevel: 0.0
    },
    debug: false,
    delaunay: null as Delaunay<Float64Array> | null,
    voronoi: null as any,
    sites: [] as [number, number][],
    seed: -1,
    cells: [] as any[],
    cellsContainer: null as PIXI.Container | null,
    riversContainer: null as PIXI.Container | null,
    debugContainer: null as PIXI.Container | null,
    isGenerating: false,
    renderQueue: [] as (() => void)[],
    currentRenderTask: null as (() => void) | null,

    init: function (userConfig: Partial<IslandConfig>, app: PIXI.Application) {
        console.log('Initializing Island with config:', userConfig);
        console.log('PIXI Application:', app);

        if (!app || !app.renderer) {
            console.error('PIXI Application not properly initialized');
            return;
        }

        // Store original dimensions
        const originalWidth = userConfig.width || app.screen.width;
        const originalHeight = userConfig.height || app.screen.height;
        
        console.log('Dimensions:', { width: originalWidth, height: originalHeight });

        userConfig = userConfig || {};
        this.config.width = originalWidth;
        this.config.height = originalHeight;
        this.config.noiseScale = userConfig.noiseScale || 0.02;
        this.config.allowDebug = userConfig.allowDebug !== undefined ? userConfig.allowDebug : false;
        
        // Calculate number of sites based on the smaller dimension to ensure proper fit
        const minDimension = Math.min(originalWidth, originalHeight);
        this.config.nbSites = userConfig.nbSites || Math.floor((minDimension * minDimension) / 25);
        
        this.config.sitesDistribution = userConfig.sitesDistribution || 'hexagon';
        this.config.sitesRandomisation = userConfig.sitesRandomisation !== undefined ? userConfig.sitesRandomisation : 80;
        this.config.nbGraphRelaxation = userConfig.nbGraphRelaxation !== undefined ? userConfig.nbGraphRelaxation : 0;
        this.config.cliffsThreshold = userConfig.cliffsThreshold !== undefined ? userConfig.cliffsThreshold : 0.15;
        this.config.lakesThreshold = userConfig.lakesThreshold !== undefined ? userConfig.lakesThreshold : 0.005;
        this.config.riverDensity = userConfig.riverDensity || 50;
        this.config.maxRiversSize = userConfig.maxRiversSize !== undefined ? userConfig.maxRiversSize : 4;
        this.config.shading = userConfig.shading !== undefined ? userConfig.shading : 0.35;
        this.config.shadeOcean = userConfig.shadeOcean !== undefined ? userConfig.shadeOcean : true;
        this.config.renderMode = userConfig.renderMode || 'square';
        this.config.seaLevel = userConfig.seaLevel !== undefined ? userConfig.seaLevel : 0.0;

        // Initialize noise with the new seed
        const seed = userConfig.seed || Math.random();
        const noise2D = createNoise2D(() => seed);
        this.seed = seed;

        // Create containers
        this.cellsContainer = new PIXI.Container();
        this.riversContainer = new PIXI.Container();
        this.debugContainer = new PIXI.Container();
        this.debugContainer.visible = false;

        // Clear existing children
        app.stage.removeChildren();
        
        // Add containers in correct order
        app.stage.addChild(this.cellsContainer);
        app.stage.addChild(this.riversContainer);
        app.stage.addChild(this.debugContainer);

        // Update canvas size with original dimensions
        updateCanvasSize(originalWidth, originalHeight, app);

        this.generateIsland();
    },

    generateIsland: function() {
        console.log('Generating island...');
        if (!this.cellsContainer) {
            console.error('Cells container is not initialized');
            return;
        }

        // Clear previous content
        this.cellsContainer.removeChildren();

        // Create a test pattern
        const graphics = new PIXI.Graphics();
        
        // Draw ocean background
        graphics.beginFill(DISPLAY_COLORS.OCEAN);
        graphics.drawRect(0, 0, this.config.width, this.config.height);
        graphics.endFill();

        // Draw a simple island shape
        graphics.beginFill(DISPLAY_COLORS.GRASSLAND);
        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;
        const radius = Math.min(this.config.width, this.config.height) * 0.4;
        
        // Draw a circle for the island
        graphics.drawCircle(centerX, centerY, radius);
        
        // Add some mountains
        graphics.beginFill(DISPLAY_COLORS.ROCK);
        const mountainHeight = radius * 0.3;
        const mountainWidth = radius * 0.4;
        graphics.drawPolygon([
            centerX - mountainWidth/2, centerY,
            centerX, centerY - mountainHeight,
            centerX + mountainWidth/2, centerY
        ]);
        
        // Add a beach
        graphics.beginFill(DISPLAY_COLORS.BEACH);
        const beachWidth = radius * 0.1;
        graphics.drawCircle(centerX, centerY, radius + beachWidth);
        
        // Add the graphics to the container
        this.cellsContainer.addChild(graphics);

        // Add some debug text
        const text = new PIXI.Text('Island Generator Test', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        text.x = 20;
        text.y = 20;
        this.cellsContainer.addChild(text);

        console.log('Island generation complete');
    }
};

function updateCanvasSize(width: number, height: number, app: PIXI.Application) {
    console.log('Updating canvas size:', { width, height });
    if (!app || !app.renderer) {
        console.error('Cannot update canvas size: app or renderer is not initialized');
        return;
    }

    // Get the container dimensions
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return;
    }
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    console.log('Container dimensions:', { width: containerWidth, height: containerHeight });

    // Calculate scale to fit within container while maintaining aspect ratio
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scale = Math.min(scaleX, scaleY);

    // Update PIXI renderer size to match container
    app.renderer.resize(containerWidth, containerHeight);
    
    // Center the stage
    app.stage.x = (containerWidth - width * scale) / 2;
    app.stage.y = (containerHeight - height * scale) / 2;
    
    // Scale the stage to fit
    app.stage.scale.set(scale);

    console.log('Canvas size updated');
}

export default function IslandGenerator({ config }: IslandGeneratorProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        console.log('IslandGenerator effect running');
        let handleResize: (() => void) | undefined;

        function initPixi() {
            console.log('Initializing PIXI');
            if (canvasRef.current && !appRef.current) {
                try {
                    // Check WebGL support
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
                    if (!gl) {
                        throw new Error('WebGL not supported');
                    }
                    console.log('WebGL context created successfully');

                    // Create PIXI application with autoDetectRenderer
                    const app = new PIXI.Application({
                        width: config.width,
                        height: config.height,
                        backgroundColor: 0xFFFFFF,
                        antialias: true,
                        powerPreference: 'high-performance',
                        resolution: window.devicePixelRatio || 1,
                        autoDensity: true,
                        hello: true // Enable PIXI debug messages
                    });

                    // Clear any existing children
                    while (canvasRef.current.firstChild) {
                        canvasRef.current.removeChild(canvasRef.current.firstChild);
                    }

                    // Append the PIXI canvas to our container
                    canvasRef.current.appendChild(app.view as HTMLCanvasElement);

                    console.log('PIXI Application created:', {
                        renderer: app.renderer,
                        view: app.view,
                        stage: app.stage
                    });

                    // Store the app reference
                    appRef.current = app;
                    
                    // Initialize with provided config
                    Island.init(config, app);

                    // Add window resize handler
                    handleResize = () => {
                        if (appRef.current) {
                            updateCanvasSize(config.width, config.height, appRef.current);
                        }
                    };
                    window.addEventListener('resize', handleResize);

                    // Initial resize
                    handleResize();
                } catch (error) {
                    console.error('Failed to initialize PIXI application:', error);
                    if (error instanceof Error) {
                        console.error('Error details:', {
                            message: error.message,
                            stack: error.stack
                        });
                    }
                }
            } else {
                console.log('Canvas ref or app already exists:', {
                    hasCanvasRef: !!canvasRef.current,
                    hasApp: !!appRef.current
                });
            }
        }

        initPixi();

        return () => {
            console.log('Cleaning up IslandGenerator');
            if (handleResize) {
                window.removeEventListener('resize', handleResize);
            }
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
            if (canvasRef.current) {
                while (canvasRef.current.firstChild) {
                    canvasRef.current.removeChild(canvasRef.current.firstChild);
                }
            }
        };
    }, [config]);

    return (
        <div className="relative w-full h-screen bg-gray-100">
            <div 
                id="canvas-container" 
                ref={canvasRef} 
                className="w-full h-full min-h-[500px] border border-gray-300"
                style={{ minHeight: '500px' }}
            />
        </div>
    );
} 