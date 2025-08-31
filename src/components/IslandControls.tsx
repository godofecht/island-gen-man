'use client';

import { useState, useEffect } from 'react';

interface IslandControlsProps {
    onConfigChange: (config: any) => void;
}

export default function IslandControls({ onConfigChange }: IslandControlsProps) {
    const [config, setConfig] = useState({
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
        seaLevel: 0.0,
        seed: Math.random()
    });

    useEffect(() => {
        onConfigChange(config);
    }, [config, onConfigChange]);

    const handleSliderChange = (key: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            [key]: parseFloat(value)
        }));
    };

    const handleCheckboxChange = (key: string, checked: boolean) => {
        setConfig(prev => ({
            ...prev,
            [key]: checked
        }));
    };

    const handleModeChange = (mode: string) => {
        setConfig(prev => ({
            ...prev,
            renderMode: mode
        }));
    };

    const handleRandomSeed = () => {
        setConfig(prev => ({
            ...prev,
            seed: Math.random()
        }));
    };

    return (
        <div className="w-80 p-5 bg-white shadow-lg h-screen overflow-y-auto">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Display</h3>
                    <div className="flex rounded-full bg-gray-200 p-1">
                        <button
                            className={`flex-1 py-2 px-4 rounded-full ${
                                config.renderMode === 'square' ? 'bg-blue-500 text-white' : 'text-gray-600'
                            }`}
                            onClick={() => handleModeChange('square')}
                        >
                            Grid
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 rounded-full ${
                                config.renderMode === 'voronoi' ? 'bg-blue-500 text-white' : 'text-gray-600'
                            }`}
                            onClick={() => handleModeChange('voronoi')}
                        >
                            Voronoi
                        </button>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <input
                            type="number"
                            value={config.seed}
                            onChange={(e) => setConfig(prev => ({ ...prev, seed: parseFloat(e.target.value) }))}
                            className="flex-1 px-3 py-2 border rounded"
                            placeholder="Enter seed value"
                        />
                        <button
                            onClick={handleRandomSeed}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            🎲
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Width: {config.width}px</label>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="100"
                                value={config.width}
                                onChange={(e) => handleSliderChange('width', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Height: {config.height}px</label>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="100"
                                value={config.height}
                                onChange={(e) => handleSliderChange('height', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Resolution: {config.nbSites}</label>
                            <input
                                type="range"
                                min="1000"
                                max="50000"
                                step="1000"
                                value={config.nbSites}
                                onChange={(e) => handleSliderChange('nbSites', e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Generation</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Noise Scale: {config.noiseScale.toFixed(3)}</label>
                            <input
                                type="range"
                                min="0.001"
                                max="0.1"
                                step="0.001"
                                value={config.noiseScale}
                                onChange={(e) => handleSliderChange('noiseScale', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Site Randomization: {config.sitesRandomisation}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={config.sitesRandomisation}
                                onChange={(e) => handleSliderChange('sitesRandomisation', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Graph Relaxation: {config.nbGraphRelaxation}</label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={config.nbGraphRelaxation}
                                onChange={(e) => handleSliderChange('nbGraphRelaxation', e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Terrain</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Sea Level: {config.seaLevel.toFixed(2)}</label>
                            <input
                                type="range"
                                min="-0.5"
                                max="0.5"
                                step="0.01"
                                value={config.seaLevel}
                                onChange={(e) => handleSliderChange('seaLevel', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Cliffs Threshold: {config.cliffsThreshold.toFixed(2)}</label>
                            <input
                                type="range"
                                min="0"
                                max="0.5"
                                step="0.01"
                                value={config.cliffsThreshold}
                                onChange={(e) => handleSliderChange('cliffsThreshold', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Lakes Threshold: {config.lakesThreshold.toFixed(3)}</label>
                            <input
                                type="range"
                                min="0"
                                max="0.02"
                                step="0.001"
                                value={config.lakesThreshold}
                                onChange={(e) => handleSliderChange('lakesThreshold', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">River Density: {config.riverDensity}</label>
                            <input
                                type="range"
                                min="1"
                                max="1000"
                                step="1"
                                value={config.riverDensity}
                                onChange={(e) => handleSliderChange('riverDensity', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Max River Size: {config.maxRiversSize}</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={config.maxRiversSize}
                                onChange={(e) => handleSliderChange('maxRiversSize', e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Visual</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600">Shading: {config.shading.toFixed(2)}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={config.shading}
                                onChange={(e) => handleSliderChange('shading', e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={config.shadeOcean}
                                    onChange={(e) => handleCheckboxChange('shadeOcean', e.target.checked)}
                                    className="form-checkbox"
                                />
                                <span className="text-sm text-gray-600">Shade Ocean</span>
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        // Export functionality will be implemented later
                        console.log('Export clicked');
                    }}
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Export Tilemap
                </button>
            </div>
        </div>
    );
} 