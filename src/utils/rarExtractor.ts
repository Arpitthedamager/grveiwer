'use client';

export interface ExtractedFile {
  name: string;
  size: number;
  content: Blob;
  isDirectory: boolean;
  path: string;
  type?: string;
}

// Simulated RAR extraction function
export async function extractRARFile(rarFile: File): Promise<ExtractedFile[]> {
  try {
    // In a real implementation, we would use a cross-platform library
    // For now, we'll generate synthetic PCB files for demo purposes
    
    // Create simulated Gerber files based on the RAR filename
    const baseName = rarFile.name.replace('.rar', '');
    const simulatedFiles: ExtractedFile[] = [];
    
    // Create simulated file contents
    const topLayerContent = createGerberContent('top');
    const bottomLayerContent = createGerberContent('bottom');
    const drillContent = createDrillContent();
    const outlineContent = createOutlineContent();
    
    // Add top layer
    simulatedFiles.push({
      name: `${baseName}.GTL`,
      path: `${baseName}.GTL`,
      size: topLayerContent.length,
      content: new Blob([topLayerContent], { type: 'text/plain' }),
      isDirectory: false,
      type: 'gerber'
    });
    
    // Add bottom layer
    simulatedFiles.push({
      name: `${baseName}.GBL`,
      path: `${baseName}.GBL`, 
      size: bottomLayerContent.length,
      content: new Blob([bottomLayerContent], { type: 'text/plain' }),
      isDirectory: false,
      type: 'gerber'
    });
    
    // Add drill file
    simulatedFiles.push({
      name: `${baseName}.DRL`,
      path: `${baseName}.DRL`,
      size: drillContent.length,
      content: new Blob([drillContent], { type: 'text/plain' }),
      isDirectory: false,
      type: 'gerber'
    });
    
    // Add outline file
    simulatedFiles.push({
      name: `${baseName}.GKO`,
      path: `${baseName}.GKO`,
      size: outlineContent.length,
      content: new Blob([outlineContent], { type: 'text/plain' }),
      isDirectory: false,
      type: 'gerber'
    });
    
    // Add a text file with board information
    const infoContent = `Board: ${baseName}\nLayers: 2\nThickness: 1.6mm\nDimensions: 100mm x 80mm`;
    simulatedFiles.push({
      name: `${baseName}_info.txt`,
      path: `${baseName}_info.txt`,
      size: infoContent.length,
      content: new Blob([infoContent], { type: 'text/plain' }),
      isDirectory: false,
      type: 'text'
    });
    
    // Simulate an extraction delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return simulatedFiles;
  } catch (error) {
    console.error("Error extracting RAR:", error);
    throw new Error("Failed to extract RAR file: " + (error as Error).message);
  }
}

// Helper functions to create sample Gerber and drill content
function createGerberContent(layer: 'top' | 'bottom'): string {
  return `G04 ${layer.toUpperCase()} Layer Gerber File*
G04 Generated by PCB Demo Creator*
%FSLAX46Y46*%
%MOMM*%
%AMCircle*
21,1,$1,0,0,0*
%
G01*
%ADD10C,1.6*%
%ADD11C,1.0*%
%ADD12R,1.8X1.8*%
D10*
X25400Y25400D03*
X152400Y25400D03*
X152400Y152400D03*
X25400Y152400D03*
D11*
X50800Y50800D03*
X76200Y50800D03*
X101600Y50800D03*
X127000Y50800D03*
X50800Y76200D03*
X76200Y76200D03*
X101600Y76200D03*
X127000Y76200D03*
D12*
X50800Y101600D03*
X50800Y127000D03*
X127000Y101600D03*
X127000Y127000D03*
M02*`;
}

function createDrillContent(): string {
  return `M48
;DRILL file {KiCad (6.0.0-0)} date Friday, 19 April 2024 at 12:15:09
;FORMAT={-:-/ absolute / metric / decimal}
FMAT,2
METRIC,TZ
; #@! TF.CreationDate,2024-04-19T12:15:09+01:00
; #@! TF.GenerationSoftware,Kicad,Pcbnew,(6.0.0-0)
; #@! TF.FileFunction,MixedPlating,1,2
FMAT,2
METRIC
; #@! TA.AperFunction,Plated,PTH,ComponentDrill
T1C1.000
; #@! TA.AperFunction,Plated,PTH,ComponentDrill
T2C3.200
%
G90
G05
T1
X50.8Y50.8
X50.8Y76.2
X50.8Y101.6
X50.8Y127.0
X76.2Y50.8
X76.2Y76.2
X101.6Y50.8
X101.6Y76.2
X127.0Y50.8
X127.0Y76.2
X127.0Y101.6
X127.0Y127.0
T2
X25.4Y25.4
X25.4Y152.4
X152.4Y25.4
X152.4Y152.4
T0
M30`;
}

function createOutlineContent(): string {
  return `G04 Board Outline*
G04 Generated by PCB Demo Creator*
%FSLAX46Y46*%
%MOMM*%
G01*
%ADD10C,0.1*%
D10*
X0Y0D02*
X177800Y0D01*
X177800Y177800D01*
X0Y177800D01*
X0Y0D01*
M02*`;
}

export function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'image';
  } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
    return 'video';
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  } else if (['obj', 'stl', 'gltf', 'glb', '3ds', 'fbx'].includes(extension)) {
    return '3d';
  } else if (['txt', 'md', 'json', 'xml', 'csv', 'html', 'css', 'js', 'ini'].includes(extension)) {
    return 'text';
  } else if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['gbr', 'gbl', 'gbs', 'gto', 'gtp', 'gts', 'gbp', 'drl', 'cmp', 'gtl', 'gko'].includes(extension)) {
    return 'gerber';
  }
  
  return 'unknown';
} 