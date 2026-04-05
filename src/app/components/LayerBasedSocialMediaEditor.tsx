import { useState, useRef, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronLeft, ChevronRight, Upload, Download, Image as ImageIcon, Type, X, Eye, EyeOff, GripVertical, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Pin, Save, FolderOpen, Bookmark, FileText, Library, Copy, Undo2, Redo2, ImagePlus, Shield, Columns, SplitSquareHorizontal, LayoutGrid, RectangleHorizontal, Rows } from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import logo from '../../assets/6705475f4c357a167b42625959f8ccbb9d9a1ccb.png';
import { createAbrakadabraSlides } from './AbrakadabraSlides';
import { createProfessionalPresets } from './ProfessionalPresets';

// Brand colors
const colors = {
  blue: '#4A90E2',
  yellow: '#F5D547',
  lavender: '#D8D4E8',
  orange: '#F77754',
  purple: '#4A4458',
  cream: '#F5F0E8',
  green: '#6FCF97',
  white: '#FFFFFF',
  black: '#000000',
};

// Layer types
interface BaseLayer {
  id: string;
  zIndex: number;
  visible: boolean;
  name: string;
}

interface BackgroundLayer extends BaseLayer {
  type: 'background';
  color: string;
}

interface MediaLayer extends BaseLayer {
  type: 'media';
  url: string;
  mediaType: 'image' | 'video';
  scale: number;
  position: { x: number; y: number };
  filter?: 'none' | 'blur' | 'grayscale' | 'sepia' | 'brightness';
  overlay?: 'none' | 'dark' | 'light' | 'gradient';
  crop?: 'full' | 'left-half' | 'right-half' | 'top-half' | 'bottom-half';
  borderWidth?: number;
  borderColor?: string;
  // Transform & style properties
  rotation?: number;
  cornerRadius?: number;
  flipH?: boolean;
  flipV?: boolean;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  opacity?: number;        // 0-100
  objectFit?: 'cover' | 'contain';
}

interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string; // Allow any font family for custom fonts
  fontWeight: 400 | 700;
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify-spread';
  lineHeight: number;
  letterSpacing: number;
  width: number;
  animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'bounce' | 'pulse' | 'zoom-in' | 'typewriter' | 'glitch' | 'wave' | 'rotate-in' | 'blur-in' | 'elastic' | 'flip-in' | 'shake';
  animationDelay?: number;
  textBackground?: 'none' | 'solid' | 'pill';
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
  pinned?: boolean;
}

interface LogoLayer extends BaseLayer {
  type: 'logo';
  position: { x: number; y: number };
  size: number;
  pinned: boolean;
  animation: 'none' | 'fade-in' | 'slide-up' | 'bounce' | 'pulse' | 'spin';
  opacity: number;
  filter: 'none' | 'invert' | 'brightness' | 'contrast' | 'grayscale';
}

type Layer = BackgroundLayer | MediaLayer | TextLayer | LogoLayer;

interface Slide {
  id: number;
  layers: Layer[];
  frameWidth?: number;
  frameColor?: string;
}

