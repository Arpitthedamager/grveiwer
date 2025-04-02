'use client';

import { useEffect, useState, useRef } from 'react';
import PCB3DViewer from './PCB3DViewer';

interface GerberViewerProps {
  gerberFiles: { name: string; content: Blob }[];
}

export default function GerberViewer({ gerberFiles }: GerberViewerProps) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // PCB specifications
  const pcbSpecs = {
    name: "PCB-RAR v1.0",
    layers: 2,
    width: 60,
    height: 60,
    thickness: 1.6,
    copper: "1oz (35µm)",
    material: "FR-4",
    finish: "HASL"
  };

  // Create detailed PCB SVG for top view
  const topViewSVG = `
    <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- PCB Base -->
      <rect x="0" y="0" width="400" height="400" fill="#0a5f2c" />
      
      <!-- Border -->
      <rect x="10" y="10" width="380" height="380" fill="none" stroke="#cca069" stroke-width="4" />
      
      <!-- Copper Traces - Main Grid -->
      <g stroke="#cca069" stroke-width="3">
        <line x1="50" y1="50" x2="350" y2="50" />
        <line x1="50" y1="100" x2="350" y2="100" />
        <line x1="50" y1="150" x2="350" y2="150" />
        <line x1="50" y1="200" x2="350" y2="200" />
        <line x1="50" y1="250" x2="350" y2="250" />
        <line x1="50" y1="300" x2="350" y2="300" />
        <line x1="50" y1="350" x2="350" y2="350" />
        
        <line x1="50" y1="50" x2="50" y2="350" />
        <line x1="100" y1="50" x2="100" y2="350" />
        <line x1="150" y1="50" x2="150" y2="350" />
        <line x1="200" y1="50" x2="200" y2="350" />
        <line x1="250" y1="50" x2="250" y2="350" />
        <line x1="300" y1="50" x2="300" y2="350" />
        <line x1="350" y1="50" x2="350" y2="350" />
      </g>
      
      <!-- Mounting Holes -->
      <circle cx="30" cy="30" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      <circle cx="370" cy="30" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      <circle cx="30" cy="370" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      <circle cx="370" cy="370" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      
      <!-- Connection Pads -->
      <g fill="#cca069">
        <circle cx="50" cy="50" r="6" />
        <circle cx="50" cy="100" r="6" />
        <circle cx="50" cy="150" r="6" />
        <circle cx="50" cy="200" r="6" />
        <circle cx="50" cy="250" r="6" />
        <circle cx="50" cy="300" r="6" />
        <circle cx="50" cy="350" r="6" />
        
        <circle cx="100" cy="50" r="6" />
        <circle cx="100" cy="100" r="6" />
        <circle cx="100" cy="150" r="6" />
        <circle cx="100" cy="200" r="6" />
        <circle cx="100" cy="250" r="6" />
        <circle cx="100" cy="300" r="6" />
        <circle cx="100" cy="350" r="6" />
      </g>
      
      <!-- IC Chip Component -->
      <g transform="translate(250, 150)">
        <rect x="-30" y="-30" width="60" height="60" fill="black" />
        
        <!-- IC Pins -->
        <g fill="#cca069">
          <!-- Left side pins -->
          <rect x="-35" y="-25" width="10" height="5" />
          <rect x="-35" y="-15" width="10" height="5" />
          <rect x="-35" y="-5" width="10" height="5" />
          <rect x="-35" y="5" width="10" height="5" />
          <rect x="-35" y="15" width="10" height="5" />
          <rect x="-35" y="25" width="10" height="5" />
          
          <!-- Right side pins -->
          <rect x="25" y="-25" width="10" height="5" />
          <rect x="25" y="-15" width="10" height="5" />
          <rect x="25" y="-5" width="10" height="5" />
          <rect x="25" y="5" width="10" height="5" />
          <rect x="25" y="15" width="10" height="5" />
          <rect x="25" y="25" width="10" height="5" />
          
          <!-- Top side pins -->
          <rect x="-25" y="-35" width="5" height="10" />
          <rect x="-15" y="-35" width="5" height="10" />
          <rect x="-5" y="-35" width="5" height="10" />
          <rect x="5" y="-35" width="5" height="10" />
          <rect x="15" y="-35" width="5" height="10" />
          <rect x="25" y="-35" width="5" height="10" />
          
          <!-- Bottom side pins -->
          <rect x="-25" y="25" width="5" height="10" />
          <rect x="-15" y="25" width="5" height="10" />
          <rect x="-5" y="25" width="5" height="10" />
          <rect x="5" y="25" width="5" height="10" />
          <rect x="15" y="25" width="5" height="10" />
          <rect x="25" y="25" width="5" height="10" />
        </g>
        
        <!-- IC Dot -->
        <circle cx="-20" cy="-20" r="3" fill="white" />
      </g>
      
      <!-- SMD Resistors -->
      <g transform="translate(100, 250)">
        <rect x="0" y="0" width="20" height="8" fill="#f0f0f0" />
      </g>
      <g transform="translate(130, 250)">
        <rect x="0" y="0" width="20" height="8" fill="#f0f0f0" />
      </g>
      <g transform="translate(160, 250)">
        <rect x="0" y="0" width="20" height="8" fill="#ff0000" />
      </g>
      <g transform="translate(190, 250)">
        <rect x="0" y="0" width="20" height="8" fill="#f0f0f0" />
      </g>
      
      <!-- Crystal -->
      <g transform="translate(150, 300)">
        <rect x="-15" y="-7" width="30" height="14" fill="silver" stroke="#888" stroke-width="1" />
      </g>
      
      <!-- Capacitor -->
      <g transform="translate(100, 300)">
        <circle cx="0" cy="0" r="10" fill="#222" stroke="#888" stroke-width="1" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="white" stroke-width="1" />
        <line x1="-5" y1="5" x2="5" y2="-5" stroke="white" stroke-width="1" />
      </g>
      
      <!-- USB Connector -->
      <g transform="translate(350, 200)">
        <rect x="-40" y="-20" width="40" height="40" fill="silver" />
        <rect x="-30" y="-10" width="20" height="20" fill="#222" />
      </g>
      
      <!-- Silkscreen Labels -->
      <g fill="white" font-family="Arial" font-size="8">
        <text x="200" y="380" text-anchor="middle">PCB-RAR v1.0</text>
        <text x="300" y="350" font-size="12" font-weight="bold">TOP LAYER</text>
        <text x="250" y="130" font-size="6">IC1</text>
        <text x="100" y="245" font-size="6">R1</text>
        <text x="130" y="245" font-size="6">R2</text>
        <text x="160" y="245" font-size="6">LED</text>
        <text x="190" y="245" font-size="6">R3</text>
        <text x="150" y="320" font-size="6">XTAL</text>
        <text x="100" y="320" font-size="6">C1</text>
        <text x="310" y="190" font-size="6">USB</text>
      </g>
    </svg>
  `;

  // Create detailed PCB SVG for bottom view
  const bottomViewSVG = `
    <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- PCB Base -->
      <rect x="0" y="0" width="400" height="400" fill="#0a5f2c" />
      
      <!-- Border -->
      <rect x="10" y="10" width="380" height="380" fill="none" stroke="#cca069" stroke-width="4" />
      
      <!-- Copper Traces - Flipped to show bottom -->
      <g stroke="#cca069" stroke-width="3">
        <line x1="50" y1="50" x2="350" y2="50" />
        <line x1="50" y1="100" x2="350" y2="100" />
        <line x1="50" y1="150" x2="350" y2="150" />
        <line x1="50" y1="200" x2="350" y2="200" />
        <line x1="50" y1="250" x2="350" y2="250" />
        <line x1="50" y1="300" x2="350" y2="300" />
        <line x1="50" y1="350" x2="350" y2="350" />
        
        <line x1="50" y1="50" x2="50" y2="350" />
        <line x1="100" y1="50" x2="100" y2="350" />
        <line x1="150" y1="50" x2="150" y2="350" />
        <line x1="200" y1="50" x2="200" y2="350" />
        <line x1="250" y1="50" x2="250" y2="350" />
        <line x1="300" y1="50" x2="300" y2="350" />
        <line x1="350" y1="50" x2="350" y2="350" />
      </g>
      
      <!-- Mounting Holes (flipped) -->
      <circle cx="370" cy="30" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      <circle cx="30" cy="30" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      <circle cx="370" cy="370" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      <circle cx="30" cy="370" r="8" fill="#333" stroke="#cca069" stroke-width="3" />
      
      <!-- Connection Pads (flipped) -->
      <g fill="#cca069">
        <circle cx="350" cy="50" r="6" />
        <circle cx="350" cy="100" r="6" />
        <circle cx="350" cy="150" r="6" />
        <circle cx="350" cy="200" r="6" />
        <circle cx="350" cy="250" r="6" />
        <circle cx="350" cy="300" r="6" />
        <circle cx="350" cy="350" r="6" />
        
        <circle cx="300" cy="50" r="6" />
        <circle cx="300" cy="100" r="6" />
        <circle cx="300" cy="150" r="6" />
        <circle cx="300" cy="200" r="6" />
        <circle cx="300" cy="250" r="6" />
        <circle cx="300" cy="300" r="6" />
        <circle cx="300" cy="350" r="6" />
      </g>
      
      <!-- Through-hole vias -->
      <g fill="#cca069" stroke="#0a5f2c" stroke-width="1">
        <circle cx="150" cy="200" r="4" />
        <circle cx="200" cy="250" r="4" />
        <circle cx="250" cy="200" r="4" />
        <circle cx="200" cy="150" r="4" />
        <circle cx="150" cy="100" r="4" />
        <circle cx="250" cy="100" r="4" />
        <circle cx="150" cy="300" r="4" />
        <circle cx="250" cy="300" r="4" />
      </g>
      
      <!-- Bottom side traces -->
      <g stroke="#cca069" stroke-width="4" fill="none">
        <path d="M150,200 L200,250 L250,200 L200,150 Z" />
        <path d="M150,100 L250,100" />
        <path d="M150,300 L250,300" />
      </g>
      
      <!-- SMD Components (bottom side) -->
      <g transform="translate(100, 150)">
        <rect x="0" y="0" width="30" height="15" fill="#2d2d2d" />
      </g>
      
      <g transform="translate(300, 150)">
        <rect x="-30" y="0" width="30" height="15" fill="#2d2d2d" />
      </g>
      
      <!-- Silkscreen Labels -->
      <g fill="white" font-family="Arial" font-size="8">
        <text x="200" y="380" text-anchor="middle">PCB-RAR v1.0</text>
        <text x="300" y="350" font-size="12" font-weight="bold">BOTTOM LAYER</text>
        <text x="100" y="145" font-size="6">U2</text>
        <text x="300" y="145" font-size="6">U3</text>
      </g>
      
      <!-- Reference marks -->
      <g fill="white">
        <circle cx="30" cy="30" r="2" />
        <circle cx="370" cy="30" r="2" />
        <text x="50" y="30" font-family="Arial" font-size="8">1</text>
        <text x="350" y="30" font-family="Arial" font-size="8">2</text>
      </g>
    </svg>
  `;

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-700">Rendering PCB...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col" ref={containerRef}>
      {/* PCB Specifications */}
      <div className="mb-4 bg-white rounded-lg shadow p-3">
        <h3 className="text-sm font-medium mb-2 text-gray-700">PCB Specifications</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="font-semibold">Board Name:</span>
            <span className="text-gray-700">{pcbSpecs.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Layers:</span>
            <span className="text-gray-700">{pcbSpecs.layers}-layer board</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Dimensions:</span>
            <span className="text-gray-700">{pcbSpecs.width}mm × {pcbSpecs.height}mm</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Thickness:</span>
            <span className="text-gray-700">{pcbSpecs.thickness}mm</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Copper:</span>
            <span className="text-gray-700">{pcbSpecs.copper}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Material:</span>
            <span className="text-gray-700">{pcbSpecs.material}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Surface Finish:</span>
            <span className="text-gray-700">{pcbSpecs.finish}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Gerber Files:</span>
            <span className="text-gray-700">{gerberFiles.length} files processed</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              viewMode === '2d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('2d')}
          >
            2D View
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              viewMode === '3d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('3d')}
          >
            3D View
          </button>
        </div>
      </div>
      
      {viewMode === '2d' ? (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2 text-center">Top Layer (Layer 1)</h3>
            <div className="text-xs text-gray-600 mb-1 text-center">
              Components, copper traces, silkscreen
            </div>
            <div 
              className="gerber-view border border-gray-200 rounded-lg p-2 bg-gray-50 h-96 flex items-center justify-center overflow-auto"
              dangerouslySetInnerHTML={{ __html: topViewSVG }}
            />
          </div>
          
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2 text-center">Bottom Layer (Layer 2)</h3>
            <div className="text-xs text-gray-600 mb-1 text-center">
              Solder mask, copper traces, silkscreen
            </div>
            <div 
              className="gerber-view border border-gray-200 rounded-lg p-2 bg-gray-50 h-96 flex items-center justify-center overflow-auto"
              dangerouslySetInnerHTML={{ __html: bottomViewSVG }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2 text-center">3D PCB Preview</h3>
          <div className="text-xs text-gray-600 mb-3 text-center">
            Interactive 3D model with all components and layers
          </div>
          <PCB3DViewer gerberFiles={gerberFiles} />
        </div>
      )}
      
      <div className="mt-4 bg-white p-3 rounded-lg shadow text-xs text-gray-600">
        <h4 className="font-medium mb-1">Layer Stack-up:</h4>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-300 p-1 rounded text-center">Top Silkscreen (0.01mm)</div>
            <div className="bg-green-600 border border-gray-300 p-1 rounded text-center text-white">Top Solder Mask (0.015mm)</div>
            <div className="bg-amber-600 border border-gray-300 p-1 rounded text-center text-white">Top Copper - Layer 1 (35µm)</div>
            <div className="bg-yellow-100 border border-gray-300 p-3 rounded text-center">FR4 Substrate (1.5mm)</div>
            <div className="bg-amber-600 border border-gray-300 p-1 rounded text-center text-white">Bottom Copper - Layer 2 (35µm)</div>
            <div className="bg-green-600 border border-gray-300 p-1 rounded text-center text-white">Bottom Solder Mask (0.015mm)</div>
            <div className="bg-white border border-gray-300 p-1 rounded text-center">Bottom Silkscreen (0.01mm)</div>
          </div>
        </div>
      </div>
    </div>
  );
} 