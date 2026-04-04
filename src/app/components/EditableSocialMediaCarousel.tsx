import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronLeft, ChevronRight, Upload, Download, ZoomIn, Type, Video, Image as ImageIcon, FileText, X, GripVertical, Plus, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import logo from '../../assets/6705475f4c357a167b42625959f8ccbb9d9a1ccb.png';

interface EditableSocialMediaCarouselProps {
  format: 'story' | 'post' | 'post-portrait' | 'post-landscape' | 'linkedin';
  editMode?: boolean;
  showAnimated?: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  scale: number;
  position: { x: number; y: number };
}

interface CustomTextElement {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
  fontSize: string; // Tailwind class like 'text-2xl'
  fontFamily: string;
  fontWeight: string; // 'normal' | 'bold'
  fontStyle: 'heading' | 'subheading' | 'body'; // Font style category
}

// Brand colors from the palette
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

// Default text positions for each slide type - adjusted for different formats
const getDefaultTextPositions = (format: string) => {
  const isStory = format === 'story';
  const isLandscape = format === 'post-landscape';
  
  if (isStory) {
    return {
      opening: { x: 32, y: 80 },
      'text-only': { title: { x: 32, y: 200 }, body: { x: 32, y: 280 } },
      'image-text': { x: 32, y: 60 },
      closing: { title: { x: 202, y: 320 }, subtitle: { x: 202, y: 380 } },
    };
  } else if (isLandscape) {
    return {
      opening: { x: 24, y: 24 },
      'text-only': { title: { x: 24, y: 60 }, body: { x: 24, y: 120 } },
      'image-text': { x: 24, y: 24 },
      closing: { title: { x: 300, y: 100 }, subtitle: { x: 300, y: 150 } },
    };
  } else {
    // Square and portrait
    return {
      opening: { x: 32, y: 48 },
      'text-only': { title: { x: 32, y: 140 }, body: { x: 32, y: 200 } },
      'image-text': { x: 32, y: 48 },
      closing: { title: { x: 240, y: 220 }, subtitle: { x: 240, y: 270 } },
    };
  }
};

// Get responsive font sizes based on format
const getResponsiveFontSizes = (format: string) => {
  const isStory = format === 'story';
  const isLandscape = format === 'post-landscape';
  
  if (isStory) {
    return {
      openingHeading: 'text-4xl',      // 36px
      titleSize: 'text-3xl',           // 30px
      bodySize: 'text-lg',             // 18px
      imageTextSize: 'text-4xl',       // 36px
      closingTitleSize: 'text-3xl',    // 30px
      closingSubtitleSize: 'text-xl',  // 20px
    };
  } else if (isLandscape) {
    return {
      openingHeading: 'text-2xl',      // 24px - smaller for landscape
      titleSize: 'text-2xl',           // 24px
      bodySize: 'text-base',           // 16px
      imageTextSize: 'text-2xl',       // 24px
      closingTitleSize: 'text-2xl',    // 24px
      closingSubtitleSize: 'text-lg',  // 18px
    };
  } else {
    // Square and portrait
    return {
      openingHeading: 'text-3xl',      // 30px
      titleSize: 'text-2xl',           // 24px
      bodySize: 'text-base',           // 16px
      imageTextSize: 'text-3xl',       // 30px
      closingTitleSize: 'text-2xl',    // 24px
      closingSubtitleSize: 'text-lg',  // 18px
    };
  }
};

// Get pixel-based font sizes for export
const getExportFontSizes = (format: string) => {
  const isStory = format === 'story';
  const isLandscape = format === 'post-landscape';
  
  if (isStory) {
    return {
      openingHeading: 64,
      titleSize: 48,
      bodySize: 28,
      imageTextSize: 64,
      closingTitleSize: 48,
      closingSubtitleSize: 32,
    };
  } else if (isLandscape) {
    return {
      openingHeading: 40,
      titleSize: 36,
      bodySize: 22,
      imageTextSize: 40,
      closingTitleSize: 36,
      closingSubtitleSize: 24,
    };
  } else {
    // Square and portrait
    return {
      openingHeading: 52,
      titleSize: 42,
      bodySize: 26,
      imageTextSize: 52,
      closingTitleSize: 42,
      closingSubtitleSize: 28,
    };
  }
};

// Sample slides data
const initialSlidesData = [
  {
    id: 1,
    type: 'opening',
    topText: 'CASE STUDY:\nTRANSFORMING DIGITAL\nEXPERIENCES',
    backgroundColor: colors.cream,
    textColor: colors.purple,
    showLogo: true,
    mediaItems: [] as MediaItem[],
    textPosition: { ...getDefaultTextPositions('story').opening },
  },
  {
    id: 2,
    type: 'text-only',
    title: 'The Challenge',
    body: 'Our client needed a complete digital transformation to compete in the modern marketplace.',
    backgroundColor: colors.blue,
    textColor: colors.white,
    showLogo: true,
    mediaItems: [] as MediaItem[],
    textPosition: { ...getDefaultTextPositions('story')['text-only'] },
  },
  {
    id: 3,
    type: 'image-text',
    text: 'Research & Discovery',
    mediaItems: [{
      id: 'default-1',
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
      type: 'image' as const,
      scale: 100,
      position: { x: 50, y: 50 }
    }] as MediaItem[],
    backgroundColor: colors.cream,
    textColor: colors.white,
    showLogo: true,
    textPosition: { ...getDefaultTextPositions('story')['image-text'] },
  },
  {
    id: 4,
    type: 'text-only',
    title: 'Our Approach',
    body: 'We developed a comprehensive strategy focusing on user experience, brand identity, and scalable technology.',
    backgroundColor: colors.yellow,
    textColor: colors.purple,
    showLogo: true,
    mediaItems: [] as MediaItem[],
    textPosition: { ...getDefaultTextPositions('story')['text-only'] },
  },
  {
    id: 5,
    type: 'image-text',
    text: 'Design & Development',
    mediaItems: [{
      id: 'default-2',
      url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200',
      type: 'image' as const,
      scale: 100,
      position: { x: 50, y: 50 }
    }] as MediaItem[],
    backgroundColor: colors.cream,
    textColor: colors.white,
    showLogo: true,
    textPosition: { ...getDefaultTextPositions('story')['image-text'] },
  },
  {
    id: 6,
    type: 'text-only',
    title: 'Key Features',
    body: '• Responsive design\n• Intuitive navigation\n• Enhanced performance\n• Modern aesthetics',
    backgroundColor: colors.orange,
    textColor: colors.white,
    showLogo: true,
    mediaItems: [] as MediaItem[],
    textPosition: { ...getDefaultTextPositions('story')['text-only'] },
  },
  {
    id: 7,
    type: 'image-text',
    text: 'Implementation',
    mediaItems: [{
      id: 'default-3',
      url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200',
      type: 'image' as const,
      scale: 100,
      position: { x: 50, y: 50 }
    }] as MediaItem[],
    backgroundColor: colors.cream,
    textColor: colors.white,
    showLogo: true,
    textPosition: { ...getDefaultTextPositions('story')['image-text'] },
  },
  {
    id: 8,
    type: 'text-only',
    title: 'Results',
    body: '300% increase in user engagement\n150% boost in conversions\nAward-winning design',
    backgroundColor: colors.green,
    textColor: colors.white,
    showLogo: true,
    mediaItems: [] as MediaItem[],
    textPosition: { ...getDefaultTextPositions('story')['text-only'] },
  },
  {
    id: 9,
    type: 'image-text',
    text: 'Client Success',
    mediaItems: [{
      id: 'default-4',
      url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200',
      type: 'image' as const,
      scale: 100,
      position: { x: 50, y: 50 }
    }] as MediaItem[],
    backgroundColor: colors.cream,
    textColor: colors.white,
    showLogo: true,
    textPosition: { ...getDefaultTextPositions('story')['image-text'] },
  },
  {
    id: 10,
    type: 'closing',
    title: 'Ready to transform your brand?',
    subtitle: 'Let\'s work together',
    backgroundColor: colors.purple,
    textColor: colors.white,
    showLogo: true,
    mediaItems: [] as MediaItem[],
    textPosition: { ...getDefaultTextPositions('story').closing },
  },
];

