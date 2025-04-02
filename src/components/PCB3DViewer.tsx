'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface PCB3DViewerProps {
  gerberFiles: { name: string; content: Blob }[];
  width?: number;
  height?: number;
}

function PCBModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // PCB dimensions in mm
  const pcbWidth = 60;
  const pcbHeight = 60;
  const pcbThickness = 1.6;
  
  // Create PCB textures with high detail using the existing createPCBTexture function
  const textureFront = useRef<THREE.CanvasTexture | null>(null);
  const textureBack = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // Initialize textures once the component mounts
    if (textureFront.current === null) {
      textureFront.current = new THREE.CanvasTexture(createPCBTexture('#0a5f2c', true));
      textureFront.current.anisotropy = 16;
    }
    
    if (textureBack.current === null) {
      textureBack.current = new THREE.CanvasTexture(createPCBTexture('#0a5f2c', false));
      textureBack.current.anisotropy = 16;
    }
  }, []);
  
  return (
    <group>
      {/* Main PCB board with refined materials */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[pcbWidth, pcbHeight, pcbThickness]} />
        <meshPhysicalMaterial 
          color="#0a5f2c"
          roughness={0.3}
          metalness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          map={textureFront.current}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* PCB back side with separate material for realistic look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[pcbWidth, pcbHeight, pcbThickness]} />
        <meshPhysicalMaterial 
          color="#0a5f2c"
          roughness={0.3}
          metalness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          map={textureBack.current}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* PCB edge with different material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.8, 0]}>
        <boxGeometry args={[pcbWidth, pcbHeight, pcbThickness]} />
        <meshPhysicalMaterial 
          color="#066329"
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Black QFP IC component with better materials */}
      <mesh position={[15, 2.2, 10]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[12, 12, 1.5]} />
        <meshPhysicalMaterial color="#111" roughness={0.7} />
        
        {/* IC markings */}
        <mesh position={[0, 0.76, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="white" transparent opacity={0.8}>
            <canvasTexture attach="map" image={createICTexture()} />
          </meshBasicMaterial>
        </mesh>
        
        {/* IC pins - with more detailed geometry */}
        {[...Array(8)].map((_, i) => {
          const spacing = 12 / 9;
          const offset = -12/2 + spacing * (i + 1);
          
          return (
            <group key={`pins-${i}`}>
              {/* Bottom row */}
              <mesh position={[offset, -12/2 - 0.6, -1.5/2 + 0.1]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.5, 1.2, 0.2]} />
                <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
              </mesh>
              
              {/* Top row */}
              <mesh position={[offset, 12/2 + 0.6, -1.5/2 + 0.1]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.5, 1.2, 0.2]} />
                <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
              </mesh>
              
              {/* Left column */}
              <mesh position={[-12/2 - 0.6, offset, -1.5/2 + 0.1]} rotation={[0, 0, Math.PI/2]}>
                <boxGeometry args={[0.5, 1.2, 0.2]} />
                <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
              </mesh>
              
              {/* Right column */}
              <mesh position={[12/2 + 0.6, offset, -1.5/2 + 0.1]} rotation={[0, 0, Math.PI/2]}>
                <boxGeometry args={[0.5, 1.2, 0.2]} />
                <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          );
        })}
      </mesh>
      
      {/* Black SOT-23 with more detail */}
      <mesh position={[-15, 1.7, 15]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[3, 3, 1]} />
        <meshPhysicalMaterial color="#0d0d0d" roughness={0.7} />
        
        {/* SOT-23 pins */}
        <mesh position={[-1, -1.5, -0.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.2]} />
          <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[1, -1.5, -0.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.2]} />
          <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.5, -0.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.2]} />
          <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
        </mesh>
      </mesh>
      
      {/* Silver crystal with better reflections */}
      <mesh position={[-15, 2.0, -5]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[7, 3, 1.5]} />
        <meshPhysicalMaterial 
          color="silver" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
        
        {/* Crystal markings */}
        <mesh position={[0, 0.76, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[6, 2.5]} />
          <meshBasicMaterial color="black" transparent opacity={0.7}>
            <canvasTexture attach="map" image={createCrystalTexture()} />
          </meshBasicMaterial>
        </mesh>
      </mesh>
      
      {/* Small capacitor */}
      <mesh position={[-15, 2.0, -15]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} castShadow>
        <cylinderGeometry args={[2, 2, 3, 32]} />
        <meshPhysicalMaterial color="#444" metalness={0.3} roughness={0.5} />
        
        {/* Capacitor markings */}
        <mesh position={[0, 0, 2.01]} rotation={[Math.PI/2, 0, 0]}>
          <circleGeometry args={[1.8, 32]} />
          <meshBasicMaterial color="#222" />
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[1.4, 32]} />
            <meshBasicMaterial color="#444" />
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[2, 0.4]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </mesh>
        </mesh>
      </mesh>
      
      {/* Big electrolytic capacitor with detailed top and polarity */}
      <mesh position={[0, 3.5, -15]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[4, 4, 5, 32]} />
        <meshPhysicalMaterial color="#222" metalness={0.3} roughness={0.7} />
        
        {/* Cap top */}
        <mesh position={[0, 2.51, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[4, 4, 0.1, 32]} />
          <meshPhysicalMaterial color="#444" metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Polarity marking */}
        <mesh position={[-2, 2.52, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.1, 3]} />
          <meshBasicMaterial color="white" />
        </mesh>
        
        {/* Capacitor value label */}
        <mesh position={[0, 0, 4.01]} rotation={[Math.PI/2, 0, 0]}>
          <planeGeometry args={[6, 3]} />
          <meshBasicMaterial color="white" transparent opacity={0.8}>
            <canvasTexture attach="map" image={createCapacitorLabel()} />
          </meshBasicMaterial>
        </mesh>
      </mesh>
      
      {/* USB connector with improved detail */}
      <mesh position={[20, 2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[15, 8, 3]} />
        <meshPhysicalMaterial 
          color="silver" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
        
        {/* USB opening */}
        <mesh position={[7.51, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 5, 1.5]} />
          <meshPhysicalMaterial color="black" metalness={0.1} roughness={0.8} />
        </mesh>
        
        {/* USB label */}
        <mesh position={[0, 4.01, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[10, 6]} />
          <meshBasicMaterial color="#888" transparent opacity={0.5}>
            <canvasTexture attach="map" image={createUSBLabel()} />
          </meshBasicMaterial>
        </mesh>
      </mesh>
      
      {/* White silkscreen label with detailed text */}
      <mesh position={[0, 1.7, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 5]} />
        <meshBasicMaterial color="white" transparent opacity={0.9}>
          <canvasTexture attach="map" image={createSilkscreenLabel()} />
        </meshBasicMaterial>
      </mesh>
      
      {/* Mounting holes with metal ring */}
      <CircleHole position={[25, 0, 25]} />
      <CircleHole position={[-25, 0, 25]} />
      <CircleHole position={[25, 0, -25]} />
      <CircleHole position={[-25, 0, -25]} />
      
      {/* SMD resistors and LEDs with improved material */}
      {[...Array(5)].map((_, i) => (
        <SMDComponent 
          key={i} 
          position={[15 - i * 6, 1.7, -20]} 
          color={i === 2 ? "#ff0000" : "#f0f0f0"} 
          isLED={i === 2}
          label={i === 2 ? "LED" : `${i * 100 + 100}Ω`}
        />
      ))}
      
      {/* LED effect for the LED component with bloom effect */}
      <mesh position={[3, 1.8, -20]}>
        <pointLight color="#ff0000" intensity={0.5} distance={8} decay={2} />
        <spotLight 
          position={[0, 0.5, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5} 
          color="#ff0000" 
          distance={5}
          castShadow={false}
        />
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* SOIC-8 component with improved pins */}
      <mesh position={[-12, 1.8, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[5, 4, 1.2]} />
        <meshPhysicalMaterial color="black" roughness={0.8} />
        
        {/* SOIC pins - left side */}
        {[...Array(4)].map((_, i) => (
          <mesh 
            key={`soic-left-${i}`} 
            position={[-2.5, -1.5 + i, -0.6]} 
            rotation={[0, 0, 0]}
          >
            <boxGeometry args={[1, 0.4, 0.2]} />
            <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        
        {/* SOIC pins - right side */}
        {[...Array(4)].map((_, i) => (
          <mesh 
            key={`soic-right-${i}`} 
            position={[2.5, -1.5 + i, -0.6]} 
            rotation={[0, 0, 0]}
          >
            <boxGeometry args={[1, 0.4, 0.2]} />
            <meshPhysicalMaterial color="silver" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        
        {/* SOIC label */}
        <mesh position={[0, 0, 0.61]} rotation={[0, 0, 0]}>
          <planeGeometry args={[4, 3]} />
          <meshBasicMaterial color="white" transparent opacity={0.7}>
            <canvasTexture attach="map" image={createSOICLabel()} />
          </meshBasicMaterial>
        </mesh>
      </mesh>
    </group>
  );
}

// Enhanced SMD Component with label
function SMDComponent({ 
  position, 
  color, 
  isLED = false,
  label = ""
}: { 
  position: [number, number, number], 
  color: string, 
  isLED?: boolean,
  label?: string
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.5} 
          emissive={isLED ? color : undefined}
          emissiveIntensity={isLED ? 0.5 : 0}
        />
      </mesh>
      
      {/* Label on top */}
      {label && (
        <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 0.8]} />
          <meshBasicMaterial color="black" transparent opacity={0.7}>
            <canvasTexture attach="map" image={createComponentLabel(label)} />
          </meshBasicMaterial>
        </mesh>
      )}
    </group>
  );
}

// Enhanced mounting hole with copper ring
function CircleHole({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 2, 32]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
      
      {/* Metal ring around hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.01, 0]}>
        <ringGeometry args={[2, 3.5, 32]} />
        <meshPhysicalMaterial 
          color="#cca069" 
          metalness={0.9} 
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Create a texture for component labels
function createComponentLabel(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width/2, canvas.height/2);
  }
  
  return canvas;
}

// Create a texture for crystal
function createCrystalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('16.000 MHz', canvas.width/2, canvas.height/2);
  }
  
  return canvas;
}

// Create a texture for capacitor label
function createCapacitorLabel() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'black';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('470μF 16V', canvas.width/2, canvas.height/2);
  }
  
  return canvas;
}

// Create a texture for USB label
function createUSBLabel() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('USB', canvas.width/2, canvas.height/2);
  }
  
  return canvas;
}

// Create a texture for SOIC label
function createSOICLabel() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LM358', canvas.width/2, canvas.height/2 - 15);
    ctx.font = '18px Arial';
    ctx.fillText('OP-AMP', canvas.width/2, canvas.height/2 + 20);
  }
  
  return canvas;
}

// Create a texture for silkscreen label
function createSilkscreenLabel() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PCB-RAR v1.0 © 2024', canvas.width/2, canvas.height/2);
  }
  
  return canvas;
}

// Create a PCB texture with copper traces pattern
function createPCBTexture(baseColor: string, isFront: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Base PCB color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw detailed PCB elements
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw reference grid
    ctx.strokeStyle = '#cca069';
    ctx.lineWidth = 3;
    const gridSize = 80;
    
    // Main grid
    for (let y = gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    for (let x = gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw PCB traces - common for both sides
    ctx.strokeStyle = '#cca069'; // Copper color
    ctx.lineWidth = 10;
    
    // Horizontal complex traces
    ctx.beginPath();
    ctx.moveTo(centerX - 300, centerY - 300);
    ctx.lineTo(centerX + 300, centerY - 300);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - 300, centerY + 300);
    ctx.lineTo(centerX + 300, centerY + 300);
    ctx.stroke();
    
    // Vertical traces
    ctx.beginPath();
    ctx.moveTo(centerX - 300, centerY - 300);
    ctx.lineTo(centerX - 300, centerY + 300);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + 300, centerY - 300);
    ctx.lineTo(centerX + 300, centerY + 300);
    ctx.stroke();
    
    // Add some pads
    for (let x = centerX - 250; x <= centerX + 250; x += 100) {
      for (let y = centerY - 250; y <= centerY + 250; y += 100) {
        ctx.fillStyle = '#cca069';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Side-specific elements
    if (isFront) {
      // Front side - add complex QFP footprint
      const qfpX = centerX + 380;
      const qfpY = centerY - 150;
      const qfpSize = 180;
      
      // QFP center pad
      ctx.fillStyle = '#cca069';
      ctx.beginPath();
      ctx.rect(qfpX - 50, qfpY - 50, 100, 100);
      ctx.fill();
      
      // QFP pins
      const pinWidth = 12;
      const pinLength = 25;
      const pinSpacing = 20;
      const pinsPerSide = 8;
      
      // Draw pins on all four sides of the QFP
      for (let i = 0; i < pinsPerSide; i++) {
        const offset = (i - pinsPerSide / 2 + 0.5) * pinSpacing;
        
        // Bottom row
        ctx.fillRect(qfpX + offset - pinWidth/2, qfpY + qfpSize/2, pinWidth, pinLength);
        
        // Top row
        ctx.fillRect(qfpX + offset - pinWidth/2, qfpY - qfpSize/2 - pinLength, pinWidth, pinLength);
        
        // Left column
        ctx.fillRect(qfpX - qfpSize/2 - pinLength, qfpY + offset - pinWidth/2, pinLength, pinWidth);
        
        // Right column
        ctx.fillRect(qfpX + qfpSize/2, qfpY + offset - pinWidth/2, pinLength, pinWidth);
      }
      
      // Add resistor footprints
      drawSMDPads(ctx, centerX - 200, centerY + 200, 20, 60);
      drawSMDPads(ctx, centerX - 150, centerY + 200, 20, 60);
      drawSMDPads(ctx, centerX - 100, centerY + 200, 20, 60);
      
      // Add capacitor footprints
      drawSMDPads(ctx, centerX + 100, centerY + 200, 25, 50);
      drawSMDPads(ctx, centerX + 150, centerY + 200, 25, 50);
      
      // Add microcontroller traces
      ctx.lineWidth = 5;
      for (let i = 0; i < 10; i++) {
        const startX = qfpX - qfpSize/2 - pinLength;
        const startY = qfpY - qfpSize/2 + i * pinSpacing;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - 100, startY);
        if (i % 2 === 0) {
          ctx.lineTo(startX - 150, startY + 30);
        } else {
          ctx.lineTo(startX - 150, startY - 30);
        }
        ctx.stroke();
      }
      
      // Add component labels with white silkscreen
      ctx.fillStyle = '#ffffff';
      ctx.font = '32px Arial';
      ctx.fillText('IC1', qfpX, qfpY - qfpSize/2 - 50);
      ctx.fillText('R1', centerX - 200, centerY + 170);
      ctx.fillText('R2', centerX - 150, centerY + 170);
      ctx.fillText('R3', centerX - 100, centerY + 170);
      ctx.fillText('C1', centerX + 100, centerY + 170);
      ctx.fillText('C2', centerX + 150, centerY + 170);
      
      // Add PCB identification text
      ctx.font = 'bold 40px Arial';
      ctx.fillText('PCB-RAR-V1.0', centerX, centerY + 350);
      ctx.font = '30px Arial';
      ctx.fillText('TOP LAYER', centerX, centerY + 400);
      
      // Add polarization marks and reference designators
      ctx.beginPath();
      ctx.arc(centerX - 400, centerY - 400, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw board outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200);
      
    } else {
      // Bottom side - different pattern
      // Add ground planes
      ctx.fillStyle = '#cca069';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(centerX - 350, centerY - 350, 700, 700);
      ctx.globalAlpha = 1.0;
      
      // Add vias connecting layers
      for (let x = centerX - 250; x <= centerX + 250; x += 100) {
        for (let y = centerY - 250; y <= centerY + 250; y += 100) {
          if ((x + y) % 200 === 0) { // Only some positions
            ctx.fillStyle = '#cca069';
            ctx.lineWidth = 1;
            ctx.strokeStyle = baseColor;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
      
      // Add some bottom layer SMD pads
      drawSMDPads(ctx, centerX - 200, centerY - 200, 30, 60);
      drawSMDPads(ctx, centerX + 200, centerY - 200, 30, 60);
      
      // Add traces connecting components
      ctx.strokeStyle = '#cca069';
      ctx.lineWidth = 10;
      
      ctx.beginPath();
      ctx.moveTo(centerX - 200, centerY - 170);
      ctx.lineTo(centerX - 200, centerY);
      ctx.lineTo(centerX + 200, centerY);
      ctx.lineTo(centerX + 200, centerY - 170);
      ctx.stroke();
      
      // Add text for bottom layer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.fillText('PCB-RAR-V1.0', centerX, centerY + 350);
      ctx.font = '30px Arial';
      ctx.fillText('BOTTOM LAYER', centerX, centerY + 400);
      
      // Add version information
      ctx.font = '25px Arial';
      ctx.fillText('REV 2024-04', centerX, centerY - 350);
      
      // Add reference marks
      ctx.beginPath();
      ctx.arc(centerX - 400, centerY - 400, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Add text
      ctx.fillText('GND', centerX - 100, centerY - 50);
      ctx.fillText('3V3', centerX + 100, centerY - 50);
    }
  }
  
  return canvas;
}

// Helper function to draw SMD component pads
function drawSMDPads(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, length: number) {
  ctx.fillStyle = '#cca069';
  
  // Draw two pads with a gap in between
  ctx.fillRect(x - length/2, y - width/2, length * 0.4, width);
  ctx.fillRect(x + length/2 - length * 0.4, y - width/2, length * 0.4, width);
}

// Create a texture for the IC markings
function createICTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // IC markings
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STM32F103', canvas.width/2, canvas.height/2 - 20);
    
    ctx.font = '16px Arial';
    ctx.fillText('ARM Cortex-M3', canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('32-bit MCU', canvas.width/2, canvas.height/2 + 30);
    
    // Dot marking for pin 1
    ctx.beginPath();
    ctx.arc(canvas.width/4, canvas.height/4, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas;
}

export default function PCB3DViewer({ gerberFiles }: PCB3DViewerProps) {
  const [pcbInfo, setPcbInfo] = useState({
    layers: 2,
    width: 60,
    height: 60,
    thickness: 1.6,
    copperThickness: 0.035,
    surfaceFinish: "HASL"
  });
  
  // Add camera control states for animation transitions
  const [cameraView, setCameraView] = useState<'top' | 'bottom' | 'angle'>('angle');
  const [rotating, setRotating] = useState(true);
  
  return (
    <div className="flex flex-col">
      <div className="mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="font-semibold">Layers:</span>
              <span className="text-gray-700">{pcbInfo.layers} Layer PCB</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Dimensions:</span>
              <span className="text-gray-700">{pcbInfo.width}mm × {pcbInfo.height}mm</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Thickness:</span>
              <span className="text-gray-700">{pcbInfo.thickness}mm</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Copper:</span>
              <span className="text-gray-700">{pcbInfo.copperThickness}mm</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Surface:</span>
              <span className="text-gray-700">{pcbInfo.surfaceFinish}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Files:</span>
              <span className="text-gray-700">{gerberFiles.length} Gerber files</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera control buttons */}
      <div className="mb-3 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-l-lg ${
              cameraView === 'top' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setCameraView('top')}
          >
            Top View
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium ${
              cameraView === 'angle' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setCameraView('angle')}
          >
            Angle View
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-r-lg ${
              cameraView === 'bottom' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setCameraView('bottom')}
          >
            Bottom View
          </button>
          <button
            type="button"
            className={`ml-2 px-3 py-1.5 text-xs font-medium rounded-lg ${
              rotating 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setRotating(!rotating)}
          >
            {rotating ? 'Stop Rotation' : 'Start Rotation'}
          </button>
        </div>
      </div>
      
      <div className="relative h-[500px] w-full bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        <Canvas shadows dpr={[1, 2]}>
          <color attach="background" args={['#111']} />
          <fog attach="fog" args={['#111', 30, 120]} />
          
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[10, 20, 15]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={100}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#fff" />
          <pointLight position={[0, 5, 0]} intensity={0.3} color="#fff" />
          <spotLight 
            position={[-10, 30, 20]} 
            angle={0.3} 
            penumbra={1} 
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          
          <PCBModel />
          
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.8} 
            scale={100} 
            blur={2} 
            far={10} 
            color="#000000" 
          />
          
          {cameraView === 'top' && (
            <PerspectiveCamera 
              makeDefault 
              position={[0, 60, 0]} 
              fov={25}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          )}
          
          {cameraView === 'bottom' && (
            <PerspectiveCamera 
              makeDefault 
              position={[0, -60, 0]} 
              fov={25}
              rotation={[Math.PI / 2, 0, 0]}
            />
          )}
          
          {cameraView === 'angle' && (
            <PerspectiveCamera 
              makeDefault 
              position={[35, 40, 40]} 
              fov={25}
            />
          )}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={rotating}
            autoRotateSpeed={0.5}
            maxDistance={100}
            minDistance={20}
          />
          
          <Environment preset="city" />
          
          {/* Add a grid to help with scale perception */}
          <gridHelper 
            args={[120, 24, '#555', '#333']} 
            position={[0, -2, 0]} 
            rotation={[0, Math.PI / 4, 0]}
          />
        </Canvas>
        
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-md">
          <p className="font-medium">PCB 3D Model - {pcbInfo.layers} Layer Board</p>
          <p className="opacity-70 text-xs mt-1">👆 Use mouse to interact: Drag to rotate, scroll to zoom</p>
        </div>
        
        <div className="absolute top-3 right-3">
          <div className="bg-black bg-opacity-70 text-white text-xs px-3 py-2 rounded-md">
            <p className="font-bold">PCB-RAR v1.0</p>
            <p className="text-xs opacity-70 mt-1">{pcbInfo.width}mm × {pcbInfo.height}mm</p>
          </div>
        </div>
      </div>
      
      {/* Component legend */}
      <div className="mt-4 bg-white rounded-lg p-3 shadow-sm">
        <h4 className="text-sm font-medium mb-2">Component Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-black mr-2"></div>
            <span>IC (STM32F103)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 mr-2"></div>
            <span>LED Indicator</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 mr-2"></div>
            <span>Resistors</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 mr-2"></div>
            <span>Capacitors</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-600 mr-2"></div>
            <span>Copper Traces</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-white border border-gray-400 mr-2"></div>
            <span>Silkscreen</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-600 mr-2"></div>
            <span>Crystal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 mr-2"></div>
            <span>USB Connector</span>
          </div>
        </div>
      </div>
    </div>
  );
} 