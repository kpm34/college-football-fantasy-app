/**
 * Figma API Integration
 * 
 * This module provides utilities for working with Figma designs in your development workflow.
 * Get your Figma API token from: https://www.figma.com/developers/api#access-tokens
 */

interface FigmaConfig {
  accessToken?: string;
  fileId?: string;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  fills?: any[];
  strokes?: any[];
  effects?: any[];
}

class FigmaAPI {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(config: FigmaConfig) {
    this.accessToken = config.accessToken || process.env.FIGMA_ACCESS_TOKEN || '';
    
    if (!this.accessToken) {
      console.warn('Figma access token not found. Please set FIGMA_ACCESS_TOKEN in your .env file');
    }
  }

  /**
   * Fetch a Figma file
   */
  async getFile(fileId: string) {
    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma file: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get images from a Figma file
   */
  async getImages(fileId: string, nodeIds: string[], format: 'jpg' | 'png' | 'svg' | 'pdf' = 'png') {
    const params = new URLSearchParams({
      ids: nodeIds.join(','),
      format,
    });

    const response = await fetch(`${this.baseUrl}/images/${fileId}?${params}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma images: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get components from a Figma file
   */
  async getComponents(fileId: string) {
    const response = await fetch(`${this.baseUrl}/files/${fileId}/components`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma components: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get styles from a Figma file
   */
  async getStyles(fileId: string) {
    const response = await fetch(`${this.baseUrl}/files/${fileId}/styles`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma styles: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Convert Figma color to CSS
 */
export function figmaColorToCSS(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;

  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Convert Figma node to React component props
 */
export function figmaNodeToProps(node: FigmaNode): Record<string, any> {
  const props: Record<string, any> = {};

  // Extract common properties
  if (node.absoluteBoundingBox) {
    props.width = node.absoluteBoundingBox.width;
    props.height = node.absoluteBoundingBox.height;
  }

  if (node.backgroundColor) {
    props.backgroundColor = figmaColorToCSS(node.backgroundColor);
  }

  // Extract text properties
  if (node.type === 'TEXT') {
    // Text-specific properties would go here
  }

  return props;
}

/**
 * Generate Tailwind classes from Figma properties
 */
export function figmaToTailwind(node: FigmaNode): string {
  const classes: string[] = [];

  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    
    // Convert to Tailwind spacing units (rough approximation)
    const widthClass = `w-[${width}px]`;
    const heightClass = `h-[${height}px]`;
    
    classes.push(widthClass, heightClass);
  }

  // Add more conversions as needed
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      // You could map to Tailwind color classes here
      classes.push('bg-gray-100'); // Placeholder
    }
  }

  return classes.join(' ');
}

/**
 * Generate React component from Figma node
 */
export function generateComponentFromFigma(node: FigmaNode): string {
  const componentName = node.name.replace(/[^a-zA-Z0-9]/g, '');
  const props = figmaNodeToProps(node);
  const tailwindClasses = figmaToTailwind(node);

  return `
import React from 'react';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${componentName}({ className = '', children, ...props }: ${componentName}Props) {
  return (
    <div 
      className={\`${tailwindClasses} \${className}\`}
      {...props}
    >
      {children}
    </div>
  );
}
`;
}

/**
 * Extract design tokens from Figma
 */
export function extractDesignTokens(styles: any[]): Record<string, any> {
  const tokens: Record<string, any> = {
    colors: {},
    typography: {},
    spacing: {},
    borderRadius: {},
    shadows: {},
  };

  styles.forEach(style => {
    if (style.styleType === 'FILL' && style.fills) {
      // Extract color tokens
      style.fills.forEach((fill: any) => {
        if (fill.type === 'SOLID') {
          tokens.colors[style.name] = figmaColorToCSS(fill.color);
        }
      });
    }

    if (style.styleType === 'TEXT') {
      // Extract typography tokens
      tokens.typography[style.name] = {
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      };
    }

    if (style.styleType === 'EFFECT') {
      // Extract shadow tokens
      if (style.effects) {
        style.effects.forEach((effect: any) => {
          if (effect.type === 'DROP_SHADOW') {
            tokens.shadows[style.name] = {
              x: effect.offset.x,
              y: effect.offset.y,
              blur: effect.radius,
              color: figmaColorToCSS(effect.color),
            };
          }
        });
      }
    }
  });

  return tokens;
}

/**
 * Sync Figma components with local code
 */
export async function syncFigmaComponents(fileId: string, outputDir: string = './components/figma') {
  const figma = new FigmaAPI({ accessToken: process.env.FIGMA_ACCESS_TOKEN });
  
  try {
    // Fetch components from Figma
    const components = await figma.getComponents(fileId);
    
    // Generate component files
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate component files
    for (const [key, component] of Object.entries(components.meta.components)) {
      const componentData = component as any;
      const fileName = `${componentData.name.replace(/[^a-zA-Z0-9]/g, '')}.tsx`;
      const filePath = path.join(outputDir, fileName);
      
      // Generate component code (simplified)
      const componentCode = `
// Auto-generated from Figma
// Component: ${componentData.name}
// Last synced: ${new Date().toISOString()}

import React from 'react';

export function ${componentData.name.replace(/[^a-zA-Z0-9]/g, '')}() {
  return (
    <div>
      {/* TODO: Implement component based on Figma design */}
      <p>Component: ${componentData.name}</p>
    </div>
  );
}
`;
      
      await fs.writeFile(filePath, componentCode);
      console.log(`Generated component: ${fileName}`);
    }
    
    return components;
  } catch (error) {
    console.error('Failed to sync Figma components:', error);
    throw error;
  }
}

export default FigmaAPI;