// Draggable media thumbnail component
function DraggableMediaThumb({ media, index, moveMedia, removeMedia, isActive }: any) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'media',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'media',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveMedia(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative group cursor-move ${
        isDragging ? 'opacity-50' : ''
      } ${isActive ? 'ring-4 ring-blue-500' : ''}`}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
        {media.type === 'video' ? (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            muted
          />
        ) : (
          <img
            src={media.url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
      <GripVertical className="absolute top-1 right-8 w-4 h-4 text-white drop-shadow-lg" />
      <button
        onClick={() => removeMedia(index)}
        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
      {media.type === 'video' && (
        <Video className="absolute bottom-1 right-1 w-4 h-4 text-white drop-shadow-lg" />
      )}
    </div>
  );
}

function EditableSocialMediaCarouselInner({ format, editMode = true, showAnimated = false }: EditableSocialMediaCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(initialSlidesData.map(slide => ({
    ...slide,
    mediaItems: slide.mediaItems || [],
    customTextElements: (slide.customTextElements || []).map(el => ({
      ...el,
      fontStyle: el.fontStyle || 'body' // Default to body if not set
    })),
    textWidth: slide.textWidth || null // Custom width for text elements
  })));
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isResizingText, setIsResizingText] = useState(false);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [showTextStyleDialog, setShowTextStyleDialog] = useState(false);
  const [selectedTextStyle, setSelectedTextStyle] = useState<'heading' | 'subheading' | 'body'>('body');
  const [logoAnimation, setLogoAnimation] = useState<string>('none');
  
  // Global media library (shared across all slides)
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [draggingFromLibrary, setDraggingFromLibrary] = useState<MediaItem | null>(null);
  
  const [customFonts, setCustomFonts] = useState<{ name: string; family: string }[]>([
    { name: 'Georgia (Default)', family: 'Georgia, serif' },
    { name: 'Arial', family: 'Arial, sans-serif' },
  ]);
  const [fonts, setFonts] = useState({
    heading: 'Georgia, serif',      // For opening slide, image-text overlay
    subheading: 'Georgia, serif',   // For titles in text-only, closing
    body: 'Georgia, serif',         // For body text
  });
  
  const slideRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get logo animation class
  const getLogoAnimationClass = () => {
    const animationMap: Record<string, string> = {
      'none': '',
      'bounce': 'animate-bounce',
      'pulse': 'animate-pulse-slow',
      'swing': 'animate-swing',
      'fade': 'animate-fade',
      'slide': 'animate-slide',
      'rotate': 'animate-rotate',
      'wiggle': 'animate-wiggle',
      'heartbeat': 'animate-heartbeat',
      'float': 'animate-float',
      'shake': 'animate-shake',
      'flip': 'animate-flip',
    };
    return animationMap[logoAnimation] || '';
  };

  // Instagram recommended dimensions
  const getExportDimensions = () => {
    if (format === 'story') {
      return { width: 1080, height: 1920 }; // 9:16
    } else if (format === 'post-portrait') {
      return { width: 1080, height: 1350 }; // 4:5
    } else if (format === 'post-landscape') {
      return { width: 1080, height: 566 }; // 1.91:1
    } else {
      return { width: 1080, height: 1080 }; // 1:1
    }
  };

  // Preview dimensions (scaled down for UI)
  const getDimensions = () => {
    if (format === 'story') {
      return { width: 405, height: 720 }; // 9:16
    } else if (format === 'post-portrait') {
      return { width: 480, height: 600 }; // 4:5
    } else if (format === 'post-landscape') {
      return { width: 600, height: 314 }; // 1.91:1
    } else {
      return { width: 600, height: 600 }; // 1:1
    }
  };

  const dimensions = getDimensions();

  const currentSlideData = slides[currentSlide];
  const activeMedia = currentSlideData.mediaItems[activeMediaIndex];

  useEffect(() => {
    console.log('Current slide:', currentSlide, 'MediaItems:', currentSlideData.mediaItems);
  }, [currentSlide, currentSlideData.mediaItems]);

  useEffect(() => {
    // Reset active media index when changing slides
    setActiveMediaIndex(0);
  }, [currentSlide]);

  useEffect(() => {
    // Play video when slide changes
    if (videoRef.current && activeMedia?.type === 'video') {
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    }
  }, [currentSlide, activeMediaIndex, activeMedia?.type]);

  // Auto-adapt text positions when format changes
  useEffect(() => {
    const defaultPositions = getDefaultTextPositions(format);
    setSlides((prevSlides) =>
      prevSlides.map((slide) => {
        const type = slide.type as keyof typeof defaultPositions;
        return {
          ...slide,
          textPosition: { ...defaultPositions[type] },
        };
      })
    );
  }, [format]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const updateSlide = (updates: any) => {
    console.log('updateSlide called with:', updates);
    setSlides((prev) => {
      const newSlides = prev.map((slide, i) =>
        i === currentSlide ? { ...slide, ...updates } : slide
      );
      console.log('Updated slides array, slide', currentSlide, 'now has:', newSlides[currentSlide]);
      return newSlides;
    });
  };

  const updateActiveMedia = (updates: Partial<MediaItem>) => {
    const newMediaItems = [...currentSlideData.mediaItems];
    if (newMediaItems[activeMediaIndex]) {
      newMediaItems[activeMediaIndex] = {
        ...newMediaItems[activeMediaIndex],
        ...updates,
      };
      updateSlide({ mediaItems: newMediaItems });
    }
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    const newMediaItems = [...currentSlideData.mediaItems];
    const [movedItem] = newMediaItems.splice(fromIndex, 1);
    newMediaItems.splice(toIndex, 0, movedItem);
    updateSlide({ mediaItems: newMediaItems });
    
    // Update active index if needed
    if (activeMediaIndex === fromIndex) {
      setActiveMediaIndex(toIndex);
    } else if (fromIndex < activeMediaIndex && toIndex >= activeMediaIndex) {
      setActiveMediaIndex(activeMediaIndex - 1);
    } else if (fromIndex > activeMediaIndex && toIndex <= activeMediaIndex) {
      setActiveMediaIndex(activeMediaIndex + 1);
    }
  };

  const removeMedia = (index: number) => {
    const newMediaItems = currentSlideData.mediaItems.filter((_, i) => i !== index);
    updateSlide({ mediaItems: newMediaItems });
    
    // Adjust active index
    if (activeMediaIndex >= newMediaItems.length) {
      setActiveMediaIndex(Math.max(0, newMediaItems.length - 1));
    }
  };

  const resetTextPosition = () => {
    const defaultPositions = getDefaultTextPositions(format);
    const type = currentSlideData.type as keyof typeof defaultPositions;
    updateSlide({ textPosition: { ...defaultPositions[type] } });
  };

  // Custom text element functions
  const addCustomText = () => {
    setShowTextStyleDialog(true);
  };

  const confirmAddCustomText = () => {
    const fontFamilyMap = {
      heading: fonts.heading,
      subheading: fonts.subheading,
      body: fonts.body,
    };
    
    const newTextElement: CustomTextElement = {
      id: `custom-${Date.now()}`,
      text: 'New Text',
      position: { x: 100, y: 100 },
      color: currentSlideData.textColor,
      fontSize: 'text-2xl',
      fontFamily: fontFamilyMap[selectedTextStyle],
      fontWeight: selectedTextStyle === 'heading' ? 'bold' : 'normal',
      fontStyle: selectedTextStyle,
    };
    const currentElements = currentSlideData.customTextElements || [];
    updateSlide({ customTextElements: [...currentElements, newTextElement] });
    setShowTextStyleDialog(false);
  };

  const updateCustomText = (id: string, updates: Partial<CustomTextElement>) => {
    const currentElements = currentSlideData.customTextElements || [];
    const updatedElements = currentElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    updateSlide({ customTextElements: updatedElements });
  };

  const deleteCustomText = (id: string) => {
    const currentElements = currentSlideData.customTextElements || [];
    const updatedElements = currentElements.filter(el => el.id !== id);
    updateSlide({ customTextElements: updatedElements });
  };

  const deleteDefaultText = (textType: 'topText' | 'title' | 'body' | 'text' | 'subtitle') => {
    updateSlide({ [textType]: '' });
  };

  // Get text widths based on format
  const getTextWidths = () => {
    const isStory = format === 'story';
    const isLandscape = format === 'post-landscape';
    const isPortrait = format === 'post-portrait';
    
    if (isStory) {
      // Story: 405px wide - use 340px for text (32px padding each side)
      return {
        opening: '340px',
        title: '340px',
        body: '340px',
        closing: '340px',
      };
    } else if (isLandscape) {
      // Landscape: 600px wide - use 540px for text (30px padding each side)
      return {
        opening: '540px',
        title: '540px',
        body: '540px',
        closing: '540px',
      };
    } else if (isPortrait) {
      // Portrait: 480px wide - use 420px for text (30px padding each side)
      return {
        opening: '420px',
        title: '420px',
        body: '420px',
        closing: '420px',
      };
    } else {
      // Square: 600px wide - use 540px for text (30px padding each side)
      return {
        opening: '540px',
        title: '540px',
        body: '540px',
        closing: '540px',
      };
    }
  };

  const textWidths = getTextWidths();

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('Files selected:', files.length);
    const fileArray = Array.from(files);
    const newMediaItems: MediaItem[] = [];
    let loadedCount = 0;

    fileArray.forEach((file, index) => {
      // Only process image and video files
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        loadedCount++;
        if (loadedCount === fileArray.length && newMediaItems.length > 0) {
          setMediaLibrary((prev) => [...prev, ...newMediaItems]);
          console.log('Added', newMediaItems.length, 'items to media library');
        }
        return;
      }

      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newItem = {
            id: `${Date.now()}-${index}`,
            url: result,
            type: isVideo ? 'video' : 'image',
            scale: 100,
            position: { x: 50, y: 50 },
          };
          newMediaItems.push(newItem);
          console.log('Loaded media item:', newItem.id, newItem.type);
        }
        
        loadedCount++;
        if (loadedCount === fileArray.length && newMediaItems.length > 0) {
          console.log('All files loaded, adding', newMediaItems.length, 'items to media library');
          setMediaLibrary((prev) => [...prev, ...newMediaItems]);
        }
      };

      reader.onerror = () => {
        console.error('Error reading uploaded file:', file.name);
        loadedCount++;
        if (loadedCount === fileArray.length && newMediaItems.length > 0) {
          setMediaLibrary((prev) => [...prev, ...newMediaItems]);
          console.log('Added', newMediaItems.length, 'items to media library (with errors)');
        }
      };
      
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    console.log('Files dropped:', files.length);
    const fileArray = Array.from(files);
    const newMediaItems: MediaItem[] = [];
    let loadedCount = 0;

    fileArray.forEach((file, index) => {
      // Only process image and video files
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        loadedCount++;
        if (loadedCount === fileArray.length && newMediaItems.length > 0) {
          setMediaLibrary((prev) => [...prev, ...newMediaItems]);
          console.log('Added', newMediaItems.length, 'items to media library');
        }
        return;
      }

      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newItem = {
            id: `${Date.now()}-${index}`,
            url: result,
            type: isVideo ? 'video' : 'image',
            scale: 100,
            position: { x: 50, y: 50 },
          };
          newMediaItems.push(newItem);
          console.log('Loaded dropped media item:', newItem.id, newItem.type);
        }
        
        loadedCount++;
        if (loadedCount === fileArray.length && newMediaItems.length > 0) {
          console.log('All dropped files loaded, adding', newMediaItems.length, 'items to media library');
          setMediaLibrary((prev) => [...prev, ...newMediaItems]);
        }
      };

      reader.onerror = () => {
        console.error('Error reading dropped file:', file.name);
        loadedCount++;
        if (loadedCount === fileArray.length && newMediaItems.length > 0) {
          setMediaLibrary((prev) => [...prev, ...newMediaItems]);
          console.log('Added', newMediaItems.length, 'items to media library (with errors)');
        }
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  // Drag from library gallery and drop on slide preview
  const handleLibraryDragStart = (media: MediaItem) => {
    console.log('Started dragging from library:', media.id);
    setDraggingFromLibrary(media);
  };
  
  const handleLibraryDragEnd = () => {
    console.log('Ended dragging from library');
    setDraggingFromLibrary(null);
  };
  
  const handlePreviewDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggingFromLibrary) {
      // Add the media from library to current slide
      console.log('Dropping library item onto slide:', draggingFromLibrary.id);
      const newMediaItem = {
        ...draggingFromLibrary,
        id: `${Date.now()}-${currentSlide}`, // New unique ID for this instance
      };
      
      let newIndex = 0;
      setSlides((prevSlides) => {
        const updatedSlides = prevSlides.map((slide, i) => {
          if (i === currentSlide) {
            const updatedMediaItems = [...slide.mediaItems, newMediaItem];
            newIndex = updatedMediaItems.length - 1; // Get index of newly added item
            console.log('Added media to slide', i, '- now has', updatedMediaItems.length, 'items');
            return { ...slide, mediaItems: updatedMediaItems };
          }
          return slide;
        });
        return updatedSlides;
      });
      
      // Set as active media using the captured index
      setActiveMediaIndex(newIndex);
      setDraggingFromLibrary(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop zone itself
    if (e.currentTarget === e.target) {
      setIsDraggingFile(false);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      const fontFamily = `CustomFont_${Date.now()}`;
      
      // Create font-face
      const fontFace = new FontFace(fontFamily, `url(${result})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        setCustomFonts(prev => [...prev, { 
          name: fontName, 
          family: fontFamily 
        }]);
        // Set as heading font by default when uploaded
        setFonts(prev => ({ ...prev, heading: fontFamily }));
      }).catch(err => {
        console.error('Font loading error:', err);
        alert('Failed to load font. Please make sure it\'s a valid font file.');
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newMediaItems: MediaItem[] = [];
    let loadedCount = 0;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        const isVideo = file.type.startsWith('video/');
        
        reader.onload = (event) => {
          const result = event.target?.result as string;
          newMediaItems.push({
            id: `${Date.now()}-${index}`,
            url: result,
            type: isVideo ? 'video' : 'image',
            scale: 100,
            position: { x: 50, y: 50 },
          });
          
          loadedCount++;
          if (loadedCount === files.length) {
            updateSlide({ 
              mediaItems: [...currentSlideData.mediaItems, ...newMediaItems]
            });
            setActiveMediaIndex(currentSlideData.mediaItems.length);
          }
        };
        
        reader.readAsDataURL(file);
      }
    });
  };

  const handleMediaMouseDown = (e: React.MouseEvent) => {
    if (!activeMedia) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleTextMouseDown = (e: React.MouseEvent, element: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingText(true);
    setDraggedElement(element);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, element: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingText(true);
    setDraggedElement(element);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Get current width
    const currentWidth = currentSlideData.textWidth?.[element] || 
      parseInt(textWidths[element === 'main' ? 'opening' : element] || textWidths.opening);
    setResizeStartWidth(currentWidth);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizingText && draggedElement) {
      const deltaX = e.clientX - dragStartPos.x;
      const newWidth = Math.max(100, resizeStartWidth + deltaX); // Minimum 100px
      
      const textWidthObj = currentSlideData.textWidth || {};
      textWidthObj[draggedElement] = newWidth;
      
      updateSlide({ textWidth: textWidthObj });
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setResizeStartWidth(newWidth);
    } else if (isDraggingMedia && activeMedia) {
      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;
      
      const newX = activeMedia.position.x + (deltaX / dimensions.width) * 100;
      const newY = activeMedia.position.y + (deltaY / dimensions.height) * 100;
      
      updateActiveMedia({
        position: {
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        },
      });
      
      setDragStartPos({ x: e.clientX, y: e.clientY });
    } else if (isDraggingText && draggedElement) {
      // Check if it's a custom text element (starts with 'custom-')
      if (draggedElement.startsWith('custom-')) {
        const newX = e.clientX - dragStartPos.x;
        const newY = e.clientY - dragStartPos.y;
        updateCustomText(draggedElement, { position: { x: newX, y: newY } });
      } else {
        // Handle default text elements
        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;
        
        const newTextPosition = { ...currentSlideData.textPosition };
        
        if (currentSlideData.type === 'text-only') {
          if (draggedElement === 'title') {
            newTextPosition.title = {
              x: newTextPosition.title.x + deltaX,
              y: newTextPosition.title.y + deltaY,
            };
          } else if (draggedElement === 'body') {
            newTextPosition.body = {
              x: newTextPosition.body.x + deltaX,
              y: newTextPosition.body.y + deltaY,
            };
          }
        } else if (currentSlideData.type === 'closing') {
          if (draggedElement === 'title') {
            newTextPosition.title = {
              x: newTextPosition.title.x + deltaX,
              y: newTextPosition.title.y + deltaY,
            };
          } else if (draggedElement === 'subtitle') {
            newTextPosition.subtitle = {
              x: newTextPosition.subtitle.x + deltaX,
              y: newTextPosition.subtitle.y + deltaY,
            };
          }
        } else {
          newTextPosition.x = newTextPosition.x + deltaX;
          newTextPosition.y = newTextPosition.y + deltaY;
        }
        
        updateSlide({ textPosition: newTextPosition });
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingMedia(false);
    setIsDraggingText(false);
    setIsResizingText(false);
    setDraggedElement(null);
  };

  const exportAsJPEG = async () => {
    if (!slideRef.current) return;

    const exportDims = getExportDimensions();

    try {
      // Create canvas directly
      const canvas = document.createElement('canvas');
      canvas.width = exportDims.width;
      canvas.height = exportDims.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Fill background
      ctx.fillStyle = currentSlideData.backgroundColor;
      ctx.fillRect(0, 0, exportDims.width, exportDims.height);

      const scale = exportDims.width / dimensions.width;

      // Draw all media items
      if (currentSlideData.mediaItems && currentSlideData.mediaItems.length > 0) {
        for (const mediaItem of currentSlideData.mediaItems) {
          await new Promise<void>((resolve, reject) => {
            if (mediaItem.type === 'video') {
              const video = document.createElement('video');
              video.src = mediaItem.url;
              video.muted = true;
              video.playsInline = true;
              
              video.onloadeddata = () => {
                video.currentTime = 0.1;
              };
              
              video.onseeked = () => {
                try {
                  const imgScale = mediaItem.scale / 100;
                  const imgWidth = exportDims.width * imgScale;
                  const imgHeight = exportDims.height * imgScale;
                  const posX = (exportDims.width * mediaItem.position.x / 100) - (imgWidth / 2);
                  const posY = (exportDims.height * mediaItem.position.y / 100) - (imgHeight / 2);
                  
                  ctx.drawImage(video, posX, posY, imgWidth, imgHeight);
                  resolve();
                } catch (err) {
                  console.warn('Video rendering error, skipping');
                  resolve();
                }
              };
              
              video.onerror = () => {
                console.warn('Video loading failed, skipping');
                resolve();
              };
            } else {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              img.onload = () => {
                try {
                  const imgScale = mediaItem.scale / 100;
                  const imgWidth = exportDims.width * imgScale;
                  const imgHeight = exportDims.height * imgScale;
                  const posX = (exportDims.width * mediaItem.position.x / 100) - (imgWidth / 2);
                  const posY = (exportDims.height * mediaItem.position.y / 100) - (imgHeight / 2);
                  
                  ctx.drawImage(img, posX, posY, imgWidth, imgHeight);
                  resolve();
                } catch (err) {
                  console.warn('Image rendering error, skipping');
                  resolve();
                }
              };
              
              img.onerror = () => {
                console.warn('Image CORS error, skipping');
                resolve();
              };
              
              img.src = mediaItem.url;
            }
          });
        }

        // Add overlay for certain slide types if media exists
        if (currentSlideData.type === 'image-text' || currentSlideData.type === 'opening') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, exportDims.width, exportDims.height);
        }
      }

      // Set text rendering quality
      ctx.textBaseline = 'top';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Render text based on slide type
      const exportFontSizes = getExportFontSizes(format);
      
      if (currentSlideData.type === 'opening') {
        ctx.fillStyle = currentSlideData.textColor;
        ctx.font = `bold ${exportFontSizes.openingHeading * scale}px ${fonts.heading}`;
        ctx.textTransform = 'uppercase';
        
        const lines = currentSlideData.topText.split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(
            line,
            currentSlideData.textPosition.x * scale,
            (currentSlideData.textPosition.y * scale) + (i * exportFontSizes.openingHeading * scale * 1.2)
          );
        });
      } else if (currentSlideData.type === 'text-only') {
        // Title
        ctx.fillStyle = currentSlideData.textColor;
        ctx.font = `bold ${exportFontSizes.titleSize * scale}px ${fonts.subheading}`;
        ctx.fillText(
          currentSlideData.title,
          currentSlideData.textPosition.title.x * scale,
          currentSlideData.textPosition.title.y * scale
        );
        
        // Body
        ctx.font = `${exportFontSizes.bodySize * scale}px ${fonts.body}`;
        const bodyLines = currentSlideData.body.split('\n');
        bodyLines.forEach((line, i) => {
          ctx.fillText(
            line,
            currentSlideData.textPosition.body.x * scale,
            (currentSlideData.textPosition.body.y * scale) + (i * exportFontSizes.bodySize * scale * 1.6)
          );
        });
      } else if (currentSlideData.type === 'image-text') {
        ctx.fillStyle = currentSlideData.textColor;
        ctx.font = `bold ${exportFontSizes.imageTextSize * scale}px ${fonts.heading}`;
        ctx.fillText(
          currentSlideData.text,
          currentSlideData.textPosition.x * scale,
          currentSlideData.textPosition.y * scale
        );
      } else if (currentSlideData.type === 'closing') {
        // Title
        ctx.fillStyle = currentSlideData.textColor;
        ctx.font = `bold ${exportFontSizes.closingTitleSize * scale}px ${fonts.subheading}`;
        ctx.textAlign = 'center';
        ctx.fillText(
          currentSlideData.title,
          currentSlideData.textPosition.title.x * scale,
          currentSlideData.textPosition.title.y * scale
        );
        
        // Subtitle
        ctx.font = `${exportFontSizes.closingSubtitleSize * scale}px ${fonts.body}`;
        ctx.fillText(
          currentSlideData.subtitle,
          currentSlideData.textPosition.subtitle.x * scale,
          currentSlideData.textPosition.subtitle.y * scale
        );
        ctx.textAlign = 'left';
      }

      // Add logo if visible
      if (currentSlideData.showLogo) {
        await new Promise<void>((resolve, reject) => {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          
          logoImg.onload = () => {
            try {
              const logoHeight = (currentSlideData.type === 'opening' || currentSlideData.type === 'closing' ? 64 : 48) * scale;
              const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
              const logoX = (exportDims.width - logoWidth) / 2;
              const logoY = exportDims.height - (64 * scale) - logoHeight;
              
              // If logo should be inverted, we need to apply filter
              if (shouldInvertLogo) {
                // Create temporary canvas for inversion
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = logoWidth;
                tempCanvas.height = logoHeight;
                const tempCtx = tempCanvas.getContext('2d');
                
                if (tempCtx) {
                  tempCtx.filter = 'invert(1) brightness(2)';
                  tempCtx.drawImage(logoImg, 0, 0, logoWidth, logoHeight);
                  ctx.drawImage(tempCanvas, logoX, logoY);
                } else {
                  ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                }
              } else {
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
              }
              
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          
          logoImg.onerror = () => {
            console.warn('Logo loading failed, exporting without logo');
            resolve();
          };
          
          logoImg.src = logo;
        });
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `abrakadabra-${format}-slide-${currentSlide + 1}.jpg`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try using a screenshot tool like Cmd+Shift+4 (Mac) or Snipping Tool (Windows).`);
    }
  };

  const exportAllSlides = async () => {
    alert('Exporting all slides... This may take a few moments.');
    
    try {
      for (let i = 0; i < slides.length; i++) {
        const slideData = slides[i];
        const exportDims = getExportDimensions();
        const canvas = document.createElement('canvas');
        canvas.width = exportDims.width;
        canvas.height = exportDims.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) continue;
        
        const scale = exportDims.width / dimensions.width;
        
        ctx.fillStyle = slideData.backgroundColor;
        ctx.fillRect(0, 0, exportDims.width, exportDims.height);
        
        if (slideData.mediaItems && slideData.mediaItems.length > 0) {
          const mediaItem = slideData.mediaItems[0];
          
          if (mediaItem.type === 'image') {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                const imgScale = mediaItem.scale / 100;
                const imgWidth = exportDims.width * imgScale;
                const imgHeight = exportDims.height * imgScale;
                const posX = (exportDims.width * mediaItem.position.x / 100) - (imgWidth / 2);
                const posY = (exportDims.height * mediaItem.position.y / 100) - (imgHeight / 2);
                ctx.drawImage(img, posX, posY, imgWidth, imgHeight);
                
                if (slideData.type === 'image-text' || slideData.type === 'opening') {
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                  ctx.fillRect(0, 0, exportDims.width, exportDims.height);
                }
                resolve();
              };
              img.onerror = () => resolve();
              img.src = mediaItem.url;
            });
          }
        }
        
        ctx.textBaseline = 'top';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const exportFontSizes = getExportFontSizes(format);
        
        if (slideData.type === 'opening') {
          ctx.fillStyle = slideData.textColor;
          ctx.font = `bold ${exportFontSizes.openingHeading * scale}px ${fonts.heading}`;
          const lines = slideData.topText.split('\n');
          lines.forEach((line, idx) => {
            ctx.fillText(line, slideData.textPosition.x * scale, (slideData.textPosition.y * scale) + (idx * exportFontSizes.openingHeading * scale * 1.2));
          });
        } else if (slideData.type === 'text-only') {
          ctx.fillStyle = slideData.textColor;
          ctx.font = `bold ${exportFontSizes.titleSize * scale}px ${fonts.subheading}`;
          ctx.fillText(slideData.title, slideData.textPosition.title.x * scale, slideData.textPosition.title.y * scale);
          ctx.font = `${exportFontSizes.bodySize * scale}px ${fonts.body}`;
          const bodyLines = slideData.body.split('\n');
          bodyLines.forEach((line, idx) => {
            ctx.fillText(line, slideData.textPosition.body.x * scale, (slideData.textPosition.body.y * scale) + (idx * exportFontSizes.bodySize * scale * 1.6));
          });
        } else if (slideData.type === 'image-text') {
          ctx.fillStyle = slideData.textColor;
          ctx.font = `bold ${exportFontSizes.imageTextSize * scale}px ${fonts.heading}`;
          ctx.fillText(slideData.text, slideData.textPosition.x * scale, slideData.textPosition.y * scale);
        } else if (slideData.type === 'closing') {
          ctx.fillStyle = slideData.textColor;
          ctx.font = `bold ${exportFontSizes.closingTitleSize * scale}px ${fonts.subheading}`;
          ctx.textAlign = 'center';
          ctx.fillText(slideData.title, slideData.textPosition.title.x * scale, slideData.textPosition.title.y * scale);
          ctx.font = `${exportFontSizes.closingSubtitleSize * scale}px ${fonts.body}`;
          ctx.fillText(slideData.subtitle, slideData.textPosition.subtitle.x * scale, slideData.textPosition.subtitle.y * scale);
          ctx.textAlign = 'left';
        }
        
        if (slideData.showLogo) {
          await new Promise<void>((resolve) => {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            logoImg.onload = () => {
              const logoHeight = (slideData.type === 'opening' || slideData.type === 'closing' ? 64 : 48) * scale;
              const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
              const logoX = (exportDims.width - logoWidth) / 2;
              const logoY = exportDims.height - (64 * scale) - logoHeight;
              
              const shouldInvert = slideData.textColor === colors.white || 
                                  slideData.backgroundColor === colors.purple ||
                                  slideData.backgroundColor === colors.blue ||
                                  slideData.backgroundColor === colors.orange ||
                                  slideData.backgroundColor === colors.green;
              
              if (shouldInvert) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = logoWidth;
                tempCanvas.height = logoHeight;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                  tempCtx.filter = 'invert(1) brightness(2)';
                  tempCtx.drawImage(logoImg, 0, 0, logoWidth, logoHeight);
                  ctx.drawImage(tempCanvas, logoX, logoY);
                } else {
                  ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                }
              } else {
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
              }
              resolve();
            };
            logoImg.onerror = () => resolve();
            logoImg.src = logo;
          });
        }
        
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `abrakadabra-${format}-slide-${i + 1}.jpg`;
              link.click();
              URL.revokeObjectURL(url);
            }
            setTimeout(resolve, 200);
          }, 'image/jpeg', 0.95);
        });
      }
      
      alert(`Successfully exported all ${slides.length} slides!`);
    } catch (error) {
      console.error('Export all failed:', error);
      alert('Failed to export all slides.');
    }
  };

  const exportAsVideo = async () => {
    alert('Preparing video export... This will take about ' + (slides.length * 3) + ' seconds.');
    
    try {
      const exportDims = getExportDimensions();
      const canvas = document.createElement('canvas');
      canvas.width = exportDims.width;
      canvas.height = exportDims.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `abrakadabra-${format}-video.webm`;
        link.click();
        URL.revokeObjectURL(url);
        alert('Video exported successfully!');
      };
      
      mediaRecorder.start();
      
      const scale = exportDims.width / dimensions.width;
      const slideDuration = 3000;
      const fps = 30;
      const framesPerSlide = (slideDuration / 1000) * fps;
      
      for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
        const slideData = slides[slideIndex];
        
        for (let frame = 0; frame < framesPerSlide; frame++) {
          ctx.fillStyle = slideData.backgroundColor;
          ctx.fillRect(0, 0, exportDims.width, exportDims.height);
          
          if (slideData.mediaItems && slideData.mediaItems.length > 0) {
            const mediaItem = slideData.mediaItems[0];
            if (mediaItem.type === 'image') {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = mediaItem.url;
              
              const imgScale = mediaItem.scale / 100;
              const imgWidth = exportDims.width * imgScale;
              const imgHeight = exportDims.height * imgScale;
              const posX = (exportDims.width * mediaItem.position.x / 100) - (imgWidth / 2);
              const posY = (exportDims.height * mediaItem.position.y / 100) - (imgHeight / 2);
              
              try {
                ctx.drawImage(img, posX, posY, imgWidth, imgHeight);
                if (slideData.type === 'image-text' || slideData.type === 'opening') {
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                  ctx.fillRect(0, 0, exportDims.width, exportDims.height);
                }
              } catch (e) {
                // Image not loaded yet, skip
              }
            }
          }
          
          ctx.textBaseline = 'top';
          
          const exportFontSizes = getExportFontSizes(format);
          
          if (slideData.type === 'opening') {
            ctx.fillStyle = slideData.textColor;
            ctx.font = `bold ${exportFontSizes.openingHeading * scale}px ${fonts.heading}`;
            const lines = slideData.topText.split('\n');
            lines.forEach((line, idx) => {
              ctx.fillText(line, slideData.textPosition.x * scale, (slideData.textPosition.y * scale) + (idx * exportFontSizes.openingHeading * scale * 1.2));
            });
          } else if (slideData.type === 'text-only') {
            ctx.fillStyle = slideData.textColor;
            ctx.font = `bold ${exportFontSizes.titleSize * scale}px ${fonts.subheading}`;
            ctx.fillText(slideData.title, slideData.textPosition.title.x * scale, slideData.textPosition.title.y * scale);
            ctx.font = `${exportFontSizes.bodySize * scale}px ${fonts.body}`;
            const bodyLines = slideData.body.split('\n');
            bodyLines.forEach((line, idx) => {
              ctx.fillText(line, slideData.textPosition.body.x * scale, (slideData.textPosition.body.y * scale) + (idx * exportFontSizes.bodySize * scale * 1.6));
            });
          } else if (slideData.type === 'image-text') {
            ctx.fillStyle = slideData.textColor;
            ctx.font = `bold ${exportFontSizes.imageTextSize * scale}px ${fonts.heading}`;
            ctx.fillText(slideData.text, slideData.textPosition.x * scale, slideData.textPosition.y * scale);
          } else if (slideData.type === 'closing') {
            ctx.fillStyle = slideData.textColor;
            ctx.font = `bold ${exportFontSizes.closingTitleSize * scale}px ${fonts.subheading}`;
            ctx.textAlign = 'center';
            ctx.fillText(slideData.title, slideData.textPosition.title.x * scale, slideData.textPosition.title.y * scale);
            ctx.font = `${exportFontSizes.closingSubtitleSize * scale}px ${fonts.body}`;
            ctx.fillText(slideData.subtitle, slideData.textPosition.subtitle.x * scale, slideData.textPosition.subtitle.y * scale);
            ctx.textAlign = 'left';
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        }
      }
      
      mediaRecorder.stop();
    } catch (error) {
      console.error('Video export failed:', error);
      alert('Video export failed. Your browser may not support this feature.');
    }
  };

  const shouldInvertLogo = currentSlideData.textColor === colors.white || 
                           currentSlideData.backgroundColor === colors.purple ||
                           currentSlideData.backgroundColor === colors.blue ||
                           currentSlideData.backgroundColor === colors.orange ||
                           currentSlideData.backgroundColor === colors.green;

  const responsiveFontSizes = getResponsiveFontSizes(format);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Main Carousel Container */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
          {/* Slide Content */}
          <div
            ref={slideRef}
            className={`w-full h-full relative overflow-hidden rounded-lg shadow-2xl transition-all ${
              draggingFromLibrary ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
            }`}
            style={{
              backgroundColor: currentSlideData.backgroundColor || colors.cream,
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              if (draggingFromLibrary) {
                handlePreviewDrop(e);
              } else {
                handleDrop(e);
              }
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Media */}
            {activeMedia && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  cursor: isDraggingMedia ? 'grabbing' : 'grab',
                  overflow: 'hidden',
                }}
                onMouseDown={handleMediaMouseDown}
              >
                {activeMedia.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={activeMedia.url}
                    className="absolute"
                    style={{
                      width: `${activeMedia.scale}%`,
                      height: `${activeMedia.scale}%`,
                      objectFit: 'cover',
                      left: `${activeMedia.position.x}%`,
                      top: `${activeMedia.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      backgroundColor: 'transparent',
                    }}
                    loop
                    muted
                    playsInline
                    autoPlay
                    onError={(e) => {
                      console.error('Video failed to load:', activeMedia.url);
                    }}
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt="Background"
                    className="absolute"
                    style={{
                      width: `${activeMedia.scale}%`,
                      height: `${activeMedia.scale}%`,
                      objectFit: 'cover',
                      left: `${activeMedia.position.x}%`,
                      top: `${activeMedia.position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      backgroundColor: 'transparent',
                    }}
                    draggable={false}
                    onError={(e) => {
                      console.error('Image failed to load:', activeMedia.url);
                    }}
                  />
                )}
              </div>
            )}

            {/* Dark overlay for media slides */}
            {activeMedia && (currentSlideData.type === 'image-text' || currentSlideData.type === 'opening') && (
              <div className="absolute inset-0 bg-black bg-opacity-40 z-[1]" />
            )}

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 pointer-events-none">
              {/* Opening Slide */}
              {currentSlideData.type === 'opening' && (
                <>
                  {currentSlideData.topText && (
                    <div
                      className={editMode ? "absolute group pointer-events-auto" : "absolute pointer-events-auto"}
                      style={{
                        left: `${currentSlideData.textPosition.x}px`,
                        top: `${currentSlideData.textPosition.y}px`,
                      }}
                    >
                      <div
                        className={editMode ? "cursor-move border-2 border-dashed border-transparent hover:border-blue-400 p-1" : ""}
                        onMouseDown={editMode ? (e) => {
                          // Only drag if clicking outside textarea
                          if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
                            handleTextMouseDown(e, 'main');
                          }
                        } : undefined}
                      >
                        <textarea
                          value={currentSlideData.topText}
                          onChange={(e) => updateSlide({ topText: e.target.value })}
                          readOnly={!editMode}
                          className={`bg-transparent border-none outline-none resize-none ${responsiveFontSizes.openingHeading} font-bold uppercase leading-tight ${editMode ? 'cursor-text' : 'cursor-default'}`}
                          style={{
                            color: currentSlideData.textColor,
                            fontFamily: fonts.heading,
                            width: currentSlideData.textWidth?.main ? `${currentSlideData.textWidth.main}px` : textWidths.opening,
                          }}
                          rows={6}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {editMode && (
                        <>
                          <button
                            onClick={() => deleteDefaultText('topText')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'main')}
                            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            title="Drag to resize"
                          />
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex-1" />
                  {currentSlideData.showLogo && (
                    <div className="flex justify-center">
                      <img
                        src={logo}
                        alt="ABRAKADABRA"
                        className={`h-8 object-contain pointer-events-none ${getLogoAnimationClass()}`}
                        style={{
                          filter: shouldInvertLogo ? 'invert(1) brightness(2)' : 'none',
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Text-Only Slide */}
              {currentSlideData.type === 'text-only' && (
                <>
                  <div className="flex-1 flex flex-col">
                    {currentSlideData.title && (
                      <div
                        className={editMode ? "absolute group pointer-events-auto" : "absolute pointer-events-auto"}
                        style={{
                          left: `${currentSlideData.textPosition.title.x}px`,
                          top: `${currentSlideData.textPosition.title.y}px`,
                        }}
                      >
                        <div
                          className={editMode ? "cursor-move border-2 border-dashed border-transparent hover:border-blue-400 p-1" : ""}
                          onMouseDown={editMode ? (e) => {
                            if ((e.target as HTMLElement).tagName !== 'INPUT') {
                              handleTextMouseDown(e, 'title');
                            }
                          } : undefined}
                        >
                          <input
                            type="text"
                            value={currentSlideData.title}
                            onChange={(e) => updateSlide({ title: e.target.value })}
                            readOnly={!editMode}
                            className={`bg-transparent border-none outline-none ${responsiveFontSizes.titleSize} font-bold ${editMode ? 'cursor-text' : 'cursor-default'}`}
                            style={{
                              color: currentSlideData.textColor,
                              fontFamily: fonts.subheading,
                              width: currentSlideData.textWidth?.title ? `${currentSlideData.textWidth.title}px` : textWidths.title,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {editMode && (
                          <>
                            <button
                              onClick={() => deleteDefaultText('title')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div
                              onMouseDown={(e) => handleResizeMouseDown(e, 'title')}
                              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                              title="Drag to resize"
                            />
                          </>
                        )}
                      </div>
                    )}
                    {currentSlideData.body && (
                      <div
                        className={editMode ? "absolute group pointer-events-auto" : "absolute pointer-events-auto"}
                        style={{
                          left: `${currentSlideData.textPosition.body.x}px`,
                          top: `${currentSlideData.textPosition.body.y}px`,
                        }}
                      >
                        <div
                          className={editMode ? "cursor-move border-2 border-dashed border-transparent hover:border-blue-400 p-1" : ""}
                          onMouseDown={editMode ? (e) => {
                            if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
                              handleTextMouseDown(e, 'body');
                            }
                          } : undefined}
                        >
                          <textarea
                            value={currentSlideData.body}
                            onChange={(e) => updateSlide({ body: e.target.value })}
                            readOnly={!editMode}
                            className={`bg-transparent border-none outline-none resize-none ${responsiveFontSizes.bodySize} leading-relaxed ${editMode ? 'cursor-text' : 'cursor-default'}`}
                            style={{
                              color: currentSlideData.textColor,
                              fontFamily: fonts.body,
                              width: currentSlideData.textWidth?.body ? `${currentSlideData.textWidth.body}px` : textWidths.body,
                            }}
                            rows={6}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {editMode && (
                          <>
                            <button
                              onClick={() => deleteDefaultText('body')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div
                              onMouseDown={(e) => handleResizeMouseDown(e, 'body')}
                              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                              title="Drag to resize"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {currentSlideData.showLogo && (
                    <div className="flex justify-center">
                      <img
                        src={logo}
                        alt="ABRAKADABRA"
                        className={`h-6 object-contain pointer-events-none ${showAnimated && !editMode ? 'animate-bounce' : ''}`}
                        style={{
                          filter: shouldInvertLogo ? 'invert(1) brightness(2)' : 'none',
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Image-Text Slide */}
              {currentSlideData.type === 'image-text' && (
                <>
                  {currentSlideData.text && (
                    <div
                      className={editMode ? "absolute group pointer-events-auto" : "absolute pointer-events-auto"}
                      style={{
                        left: `${currentSlideData.textPosition.x}px`,
                        top: `${currentSlideData.textPosition.y}px`,
                      }}
                    >
                      <div
                        className={editMode ? "cursor-move border-2 border-dashed border-transparent hover:border-blue-400 p-1" : ""}
                        onMouseDown={editMode ? (e) => {
                          if ((e.target as HTMLElement).tagName !== 'INPUT') {
                            handleTextMouseDown(e, 'main');
                          }
                        } : undefined}
                      >
                        <input
                          type="text"
                          value={currentSlideData.text}
                          onChange={(e) => updateSlide({ text: e.target.value })}
                          readOnly={!editMode}
                          className={`bg-transparent border-none outline-none ${responsiveFontSizes.imageTextSize} font-bold ${editMode ? 'cursor-text' : 'cursor-default'}`}
                          style={{
                            color: currentSlideData.textColor,
                            fontFamily: fonts.heading,
                            width: currentSlideData.textWidth?.main ? `${currentSlideData.textWidth.main}px` : textWidths.opening,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {editMode && (
                        <>
                          <button
                            onClick={() => deleteDefaultText('text')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, 'main')}
                            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            title="Drag to resize"
                          />
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex-1" />
                  {currentSlideData.showLogo && (
                    <div className="flex justify-center">
                      <img
                        src={logo}
                        alt="ABRAKADABRA"
                        className={`h-6 object-contain pointer-events-none ${getLogoAnimationClass()}`}
                        style={{
                          filter: shouldInvertLogo ? 'invert(1) brightness(2)' : 'none',
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Closing Slide */}
              {currentSlideData.type === 'closing' && (
                <>
                  <div className="flex-1 flex flex-col items-center">
                    {currentSlideData.title && (
                      <div
                        className={editMode ? "absolute group pointer-events-auto" : "absolute pointer-events-auto"}
                        style={{
                          left: `${currentSlideData.textPosition.title.x}px`,
                          top: `${currentSlideData.textPosition.title.y}px`,
                        }}
                      >
                        <div
                          className={editMode ? "cursor-move border-2 border-dashed border-transparent hover:border-blue-400 p-1" : ""}
                          onMouseDown={editMode ? (e) => {
                            if ((e.target as HTMLElement).tagName !== 'INPUT') {
                              handleTextMouseDown(e, 'title');
                            }
                          } : undefined}
                        >
                          <input
                            type="text"
                            value={currentSlideData.title}
                            onChange={(e) => updateSlide({ title: e.target.value })}
                            readOnly={!editMode}
                            className={`bg-transparent border-none outline-none ${responsiveFontSizes.closingTitleSize} font-bold text-center ${editMode ? 'cursor-text' : 'cursor-default'}`}
                            style={{
                              color: currentSlideData.textColor,
                              fontFamily: fonts.subheading,
                              width: currentSlideData.textWidth?.title ? `${currentSlideData.textWidth.title}px` : textWidths.closing,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {editMode && (
                          <>
                            <button
                              onClick={() => deleteDefaultText('title')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div
                              onMouseDown={(e) => handleResizeMouseDown(e, 'title')}
                              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                              title="Drag to resize"
                            />
                          </>
                        )}
                      </div>
                    )}
                    {currentSlideData.subtitle && (
                      <div
                        className={editMode ? "absolute group pointer-events-auto" : "absolute pointer-events-auto"}
                        style={{
                          left: `${currentSlideData.textPosition.subtitle.x}px`,
                          top: `${currentSlideData.textPosition.subtitle.y}px`,
                        }}
                      >
                        <div
                          className={editMode ? "cursor-move border-2 border-dashed border-transparent hover:border-blue-400 p-1" : ""}
                          onMouseDown={editMode ? (e) => {
                            if ((e.target as HTMLElement).tagName !== 'INPUT') {
                              handleTextMouseDown(e, 'subtitle');
                            }
                          } : undefined}
                        >
                          <input
                            type="text"
                            value={currentSlideData.subtitle}
                            onChange={(e) => updateSlide({ subtitle: e.target.value })}
                            readOnly={!editMode}
                            className={`bg-transparent border-none outline-none ${responsiveFontSizes.closingSubtitleSize} text-center ${editMode ? 'cursor-text' : 'cursor-default'}`}
                            style={{
                              color: currentSlideData.textColor,
                              fontFamily: fonts.body,
                              width: currentSlideData.textWidth?.subtitle ? `${currentSlideData.textWidth.subtitle}px` : textWidths.closing,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {editMode && (
                          <>
                            <button
                              onClick={() => deleteDefaultText('subtitle')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div
                              onMouseDown={(e) => handleResizeMouseDown(e, 'subtitle')}
                              className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                              title="Drag to resize"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {currentSlideData.showLogo && (
                    <div className="flex justify-center">
                      <img
                        src={logo}
                        alt="ABRAKADABRA"
                        className={`h-8 object-contain pointer-events-none ${getLogoAnimationClass()}`}
                        style={{
                          filter: shouldInvertLogo ? 'invert(1) brightness(2)' : 'none',
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Custom Text Elements */}
              {currentSlideData.customTextElements && currentSlideData.customTextElements.map((textEl) => (
                <div
                  key={textEl.id}
                  className={editMode ? "absolute cursor-move group" : "absolute"}
                  style={{
                    left: `${textEl.position.x}px`,
                    top: `${textEl.position.y}px`,
                  }}
                  onMouseDown={editMode ? (e) => {
                    setIsDraggingText(true);
                    setDraggedElement(textEl.id);
                    setDragStartPos({ x: e.clientX - textEl.position.x, y: e.clientY - textEl.position.y });
                  } : undefined}
                >
                  <input
                    type="text"
                    value={textEl.text}
                    onChange={(e) => updateCustomText(textEl.id, { text: e.target.value })}
                    readOnly={!editMode}
                    className={`bg-transparent border-none outline-none ${textEl.fontSize} ${textEl.fontWeight === 'bold' ? 'font-bold' : ''} ${!editMode ? 'cursor-default' : ''}`}
                    style={{
                      color: textEl.color,
                      fontFamily: textEl.fontFamily,
                      width: '300px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {editMode && (
                    <button
                      onClick={() => deleteCustomText(textEl.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {editMode && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-20"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Export Info */}
        {editMode && (
          <div className="text-center space-y-3">
            <div className="flex gap-2 justify-center">
              <button
                onClick={exportAsJPEG}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Export Current
              </button>
              <button
                onClick={exportAllSlides}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Export All
              </button>
            </div>
            <button
              onClick={exportAsVideo}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mx-auto"
            >
              <Video className="w-5 h-5" />
              Export as Video (3s per slide)
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Exports at {getExportDimensions().width}x{getExportDimensions().height}px (Instagram recommended)
            </p>
          </div>
        )}
      </div>

      {/* Editor Panel */}
      {editMode && (
        <div className="flex-1 min-w-[300px] max-w-md">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Slide {currentSlide + 1} of {slides.length}</h3>
            </div>

          {/* Custom Font Upload */}
          <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
            <label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" />
              Typography (Apple Notes Style)
            </label>
            <input
              ref={fontInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFontUpload}
              className="hidden"
            />
            <button
              onClick={() => fontInputRef.current?.click()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Upload Font (.ttf, .otf, .woff)
            </button>
            
            {/* Heading Font */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <span className="bg-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">HEADING</span>
                Opening slide • Image overlay text
              </label>
              <select
                value={fonts.heading}
                onChange={(e) => setFonts(prev => ({ ...prev, heading: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                style={{ fontFamily: fonts.heading }}
              >
                {customFonts.map((font) => (
                  <option key={`heading-${font.family}`} value={font.family} style={{ fontFamily: font.family }}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subheading Font */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <span className="bg-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">SUBHEADING</span>
                Slide titles
              </label>
              <select
                value={fonts.subheading}
                onChange={(e) => setFonts(prev => ({ ...prev, subheading: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                style={{ fontFamily: fonts.subheading }}
              >
                {customFonts.map((font) => (
                  <option key={`subheading-${font.family}`} value={font.family} style={{ fontFamily: font.family }}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Font */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                <span className="bg-green-200 px-2 py-0.5 rounded text-[10px] font-bold">BODY</span>
                Body text • Subtitles
              </label>
              <select
                value={fonts.body}
                onChange={(e) => setFonts(prev => ({ ...prev, body: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                style={{ fontFamily: fonts.body }}
              >
                {customFonts.map((font) => (
                  <option key={`body-${font.family}`} value={font.family} style={{ fontFamily: font.family }}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-600 mt-2">Upload LL Kristall for headings, Plantin for body</p>
          </div>

          {/* Media Upload with Drag & Drop Zone */}
          <div className="space-y-2">
            <label className="block font-medium text-sm">Media Library</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
              multiple
            />
            
            {/* Drag & Drop Zone */}
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
                isDraggingFile
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className={`p-3 rounded-full transition-all ${
                  isDraggingFile ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <Upload className={`w-6 h-6 ${isDraggingFile ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`font-medium transition-colors ${
                    isDraggingFile ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {isDraggingFile ? 'Drop files here' : 'Drag & drop images or videos'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">or</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Browse Files
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">Supports: JPG, PNG, GIF, MP4, WebM • Multiple files at once</p>
          </div>

          {/* Global Media Library */}
          {mediaLibrary.length > 0 && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium mb-2">
                Media Library ({mediaLibrary.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {mediaLibrary.map((media, index) => (
                  <div
                    key={media.id}
                    draggable
                    onDragStart={() => handleLibraryDragStart(media)}
                    onDragEnd={handleLibraryDragEnd}
                    className="cursor-move relative group aspect-square rounded overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all"
                  >
                    {media.type === 'video' ? (
                      <video 
                        src={media.url} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={media.url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaLibrary(prev => prev.filter(m => m.id !== media.id));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from library"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Drag images from here to the preview to add them to your slide
              </p>
            </div>
          )}

          {/* Media on This Slide */}
          {currentSlideData.mediaItems.length > 0 && (
            <div className="space-y-2 p-4 bg-green-50 rounded-lg">
              <label className="block text-sm font-medium mb-2">
                Media on This Slide ({currentSlideData.mediaItems.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {currentSlideData.mediaItems.map((media, index) => (
                  <div
                    key={media.id}
                    onClick={() => setActiveMediaIndex(index)}
                    className={`cursor-pointer relative group aspect-square rounded overflow-hidden border-2 transition-all ${
                      index === activeMediaIndex ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <video 
                        src={media.url} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={media.url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newMediaItems = currentSlideData.mediaItems.filter((_, i) => i !== index);
                        updateSlide({ mediaItems: newMediaItems });
                        if (activeMediaIndex >= newMediaItems.length) {
                          setActiveMediaIndex(Math.max(0, newMediaItems.length - 1));
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from slide"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Click to select for editing • First image is displayed on slide
              </p>
            </div>
          )}

          {/* Active Media Controls */}
          {activeMedia && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Active: {activeMedia.type === 'video' ? '🎥' : '🖼️'} #{activeMediaIndex + 1}
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <ZoomIn className="w-4 h-4" />
                  Scale: {activeMedia.scale}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={activeMedia.scale}
                  onChange={(e) => updateActiveMedia({ scale: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="text-xs text-gray-600">
                Click and drag media on slide to reposition
              </div>
            </div>
          )}

          {/* Text Positioning */}
          <div className="space-y-2 p-4 bg-green-50 rounded-lg">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Type className="w-4 h-4" />
              Text Controls
            </label>
            <button
              onClick={addCustomText}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Text
            </button>
            <button
              onClick={resetTextPosition}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Reset to Default Position
            </button>
            <p className="text-xs text-gray-600">Click and drag text to reposition • Hover over text for delete button</p>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="block font-medium text-sm">Background Color</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(colors).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => updateSlide({ backgroundColor: color })}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    currentSlideData.backgroundColor === color
                      ? 'border-black scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                />
              ))}
            </div>
            <input
              type="color"
              value={currentSlideData.backgroundColor}
              onChange={(e) => updateSlide({ backgroundColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="block font-medium text-sm">Text Color</label>
            <div className="grid grid-cols-4 gap-2">
              {[colors.black, colors.white, colors.purple, colors.blue].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSlide({ textColor: color })}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    currentSlideData.textColor === color
                      ? 'border-black scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={currentSlideData.textColor}
              onChange={(e) => updateSlide({ textColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          {/* Logo Toggle */}
          <div className="flex items-center justify-between">
            <label className="font-medium text-sm">Show Logo</label>
            <button
              onClick={() => updateSlide({ showLogo: !currentSlideData.showLogo })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentSlideData.showLogo
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {currentSlideData.showLogo ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {/* Logo Animation */}
          <div className="space-y-2">
            <label className="font-medium text-sm">Logo Animation</label>
            <select
              value={logoAnimation}
              onChange={(e) => setLogoAnimation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="none">None</option>
              <option value="bounce">Bounce</option>
              <option value="pulse">Pulse</option>
              <option value="swing">Swing</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide Up/Down</option>
              <option value="rotate">Rotate</option>
              <option value="wiggle">Wiggle</option>
              <option value="heartbeat">Heartbeat</option>
              <option value="float">Float</option>
              <option value="shake">Shake</option>
              <option value="flip">Flip</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {/* Text Style Selection Dialog */}
      {showTextStyleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Choose Text Style</h2>
            <p className="text-sm text-gray-600 mb-4">Select which font type to use for your custom text:</p>
            
            <div className="space-y-3 mb-6">
              <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedTextStyle === 'heading' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="textStyle"
                  value="heading"
                  checked={selectedTextStyle === 'heading'}
                  onChange={(e) => setSelectedTextStyle(e.target.value as 'heading' | 'subheading' | 'body')}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">HEADING</div>
                  <div className="text-xs text-gray-500">For opening slides & image overlays</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedTextStyle === 'subheading' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="textStyle"
                  value="subheading"
                  checked={selectedTextStyle === 'subheading'}
                  onChange={(e) => setSelectedTextStyle(e.target.value as 'heading' | 'subheading' | 'body')}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">SUBHEADING</div>
                  <div className="text-xs text-gray-500">For slide titles</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedTextStyle === 'body' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="textStyle"
                  value="body"
                  checked={selectedTextStyle === 'body'}
                  onChange={(e) => setSelectedTextStyle(e.target.value as 'heading' | 'subheading' | 'body')}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-bold">BODY</div>
                  <div className="text-xs text-gray-500">For body text & subtitles</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTextStyleDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddCustomText}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function EditableSocialMediaCarousel(props: EditableSocialMediaCarouselProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditableSocialMediaCarouselInner {...props} />
    </DndProvider>
  );
}