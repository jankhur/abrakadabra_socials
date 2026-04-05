// Abrakadabra Brand Slides Configuration
// Professional slide templates for social media

export const colors = {
  blue: '#4A90E2',
  yellow: '#F5D547',
  purple: '#8B5CF6',
  orange: '#FF8A3D',
  cream: '#FFF9F0',
  black: '#000000',
  white: '#FFFFFF',
};

export type BackgroundLayer = {
  id: string;
  type: 'background';
  zIndex: number;
  visible: boolean;
  name: string;
  color: string;
};

export type TextLayer = {
  id: string;
  type: 'text';
  zIndex: number;
  visible: boolean;
  name: string;
  content: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: 'LL Kristall' | 'Plantin';
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
};

export type LogoLayer = {
  id: string;
  type: 'logo';
  zIndex: number;
  visible: boolean;
  name: string;
  position: { x: number; y: number };
  size: number;
  pinned: boolean;
  animation: 'none' | 'fade-in' | 'slide-up' | 'bounce' | 'pulse' | 'spin';
  opacity: number;
  filter: 'none' | 'invert' | 'brightness' | 'contrast' | 'grayscale';
};

export type MediaLayer = {
  id: string;
  type: 'media';
  zIndex: number;
  visible: boolean;
  name: string;
  url: string;
  mediaType: 'image' | 'video';
  scale: number;
  position: { x: number; y: number };
  filter?: 'none' | 'blur' | 'grayscale' | 'sepia' | 'brightness';
  overlay?: 'none' | 'dark' | 'light' | 'gradient';
  crop?: 'full' | 'left-half' | 'right-half' | 'top-half' | 'bottom-half';
  borderWidth?: number;
  borderColor?: string;
  // New transform & style properties
  rotation?: number;         // degrees, -180 to 180
  cornerRadius?: number;     // px
  flipH?: boolean;
  flipV?: boolean;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  opacity?: number;          // 0-100
  objectFit?: 'cover' | 'contain';
};

export type Layer = BackgroundLayer | MediaLayer | TextLayer | LogoLayer;

export interface Slide {
  id: number;
  layers: Layer[];
  frameWidth?: number;
  frameColor?: string;
}

