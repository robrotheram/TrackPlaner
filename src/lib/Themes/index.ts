import { Theme } from "@/types";

export const themes: Theme[] = [
  {
    name: 'Blueprint',
    background: '#1a365d',
    gridColor: '#ffffff',
    gridOpacity: 0.3,
    extras: { texture: true }
  },
  {
    name: 'Chalkboard',
    background: '#2d3a2d',
    gridColor: '#e5e5e5',
    gridOpacity: 0.2,
    extras: { texture: true }
  },
  {
    name: 'Light Paper',
    background: '#f7f4ed',
    gridColor: '#94a3b8',
    gridOpacity: 0.2,
    extras: { texture: true }
  },
  {
    name: 'Dark Mode',
    background: '#1a1a1a',
    gridColor: '#4ade80',
    gridOpacity: 0.3
  },
  {
    name: 'Ocean Glow',
    background: '#0f2d4e',
    gridColor: '#4ac9ff',
    gridOpacity: 0.4,
    extras: { glow: true }
  },
  {
    name: 'Futuristic Neon',
    background: '#0a0a1f',
    gridColor: '#00ffff',
    gridOpacity: 0.5,
    extras: { glow: true }
  },
  {
    name: 'Dotted Sketchpad',
    background: '#f5f5f4',
    gridColor: '#78716c',
    gridOpacity: 0.3,
    extras: { dots: true }
  },
  {
    name: 'Galactic Grid',
    background: '#000000',
    gridColor: '#ffffff',
    gridOpacity: 0.2,
    extras: { stars: true }
  },
  {
    name: 'Retro Grid',
    background: '#2d1b4e',
    gridColor: '#ff61d8',
    gridOpacity: 0.4,
    extras: { glow: true }
  },
  {
    name: 'Minimalist Whiteboard',
    background: '#ffffff',
    gridColor: '#94a3b8',
    gridOpacity: 0.15
  }
];