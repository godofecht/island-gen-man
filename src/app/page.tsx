'use client';

import { useState } from 'react';
import IslandGenerator from '@/components/IslandGenerator';
import IslandControls from '@/components/IslandControls';

export default function Home() {
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

  return (
    <main className="flex min-h-screen bg-gray-100">
      <div className="flex-1 relative">
        <IslandGenerator config={config} />
      </div>
      <div className="w-80">
        <IslandControls onConfigChange={setConfig} />
      </div>
    </main>
  );
}