export const createAbrakadabraSlides = (
  dims: { width: number; height: number },
  centerX: number,
  centerY: number
): Slide[] => {
  // Convert pixel positions to percentages for format-independent layout
  const pctX = (px: number) => (px / dims.width) * 100;
  const pctY = (px: number) => (px / dims.height) * 100;
  const pctW = (px: number) => (px / dims.width) * 100;

  return [
    // Slide 1: Brand Hero Slide
    {
      id: 1,
      layers: [
        {
          id: 'bg-1',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.purple,
        } as BackgroundLayer,
        {
          id: 'text-1-main',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Main Heading',
          content: 'ABRAKADABRA',
          position: { x: pctX(32), y: pctY(centerY - 80) },
          fontSize: 52,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.1,
          letterSpacing: 2,
          width: pctW(dims.width - 64),
          animation: 'fade-in',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-1-sub',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Subheading',
          content: 'Creative Magic for\\nYour Brand',
          position: { x: pctX(32), y: pctY(centerY + 20) },
          fontSize: 24,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.yellow,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-up',
          animationDelay: 300,
        } as TextLayer,
        {
          id: 'logo-1',
          type: 'logo',
          zIndex: 3,
          visible: true,
          name: 'Logo',
          position: { x: centerX, y: dims.height - 60 },
          size: 28,
          pinned: true,
          animation: 'none',
          opacity: 1,
          filter: 'none',
        } as LogoLayer,
      ],
    },

    // Slide 2: Services Overview
    {
      id: 2,
      layers: [
        {
          id: 'bg-2',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.cream,
        } as BackgroundLayer,
        {
          id: 'text-2-title',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Title',
          content: 'WHAT WE DO',
          position: { x: pctX(32), y: pctY(60) },
          fontSize: 42,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.purple,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 1,
          width: pctW(dims.width - 64),
          animation: 'slide-down',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-2-item1',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Service 1',
          content: '✦ Brand Strategy',
          position: { x: pctX(32), y: pctY(180) },
          fontSize: 22,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-right',
          animationDelay: 200,
        } as TextLayer,
        {
          id: 'text-2-item2',
          type: 'text',
          zIndex: 3,
          visible: true,
          name: 'Service 2',
          content: '✦ Creative Design',
          position: { x: pctX(32), y: pctY(240) },
          fontSize: 22,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-right',
          animationDelay: 400,
        } as TextLayer,
        {
          id: 'text-2-item3',
          type: 'text',
          zIndex: 4,
          visible: true,
          name: 'Service 3',
          content: '✦ Digital Transformation',
          position: { x: pctX(32), y: pctY(300) },
          fontSize: 22,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-right',
          animationDelay: 600,
        } as TextLayer,
        {
          id: 'logo-2',
          type: 'logo',
          zIndex: 5,
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

    // Slide 3: Quote / Testimonial
    {
      id: 3,
      layers: [
        {
          id: 'bg-3',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.blue,
        } as BackgroundLayer,
        {
          id: 'text-3-quote',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Quote',
          content: '"Abrakadabra transformed our brand with creative excellence and strategic thinking."',
          position: { x: pctX(40), y: pctY(centerY - 80) },
          fontSize: 28,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'italic',
          color: colors.white,
          textAlign: 'center',
          lineHeight: 1.5,
          letterSpacing: 0,
          width: pctW(dims.width - 80),
          animation: 'zoom-in',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-3-author',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Author',
          content: '— Client Name, Company',
          position: { x: pctX(40), y: pctY(centerY + 60) },
          fontSize: 18,
          fontFamily: 'Plantin',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.yellow,
          textAlign: 'center',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 80),
          animation: 'fade-in',
          animationDelay: 500,
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

    // Slide 4: Stats / Numbers
    {
      id: 4,
      layers: [
        {
          id: 'bg-4',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.orange,
        } as BackgroundLayer,
        {
          id: 'text-4-number',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Big Number',
          content: '500+',
          position: { x: pctX(32), y: pctY(centerY - 100) },
          fontSize: 72,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'bounce',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-4-label',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Label',
          content: 'Projects Delivered\\nWith Excellence',
          position: { x: pctX(32), y: pctY(centerY + 20) },
          fontSize: 26,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-up',
          animationDelay: 300,
        } as TextLayer,
        {
          id: 'logo-4',
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

    // Slide 5: Image + Text Overlay
    {
      id: 5,
      layers: [
        {
          id: 'bg-5',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.black,
        } as BackgroundLayer,
        {
          id: 'text-5-title',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Title',
          content: 'OUR\\nAPPROACH',
          position: { x: pctX(40), y: pctY(centerY - 60) },
          fontSize: 56,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.yellow,
          textAlign: 'left',
          lineHeight: 1.1,
          letterSpacing: 2,
          width: pctW(dims.width - 80),
          animation: 'slide-left',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-5-desc',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Description',
          content: 'Data-driven creativity\\nmeets bold execution',
          position: { x: pctX(40), y: pctY(centerY + 80) },
          fontSize: 20,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.5,
          letterSpacing: 0,
          width: pctW(dims.width - 80),
          animation: 'fade-in',
          animationDelay: 400,
        } as TextLayer,
        {
          id: 'logo-5',
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

    // Slide 6: Process Step
    {
      id: 6,
      layers: [
        {
          id: 'bg-6',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.cream,
        } as BackgroundLayer,
        {
          id: 'text-6-number',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Step Number',
          content: '01',
          position: { x: pctX(32), y: pctY(80) },
          fontSize: 64,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.purple,
          textAlign: 'left',
          lineHeight: 1,
          letterSpacing: 0,
          width: pctW(150),
          animation: 'zoom-in',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-6-title',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Step Title',
          content: 'DISCOVERY',
          position: { x: pctX(32), y: pctY(180) },
          fontSize: 36,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 1,
          width: pctW(dims.width - 64),
          animation: 'slide-right',
          animationDelay: 200,
        } as TextLayer,
        {
          id: 'text-6-desc',
          type: 'text',
          zIndex: 3,
          visible: true,
          name: 'Step Description',
          content: 'We dive deep into understanding your brand, audience, and goals to create the perfect foundation.',
          position: { x: pctX(32), y: pctY(250) },
          fontSize: 18,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'fade-in',
          animationDelay: 400,
        } as TextLayer,
        {
          id: 'logo-6',
          type: 'logo',
          zIndex: 4,
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

    // Slide 7: Feature Highlight
    {
      id: 7,
      layers: [
        {
          id: 'bg-7',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.yellow,
        } as BackgroundLayer,
        {
          id: 'text-7-title',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Title',
          content: 'WHY CHOOSE US?',
          position: { x: pctX(32), y: pctY(100) },
          fontSize: 38,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 1,
          width: pctW(dims.width - 64),
          animation: 'slide-down',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-7-body',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Body',
          content: 'We combine strategic thinking with creative magic to deliver results that exceed expectations.',
          position: { x: pctX(32), y: pctY(200) },
          fontSize: 22,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.black,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-up',
          animationDelay: 300,
        } as TextLayer,
        {
          id: 'logo-7',
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

    // Slide 8: Call to Action
    {
      id: 8,
      layers: [
        {
          id: 'bg-8',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.purple,
        } as BackgroundLayer,
        {
          id: 'text-8-cta',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'CTA',
          content: 'READY TO CREATE\\nSOMETHING MAGICAL?',
          position: { x: pctX(40), y: pctY(centerY - 60) },
          fontSize: 40,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 1,
          width: pctW(dims.width - 80),
          animation: 'bounce',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-8-contact',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Contact',
          content: 'hello@abrakadabra.com',
          position: { x: pctX(40), y: pctY(centerY + 60) },
          fontSize: 22,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.yellow,
          textAlign: 'center',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 80),
          animation: 'fade-in',
          animationDelay: 400,
        } as TextLayer,
        {
          id: 'logo-8',
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

    // Slide 9: Social Proof
    {
      id: 9,
      layers: [
        {
          id: 'bg-9',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.blue,
        } as BackgroundLayer,
        {
          id: 'text-9-stat1',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Stat 1',
          content: '98%',
          position: { x: pctX(32), y: pctY(120) },
          fontSize: 56,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.yellow,
          textAlign: 'left',
          lineHeight: 1,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'zoom-in',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-9-label1',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Label 1',
          content: 'Client Satisfaction',
          position: { x: pctX(32), y: pctY(200) },
          fontSize: 20,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-right',
          animationDelay: 200,
        } as TextLayer,
        {
          id: 'text-9-stat2',
          type: 'text',
          zIndex: 3,
          visible: true,
          name: 'Stat 2',
          content: '10 Years',
          position: { x: pctX(32), y: pctY(300) },
          fontSize: 56,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.yellow,
          textAlign: 'left',
          lineHeight: 1,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'zoom-in',
          animationDelay: 400,
        } as TextLayer,
        {
          id: 'text-9-label2',
          type: 'text',
          zIndex: 4,
          visible: true,
          name: 'Label 2',
          content: 'Of Creative Excellence',
          position: { x: pctX(32), y: pctY(380) },
          fontSize: 20,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 64),
          animation: 'slide-right',
          animationDelay: 600,
        } as TextLayer,
        {
          id: 'logo-9',
          type: 'logo',
          zIndex: 5,
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

    // Slide 10: Closing / Thank You
    {
      id: 10,
      layers: [
        {
          id: 'bg-10',
          type: 'background',
          zIndex: 0,
          visible: true,
          name: 'Background',
          color: colors.black,
        } as BackgroundLayer,
        {
          id: 'text-10-thanks',
          type: 'text',
          zIndex: 1,
          visible: true,
          name: 'Thank You',
          content: 'THANK YOU',
          position: { x: pctX(40), y: pctY(centerY - 40) },
          fontSize: 52,
          fontFamily: 'LL Kristall',
          fontWeight: 700,
          fontStyle: 'normal',
          color: colors.white,
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 2,
          width: pctW(dims.width - 80),
          animation: 'fade-in',
          animationDelay: 0,
        } as TextLayer,
        {
          id: 'text-10-tagline',
          type: 'text',
          zIndex: 2,
          visible: true,
          name: 'Tagline',
          content: "Let's create magic together",
          position: { x: pctX(40), y: pctY(centerY + 40) },
          fontSize: 24,
          fontFamily: 'Plantin',
          fontWeight: 400,
          fontStyle: 'italic',
          color: colors.yellow,
          textAlign: 'center',
          lineHeight: 1.4,
          letterSpacing: 0,
          width: pctW(dims.width - 80),
          animation: 'slide-up',
          animationDelay: 300,
        } as TextLayer,
        {
          id: 'logo-10',
          type: 'logo',
          zIndex: 3,
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
  ];
};