interface Preset {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: number;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface CustomFont {
  name: string;
  family: string;
}

type FormatKey = 'story' | 'post' | 'post-portrait' | 'post-landscape' | 'linkedin';

interface EditorProps {
  initialFormat?: FormatKey;
}

// Format dimensions
const getDimensions = (format: string) => {
  switch (format) {
    case 'story':
      return { width: 436, height: 774 };
    case 'post':
      return { width: 480, height: 480 };
    case 'post-portrait':
      return { width: 480, height: 600 };
    case 'post-landscape':
      return { width: 600, height: 315 };
    case 'linkedin':
      return { width: 520, height: 520 };
    default:
      return { width: 436, height: 774 };
  }
};

// Export dimensions
const getExportDimensions = (format: string) => {
  switch (format) {
    case 'story':
      return { width: 1080, height: 1920 };
    case 'post':
      return { width: 1080, height: 1080 };
    case 'post-portrait':
      return { width: 1080, height: 1350 };
    case 'post-landscape':
      return { width: 1080, height: 566 };
    case 'linkedin':
      return { width: 1080, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
};

// Initial slides — clean white canvas with logo at bottom
const createInitialSlides = (format: string): Slide[] => {
  const dims = getDimensions(format);
  return [{
    id: 1,
    layers: [
      { id: 'bg-1', type: 'background', zIndex: 0, visible: true, name: 'Background', color: '#FFFFFF' } as BackgroundLayer,
      { id: 'logo-1', type: 'logo', zIndex: 10, visible: true, name: 'Logo', position: { x: dims.width / 2, y: dims.height - 60 }, size: 28, pinned: true, animation: 'none' as const, opacity: 1, filter: 'none' as const } as LogoLayer,
    ],
  }];
};

// Legacy slides definition (keeping for reference)
const createLegacySlides = (format: string): Slide[] => {
  const dims = getDimensions(format);
  const centerX = dims.width / 2;
  const centerY = dims.height / 2;
  const pctX = (px: number) => (px / dims.width) * 100;
  const pctY = (px: number) => (px / dims.height) * 100;
  const pctW = (px: number) => (px / dims.width) * 100;

  return [
    // Slide 1: Opening slide
    {
      id: 1,
      layers: [
        {
          id: 'bg-1',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.cream,
        } as BackgroundLayer,
        {
          id: 'text-1',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Heading',
          content: 'CASE STUDY:\nTRANSFORMING DIGITAL\nEXPERIENCES',
          position: { x: pctX(32), y: pctY(80) },
          fontSize: 36,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.purple,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          width: pctW(372),
        } as TextLayer,
        {
          id: 'logo-1',
          type: 'logo',
          zIndex: 2,
          visible: true,
          name: 'Logo',
          position: { x: centerX, y: dims.height - 60 },
          size: 32,
          pinned: true,
          animation: 'none',
          opacity: 1,
          filter: 'none',
        } as LogoLayer,
      ],
    },
    // Slide 2: Text only
    {
      id: 2,
      layers: [
        {
          id: 'bg-2',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.blue,
        } as BackgroundLayer,
        {
          id: 'text-2-title',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Title',
          content: 'The Challenge',
          position: { x: pctX(32), y: pctY(200) },
          fontSize: 30,
          fontFamily: 'Plantin',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          width: pctW(372),
        } as TextLayer,
        {
          id: 'text-2-body',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Body Text',
          content: 'Our client needed a complete digital transformation to compete in the modern marketplace.',
          position: { x: pctX(32), y: pctY(280) },
          fontSize: 18,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          width: pctW(372),
        } as TextLayer,
        {
          id: 'logo-2',
          type: 'logo',
          zIndex: 3,
          visible: true,
          name: 'Logo',
          position: { x: centerX, y: dims.height - 60 },
          size: 24,
          pinned: true,
          animation: 'none',
          opacity: 1,
          filter: 'none',
        } as LogoLayer,
      ],
    },
    // Slide 3: Image with text
    {
      id: 3,
      layers: [
        {
          id: 'bg-3',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.cream,
        } as BackgroundLayer,
        {
          id: 'media-3',
          type: 'media',
          zIndex: 1,
          visible: true,
          name: 'Background Image',
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
          mediaType: 'image',
          scale: 100,
          position: { x: 50, y: 50 },
        } as MediaLayer,
        {
          id: 'text-3',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Heading',
          content: 'Research & Discovery',
          position: { x: pctX(32), y: pctY(60) },
          fontSize: 36,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          width: pctW(372),
        } as TextLayer,
        {
          id: 'logo-3',
          type: 'logo',
          zIndex: 3,
          visible: true,
          name: 'Logo',
          position: { x: centerX, y: dims.height - 60 },
          size: 24,
          pinned: true,
          animation: 'none',
          opacity: 1,
          filter: 'none',
        } as LogoLayer,
      ],
    },
  ];
};

// Position Grid Component — shared by TextEditor, MediaEditor, LogoEditor
const PositionGrid = ({
  onPosition,
  mode,
  layerWidth,
  dimensions,
}: {
  onPosition: (pos: { x: number; y: number }) => void;
  mode: 'percent' | 'percent-centered' | 'pixel';
  layerWidth?: number; // text layer width in %, needed for text centering
  dimensions?: { width: number; height: number }; // needed for pixel mode (logo)
}) => {
  const pad = 5; // padding from edges in %
  const padPx = 40; // padding from edges in px (logo)

  const getPos = (col: 'left' | 'center' | 'right', row: 'top' | 'middle' | 'bottom') => {
    if (mode === 'pixel' && dimensions) {
      const xMap = { left: padPx, center: dimensions.width / 2, right: dimensions.width - padPx };
      const yMap = { top: padPx, middle: dimensions.height / 2, bottom: dimensions.height - 60 };
      return { x: xMap[col], y: yMap[row] };
    }
    if (mode === 'percent-centered') {
      // Media: has translate(-50%,-50%), so 50 = true center
      const xMap = { left: 15, center: 50, right: 85 };
      const yMap = { top: 15, middle: 50, bottom: 85 };
      return { x: xMap[col], y: yMap[row] };
    }
    // Text: no translate offset, need to account for width
    const w = layerWidth ?? 50;
    const xMap = { left: pad, center: (100 - w) / 2, right: 100 - w - pad };
    const yMap = { top: pad, middle: 42, bottom: 80 };
    return { x: xMap[col], y: yMap[row] };
  };

  const positions: Array<{ col: 'left' | 'center' | 'right'; row: 'top' | 'middle' | 'bottom' }> = [
    { col: 'left', row: 'top' }, { col: 'center', row: 'top' }, { col: 'right', row: 'top' },
    { col: 'left', row: 'middle' }, { col: 'center', row: 'middle' }, { col: 'right', row: 'middle' },
    { col: 'left', row: 'bottom' }, { col: 'center', row: 'bottom' }, { col: 'right', row: 'bottom' },
  ];

  return (
    <div>
      <label className="block text-xs font-medium mb-1">Quick Position</label>
      <div className="grid grid-cols-3 gap-1 w-24">
        {positions.map(({ col, row }) => (
          <button
            key={`${col}-${row}`}
            onClick={() => onPosition(getPos(col, row))}
            className="w-7 h-7 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
            title={`${row}-${col}`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full bg-gray-500"
              style={{
                transform: `translate(${col === 'left' ? '-4px' : col === 'right' ? '4px' : '0'}, ${row === 'top' ? '-4px' : row === 'bottom' ? '4px' : '0'})`,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Layer Panel Component
const LayerPanel = ({
  layers,
  globalLayers,
  selectedLayerId,
  onSelectLayer,
  onReorderLayers,
  onToggleVisibility,
  onDeleteLayer,
  onDuplicateLayer,
  onTogglePin,
  onPinTextLayer,
}: {
  layers: Layer[];
  globalLayers: TextLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onTogglePin: (id: string) => void;
  onPinTextLayer: (id: string) => void;
}) => {
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const LayerItem = ({ layer, index }: { layer: Layer; index: number }) => {
    const isPinned = layer.type === 'logo' && layer.pinned;
    
    const [{ isDragging }, drag, preview] = useDrag({
      type: 'layer',
      item: { index },
      canDrag: !isPinned, // Can't drag pinned layers
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: 'layer',
      hover: (item: { index: number }) => {
        if (item.index !== index && !isPinned) {
          onReorderLayers(item.index, index);
          item.index = index;
        }
      },
    });

    const getLayerIcon = () => {
      switch (layer.type) {
        case 'background':
          return <div className="w-4 h-4 bg-gray-300 rounded" />;
        case 'media':
          return <ImageIcon className="w-4 h-4" />;
        case 'text':
          return <Type className="w-4 h-4" />;
        case 'logo':
          return <div className="w-4 h-4 bg-black rounded-full" />;
      }
    };

    return (
      <div
        ref={(node) => preview(drop(node))}
        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
          selectedLayerId === layer.id ? 'bg-blue-100 border border-blue-400' : 'hover:bg-gray-100'
        } ${isDragging ? 'opacity-50' : ''} ${isPinned ? 'bg-yellow-50' : ''}`}
        onClick={() => onSelectLayer(layer.id)}
      >
        {!isPinned && (
          <div ref={drag} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        )}
        {isPinned && (
          <div className="w-4 h-4">
            <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
          </div>
        )}
        {getLayerIcon()}
        <span className="flex-1 text-sm truncate">{layer.name}</span>
        {layer.type === 'logo' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(layer.id);
            }}
            className={`p-1 hover:bg-gray-200 rounded ${isPinned ? 'text-yellow-600' : 'text-gray-400'}`}
            title={isPinned ? 'Unpin logo' : 'Pin logo to top'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-yellow-600' : ''}`} />
          </button>
        )}
        {layer.type === 'text' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinTextLayer(layer.id);
            }}
            className="p-1 hover:bg-purple-100 rounded text-gray-400 hover:text-purple-600"
            title="Pin to all slides"
          >
            <Pin className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(layer.id);
          }}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        </button>
        {layer.type !== 'background' && layer.type !== 'logo' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateLayer(layer.id);
              }}
              className="p-1 hover:bg-blue-100 rounded text-blue-500"
              title="Duplicate layer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteLayer(layer.id);
              }}
              className="p-1 hover:bg-red-100 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Layers</h3>

      {/* Global (Pinned) Text Layers */}
      {globalLayers.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-1">
            <Pin className="w-3 h-3 text-purple-500 fill-purple-500" />
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Global (All Slides)</span>
          </div>
          <div className="space-y-1">
            {globalLayers.map((gl) => (
              <div
                key={gl.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors bg-purple-50 border border-purple-200 ${
                  selectedLayerId === gl.id ? 'border-purple-500 bg-purple-100' : 'hover:bg-purple-100'
                }`}
                onClick={() => onSelectLayer(gl.id)}
              >
                <Pin className="w-3 h-3 text-purple-500 fill-purple-500 flex-shrink-0" />
                <Type className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="flex-1 text-sm truncate text-purple-800">{gl.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onPinTextLayer(gl.id); }}
                  className="p-1 hover:bg-purple-200 rounded text-purple-500"
                  title="Unpin from all slides"
                >
                  <Pin className="w-4 h-4 fill-purple-500" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(gl.id); }}
                  className="p-1 hover:bg-purple-200 rounded"
                >
                  {gl.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-2 mb-2" />
        </div>
      )}

      {/* Slide-specific Layers */}
      <div className="space-y-1">
        {sortedLayers.map((layer, index) => (
          <LayerItem key={layer.id} layer={layer} index={index} />
        ))}
      </div>
    </div>
  );
};

// Text Editor Component
const TextEditor = ({
  layer,
  onUpdate,
  customFonts,
  fontInputRef,
  onFontUploadClick,
  onApplyToAll,
}: {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
  customFonts: CustomFont[];
  fontInputRef: React.RefObject<HTMLInputElement>;
  onFontUploadClick: () => void;
  onApplyToAll: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Text Properties</h3>

      {/* Quick Position */}
      <PositionGrid
        onPosition={(pos) => onUpdate({ position: pos })}
        mode="percent"
        layerWidth={layer.width}
      />

      {/* Font Upload */}
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
        <button
          onClick={onFontUploadClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          <FileText className="w-4 h-4" />
          Upload Custom Font
        </button>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Supports .ttf, .otf, .woff, .woff2
        </p>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium mb-1">Font Family</label>
        <select
          value={layer.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full px-2 py-1 border rounded text-sm"
          style={{ fontFamily: layer.fontFamily }}
        >
          {customFonts.map((font) => (
            <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium mb-1">Font Size: {layer.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="72"
          value={layer.fontSize}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Font Weight & Style */}
      <div>
        <label className="block text-xs font-medium mb-1">Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ fontWeight: layer.fontWeight === 700 ? 400 : 700 })}
            className={`flex-1 px-3 py-1 rounded text-sm ${
              layer.fontWeight === 700 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Bold className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => onUpdate({ fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={`flex-1 px-3 py-1 rounded text-sm ${
              layer.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Italic className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-xs font-medium mb-1">Alignment</label>
        <div className="flex gap-2">
          {([
            { value: 'left' as const, icon: AlignLeft },
            { value: 'center' as const, icon: AlignCenter },
            { value: 'right' as const, icon: AlignRight },
            { value: 'justify-spread' as const, icon: AlignJustify },
          ]).map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onUpdate({ textAlign: value, ...(value === 'justify-spread' ? { width: 90 } : {}) })}
              className={`flex-1 px-3 py-1 rounded text-sm ${
                layer.textAlign === value ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              title={value === 'justify-spread' ? 'Spread (ATMOS style)' : value}
            >
              <Icon className="w-4 h-4 mx-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium mb-1">Text Color</label>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(colors).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => onUpdate({ color: hex })}
              className={`w-full h-8 rounded border-2 ${
                layer.color === hex ? 'border-blue-500 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: hex }}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-xs font-medium mb-1">Line Height: {layer.lineHeight.toFixed(1)}</label>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={layer.lineHeight}
          onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-xs font-medium mb-1">Letter Spacing: {layer.letterSpacing}px</label>
        <input
          type="range"
          min="-2"
          max="10"
          step="0.5"
          value={layer.letterSpacing}
          onChange={(e) => onUpdate({ letterSpacing: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Width */}
      <div>
        <label className="block text-xs font-medium mb-1">Width: {Math.round(layer.width)}%</label>
        <input
          type="range"
          min="10"
          max="100"
          step="1"
          value={layer.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Style Presets — static, ATMOS-inspired */}
      <div>
        <label className="block text-xs font-medium mb-2">Style Presets</label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { label: 'Title',   icon: 'H1', style: { fontFamily: 'Plantin' as const,     fontSize: 48, fontWeight: 700 as const, fontStyle: 'normal' as const,  textAlign: 'left'           as const, lineHeight: 1.1, letterSpacing: -1,  color: '#FFFFFF', animation: 'none' as const, width: 75 } },
            { label: 'Subtitle',icon: 'H2', style: { fontFamily: 'LL Kristall' as const, fontSize: 13, fontWeight: 400 as const, fontStyle: 'normal' as const,  textAlign: 'left'           as const, lineHeight: 1.4, letterSpacing: 4,   color: '#FFFFFF', animation: 'none' as const, width: 60 } },
            { label: 'Quote',   icon: '"',  style: { fontFamily: 'Plantin' as const,     fontSize: 28, fontWeight: 400 as const, fontStyle: 'italic' as const,  textAlign: 'center'         as const, lineHeight: 1.5, letterSpacing: 0,   color: '#FFFFFF', animation: 'none' as const, width: 80 } },
            { label: 'Body',    icon: 'P',  style: { fontFamily: 'Plantin' as const,     fontSize: 16, fontWeight: 400 as const, fontStyle: 'normal' as const,  textAlign: 'left'           as const, lineHeight: 1.6, letterSpacing: 0.5, color: '#FFFFFF', animation: 'none' as const, width: 70 } },
            { label: 'Caption', icon: 'sm', style: { fontFamily: 'LL Kristall' as const, fontSize: 10, fontWeight: 400 as const, fontStyle: 'normal' as const,  textAlign: 'left'           as const, lineHeight: 1.4, letterSpacing: 2,   color: '#FFFFFF', animation: 'none' as const, width: 50 } },
            { label: 'Display', icon: 'XL', style: { fontFamily: 'LL Kristall' as const, fontSize: 64, fontWeight: 700 as const, fontStyle: 'normal' as const,  textAlign: 'justify-spread' as const, lineHeight: 1.0, letterSpacing: 0,   color: '#FFFFFF', animation: 'none' as const, width: 90 } },
          ]).map((p) => (
            <button
              key={p.label}
              onClick={() => onUpdate(p.style)}
              className="px-2 py-2 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 border border-gray-200 flex flex-col items-center gap-0.5 transition-colors"
            >
              <span className="font-bold text-sm text-gray-700">{p.icon}</span>
              <span className="text-gray-500">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Presets */}
      <div>
        <label className="block text-xs font-medium mb-2">Animation Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Dramatic', anim: 'zoom-in' as const, delay: 0 },
            { label: 'Playful Pop', anim: 'elastic' as const, delay: 0 },
            { label: 'Clean Reveal', anim: 'blur-in' as const, delay: 0 },
            { label: 'Bold Glitch', anim: 'glitch' as const, delay: 0 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onUpdate({ animation: preset.anim, animationDelay: preset.delay })}
              className="px-3 py-2 rounded text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 border border-purple-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation */}
      <div>
        <label className="block text-xs font-medium mb-2">Animation</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: 'none', label: 'None' },
            { value: 'fade-in', label: 'Fade In' },
            { value: 'slide-up', label: 'Slide Up' },
            { value: 'slide-down', label: 'Slide Down' },
            { value: 'slide-left', label: 'Slide Left' },
            { value: 'slide-right', label: 'Slide Right' },
            { value: 'bounce', label: 'Bounce' },
            { value: 'pulse', label: 'Pulse' },
            { value: 'zoom-in', label: 'Zoom In' },
            { value: 'typewriter', label: 'Typewriter' },
            { value: 'glitch', label: 'Glitch' },
            { value: 'wave', label: 'Wave' },
            { value: 'rotate-in', label: 'Rotate In' },
            { value: 'blur-in', label: 'Blur In' },
            { value: 'elastic', label: 'Elastic' },
            { value: 'flip-in', label: 'Flip In' },
            { value: 'shake', label: 'Shake' },
          ].map((anim) => (
            <button
              key={anim.value}
              onClick={() => onUpdate({ animation: anim.value as TextLayer['animation'] })}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                (layer.animation ?? 'none') === anim.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Delay */}
      {layer.animation && layer.animation !== 'none' && (
        <div>
          <label className="block text-xs font-medium mb-1">Animation Delay: {layer.animationDelay ?? 0}ms</label>
          <input
            type="range"
            min="0"
            max="2000"
            step="100"
            value={layer.animationDelay ?? 0}
            onChange={(e) => onUpdate({ animationDelay: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}
      {/* Text Background */}
      <div>
        <label className="block text-xs font-medium mb-2">Text Background</label>
        <div className="flex gap-2 mb-2">
          {([
            { value: 'none' as const, label: 'None' },
            { value: 'solid' as const, label: 'Solid' },
            { value: 'pill' as const, label: 'Pill' },
          ]).map((bg) => (
            <button
              key={bg.value}
              onClick={() => onUpdate({ textBackground: bg.value })}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                (layer.textBackground ?? 'none') === bg.value ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
        {layer.textBackground && layer.textBackground !== 'none' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs">Color:</label>
              <input
                type="color"
                value={layer.textBackgroundColor ?? '#000000'}
                onChange={(e) => onUpdate({ textBackgroundColor: e.target.value })}
                className="w-8 h-6 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs">Opacity: {Math.round((layer.textBackgroundOpacity ?? 0.5) * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={layer.textBackgroundOpacity ?? 0.5}
                onChange={(e) => onUpdate({ textBackgroundOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onApplyToAll}
        className="w-full mt-2 px-3 py-2 text-xs font-medium bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
      >
        Apply Font &amp; Color to All Text Layers
      </button>
    </div>
  );
};

// Media Editor Component
const MediaEditor = ({
  layer,
  onUpdate,
}: {
  layer: MediaLayer;
  onUpdate: (updates: Partial<MediaLayer>) => void;
}) => {
  const sectionClass = "border-t border-gray-100 pt-3";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";
  const btnBase = "px-2 py-1.5 rounded text-xs font-medium transition-colors";
  const btnActive = "bg-gray-900 text-white";
  const btnInactive = "bg-gray-100 hover:bg-gray-200 text-gray-700";

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h3 className="font-bold text-sm uppercase tracking-wide text-gray-800">Media Properties</h3>

      {/* ── POSITION ── */}
      <div>
        <label className={labelClass}>Position</label>
        {/* Quick-position grid — clamped to keep image inside canvas */}
        <PositionGrid
          onPosition={(pos) => {
            const half = layer.scale / 2;
            onUpdate({ position: {
              x: Math.max(half + 2, Math.min(100 - half - 2, pos.x)),
              y: Math.max(half + 2, Math.min(100 - half - 2, pos.y)),
            }});
          }}
          mode="percent-centered"
        />
        {/* Fine X / Y sliders */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>X</span><span>{Math.round(layer.position.x)}%</span></div>
            <div className="flex items-center gap-1">
              <button onClick={() => onUpdate({ position: { ...layer.position, x: Math.max(0, layer.position.x - 1) } })} className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs flex items-center justify-center font-bold">‹</button>
              <input type="range" min="0" max="100" step="0.5" value={layer.position.x} onChange={(e) => onUpdate({ position: { ...layer.position, x: parseFloat(e.target.value) } })} className="flex-1" />
              <button onClick={() => onUpdate({ position: { ...layer.position, x: Math.min(100, layer.position.x + 1) } })} className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs flex items-center justify-center font-bold">›</button>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Y</span><span>{Math.round(layer.position.y)}%</span></div>
            <div className="flex items-center gap-1">
              <button onClick={() => onUpdate({ position: { ...layer.position, y: Math.max(0, layer.position.y - 1) } })} className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs flex items-center justify-center font-bold">‹</button>
              <input type="range" min="0" max="100" step="0.5" value={layer.position.y} onChange={(e) => onUpdate({ position: { ...layer.position, y: parseFloat(e.target.value) } })} className="flex-1" />
              <button onClick={() => onUpdate({ position: { ...layer.position, y: Math.min(100, layer.position.y + 1) } })} className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs flex items-center justify-center font-bold">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIZE ── */}
      <div className={sectionClass}>
        <label className={labelClass}>Size</label>
        <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Scale</span><span>{layer.scale}%</span></div>
        <input type="range" min="10" max="300" value={layer.scale} onChange={(e) => onUpdate({ scale: parseInt(e.target.value) })} className="w-full" />
        <div className="flex gap-1 mt-1.5">
          {[50, 75, 100].map(v => (
            <button key={v} onClick={() => onUpdate({ scale: v })} className={`flex-1 py-1 rounded text-xs font-medium ${layer.scale === v ? btnActive : btnInactive}`}>{v}%</button>
          ))}
        </div>
      </div>

      {/* ── OPACITY ── */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-1">
          <label className={labelClass} style={{marginBottom:0}}>Opacity</label>
          <span className="text-xs text-gray-500">{layer.opacity ?? 100}%</span>
        </div>
        <input type="range" min="10" max="100" value={layer.opacity ?? 100} onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) })} className="w-full" />
      </div>

      {/* ── TRANSFORM ── */}
      <div className={sectionClass}>
        <label className={labelClass}>Transform</label>
        {/* Rotation */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>Rotation</span>
            <div className="flex items-center gap-2">
              <span>{layer.rotation ?? 0}°</span>
              {(layer.rotation ?? 0) !== 0 && <button onClick={() => onUpdate({ rotation: 0 })} className="text-blue-500 hover:underline text-xs">Reset</button>}
            </div>
          </div>
          <input type="range" min="-180" max="180" value={layer.rotation ?? 0} onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })} className="w-full" />
        </div>
        {/* Flip & Fit */}
        <div className="grid grid-cols-4 gap-1">
          <button onClick={() => onUpdate({ flipH: !layer.flipH })} className={`${btnBase} ${layer.flipH ? btnActive : btnInactive}`} title="Flip Horizontal">↔ H</button>
          <button onClick={() => onUpdate({ flipV: !layer.flipV })} className={`${btnBase} ${layer.flipV ? btnActive : btnInactive}`} title="Flip Vertical">↕ V</button>
          <button onClick={() => onUpdate({ objectFit: 'cover' })} className={`${btnBase} ${(layer.objectFit ?? 'cover') === 'cover' ? 'bg-blue-500 text-white' : btnInactive}`} title="Fill frame (may crop)">Fill</button>
          <button onClick={() => onUpdate({ objectFit: 'contain' })} className={`${btnBase} ${layer.objectFit === 'contain' ? 'bg-blue-500 text-white' : btnInactive}`} title="Fit inside (letterbox)">Fit</button>
        </div>
      </div>

      {/* ── CORNER RADIUS ── */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-1">
          <label className={labelClass} style={{marginBottom:0}}>Corner Radius</label>
          <span className="text-xs text-gray-500">{layer.cornerRadius ?? 0}px</span>
        </div>
        <input type="range" min="0" max="200" value={layer.cornerRadius ?? 0} onChange={(e) => onUpdate({ cornerRadius: parseInt(e.target.value) })} className="w-full" />
        <div className="flex gap-1 mt-1.5">
          {[0, 8, 24, 999].map((v, i) => (
            <button key={v} onClick={() => onUpdate({ cornerRadius: v })} className={`flex-1 py-1 rounded text-xs font-medium ${(layer.cornerRadius ?? 0) === v ? btnActive : btnInactive}`}>
              {['None', 'S', 'M', '●'][i]}
            </button>
          ))}
        </div>
      </div>

      {/* ── SHADOW ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass} style={{marginBottom:0}}>Drop Shadow</label>
          <button onClick={() => onUpdate({ shadow: !layer.shadow })} className={`px-3 py-0.5 rounded-full text-xs font-medium transition-colors ${layer.shadow ? 'bg-gray-900 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{layer.shadow ? 'On' : 'Off'}</button>
        </div>
        {layer.shadow && (
          <div className="space-y-2 pl-1">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Blur</span><span>{layer.shadowBlur ?? 20}px</span></div>
              <input type="range" min="0" max="80" value={layer.shadowBlur ?? 20} onChange={(e) => onUpdate({ shadowBlur: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {['#000000','#1a1a1a','#ffffff','#3B82F6','#8B5CF6','#EF4444','#F59E0B'].map(hex => (
                <button key={hex} onClick={() => onUpdate({ shadowColor: hex })} className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${(layer.shadowColor ?? '#000000') === hex ? 'border-blue-500 scale-110' : 'border-gray-300'}`} style={{ background: hex }} />
              ))}
              <input type="color" value={layer.shadowColor ?? '#000000'} onChange={(e) => onUpdate({ shadowColor: e.target.value })} className="w-6 h-6 rounded border border-gray-300 cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* ── FILTER ── */}
      <div className={sectionClass}>
        <label className={labelClass}>Filter</label>
        <div className="grid grid-cols-5 gap-1">
          {([{ value: 'none', label: 'None' }, { value: 'blur', label: 'Blur' }, { value: 'grayscale', label: 'B&W' }, { value: 'sepia', label: 'Sepia' }, { value: 'brightness', label: 'Bright' }] as const).map((f) => (
            <button key={f.value} onClick={() => onUpdate({ filter: f.value })} className={`py-1.5 rounded text-xs font-medium transition-colors ${(layer.filter ?? 'none') === f.value ? 'bg-blue-500 text-white' : btnInactive}`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* ── OVERLAY ── */}
      <div className={sectionClass}>
        <label className={labelClass}>Overlay</label>
        <div className="grid grid-cols-4 gap-1">
          {([{ value: 'none', label: 'None' }, { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'gradient', label: '↓ Grad' }] as const).map((o) => (
            <button key={o.value} onClick={() => onUpdate({ overlay: o.value })} className={`py-1.5 rounded text-xs font-medium transition-colors ${(layer.overlay ?? 'none') === o.value ? 'bg-purple-500 text-white' : btnInactive}`}>{o.label}</button>
          ))}
        </div>
      </div>

      {/* ── CROP ── */}
      <div className={sectionClass}>
        <label className={labelClass}>Crop</label>
        <div className="grid grid-cols-5 gap-1">
          {([{ value: 'full', label: 'Full' }, { value: 'left-half', label: 'L ½' }, { value: 'right-half', label: 'R ½' }, { value: 'top-half', label: 'T ½' }, { value: 'bottom-half', label: 'B ½' }] as const).map((c) => (
            <button key={c.value} onClick={() => onUpdate({ crop: c.value })} className={`py-1.5 rounded text-xs font-medium transition-colors ${(layer.crop ?? 'full') === c.value ? 'bg-green-500 text-white' : btnInactive}`}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* ── BORDER ── */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-1">
          <label className={labelClass} style={{marginBottom:0}}>Border</label>
          <span className="text-xs text-gray-500">{layer.borderWidth ?? 0}px</span>
        </div>
        <input type="range" min="0" max="40" value={layer.borderWidth ?? 0} onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) })} className="w-full" />
        {(layer.borderWidth ?? 0) > 0 && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Border Color</label>
            <div className="flex gap-1 flex-wrap">
              {(['#ffffff', '#000000', '#cccccc', '#1A1A1A', '#D4AF37', '#FF4500'] as const).map((hex) => (
                <button key={hex} onClick={() => onUpdate({ borderColor: hex })} className={`w-7 h-7 rounded border-2 transition-transform hover:scale-110 ${(layer.borderColor ?? '#ffffff') === hex ? 'border-blue-500 scale-110' : 'border-gray-300'}`} style={{ background: hex }} />
              ))}
              <input type="color" value={layer.borderColor ?? '#ffffff'} onChange={(e) => onUpdate({ borderColor: e.target.value })} className="w-7 h-7 rounded border border-gray-300 cursor-pointer" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Background Editor Component
const BackgroundEditor = ({
  layer,
  onUpdate,
  onApplyToAll,
}: {
  layer: BackgroundLayer;
  onUpdate: (updates: Partial<BackgroundLayer>) => void;
  onApplyToAll: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
      <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Background</h3>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium mb-1">Background Color</label>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(colors).map(([name, hex]) => (
            <button
              key={name}
              onClick={() => onUpdate({ color: hex })}
              className={`w-full h-10 rounded border-2 ${
                layer.color === hex ? 'border-blue-500 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: hex }}
              title={name}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onApplyToAll}
        className="w-full mt-2 px-3 py-2 text-xs font-medium bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
      >
        Apply Color to All Slides
      </button>
    </div>
  );
};

// Logo Editor Component
const LogoEditor = ({
  layer,
  onUpdate,
  dimensions,
  onApplyToAll,
}: {
  layer: LogoLayer;
  onUpdate: (updates: Partial<LogoLayer>) => void;
  dimensions: { width: number; height: number };
  onApplyToAll: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Logo Properties</h3>

      {/* Quick Position */}
      <PositionGrid
        onPosition={(pos) => onUpdate({ position: pos })}
        mode="pixel"
        dimensions={dimensions}
      />

      {/* Size */}
      <div>
        <label className="block text-xs font-medium mb-1">Size: {layer.size ?? 24}px</label>
        <input
          type="range"
          min="16"
          max="120"
          value={layer.size ?? 24}
          onChange={(e) => onUpdate({ size: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-xs font-medium mb-1">Opacity: {Math.round((layer.opacity ?? 1) * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={layer.opacity ?? 1}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Animation */}
      <div>
        <label className="block text-xs font-medium mb-2">Animation</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'none', label: 'None' },
            { value: 'fade-in', label: 'Fade In' },
            { value: 'slide-up', label: 'Slide Up' },
            { value: 'bounce', label: 'Bounce' },
            { value: 'pulse', label: 'Pulse' },
            { value: 'spin', label: 'Spin' },
          ].map((anim) => (
            <button
              key={anim.value}
              onClick={() => onUpdate({ animation: anim.value as LogoLayer['animation'] })}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                (layer.animation ?? 'none') === anim.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Effects */}
      <div>
        <label className="block text-xs font-medium mb-2">Visual Effect</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'none', label: 'Normal' },
            { value: 'invert', label: 'Invert' },
            { value: 'brightness', label: 'Bright' },
            { value: 'contrast', label: 'Contrast' },
            { value: 'grayscale', label: 'Grayscale' },
          ].map((effect) => (
            <button
              key={effect.value}
              onClick={() => onUpdate({ filter: effect.value as LogoLayer['filter'] })}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                (layer.filter ?? 'none') === effect.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {effect.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Status */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium">
              {layer.pinned ? 'Logo Pinned (Always on Top)' : 'Logo Unpinned'}
            </span>
          </div>
        </div>
      </div>

      {/* Animation Preview Info */}
      {layer.animation !== 'none' && (
        <div className="p-2 bg-purple-50 rounded">
          <p className="text-xs text-purple-800">
            <strong>Animation Preview:</strong> Animations will play when exported or in preview mode.
          </p>
        </div>
      )}
      <button
        onClick={onApplyToAll}
        className="w-full mt-2 px-3 py-2 text-xs font-medium bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
      >
        Apply Size &amp; Style to All Logos
      </button>
    </div>
  );
};

// Preset Dialog Component
const PresetDialog = ({
  presets,
  onSave,
  onLoad,
  onDelete,
  onClose,
  dimensions,
}: {
  presets: Preset[];
  onSave: (name: string) => void;
  onLoad: (preset: Preset) => void;
  onDelete: (presetId: string) => void;
  onClose: () => void;
  dimensions: { width: number; height: number };
}) => {
  const proPresets = createProfessionalPresets(dimensions);
  const [presetName, setPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName.trim());
      setPresetName('');
      setShowSaveForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg uppercase tracking-wide flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-600" />
            Template Presets
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Template */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <Save className="w-5 h-5" />
              Save Current Template
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setPresetName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Professional Templates */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Professional Templates
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {proPresets.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  onLoad({ id: `pro-${p.name}`, name: p.name, slides: JSON.parse(JSON.stringify(p.slides)), createdAt: 0 });
                  onClose();
                }}
                className="text-left p-3 border rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                <div className="text-xs text-purple-600 mt-1">{p.slides.length} slides</div>
              </button>
            ))}
            {/* Also offer the original Abrakadabra template */}
            <button
              onClick={() => {
                const dims = dimensions;
                const slides = createAbrakadabraSlides(dims, dims.width / 2, dims.height / 2);
                onLoad({ id: 'pro-abrakadabra', name: 'Abrakadabra Brand', slides, createdAt: 0 });
                onClose();
              }}
              className="text-left p-3 border rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <div className="font-bold text-sm">Abrakadabra Brand</div>
              <div className="text-xs text-gray-500 mt-1">Original branded template with studio colors.</div>
              <div className="text-xs text-purple-600 mt-1">3 slides</div>
            </button>
          </div>
        </div>

        {/* Saved Presets */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Saved Templates ({presets.length})
          </h3>
          
          {presets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No saved presets yet</p>
              <p className="text-xs mt-1">Save your first template to get started</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(preset.createdAt).toLocaleDateString()} • {preset.slides.length} slides
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onLoad(preset);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete preset "${preset.name}"?`)) {
                          onDelete(preset.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> Presets save your entire slide deck including all layers, text, colors, and animations. Perfect for reusing your favorite layouts!
          </p>
        </div>
      </div>
    </div>
  );
};

// Export Dialog Component
const ALL_EXPORT_FORMATS: { key: FormatKey; label: string; dims: string; ratio: string }[] = [
  { key: 'story',          label: 'Story',          dims: '1080×1920',  ratio: '9:16'   },
  { key: 'post',           label: 'Post Square',    dims: '1080×1080',  ratio: '1:1'    },
  { key: 'post-portrait',  label: 'Post Portrait',  dims: '1080×1350',  ratio: '4:5'    },
  { key: 'post-landscape', label: 'Post Landscape', dims: '1080×566',   ratio: '1.91:1' },
  { key: 'linkedin',       label: 'LinkedIn',       dims: '1080×1080',  ratio: '1:1'    },
];

const ExportDialog = ({
  format,
  exportFormat,
  exportQuality,
  videoDuration,
  selectedFormats,
  onFormatChange,
  onQualityChange,
  onDurationChange,
  onSelectedFormatsChange,
  onExport,
  onZipExport,
  onClose,
}: {
  format: string;
  exportFormat: 'jpeg' | 'png' | 'mp4';
  exportQuality: number;
  videoDuration: number;
  selectedFormats: FormatKey[];
  onFormatChange: (format: 'jpeg' | 'png' | 'mp4') => void;
  onQualityChange: (quality: number) => void;
  onDurationChange: (duration: number) => void;
  onSelectedFormatsChange: (formats: FormatKey[]) => void;
  onExport: () => void;
  onZipExport: () => void;
  onClose: () => void;
}) => {
  const toggleFormat = (key: FormatKey) => {
    onSelectedFormatsChange(
      selectedFormats.includes(key)
        ? selectedFormats.filter(f => f !== key)
        : [...selectedFormats, key]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg uppercase tracking-wide">Export</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* ── EXPORT FORMATS ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Target Formats</label>
            <div className="flex gap-2 text-xs">
              <button onClick={() => onSelectedFormatsChange(ALL_EXPORT_FORMATS.map(f => f.key))} className="text-blue-500 hover:underline">All</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => onSelectedFormatsChange([])} className="text-gray-400 hover:underline">None</button>
            </div>
          </div>
          <div className="space-y-1.5">
            {ALL_EXPORT_FORMATS.map(({ key, label, dims, ratio }) => {
              const checked = selectedFormats.includes(key);
              const isCurrent = key === format;
              return (
                <label key={key} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleFormat(key)} className="w-4 h-4 accent-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                      {isCurrent && <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">current</span>}
                    </div>
                    <div className="text-xs text-gray-400">{dims}px · {ratio}</div>
                  </div>
                </label>
              );
            })}
          </div>
          {selectedFormats.length === 0 && <p className="text-xs text-red-400 mt-1.5">Select at least one format to export.</p>}
        </div>

        {/* ── FILE TYPE ── */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">File Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['jpeg', 'png', 'mp4'] as const).map(f => (
              <button key={f} onClick={() => onFormatChange(f)} className={`py-2 rounded-lg text-sm font-medium transition-colors uppercase ${exportFormat === f ? 'bg-purple-500 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>{f}</button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {exportFormat === 'jpeg' ? 'Compressed · good for photos' : exportFormat === 'png' ? 'Lossless · supports transparency' : 'Animated video (WebM)'}
          </p>
        </div>

        {/* Quality */}
        {exportFormat === 'jpeg' && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Quality</label>
              <span className="text-sm text-gray-500">{exportQuality}%</span>
            </div>
            <input type="range" min="60" max="100" value={exportQuality} onChange={(e) => onQualityChange(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>Smaller</span><span>Best</span></div>
          </div>
        )}

        {/* Video Duration */}
        {exportFormat === 'mp4' && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Duration</label>
              <span className="text-sm text-gray-500">{videoDuration}s</span>
            </div>
            <input type="range" min="1" max="10" value={videoDuration} onChange={(e) => onDurationChange(parseInt(e.target.value))} className="w-full" />
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm text-gray-700">Cancel</button>
          <button
            onClick={() => { onExport(); onClose(); }}
            disabled={selectedFormats.length === 0}
            className="flex-1 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {selectedFormats.length === 1 ? 'Export' : `Export ZIP (${selectedFormats.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LayerBasedSocialMediaEditor({ initialFormat = 'story' }: EditorProps) {
  const [format, setFormat] = useState<FormatKey>(initialFormat);
  const [slides, setSlides] = useState<Slide[]>(() => createInitialSlides(initialFormat));
  const [currentSlide, setCurrentSlide] = useState(0);

  // Undo/redo history
  const historyRef = useRef<{ stack: string[]; pointer: number }>({
    stack: [JSON.stringify(createInitialSlides(format))],
    pointer: 0,
  });
  const isDraggingRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback((newSlides: Slide[]) => {
    const h = historyRef.current;
    const json = JSON.stringify(newSlides);
    if (json === h.stack[h.pointer]) return; // no change
    h.stack = h.stack.slice(0, h.pointer + 1);
    h.stack.push(json);
    if (h.stack.length > 50) h.stack.shift();
    h.pointer = h.stack.length - 1;
    setCanUndo(h.pointer > 0);
    setCanRedo(false);
  }, []);

  // Snapshot history after every setSlides (except during drag)
  useEffect(() => {
    if (!isDraggingRef.current) {
      pushHistory(slides);
    }
  }, [slides, pushHistory]);

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (h.pointer <= 0) return;
    h.pointer--;
    const restored = JSON.parse(h.stack[h.pointer]) as Slide[];
    setSlides(restored);
    setCanUndo(h.pointer > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    const h = historyRef.current;
    if (h.pointer >= h.stack.length - 1) return;
    h.pointer++;
    const restored = JSON.parse(h.stack[h.pointer]) as Slide[];
    setSlides(restored);
    setCanUndo(true);
    setCanRedo(h.pointer < h.stack.length - 1);
  }, []);
  // Format change: keep slides but reposition logos
  const handleFormatChange = (newFormat: FormatKey) => {
    const newDims = getDimensions(newFormat);
    setSlides(prev => prev.map(slide => ({
      ...slide,
      layers: slide.layers.map(layer =>
        layer.type === 'logo'
          ? { ...layer, position: { x: newDims.width / 2, y: newDims.height - 60 } }
          : layer
      ),
    })));
    setFormat(newFormat);
  };

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isDraggingLayer, setIsDraggingLayer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapGuides, setSnapGuides] = useState<{ vertical: number | null; horizontal: number | null }>({ vertical: null, horizontal: null });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'jpeg' | 'png' | 'mp4'>('jpeg');
  const [exportQuality, setExportQuality] = useState(95);
  const [videoDuration, setVideoDuration] = useState(5);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('abrakadabra-presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([
    { name: 'LL Kristall (Default)', family: 'LL Kristall' },
    { name: 'Plantin (Default)', family: 'Plantin' },
    { name: 'Georgia', family: 'Georgia, serif' },
    { name: 'Arial', family: 'Arial, sans-serif' },
  ]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [globalLayers, setGlobalLayers] = useState<TextLayer[]>([]);
  const [selectedExportFormats, setSelectedExportFormats] = useState<FormatKey[]>(['story', 'post', 'post-portrait', 'post-landscape', 'linkedin']);
  const slideRef = useRef<HTMLDivElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const dimensions = getDimensions(format);
  const currentSlideData = slides[currentSlide];
  const selectedLayer = currentSlideData.layers.find(l => l.id === selectedLayerId)
    ?? globalLayers.find(gl => gl.id === selectedLayerId);

  // Adjust logo positions when format changes and ensure text layers have animation properties
  useEffect(() => {
    const dims = getDimensions(format);
    const centerX = dims.width / 2;
    const defaultLogoY = dims.height - 60;

    setSlides(prev => {
      const newSlides = prev.map(slide => ({
        ...slide,
        layers: slide.layers.map(layer => {
          // Adjust logo position for new format
          if (layer.type === 'logo') {
            const logoLayer = layer as LogoLayer;
            return {
              ...logoLayer,
              position: {
                x: centerX,
                y: defaultLogoY,
              },
            };
          }
          // Ensure text layers have animation properties
          if (layer.type === 'text') {
            const textLayer = layer as TextLayer;
            return {
              ...textLayer,
              animation: textLayer.animation ?? 'none',
              animationDelay: textLayer.animationDelay ?? 0,
            };
          }
          return layer;
        }),
      }));
      return newSlides;
    });
  }, [format]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const mod = e.metaKey || e.ctrlKey;

      // Undo
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      // Duplicate
      if (mod && e.key === 'd') {
        e.preventDefault();
        if (selectedLayerId) handleDuplicateLayer(selectedLayerId);
        return;
      }
      // Delete selected layer (not bg/logo)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        const layer = currentSlideData.layers.find(l => l.id === selectedLayerId);
        if (layer && layer.type !== 'background' && layer.type !== 'logo') {
          e.preventDefault();
          handleDeleteLayer(selectedLayerId);
        }
        return;
      }
      // Escape — deselect
      if (e.key === 'Escape') {
        setSelectedLayerId(null);
        return;
      }
      // Arrow keys — nudge selected layer
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedLayerId) {
        const layer = currentSlideData.layers.find(l => l.id === selectedLayerId);
        if (!layer || !('position' in layer)) return;
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        const isPercent = layer.type === 'text' || layer.type === 'media';
        const nudge = isPercent ? step : step * (dimensions.width / 100);
        let { x, y } = layer.position;
        if (e.key === 'ArrowUp') y -= nudge;
        if (e.key === 'ArrowDown') y += nudge;
        if (e.key === 'ArrowLeft') x -= nudge;
        if (e.key === 'ArrowRight') x += nudge;
        handleUpdateLayer(selectedLayerId, { position: { x, y } } as Partial<Layer>);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Layer reordering
  const handleReorderLayers = (fromIndex: number, toIndex: number) => {
    setSlides(prev => {
      const newSlides = [...prev];
      const sortedLayers = [...newSlides[currentSlide].layers].sort((a, b) => b.zIndex - a.zIndex);
      
      const [moved] = sortedLayers.splice(fromIndex, 1);
      sortedLayers.splice(toIndex, 0, moved);
      
      // Reassign zIndex
      newSlides[currentSlide].layers = sortedLayers.map((layer, index) => ({
        ...layer,
        zIndex: sortedLayers.length - 1 - index,
      }));
      
      return newSlides;
    });
  };

  // Toggle layer visibility
  const handleToggleVisibility = (layerId: string) => {
    // Check if it's a global layer first
    const isGlobal = globalLayers.some(gl => gl.id === layerId);
    if (isGlobal) {
      setGlobalLayers(prev => prev.map(gl => gl.id === layerId ? { ...gl, visible: !gl.visible } : gl));
      return;
    }
    setSlides(prev => {
      const newSlides = [...prev];
      const layerIndex = newSlides[currentSlide].layers.findIndex(l => l.id === layerId);
      if (layerIndex >= 0) {
        newSlides[currentSlide].layers[layerIndex].visible = !newSlides[currentSlide].layers[layerIndex].visible;
      }
      return newSlides;
    });
  };

  // Delete layer
  const handleDeleteLayer = (layerId: string) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[currentSlide].layers = newSlides[currentSlide].layers.filter(l => l.id !== layerId);
      return newSlides;
    });
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  // Duplicate layer
  const handleDuplicateLayer = (layerId: string) => {
    const layer = currentSlideData.layers.find(l => l.id === layerId);
    if (!layer || layer.type === 'background' || layer.type === 'logo') return;

    const maxZIndex = Math.max(...currentSlideData.layers.filter(l => l.type !== 'logo').map(l => l.zIndex), 0);
    const newLayer = {
      ...structuredClone(layer),
      id: `${layer.type}-${Date.now()}`,
      name: `${layer.name} (copy)`,
      zIndex: maxZIndex + 1,
      position: {
        x: (layer as TextLayer | MediaLayer).position.x + 3,
        y: (layer as TextLayer | MediaLayer).position.y + 3,
      },
    };

    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[currentSlide].layers.push(newLayer);
      // Keep pinned logo on top
      const logoLayer = newSlides[currentSlide].layers.find(l => l.type === 'logo' && (l as LogoLayer).pinned) as LogoLayer | undefined;
      if (logoLayer) {
        const logoIdx = newSlides[currentSlide].layers.findIndex(l => l.id === logoLayer.id);
        if (logoIdx >= 0) newSlides[currentSlide].layers[logoIdx].zIndex = Math.max(...newSlides[currentSlide].layers.map(l => l.zIndex)) + 1;
      }
      return newSlides;
    });
    setSelectedLayerId(newLayer.id);
  };

  // Apply to All — Background
  const handleApplyBgToAll = () => {
    const bgLayer = currentSlideData.layers.find(l => l.type === 'background') as BackgroundLayer | undefined;
    if (!bgLayer) return;
    setSlides(prev => prev.map(slide => ({
      ...slide,
      layers: slide.layers.map(l => l.type === 'background' ? { ...l, color: bgLayer.color } : l),
    })));
  };

  // Apply to All — Text (font family + color)
  const handleApplyTextToAll = () => {
    const textLayer = selectedLayer as TextLayer | undefined;
    if (!textLayer || textLayer.type !== 'text') return;
    const { fontFamily, color, fontSize } = textLayer;
    setSlides(prev => prev.map(slide => ({
      ...slide,
      layers: slide.layers.map(l => l.type === 'text' ? { ...l, fontFamily, color, fontSize } : l),
    })));
  };

  // Apply to All — Logo (size, opacity, filter)
  const handleApplyLogoToAll = () => {
    const logoLayer = selectedLayer as LogoLayer | undefined;
    if (!logoLayer || logoLayer.type !== 'logo') return;
    const { size, opacity, filter } = logoLayer;
    setSlides(prev => prev.map(slide => ({
      ...slide,
      layers: slide.layers.map(l => l.type === 'logo' ? { ...l, size, opacity, filter } : l),
    })));
  };

  // Media layout presets — arrange media layers on current slide
  const handleApplyMediaLayout = (layout: 'full-bleed' | 'diptych-side' | 'diptych-stack' | 'photo-space' | 'triptych') => {
    const configs: Record<string, Array<{ x: number; y: number; scale: number }>> = {
      'full-bleed': [{ x: 50, y: 50, scale: 100 }],
      'diptych-side': [{ x: 25, y: 30, scale: 48 }, { x: 75, y: 30, scale: 48 }],
      'diptych-stack': [{ x: 50, y: 25, scale: 95 }, { x: 50, y: 75, scale: 95 }],
      'photo-space': [{ x: 50, y: 30, scale: 95 }],
      'triptych': [{ x: 17, y: 30, scale: 32 }, { x: 50, y: 30, scale: 32 }, { x: 83, y: 30, scale: 32 }],
    };
    const positions = configs[layout];
    if (!positions) return;

    setSlides(prev => {
      const newSlides = [...prev];
      const slide = { ...newSlides[currentSlide], layers: [...newSlides[currentSlide].layers] };
      const existingMedia = slide.layers.filter(l => l.type === 'media') as MediaLayer[];
      const logoLayer = slide.layers.find(l => l.type === 'logo') as LogoLayer | undefined;
      const maxZ = Math.max(...slide.layers.filter(l => l.type !== 'logo').map(l => l.zIndex), 0);

      // Reposition existing media or create new placeholders
      positions.forEach((pos, i) => {
        if (i < existingMedia.length) {
          const idx = slide.layers.findIndex(l => l.id === existingMedia[i].id);
          slide.layers[idx] = { ...existingMedia[i], position: { x: pos.x, y: pos.y }, scale: pos.scale };
        } else {
          slide.layers.push({
            id: `media-layout-${Date.now()}-${i}`,
            type: 'media',
            zIndex: maxZ + 1 + i,
            visible: true,
            name: `Image ${i + 1}`,
            url: '',
            mediaType: 'image',
            scale: pos.scale,
            position: { x: pos.x, y: pos.y },
          } as MediaLayer);
        }
      });

      // Keep logo on top
      if (logoLayer && logoLayer.pinned) {
        const logoIdx = slide.layers.findIndex(l => l.id === logoLayer.id);
        if (logoIdx >= 0) slide.layers[logoIdx] = { ...slide.layers[logoIdx], zIndex: Math.max(...slide.layers.map(l => l.zIndex)) + 1 };
      }
      newSlides[currentSlide] = slide;
      return newSlides;
    });
  };

  // Slide management
  const handleAddSlide = () => {
    const dims = dimensions;
    const ts = Date.now();
    const newSlide: Slide = {
      id: ts,
      layers: [
        { id: `bg-${ts}`, type: 'background', zIndex: 0, visible: true, name: 'Background', color: '#FFFFFF' } as BackgroundLayer,
        { id: `logo-${ts}`, type: 'logo', zIndex: 10, visible: true, name: 'Logo',
          position: { x: dims.width / 2, y: dims.height - 60 }, size: 28, pinned: true,
          animation: 'none' as const, opacity: 1, filter: 'none' as const } as LogoLayer,
      ],
    };
    setSlides(prev => {
      const s = [...prev];
      s.splice(currentSlide + 1, 0, newSlide);
      return s;
    });
    setCurrentSlide(prev => prev + 1);
    setSelectedLayerId(null);
  };

  const handleDuplicateSlide = () => {
    const ts = Date.now();
    const source = slides[currentSlide];
    const newSlide: Slide = {
      id: ts,
      frameWidth: source.frameWidth,
      frameColor: source.frameColor,
      layers: source.layers.map(l => ({ ...l, id: `${l.id}-dup-${ts}` })),
    };
    setSlides(prev => {
      const s = [...prev];
      s.splice(currentSlide + 1, 0, newSlide);
      return s;
    });
    setCurrentSlide(prev => prev + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    setCurrentSlide(prev => Math.min(prev, slides.length - 2));
  };

  // Slide frame
  const updateSlideFrame = (updates: { frameWidth?: number; frameColor?: string }) => {
    setSlides(prev => {
      const s = [...prev];
      s[currentSlide] = { ...s[currentSlide], ...updates };
      return s;
    });
  };

  // Pin text layer to global layers (appears on all slides)
  const handlePinTextLayer = (layerId: string) => {
    // Check if already global (unpin case)
    const existingGlobal = globalLayers.find(gl => gl.id === layerId);
    if (existingGlobal) {
      // Unpin: remove from global, return to current slide
      setGlobalLayers(prev => prev.filter(gl => gl.id !== layerId));
      setSlides(sp => {
        const ns = [...sp];
        ns[currentSlide] = { ...ns[currentSlide], layers: [...ns[currentSlide].layers, { ...existingGlobal, pinned: false }] };
        return ns;
      });
      return;
    }
    // Pin: must find in current slide
    const layer = currentSlideData.layers.find(l => l.id === layerId) as TextLayer | undefined;
    if (!layer || layer.type !== 'text') return;
    const pinnedLayer: TextLayer = { ...layer, pinned: true };
    // Remove from slide, add to global
    setSlides(sp => {
      const ns = [...sp];
      ns[currentSlide] = { ...ns[currentSlide], layers: ns[currentSlide].layers.filter(l => l.id !== layerId) };
      return ns;
    });
    setGlobalLayers(prev => [...prev, pinnedLayer]);
    setSelectedLayerId(layerId);
  };

  // Panoramic split — split current media across two slides
  const handlePanoramicSplit = () => {
    if (!selectedLayerId) return;
    const layer = currentSlideData.layers.find(l => l.id === selectedLayerId);
    if (!layer || layer.type !== 'media') return;
    const mediaLayer = layer as MediaLayer;
    if (!mediaLayer.url) return;

    setSlides(prev => {
      const newSlides = [...prev];
      // Set current slide media to left-half
      const layerIdx = newSlides[currentSlide].layers.findIndex(l => l.id === selectedLayerId);
      if (layerIdx >= 0) {
        newSlides[currentSlide].layers[layerIdx] = { ...newSlides[currentSlide].layers[layerIdx], crop: 'left-half' } as MediaLayer;
      }
      // Create or update next slide with right-half
      const nextIdx = currentSlide + 1;
      if (nextIdx >= newSlides.length) {
        // Add a new slide
        const dims = getDimensions(format);
        newSlides.push({
          id: newSlides.length + 1,
          layers: [
            { id: `bg-pano-${Date.now()}`, type: 'background', zIndex: 0, visible: true, name: 'Background', color: '#FFFFFF' } as BackgroundLayer,
            { ...mediaLayer, id: `media-pano-${Date.now()}`, crop: 'right-half', name: 'Image (Right)' } as MediaLayer,
            { id: `logo-pano-${Date.now()}`, type: 'logo', zIndex: 10, visible: true, name: 'Logo', position: { x: dims.width / 2, y: dims.height - 60 }, size: 28, pinned: true, animation: 'none' as const, opacity: 1, filter: 'none' as const } as LogoLayer,
          ],
        });
      } else {
        // Add right-half media to existing next slide
        const maxZ = Math.max(...newSlides[nextIdx].layers.filter(l => l.type !== 'logo').map(l => l.zIndex), 0);
        newSlides[nextIdx].layers.push({
          ...mediaLayer,
          id: `media-pano-${Date.now()}`,
          zIndex: maxZ + 1,
          crop: 'right-half',
          name: 'Image (Right)',
        } as MediaLayer);
      }
      return newSlides;
    });
  };

  // Toggle pin
  const handleTogglePin = (layerId: string) => {
    setSlides(prev => {
      const newSlides = [...prev];
      const logoLayer = newSlides[currentSlide].layers.find(l => l.id === layerId && l.type === 'logo') as LogoLayer | undefined;
      
      if (logoLayer) {
        const newPinnedState = !logoLayer.pinned;
        
        // Update the pinned state
        const layerIndex = newSlides[currentSlide].layers.findIndex(l => l.id === layerId);
        if (layerIndex >= 0) {
          (newSlides[currentSlide].layers[layerIndex] as LogoLayer).pinned = newPinnedState;
        }
        
        // If pinning, ensure logo has highest zIndex
        if (newPinnedState) {
          const maxZIndex = Math.max(...newSlides[currentSlide].layers.map(l => l.zIndex));
          if (layerIndex >= 0) {
            newSlides[currentSlide].layers[layerIndex].zIndex = maxZIndex + 1;
          }
        }
      }
      
      return newSlides;
    });
  };

  // Update layer
  const handleUpdateLayer = (layerId: string, updates: Partial<Layer>) => {
    // Check global layers first
    const isGlobal = globalLayers.some(gl => gl.id === layerId);
    if (isGlobal) {
      setGlobalLayers(prev => prev.map(gl => gl.id === layerId ? { ...gl, ...updates } as TextLayer : gl));
      return;
    }
    setSlides(prev => {
      const newSlides = [...prev];
      const layerIndex = newSlides[currentSlide].layers.findIndex(l => l.id === layerId);
      if (layerIndex >= 0) {
        newSlides[currentSlide].layers[layerIndex] = {
          ...newSlides[currentSlide].layers[layerIndex],
          ...updates,
        };
      }
      return newSlides;
    });
  };

  // Add text layer
  const handleAddTextLayer = () => {
    const logoLayer = currentSlideData.layers.find(l => l.type === 'logo') as LogoLayer | undefined;
    const maxNonLogoZIndex = Math.max(
      ...currentSlideData.layers
        .filter(l => l.type !== 'logo')
        .map(l => l.zIndex),
      0
    );
    
    const newLayer: TextLayer = {
      id: `text-${Date.now()}`,
      type: 'text',
      zIndex: maxNonLogoZIndex + 1,
      visible: true,
      name: 'New Text',
      content: 'Double click to edit',
      position: { x: 7, y: 7 },
      fontSize: 24,
      fontFamily: 'Plantin',
      fontWeight: 400,
      fontStyle: 'normal',
      color: colors.black,
      textAlign: 'left',
      lineHeight: 1.4,
      letterSpacing: 0,
      width: 65,
      animation: 'none',
      animationDelay: 0,
    };
    
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[currentSlide].layers.push(newLayer);
      
      // If logo is pinned, ensure it stays on top
      if (logoLayer && logoLayer.pinned) {
        const logoIndex = newSlides[currentSlide].layers.findIndex(l => l.id === logoLayer.id);
        if (logoIndex >= 0) {
          const maxZIndex = Math.max(...newSlides[currentSlide].layers.map(l => l.zIndex));
          newSlides[currentSlide].layers[logoIndex].zIndex = maxZIndex + 1;
        }
      }
      
      return newSlides;
    });
    setSelectedLayerId(newLayer.id);
  };

  // Add media layer
  const handleAddMediaLayer = (url: string, mediaType: 'image' | 'video') => {
    const logoLayer = currentSlideData.layers.find(l => l.type === 'logo') as LogoLayer | undefined;
    const maxNonLogoZIndex = Math.max(
      ...currentSlideData.layers
        .filter(l => l.type !== 'logo')
        .map(l => l.zIndex),
      0
    );
    
    const newLayer: MediaLayer = {
      id: `media-${Date.now()}`,
      type: 'media',
      zIndex: maxNonLogoZIndex + 1,
      visible: true,
      name: mediaType === 'image' ? 'Image' : 'Video',
      url,
      mediaType,
      scale: 100,
      position: { x: 50, y: 50 },
    };
    
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[currentSlide].layers.push(newLayer);
      
      // If logo is pinned, ensure it stays on top
      if (logoLayer && logoLayer.pinned) {
        const logoIndex = newSlides[currentSlide].layers.findIndex(l => l.id === logoLayer.id);
        if (logoIndex >= 0) {
          const maxZIndex = Math.max(...newSlides[currentSlide].layers.map(l => l.zIndex));
          newSlides[currentSlide].layers[logoIndex].zIndex = maxZIndex + 1;
        }
      }
      
      return newSlides;
    });
    setSelectedLayerId(newLayer.id);
  };

  // File upload — supports multiple files; fills empty placeholder for first file if selected
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    files.forEach((file, i) => {
      const url = URL.createObjectURL(file);
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      if (i === 0) {
        const selectedLayer = currentSlideData.layers.find(l => l.id === selectedLayerId);
        if (selectedLayer?.type === 'media' && (selectedLayer as MediaLayer).url === '') {
          // Fill the empty placeholder with the first file
          setSlides(prev => {
            const newSlides = [...prev];
            const slide = { ...newSlides[currentSlide], layers: [...newSlides[currentSlide].layers] };
            const idx = slide.layers.findIndex(l => l.id === selectedLayerId);
            if (idx >= 0) slide.layers[idx] = { ...slide.layers[idx], url, mediaType } as MediaLayer;
            newSlides[currentSlide] = slide;
            return newSlides;
          });
          setMediaLibrary(prev => [...prev, { id: `media-${Date.now()}-${i}`, url, type: mediaType, name: file.name }]);
          return;
        }
      }
      // All other files: add as new layers
      handleAddMediaLayer(url, mediaType);
      setMediaLibrary(prev => [...prev, { id: `media-${Date.now()}-${i}`, url, type: mediaType, name: file.name }]);
    });

    // Reset input so same files can be re-selected
    e.target.value = '';
  };

  // Font upload
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
    const fontFamily = fontName.replace(/[^a-zA-Z0-9]/g, '');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const fontFace = new FontFace(fontFamily, `url(${result})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        setCustomFonts(prev => [...prev, { 
          name: fontName, 
          family: fontFamily 
        }]);
        alert(`Font "${fontName}" uploaded successfully!`);
      }).catch(() => {
        alert('Failed to load font. Please try a different file.');
      });
    };
    reader.readAsDataURL(file);
  };

  // Bulk image drop — drop N images, auto-assign one per slide
  const [isBulkDragOver, setIsBulkDragOver] = useState(false);

  const handleBulkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBulkDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const applied = Math.min(files.length, slides.length);
    const skipped = files.length - applied;

    setSlides(prev => {
      const newSlides = [...prev];
      for (let i = 0; i < applied; i++) {
        const url = URL.createObjectURL(files[i]);
        const existingMedia = newSlides[i].layers.find(l => l.type === 'media');
        if (existingMedia && existingMedia.type === 'media') {
          // Replace existing media URL
          const idx = newSlides[i].layers.indexOf(existingMedia);
          newSlides[i].layers[idx] = { ...existingMedia, url } as MediaLayer;
        } else {
          // Add new media layer
          const logoLayer = newSlides[i].layers.find(l => l.type === 'logo') as LogoLayer | undefined;
          const maxZIndex = Math.max(...newSlides[i].layers.filter(l => l.type !== 'logo').map(l => l.zIndex), 0);
          const newLayer: MediaLayer = {
            id: `media-bulk-${Date.now()}-${i}`,
            type: 'media',
            zIndex: maxZIndex + 1,
            visible: true,
            name: files[i].name,
            url,
            mediaType: 'image',
            scale: 100,
            position: { x: 50, y: 50 },
          };
          newSlides[i].layers.push(newLayer);
          if (logoLayer && logoLayer.pinned) {
            const logoIdx = newSlides[i].layers.findIndex(l => l.id === logoLayer.id);
            if (logoIdx >= 0) {
              newSlides[i].layers[logoIdx].zIndex = Math.max(...newSlides[i].layers.map(l => l.zIndex)) + 1;
            }
          }
        }

        // Add to media library
        setMediaLibrary(prev => [...prev, {
          id: `media-lib-${Date.now()}-${i}`,
          url: URL.createObjectURL(files[i]),
          type: 'image',
          name: files[i].name,
        }]);
      }
      return newSlides;
    });

    if (skipped > 0) {
      alert(`${applied} images applied to slides. ${skipped} image${skipped > 1 ? 's' : ''} skipped — only ${slides.length} slides available.`);
    }
  };

  // Add media from library — fills empty placeholder if one is selected
  const handleAddFromLibrary = (mediaItem: MediaItem) => {
    const selectedLayer = currentSlideData.layers.find(l => l.id === selectedLayerId);
    if (selectedLayer?.type === 'media' && (selectedLayer as MediaLayer).url === '') {
      setSlides(prev => {
        const newSlides = [...prev];
        const slide = { ...newSlides[currentSlide], layers: [...newSlides[currentSlide].layers] };
        const idx = slide.layers.findIndex(l => l.id === selectedLayerId);
        if (idx >= 0) slide.layers[idx] = { ...slide.layers[idx], url: mediaItem.url, mediaType: mediaItem.type } as MediaLayer;
        newSlides[currentSlide] = slide;
        return newSlides;
      });
    } else {
      handleAddMediaLayer(mediaItem.url, mediaItem.type);
    }
    setShowMediaLibrary(false);
  };

  // Delete from media library
  const handleDeleteFromLibrary = (id: string) => {
    setMediaLibrary(prev => prev.filter(item => item.id !== id));
  };

  // Layer dragging
  const handleLayerMouseDown = (e: React.MouseEvent, layer: Layer) => {
    if (layer.type === 'background') return;
    
    e.stopPropagation();
    setSelectedLayerId(layer.id);
    setIsDraggingLayer(layer.id);
    isDraggingRef.current = true;
    
    if ((layer.type === 'text' || layer.type === 'media' || layer.type === 'logo') && slideRef.current) {
      const rect = slideRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (layer.type === 'text' || layer.type === 'media') {
        // Positions are in %, convert to px for drag offset
        const layerPxX = (layer.position.x / 100) * rect.width;
        const layerPxY = (layer.position.y / 100) * rect.height;
        setDragOffset({
          x: mouseX - layerPxX,
          y: mouseY - layerPxY,
        });
      } else {
        // Logo positions are in px
        setDragOffset({
          x: mouseX - layer.position.x,
          y: mouseY - layer.position.y,
        });
      }
    }
  };

  // Snap points in % for text/media, px for logo
  // Safe area zones (percentage from edge)
  const getSafeAreaZones = (fmt: string) => {
    switch (fmt) {
      case 'story': return { topDanger: 14, bottomDanger: 10 };
      default: return { topDanger: 0, bottomDanger: 0 };
    }
  };
  const safeAreas = getSafeAreaZones(format);

  const SNAP_THRESHOLD = 1.5; // percentage units
  const SNAP_POINTS_BASE = [5, 50, 95];
  const SNAP_POINTS = showSafeArea && safeAreas.topDanger > 0
    ? [...SNAP_POINTS_BASE, safeAreas.topDanger, 100 - safeAreas.bottomDanger]
    : SNAP_POINTS_BASE;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingLayer || !slideRef.current) return;

    const rect = slideRef.current.getBoundingClientRect();
    const pxX = e.clientX - rect.left - dragOffset.x;
    const pxY = e.clientY - rect.top - dragOffset.y;

    const draggedLayer = currentSlideData.layers.find(l => l.id === isDraggingLayer)
      ?? globalLayers.find(gl => gl.id === isDraggingLayer);
    if (draggedLayer && (draggedLayer.type === 'text' || draggedLayer.type === 'media')) {
      let x = (pxX / rect.width) * 100;
      let y = (pxY / rect.height) * 100;
      let vSnap: number | null = null;
      let hSnap: number | null = null;
      for (const sp of SNAP_POINTS) {
        if (Math.abs(x - sp) < SNAP_THRESHOLD) { x = sp; vSnap = sp; }
        if (Math.abs(y - sp) < SNAP_THRESHOLD) { y = sp; hSnap = sp; }
      }
      setSnapGuides({ vertical: vSnap, horizontal: hSnap });
      handleUpdateLayer(isDraggingLayer, { position: { x, y } } as Partial<Layer>);
    } else {
      // Logo: snap in px (convert snap points from %)
      let x = pxX;
      let y = pxY;
      let vSnap: number | null = null;
      let hSnap: number | null = null;
      for (const sp of SNAP_POINTS) {
        const spPxX = (sp / 100) * dimensions.width;
        const spPxY = (sp / 100) * dimensions.height;
        const threshPx = (SNAP_THRESHOLD / 100) * dimensions.width;
        if (Math.abs(x - spPxX) < threshPx) { x = spPxX; vSnap = sp; }
        if (Math.abs(y - spPxY) < threshPx) { y = spPxY; hSnap = sp; }
      }
      setSnapGuides({ vertical: vSnap, horizontal: hSnap });
      handleUpdateLayer(isDraggingLayer, { position: { x, y } } as Partial<Layer>);
    }
  };

  const handleMouseUp = () => {
    setSnapGuides({ vertical: null, horizontal: null });
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      pushHistory(slides); // snapshot final drag position
    }
    setIsDraggingLayer(null);
  };

  // Render all layers onto a canvas at export dimensions
  // Merge global layers into a slide for rendering/export
  const mergeGlobalLayers = (slideData: Slide): Slide => {
    if (!globalLayers.length) return slideData;
    const logoLayers = slideData.layers.filter(l => l.type === 'logo');
    const maxLogoZ = logoLayers.length ? Math.max(...logoLayers.map(l => l.zIndex)) : 0;
    const merged = globalLayers.map((gl, i) => ({ ...gl, zIndex: maxLogoZ - 1 - i }));
    return { ...slideData, layers: [...slideData.layers, ...merged] };
  };

  // previewDims overrides the base dimensions used for scale calculation (for ZIP multi-format export)
  const renderSlideToCanvas = async (slideData: Slide, exportDims: { width: number; height: number }, canvas: HTMLCanvasElement, previewDims?: { width: number; height: number }) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    const baseDims = previewDims || dimensions;
    const scale = exportDims.width / baseDims.width;

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number, fontWeight: number, fontStyle: string, fontFamily: string): string[] => {
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      const lines: string[] = [];
      const paragraphs = text.split('\n');
      paragraphs.forEach(paragraph => {
        if (!paragraph) { lines.push(''); return; }
        const words = paragraph.split(' ');
        let currentLine = '';
        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);
      });
      return lines;
    };

    // Render background
    const bgLayer = slideData.layers.find(l => l.type === 'background' && l.visible) as BackgroundLayer | undefined;
    if (bgLayer) {
      ctx.fillStyle = bgLayer.color;
      ctx.fillRect(0, 0, exportDims.width, exportDims.height);
    }

    // Sort and render layers
    const sortedLayers = [...slideData.layers]
      .filter(l => l.visible && l.type !== 'background')
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      if (layer.type === 'text') {
        const textLayer = layer as TextLayer;
        ctx.save();
        const fontSize = textLayer.fontSize * scale;
        const fontFamily = textLayer.fontFamily === 'LL Kristall' ? 'LL Kristall, sans-serif' : 'Plantin, serif';
        ctx.font = `${textLayer.fontStyle} ${textLayer.fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textLayer.color;
        const maxWidth = (textLayer.width / 100) * exportDims.width;
        const lines = wrapText(textLayer.content, maxWidth, fontSize, textLayer.fontWeight, textLayer.fontStyle, fontFamily);
        const lineHeight = fontSize * textLayer.lineHeight;
        let x = (textLayer.position.x / 100) * exportDims.width;
        let y = (textLayer.position.y / 100) * exportDims.height;

        // Text background
        if (textLayer.textBackground && textLayer.textBackground !== 'none') {
          const totalH = lines.length * lineHeight;
          const pad = 8 * scale;
          ctx.save();
          ctx.globalAlpha = textLayer.textBackgroundOpacity ?? 0.5;
          ctx.fillStyle = textLayer.textBackgroundColor ?? '#000000';
          if (textLayer.textBackground === 'pill') {
            const r = totalH / 2 + pad;
            const rx = x - pad * 2;
            const ry = y - pad;
            const rw = maxWidth + pad * 4;
            const rh = totalH + pad * 2;
            ctx.beginPath();
            ctx.roundRect(rx, ry, rw, rh, r);
            ctx.fill();
          } else {
            ctx.fillRect(x - pad, y - pad, maxWidth + pad * 2, lines.length * lineHeight + pad * 2);
          }
          ctx.restore();
          ctx.fillStyle = textLayer.color;
        }

        const isSpreadExport = textLayer.textAlign === 'justify-spread';
        if (isSpreadExport) {
          // Justify-spread: distribute words evenly across maxWidth
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          lines.forEach((line, i) => {
            const yPos = y + (i * lineHeight);
            const words = line.split(/\s+/).filter(Boolean);
            if (words.length <= 1) {
              ctx.fillText(line, x, yPos);
              return;
            }
            const totalWordsWidth = words.reduce((sum, w) => sum + ctx.measureText(w).width, 0);
            const gap = (maxWidth - totalWordsWidth) / (words.length - 1);
            let xPos = x;
            words.forEach((word) => {
              ctx.fillText(word, xPos, yPos);
              xPos += ctx.measureText(word).width + gap;
            });
          });
        } else if (textLayer.textAlign === 'center') {
          ctx.textAlign = 'center';
          x += maxWidth / 2;
          ctx.textBaseline = 'top';
          if (textLayer.letterSpacing !== 0) {
            lines.forEach((line, i) => {
              const yPos = y + (i * lineHeight);
              const totalWidth = ctx.measureText(line).width + (line.length - 1) * textLayer.letterSpacing * scale;
              let xPos = x - totalWidth / 2;
              ctx.textAlign = 'left';
              for (let j = 0; j < line.length; j++) {
                ctx.fillText(line[j], xPos, yPos);
                xPos += ctx.measureText(line[j]).width + textLayer.letterSpacing * scale;
              }
            });
          } else {
            lines.forEach((line, i) => ctx.fillText(line, x, y + (i * lineHeight)));
          }
        } else if (textLayer.textAlign === 'right') {
          ctx.textAlign = 'right';
          x += maxWidth;
          ctx.textBaseline = 'top';
          if (textLayer.letterSpacing !== 0) {
            lines.forEach((line, i) => {
              const yPos = y + (i * lineHeight);
              const totalWidth = ctx.measureText(line).width + (line.length - 1) * textLayer.letterSpacing * scale;
              let xPos = x - totalWidth;
              ctx.textAlign = 'left';
              for (let j = 0; j < line.length; j++) {
                ctx.fillText(line[j], xPos, yPos);
                xPos += ctx.measureText(line[j]).width + textLayer.letterSpacing * scale;
              }
            });
          } else {
            lines.forEach((line, i) => ctx.fillText(line, x, y + (i * lineHeight)));
          }
        } else {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          if (textLayer.letterSpacing !== 0) {
            lines.forEach((line, i) => {
              const yPos = y + (i * lineHeight);
              let xPos = x;
              for (let j = 0; j < line.length; j++) {
                ctx.fillText(line[j], xPos, yPos);
                xPos += ctx.measureText(line[j]).width + textLayer.letterSpacing * scale;
              }
            });
          } else {
            lines.forEach((line, i) => ctx.fillText(line, x, y + (i * lineHeight)));
          }
        }
        ctx.restore();
      } else if (layer.type === 'media') {
        const mediaLayer = layer as MediaLayer;
        if (mediaLayer.mediaType === 'image') {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              ctx.save();

              const imgWidth = (mediaLayer.scale / 100) * exportDims.width;
              const imgHeight = (mediaLayer.scale / 100) * exportDims.height;
              const cx = (mediaLayer.position.x / 100) * exportDims.width;
              const cy = (mediaLayer.position.y / 100) * exportDims.height;

              // Opacity
              ctx.globalAlpha = (mediaLayer.opacity ?? 100) / 100;

              // Shadow
              if (mediaLayer.shadow) {
                ctx.shadowColor = mediaLayer.shadowColor ?? '#000000';
                ctx.shadowBlur = (mediaLayer.shadowBlur ?? 20) * scale;
              }

              // Translate to center, apply rotation & flip
              ctx.translate(cx, cy);
              const rot = ((mediaLayer.rotation ?? 0) * Math.PI) / 180;
              if (rot !== 0) ctx.rotate(rot);
              if (mediaLayer.flipH) ctx.scale(-1, 1);
              if (mediaLayer.flipV) ctx.scale(1, -1);

              const bw = (mediaLayer.borderWidth ?? 0) * scale;
              const drawW = imgWidth - bw * 2;
              const drawH = imgHeight - bw * 2;

              // Corner radius clipping
              const cr = (mediaLayer.cornerRadius ?? 0) * scale;
              if (cr > 0) {
                ctx.beginPath();
                ctx.roundRect(-imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight, cr);
                ctx.clip();
              }

              // Border fill
              if (bw > 0) {
                ctx.fillStyle = mediaLayer.borderColor ?? '#ffffff';
                ctx.fillRect(-imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
              }

              const dstX = -imgWidth / 2 + bw;
              const dstY = -imgHeight / 2 + bw;

              // Apply filter
              const f = mediaLayer.filter ?? 'none';
              if (f === 'blur') ctx.filter = 'blur(12px)';
              else if (f === 'grayscale') ctx.filter = 'grayscale(100%)';
              else if (f === 'sepia') ctx.filter = 'sepia(100%)';
              else if (f === 'brightness') ctx.filter = 'brightness(1.4)';

              // Draw image with crop / fit
              const crop = mediaLayer.crop ?? 'full';
              const fit = mediaLayer.objectFit ?? 'cover';

              if (crop === 'left-half') {
                ctx.drawImage(img, 0, 0, img.width / 2, img.height, dstX, dstY, drawW, drawH);
              } else if (crop === 'right-half') {
                ctx.drawImage(img, img.width / 2, 0, img.width / 2, img.height, dstX, dstY, drawW, drawH);
              } else if (crop === 'top-half') {
                ctx.drawImage(img, 0, 0, img.width, img.height / 2, dstX, dstY, drawW, drawH);
              } else if (crop === 'bottom-half') {
                ctx.drawImage(img, 0, img.height / 2, img.width, img.height / 2, dstX, dstY, drawW, drawH);
              } else if (fit === 'contain') {
                const imgAspect = img.width / img.height;
                const dstAspect = drawW / drawH;
                let lw: number, lh: number, lx: number, ly: number;
                if (imgAspect > dstAspect) {
                  lw = drawW; lh = drawW / imgAspect;
                  lx = dstX; ly = dstY + (drawH - lh) / 2;
                } else {
                  lh = drawH; lw = drawH * imgAspect;
                  lx = dstX + (drawW - lw) / 2; ly = dstY;
                }
                ctx.drawImage(img, lx, ly, lw, lh);
              } else {
                const pad = f === 'blur' ? 20 : 0;
                ctx.drawImage(img, dstX - pad, dstY - pad, drawW + pad * 2, drawH + pad * 2);
              }
              ctx.filter = 'none';
              ctx.shadowBlur = 0;

              // Overlay
              const ov = mediaLayer.overlay ?? 'none';
              if (ov === 'dark') {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(dstX, dstY, drawW, drawH);
              } else if (ov === 'light') {
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(dstX, dstY, drawW, drawH);
              } else if (ov === 'gradient') {
                const grad = ctx.createLinearGradient(dstX, dstY, dstX, dstY + drawH);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.3, 'transparent');
                grad.addColorStop(1, 'rgba(0,0,0,0.7)');
                ctx.fillStyle = grad;
                ctx.fillRect(dstX, dstY, drawW, drawH);
              }

              ctx.restore();
              resolve();
            };
            img.onerror = () => resolve();
            img.src = mediaLayer.url;
          });
        }
      } else if (layer.type === 'logo') {
        const logoLayer = layer as LogoLayer;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.save();
            ctx.globalAlpha = logoLayer.opacity ?? 1;
            const logoHeight = (logoLayer.size ?? 24) * scale;
            const logoWidth = (img.width / img.height) * logoHeight;
            const x = logoLayer.position.x * scale - logoWidth / 2;
            const y = logoLayer.position.y * scale - logoHeight / 2;
            if (logoLayer.filter === 'invert') ctx.filter = 'invert(1)';
            else if (logoLayer.filter === 'brightness') ctx.filter = 'brightness(1.5)';
            else if (logoLayer.filter === 'contrast') ctx.filter = 'contrast(1.5)';
            else if (logoLayer.filter === 'grayscale') ctx.filter = 'grayscale(1)';
            ctx.drawImage(img, x, y, logoWidth, logoHeight);
            ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = logo;
        });
      }
    }

    // Draw slide frame (drawn last, on top of everything)
    const fw = (slideData.frameWidth ?? 0) * scale;
    if (fw > 0) {
      ctx.fillStyle = slideData.frameColor ?? '#ffffff';
      ctx.fillRect(0, 0, exportDims.width, fw);
      ctx.fillRect(0, exportDims.height - fw, exportDims.width, fw);
      ctx.fillRect(0, 0, fw, exportDims.height);
      ctx.fillRect(exportDims.width - fw, 0, fw, exportDims.height);
    }
  };

  // Video export using MediaRecorder
  const handleVideoExport = async () => {
    try {
      const exportDims = getExportDimensions(format);

      // Create canvas for video capture
      const canvas = document.createElement('canvas');
      canvas.width = exportDims.width;
      canvas.height = exportDims.height;

      // Render all layers onto the canvas
      await renderSlideToCanvas(mergeGlobalLayers(currentSlideData), exportDims, canvas);

      // Capture stream from canvas
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 5000000, // 5 Mbps
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `abrakadabra-slide-${currentSlide + 1}.webm`;
        link.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();

      // Redraw frames for animation support
      const fps = 30;
      const totalFrames = videoDuration * fps;
      let frame = 0;
      const drawFrame = () => {
        if (frame < totalFrames) {
          // Re-render the static frame (future: animate layers per frame)
          frame++;
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };
      drawFrame();
    } catch (error) {
      console.error('Video export failed:', error);
      alert(`Video export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ZIP / multi-format export: renders all slides in selected formats
  const handleZipExport = async () => {
    const zip = new JSZip();

    const zipFormats = selectedExportFormats.map(f => ({
      folder: f.replace('post-', '').replace('-', '_'),
      format: f,
    }));

    for (const { folder, format: fmt } of zipFormats) {
      const exportDims = getExportDimensions(fmt);
      const fmtDims = getDimensions(fmt);
      const fmtCenterX = fmtDims.width / 2;
      const fmtCenterY = fmtDims.height / 2;
      const fmtDefaultLogoY = fmtDims.height - 60;

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // Adjust logo positions for this format
        const adjustedSlide: Slide = {
          ...slide,
          layers: slide.layers.map(layer => {
            if (layer.type === 'logo') {
              return { ...layer, position: { x: fmtCenterX, y: fmtDefaultLogoY } };
            }
            return layer;
          }),
        };

        const canvas = document.createElement('canvas');
        canvas.width = exportDims.width;
        canvas.height = exportDims.height;

        await renderSlideToCanvas(mergeGlobalLayers(adjustedSlide), exportDims, canvas, fmtDims);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        const arrayBuf = await blob.arrayBuffer();
        zip.file(`${folder}/slide-${i + 1}.png`, arrayBuf);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'abrakadabra-social-media.zip';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Preset handlers
  const handleSavePreset = (name: string) => {
    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name,
      slides: JSON.parse(JSON.stringify(slides)), // Deep copy
      createdAt: Date.now(),
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('abrakadabra-presets', JSON.stringify(updatedPresets));
  };

  const handleLoadPreset = (preset: Preset) => {
    setSlides(JSON.parse(JSON.stringify(preset.slides))); // Deep copy
    setCurrentSlide(0);
    setSelectedLayerId(null);
  };

  const handleDeletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    localStorage.setItem('abrakadabra-presets', JSON.stringify(updatedPresets));
  };

  // Export — routes to ZIP if multiple formats selected, else single format
  const handleExport = async () => {
    if (!slideRef.current) return;

    if (exportFormat === 'mp4') {
      await handleVideoExport();
      return;
    }

    // Multiple formats → ZIP
    if (selectedExportFormats.length > 1) {
      await handleZipExport();
      return;
    }

    // Single format (or fall back to current canvas format)
    try {
      const exportFmt = selectedExportFormats[0] ?? format;
      const exportDims = getExportDimensions(exportFmt);
      const fmtDims = getDimensions(exportFmt);
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = exportDims.width;
      renderCanvas.height = exportDims.height;
      await renderSlideToCanvas(mergeGlobalLayers(currentSlideData), exportDims, renderCanvas, fmtDims);
      renderCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `abrakadabra-${exportFmt}-slide-${currentSlide + 1}.${exportFormat}`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, `image/${exportFormat}`, exportQuality / 100);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderLayer = (layer: Layer) => {
    if (!layer.visible) return null;

    const isSelected = selectedLayerId === layer.id;
    const baseClasses = isSelected ? 'ring-2 ring-blue-400' : '';

    switch (layer.type) {
      case 'background':
        return (
          <div
            key={layer.id}
            className="absolute inset-0"
            style={{
              backgroundColor: layer.color,
              zIndex: layer.zIndex,
            }}
            onClick={() => setSelectedLayerId(layer.id)}
          />
        );

      case 'media':
        const getCssFilter = (f?: string) => {
          switch (f) {
            case 'blur': return 'blur(8px)';
            case 'grayscale': return 'grayscale(100%)';
            case 'sepia': return 'sepia(100%)';
            case 'brightness': return 'brightness(1.4)';
            default: return 'none';
          }
        };
        const getOverlayStyle = (o?: string): React.CSSProperties => {
          switch (o) {
            case 'dark': return { backgroundColor: 'rgba(0,0,0,0.5)' };
            case 'light': return { backgroundColor: 'rgba(255,255,255,0.3)' };
            case 'gradient': return { background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7))' };
            default: return {};
          }
        };
        const getCropStyle = (c?: string): React.CSSProperties => {
          switch (c) {
            case 'left-half': return { objectPosition: 'left center', width: '200%', maxWidth: 'none' };
            case 'right-half': return { objectPosition: 'right center', width: '200%', maxWidth: 'none' };
            case 'top-half': return { objectPosition: 'center top', height: '200%', maxHeight: 'none' };
            case 'bottom-half': return { objectPosition: 'center bottom', height: '200%', maxHeight: 'none' };
            default: return {};
          }
        };
        // Empty placeholder — show dashed drop target
        if (!layer.url) {
          return (
            <div
              key={layer.id}
              className={`absolute cursor-pointer ${selectedLayerId === layer.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: `${layer.position.x}%`,
                top: `${layer.position.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${layer.scale}%`,
                height: `${layer.scale}%`,
                zIndex: layer.zIndex,
                border: '2px dashed #9ca3af',
                background: 'rgba(243,244,246,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setSelectedLayerId(layer.id)}
            >
              <div style={{ color: '#9ca3af', textAlign: 'center', pointerEvents: 'none' }}>
                <ImageIcon size={24} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '10px', lineHeight: 1.3 }}>Select, then<br/>Add Media</div>
              </div>
            </div>
          );
        }

        const isBlur = layer.filter === 'blur';
        const hasCrop = layer.crop && layer.crop !== 'full';
        const rotation = layer.rotation ?? 0;
        const flipH = layer.flipH ? -1 : 1;
        const flipV = layer.flipV ? -1 : 1;
        const mediaTransform = `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${flipH}) scaleY(${flipV})`;
        return (
          <div
            key={layer.id}
            className={`absolute cursor-move ${baseClasses}`}
            style={{
              left: `${layer.position.x}%`,
              top: `${layer.position.y}%`,
              transform: mediaTransform,
              width: `${layer.scale}%`,
              height: `${layer.scale}%`,
              zIndex: layer.zIndex,
              overflow: 'hidden',
              border: (layer.borderWidth ?? 0) > 0 ? `${layer.borderWidth}px solid ${layer.borderColor ?? '#ffffff'}` : undefined,
              boxSizing: 'border-box',
              borderRadius: (layer.cornerRadius ?? 0) > 0 ? `${layer.cornerRadius}px` : undefined,
              boxShadow: layer.shadow ? `0 8px ${layer.shadowBlur ?? 20}px ${layer.shadowColor ?? '#000000'}` : undefined,
              opacity: (layer.opacity ?? 100) / 100,
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
          >
            {layer.mediaType === 'image' ? (
              <img
                src={layer.url}
                alt={layer.name}
                className={`${hasCrop ? '' : 'w-full'} h-full`}
                style={{
                  objectFit: layer.objectFit ?? 'cover',
                  filter: getCssFilter(layer.filter),
                  ...(isBlur ? { transform: 'scale(1.1)' } : {}),
                  ...getCropStyle(layer.crop),
                }}
              />
            ) : (
              <video
                src={layer.url}
                className={`${hasCrop ? '' : 'w-full'} h-full`}
                style={{
                  objectFit: layer.objectFit ?? 'cover',
                  filter: getCssFilter(layer.filter),
                  ...(isBlur ? { transform: 'scale(1.1)' } : {}),
                  ...getCropStyle(layer.crop),
                }}
                loop muted playsInline autoPlay
              />
            )}
            {layer.overlay && layer.overlay !== 'none' && (
              <div className="absolute inset-0 pointer-events-none" style={getOverlayStyle(layer.overlay)} />
            )}
          </div>
        );

      case 'text':
        const getTextAnimationClass = () => {
          if (!layer.animation || layer.animation === 'none') return '';
          return `text-${layer.animation}`;
        };
        const isSpread = layer.textAlign === 'justify-spread';
        const hasBg = layer.textBackground && layer.textBackground !== 'none';
        const bgColor = layer.textBackgroundColor ?? '#000000';
        const bgOp = layer.textBackgroundOpacity ?? 0.5;
        const bgRadius = layer.textBackground === 'pill' ? '999px' : '4px';

        return (
          <div
            key={layer.id}
            className={`absolute cursor-move ${baseClasses} ${getTextAnimationClass()}`}
            style={{
              left: `${layer.position.x}%`,
              top: `${layer.position.y}%`,
              zIndex: layer.zIndex,
              animationDelay: layer.animationDelay ? `${layer.animationDelay}ms` : '0ms',
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
          >
            <div className="relative">
              {hasBg && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: bgColor,
                    opacity: bgOp,
                    borderRadius: bgRadius,
                    padding: layer.textBackground === 'pill' ? '4px 16px' : '4px 8px',
                    margin: '-4px -8px',
                  }}
                />
              )}
              <textarea
                value={layer.content}
                onChange={(e) => handleUpdateLayer(layer.id, { content: e.target.value })}
                className="bg-transparent border-none outline-none resize-none overflow-hidden relative"
                style={{
                  color: layer.color,
                  fontSize: `${layer.fontSize}px`,
                  fontFamily: layer.fontFamily === 'LL Kristall' ? "'LL Kristall', sans-serif" : "'Plantin', serif",
                  fontWeight: layer.fontWeight,
                  fontStyle: layer.fontStyle,
                  textAlign: isSpread ? 'justify' : layer.textAlign,
                  lineHeight: layer.lineHeight,
                  letterSpacing: `${layer.letterSpacing}px`,
                  width: `${layer.width}%`,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  ...(isSpread ? { wordSpacing: '0.5em', textAlignLast: 'justify' as const } : {}),
                }}
                rows={Math.max(Math.ceil(layer.content.split('\n').length), 1)}
              />
            </div>
          </div>
        );

      case 'logo':
        const getAnimationClass = () => {
          switch (layer.animation) {
            case 'fade-in': return 'logo-fade-in';
            case 'slide-up': return 'logo-slide-up';
            case 'bounce': return 'logo-bounce';
            case 'pulse': return 'logo-pulse';
            case 'spin': return 'logo-spin';
            default: return '';
          }
        };

        const getFilterStyle = () => {
          switch (layer.filter) {
            case 'invert': return 'invert(1)';
            case 'brightness': return 'brightness(1.5)';
            case 'contrast': return 'contrast(1.5)';
            case 'grayscale': return 'grayscale(1)';
            default: return 'none';
          }
        };

        return (
          <div
            key={layer.id}
            className={`absolute cursor-move ${baseClasses} ${getAnimationClass()}`}
            style={{
              left: `${layer.position.x}px`,
              top: `${layer.position.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: layer.zIndex,
              opacity: layer.opacity ?? 1,
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
          >
            <img
              src={logo}
              alt="ABRAKADABRA"
              style={{
                height: `${layer.size ?? 24}px`,
                filter: getFilterStyle(),
                mixBlendMode: 'multiply',
              }}
              className="object-contain"
            />
          </div>
        );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {showPresetDialog && (
        <PresetDialog
          presets={presets}
          onSave={handleSavePreset}
          onLoad={handleLoadPreset}
          onDelete={handleDeletePreset}
          onClose={() => setShowPresetDialog(false)}
          dimensions={dimensions}
        />
      )}
      {showExportDialog && (
        <ExportDialog
          format={format}
          exportFormat={exportFormat}
          exportQuality={exportQuality}
          videoDuration={videoDuration}
          selectedFormats={selectedExportFormats}
          onFormatChange={setExportFormat}
          onQualityChange={setExportQuality}
          onDurationChange={setVideoDuration}
          onSelectedFormatsChange={setSelectedExportFormats}
          onExport={handleExport}
          onZipExport={handleZipExport}
          onClose={() => setShowExportDialog(false)}
        />
      )}
      <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
        {/* Left Sidebar - Layers */}
        <div className="w-64 flex-shrink-0 space-y-4">

          {/* ── FORMAT SELECTOR ── */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold mb-3 text-xs uppercase tracking-wide text-gray-500">Canvas Format</h3>
            <div className="space-y-1">
              {ALL_EXPORT_FORMATS.map(({ key, label, ratio }) => (
                <button
                  key={key}
                  onClick={() => handleFormatChange(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${format === key ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                >
                  <span>{label}</span>
                  <span className={`text-xs ${format === key ? 'text-purple-200' : 'text-gray-400'}`}>{ratio}</span>
                </button>
              ))}
            </div>
          </div>

          <LayerPanel
            layers={currentSlideData.layers}
            globalLayers={globalLayers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onReorderLayers={handleReorderLayers}
            onToggleVisibility={handleToggleVisibility}
            onDeleteLayer={handleDeleteLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onTogglePin={handleTogglePin}
            onPinTextLayer={handlePinTextLayer}
          />
          
          {/* Add Layer Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Add Layer</h3>
            <div className="space-y-2">
              <button
                onClick={handleAddTextLayer}
                className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Type className="w-4 h-4" />
                Add Text
              </button>
              <label className="w-full flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                Add Media
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                <Library className="w-4 h-4" />
                Media Library {mediaLibrary.length > 0 && `(${mediaLibrary.length})`}
              </button>
            </div>
          </div>

          {/* Media Library Panel */}
          {showMediaLibrary && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Media Library</h3>
              {mediaLibrary.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No media uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {mediaLibrary.map((item) => (
                    <div key={item.id} className="relative group">
                      <div
                        onClick={() => handleAddFromLibrary(item)}
                        className="cursor-pointer border-2 border-gray-300 rounded overflow-hidden hover:border-blue-500 transition-colors aspect-square"
                      >
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFromLibrary(item.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate" title={item.name}>{item.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bulk Import */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Bulk Import</h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsBulkDragOver(true); }}
              onDragLeave={() => setIsBulkDragOver(false)}
              onDrop={handleBulkDrop}
              className={`w-full py-3 px-3 rounded-lg border-2 border-dashed text-center text-xs transition-colors cursor-pointer ${
                isBulkDragOver
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
            >
              <ImagePlus className="w-4 h-4 mx-auto mb-1" />
              {isBulkDragOver ? 'Drop to apply' : 'Drop images — auto to slides'}
            </div>
          </div>

          {/* Media Layout Presets */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Slide Layout</h3>
            <div className="grid grid-cols-3 gap-1">
              {([
                { value: 'full-bleed' as const, label: 'Full', icon: RectangleHorizontal },
                { value: 'diptych-side' as const, label: 'Side', icon: Columns },
                { value: 'diptych-stack' as const, label: 'Stack', icon: Rows },
                { value: 'photo-space' as const, label: 'Top', icon: LayoutGrid },
                { value: 'triptych' as const, label: '3-Up', icon: LayoutGrid },
              ]).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleApplyMediaLayout(value)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded text-xs bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={value}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Slide Frame */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide">Slide Frame</h3>
            <label className="block text-xs font-medium mb-1">Frame: {currentSlideData.frameWidth ?? 0}px</label>
            <input
              type="range" min="0" max="80"
              value={currentSlideData.frameWidth ?? 0}
              onChange={(e) => updateSlideFrame({ frameWidth: parseInt(e.target.value) })}
              className="w-full"
            />
            {(currentSlideData.frameWidth ?? 0) > 0 && (
              <div className="mt-2">
                <label className="block text-xs font-medium mb-1">Frame Color</label>
                <div className="flex gap-1 flex-wrap">
                  {(['#ffffff', '#000000', '#cccccc', '#1A1A1A', '#D4AF37', '#FF4500'] as const).map((hex) => (
                    <button
                      key={hex}
                      onClick={() => updateSlideFrame({ frameColor: hex })}
                      className={`w-7 h-7 rounded border-2 transition-transform ${(currentSlideData.frameColor ?? '#ffffff') === hex ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
                      style={{ background: hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={currentSlideData.frameColor ?? '#ffffff'}
                    onChange={(e) => updateSlideFrame({ frameColor: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Slide Navigation */}
          <div className="flex items-center gap-4 bg-white rounded-lg shadow-lg px-4 py-2">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              Slide {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={handleAddSlide}
              className="p-2 rounded hover:bg-green-100 text-green-700"
              title="Add new slide"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleDuplicateSlide}
              className="p-2 rounded hover:bg-blue-100 text-blue-700"
              title="Duplicate current slide"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteSlide(currentSlide)}
              disabled={slides.length <= 1}
              className="p-2 rounded hover:bg-red-100 text-red-500 disabled:opacity-30"
              title="Delete current slide"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => setShowPresetDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Bookmark className="w-4 h-4" />
              Presets
            </button>
            <button
              onClick={() => setShowExportDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
                showSafeArea ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Instagram safe area guides"
            >
              <Shield className="w-4 h-4" />
              Safe
            </button>
            {selectedLayer?.type === 'media' && (selectedLayer as MediaLayer).url && (
              <button
                onClick={handlePanoramicSplit}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                title="Split image across two slides"
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                Split
              </button>
            )}
          </div>

          {/* Bulk drop zone moved to left sidebar */}

          {/* Canvas */}
          <div
            ref={slideRef}
            className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              width: dimensions.width,
              height: dimensions.height,
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {mergeGlobalLayers(currentSlideData).layers
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(renderLayer)}

            {/* Snap Guides */}
            {snapGuides.vertical !== null && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: `${snapGuides.vertical}%`, width: 1, backgroundColor: '#ff69b4', zIndex: 9999 }}
              />
            )}
            {snapGuides.horizontal !== null && (
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: `${snapGuides.horizontal}%`, height: 1, backgroundColor: '#ff69b4', zIndex: 9999 }}
              />
            )}

            {/* Safe Area Overlays */}
            {showSafeArea && safeAreas.topDanger > 0 && (
              <>
                <div
                  className="absolute left-0 right-0 top-0 pointer-events-none flex items-end justify-center"
                  style={{ height: `${safeAreas.topDanger}%`, backgroundColor: 'rgba(255,0,0,0.1)', borderBottom: '2px dashed rgba(255,0,0,0.5)', zIndex: 9998 }}
                >
                  <span className="text-[9px] text-red-500 mb-0.5">IG UI zone</span>
                </div>
                <div
                  className="absolute left-0 right-0 bottom-0 pointer-events-none flex items-start justify-center"
                  style={{ height: `${safeAreas.bottomDanger}%`, backgroundColor: 'rgba(255,0,0,0.1)', borderTop: '2px dashed rgba(255,0,0,0.5)', zIndex: 9998 }}
                >
                  <span className="text-[9px] text-red-500 mt-0.5">IG UI zone</span>
                </div>
              </>
            )}
            {/* Slide Frame overlay */}
            {(currentSlideData.frameWidth ?? 0) > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 ${currentSlideData.frameWidth}px ${currentSlideData.frameColor ?? '#ffffff'}`,
                  zIndex: 9999,
                }}
              />
            )}
          </div>

          {/* Slide Strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => {
              const thumbScale = 0.14;
              const bgLayer = slide.layers.find(l => l.type === 'background') as BackgroundLayer | undefined;
              const mediaLayer = slide.layers.find(l => l.type === 'media') as MediaLayer | undefined;
              return (
                <div key={slide.id} className="flex-shrink-0 relative group">
                  <button
                    onClick={() => setCurrentSlide(index)}
                    className={`block border-2 rounded-lg overflow-hidden transition-all ${currentSlide === index ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                    style={{ width: dimensions.width * thumbScale, height: dimensions.height * thumbScale }}
                  >
                    <div className="w-full h-full relative" style={{ backgroundColor: bgLayer?.color ?? '#fff' }}>
                      {mediaLayer?.url && (
                        <img src={mediaLayer.url} className="absolute inset-0 w-full h-full object-cover" style={{ filter: mediaLayer.filter === 'grayscale' ? 'grayscale(100%)' : 'none', opacity: 0.9 }} />
                      )}
                      <div className="absolute inset-0 flex items-end justify-center pb-0.5">
                        <span className="text-[9px] font-bold text-gray-600 bg-white/70 px-1 rounded">{index + 1}</span>
                      </div>
                    </div>
                  </button>
                  {/* Delete button on hover */}
                  {slides.length > 1 && (
                    <button
                      onClick={() => handleDeleteSlide(index)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex z-10 hover:bg-red-600"
                    >×</button>
                  )}
                </div>
              );
            })}
            {/* Add new slide button */}
            <button
              onClick={handleAddSlide}
              className="flex-shrink-0 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 flex items-center justify-center text-gray-300 hover:text-green-500 transition-colors"
              style={{ width: dimensions.width * 0.14, height: dimensions.height * 0.14 }}
              title="Add new slide"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 flex-shrink-0">
          {selectedLayer && selectedLayer.type === 'text' && (
            <TextEditor
              layer={selectedLayer as TextLayer}
              onUpdate={(updates) => handleUpdateLayer(selectedLayer.id, updates)}
              customFonts={customFonts}
              fontInputRef={fontInputRef}
              onFontUploadClick={() => fontInputRef.current?.click()}
              onApplyToAll={handleApplyTextToAll}
            />
          )}
          {selectedLayer && selectedLayer.type === 'media' && (
            <MediaEditor
              layer={selectedLayer as MediaLayer}
              onUpdate={(updates) => handleUpdateLayer(selectedLayer.id, updates)}
            />
          )}
          {selectedLayer && selectedLayer.type === 'background' && (
            <BackgroundEditor
              layer={selectedLayer as BackgroundLayer}
              onUpdate={(updates) => handleUpdateLayer(selectedLayer.id, updates)}
              onApplyToAll={handleApplyBgToAll}
            />
          )}
          {selectedLayer && selectedLayer.type === 'logo' && (
            <LogoEditor
              layer={selectedLayer as LogoLayer}
              onUpdate={(updates) => handleUpdateLayer(selectedLayer.id, updates)}
              dimensions={dimensions}
              onApplyToAll={handleApplyLogoToAll}
            />
          )}
          {!selectedLayer && (
            <div className="bg-white rounded-lg shadow-lg p-4 text-center text-gray-500">
              <p className="text-sm">Select a layer to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Font Upload Input */}
      <input
        ref={fontInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
        className="hidden"
      />
    </DndProvider>
  );
}