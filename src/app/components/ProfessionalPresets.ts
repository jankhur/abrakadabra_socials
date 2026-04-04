// Professional Design Presets — ATMOS-inspired editorial templates
// Each preset creates a set of slides with layers the user can fully edit

import type { Slide, BackgroundLayer, TextLayer, MediaLayer, LogoLayer } from './AbrakadabraSlides';

interface PresetDef {
  name: string;
  description: string;
  slides: Slide[];
}

// Helpers
const bg = (id: string, color: string): BackgroundLayer => ({
  id, type: 'background', zIndex: 0, visible: true, name: 'Background', color,
});

const text = (
  id: string, content: string, opts: Partial<TextLayer> & { position: { x: number; y: number } },
): TextLayer => ({
  id, type: 'text', zIndex: 2, visible: true, name: 'Text',
  content,
  fontSize: 28, fontFamily: 'Plantin', fontWeight: 400, fontStyle: 'normal',
  color: '#000000', textAlign: 'left', lineHeight: 1.4, letterSpacing: 0, width: 80,
  animation: 'fade-in', animationDelay: 0,
  ...opts,
});

const media = (id: string, opts?: Partial<MediaLayer>): MediaLayer => ({
  id, type: 'media', zIndex: 1, visible: true, name: 'Image',
  url: '', mediaType: 'image', scale: 100, position: { x: 50, y: 50 },
  ...opts,
});

const logo = (id: string, dims: { width: number; height: number }, opts?: Partial<LogoLayer>): LogoLayer => ({
  id, type: 'logo', zIndex: 10, visible: true, name: 'Logo',
  position: { x: dims.width / 2, y: dims.height - 50 },
  size: 24, pinned: true, animation: 'none', opacity: 1, filter: 'none',
  ...opts,
});

export function createProfessionalPresets(
  dims: { width: number; height: number },
): PresetDef[] {
  // Percentage helpers
  const pX = (px: number) => (px / dims.width) * 100;
  const pY = (py: number) => (py / dims.height) * 100;
  const pW = (w: number) => (w / dims.width) * 100;

  return [
    // ─── 1. EDITORIAL CLEAN ───────────────────────────────
    {
      name: 'Editorial Clean',
      description: 'White backgrounds, serif text, minimal layout. Magazine-style editorial.',
      slides: [
        { id: 1, layers: [
          bg('ec-bg1', '#FFFFFF'),
          text('ec-t1', 'YOUR\nHEADLINE\nHERE', {
            position: { x: pX(40), y: pY(dims.height * 0.3) },
            fontSize: 48, fontFamily: 'LL Kristall', fontWeight: 700, color: '#000000',
            textAlign: 'left', width: pW(dims.width - 80), lineHeight: 1.1,
            animation: 'slide-up',
          }),
          text('ec-t1b', 'Subtitle or tagline goes here', {
            position: { x: pX(40), y: pY(dims.height * 0.62) },
            fontSize: 18, fontFamily: 'Plantin', fontStyle: 'italic', color: '#666666',
            width: pW(dims.width - 80), zIndex: 3,
          }),
          logo('ec-l1', dims),
        ]},
        { id: 2, layers: [
          bg('ec-bg2', '#FFFFFF'),
          media('ec-m2', { scale: 100, position: { x: 50, y: 50 } }),
          logo('ec-l2', dims),
        ]},
        { id: 3, layers: [
          bg('ec-bg3', '#FFFFFF'),
          text('ec-t3', '"A great quote that captures\nthe essence of your story"', {
            position: { x: pX(40), y: pY(dims.height * 0.35) },
            fontSize: 32, fontFamily: 'Plantin', fontStyle: 'italic', color: '#333333',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.5,
            animation: 'blur-in',
          }),
          text('ec-t3b', '— Author Name', {
            position: { x: pX(40), y: pY(dims.height * 0.65) },
            fontSize: 16, fontFamily: 'LL Kristall', color: '#999999',
            textAlign: 'center', width: pW(dims.width - 80), zIndex: 3,
          }),
          logo('ec-l3', dims),
        ]},
        { id: 4, layers: [
          bg('ec-bg4', '#FFFFFF'),
          media('ec-m4', { scale: 100 }),
          logo('ec-l4', dims),
        ]},
        { id: 5, layers: [
          bg('ec-bg5', '#FFFFFF'),
          text('ec-t5', 'Body text goes here. Tell your story with intention. Every word should earn its place.', {
            position: { x: pX(40), y: pY(dims.height * 0.25) },
            fontSize: 20, fontFamily: 'Plantin', color: '#333333',
            textAlign: 'left', width: pW(dims.width - 80), lineHeight: 1.7,
          }),
          logo('ec-l5', dims),
        ]},
        { id: 6, layers: [
          bg('ec-bg6', '#FFFFFF'),
          media('ec-m6', { scale: 100 }),
          logo('ec-l6', dims),
        ]},
        { id: 7, layers: [
          bg('ec-bg7', '#F5F0E8'),
          text('ec-t7', 'LEARN MORE\nLINK IN BIO', {
            position: { x: pX(40), y: pY(dims.height * 0.4) },
            fontSize: 36, fontFamily: 'LL Kristall', fontWeight: 700, color: '#000000',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.3,
            animation: 'zoom-in',
          }),
          logo('ec-l7', dims),
        ]},
      ],
    },

    // ─── 2. PHOTO STORY (ATMOS-INSPIRED) ──────────────────
    {
      name: 'Photo Story',
      description: 'Full-bleed photos alternating with blurred backgrounds + text overlays. ATMOS-inspired.',
      slides: [
        // Slide 1: Full-bleed hero photo with title
        { id: 1, layers: [
          bg('ps-bg1', '#000000'),
          media('ps-m1', { scale: 100 }),
          text('ps-t1', 'THE\nOVERVIEW', {
            position: { x: pX(32), y: pY(40) },
            fontSize: 14, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFFFFF',
            letterSpacing: 3, width: pW(200), zIndex: 3,
          }),
          text('ps-t1b', 'Your Story\nTitle Here.', {
            position: { x: pX(32), y: pY(dims.height * 0.5) },
            fontSize: 36, fontFamily: 'Plantin', color: '#FFFFFF',
            textAlign: 'left', width: 45, lineHeight: 1.2, zIndex: 3,
            animation: 'slide-up',
          }),
          logo('ps-l1', dims, { filter: 'invert', opacity: 0.9 }),
        ]},
        // Slide 2: Blurred photo bg + quote
        { id: 2, layers: [
          bg('ps-bg2', '#000000'),
          media('ps-m2', { scale: 100, filter: 'blur', overlay: 'dark' }),
          text('ps-t2', '"A powerful quote that resonates\nwith your audience"', {
            position: { x: pX(32), y: pY(dims.height * 0.35) },
            fontSize: 28, fontFamily: 'Plantin', fontStyle: 'italic', color: '#FFFFFF',
            textAlign: 'left', width: pW(dims.width - 64), lineHeight: 1.5, zIndex: 3,
            animation: 'fade-in',
          }),
          text('ps-t2b', 'Author Name', {
            position: { x: pX(32), y: pY(dims.height * 0.6) },
            fontSize: 18, fontFamily: 'LL Kristall', color: '#CCCCCC',
            width: pW(dims.width - 64), zIndex: 3,
          }),
          logo('ps-l2', dims, { filter: 'invert', opacity: 0.8 }),
        ]},
        // Slide 3: Full-bleed photo
        { id: 3, layers: [
          bg('ps-bg3', '#000000'),
          media('ps-m3', { scale: 100 }),
          logo('ps-l3', dims, { filter: 'invert', opacity: 0.9 }),
        ]},
        // Slide 4: White quote slide
        { id: 4, layers: [
          bg('ps-bg4', '#FFFFFF'),
          text('ps-t4', 'The story continues\nwith reflection\nand meaning.', {
            position: { x: pX(40), y: pY(dims.height * 0.3) },
            fontSize: 32, fontFamily: 'Plantin', color: '#1A1A1A',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.5,
            animation: 'blur-in',
          }),
          logo('ps-l4', dims),
        ]},
        // Slide 5: Full-bleed photo
        { id: 5, layers: [
          bg('ps-bg5', '#000000'),
          media('ps-m5', { scale: 100, overlay: 'gradient' }),
          text('ps-t5', 'Key insight or\nstatement here', {
            position: { x: pX(32), y: pY(dims.height * 0.7) },
            fontSize: 28, fontFamily: 'Plantin', color: '#FFFFFF',
            width: 60, lineHeight: 1.3, zIndex: 3,
          }),
          logo('ps-l5', dims, { filter: 'invert' }),
        ]},
        // Slide 6: Blurred + text
        { id: 6, layers: [
          bg('ps-bg6', '#000000'),
          media('ps-m6', { scale: 100, filter: 'blur', overlay: 'dark' }),
          text('ps-t6', 'Another reflective\npassage with depth\nand purpose.', {
            position: { x: pX(32), y: pY(dims.height * 0.3) },
            fontSize: 26, fontFamily: 'Plantin', fontStyle: 'italic', color: '#FFFFFF',
            width: pW(dims.width - 64), lineHeight: 1.6, zIndex: 3,
          }),
          logo('ps-l6', dims, { filter: 'invert' }),
        ]},
        // Slide 7: Full-bleed
        { id: 7, layers: [
          bg('ps-bg7', '#000000'),
          media('ps-m7', { scale: 100 }),
          logo('ps-l7', dims, { filter: 'invert' }),
        ]},
        // Slide 8: CTA
        { id: 8, layers: [
          bg('ps-bg8', '#0D0D0D'),
          text('ps-t8', 'READ MORE\nLINK IN BIO', {
            position: { x: pX(40), y: pY(dims.height * 0.4) },
            fontSize: 32, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFFFFF',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.4, letterSpacing: 2,
            animation: 'zoom-in',
          }),
          logo('ps-l8', dims, { filter: 'invert' }),
        ]},
      ],
    },

    // ─── 3. BOLD STATEMENT ────────────────────────────────
    {
      name: 'Bold Statement',
      description: 'High contrast colors, large sans-serif type. Think Nike, think impact.',
      slides: [
        { id: 1, layers: [
          bg('bs-bg1', '#000000'),
          text('bs-t1', 'MAKE\nIT\nHAPPEN.', {
            position: { x: pX(40), y: pY(dims.height * 0.25) },
            fontSize: 56, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFFFFF',
            lineHeight: 1.0, width: pW(dims.width - 80),
            animation: 'slide-up',
          }),
          logo('bs-l1', dims, { filter: 'invert' }),
        ]},
        { id: 2, layers: [
          bg('bs-bg2', '#FF4500'),
          text('bs-t2', 'YOUR\nSTORY\nSTARTS\nHERE', {
            position: { x: pX(40), y: pY(dims.height * 0.2) },
            fontSize: 52, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFFFFF',
            lineHeight: 1.05, width: pW(dims.width - 80),
            animation: 'bounce',
          }),
          logo('bs-l2', dims, { filter: 'invert' }),
        ]},
        { id: 3, layers: [
          bg('bs-bg3', '#FFFFFF'),
          media('bs-m3', { scale: 100 }),
          logo('bs-l3', dims),
        ]},
        { id: 4, layers: [
          bg('bs-bg4', '#FFD700'),
          text('bs-t4', 'BREAK\nTHE\nRULES', {
            position: { x: pX(40), y: pY(dims.height * 0.25) },
            fontSize: 56, fontFamily: 'LL Kristall', fontWeight: 700, color: '#000000',
            lineHeight: 1.0, width: pW(dims.width - 80),
            animation: 'elastic',
          }),
          logo('bs-l4', dims),
        ]},
        { id: 5, layers: [
          bg('bs-bg5', '#000000'),
          media('bs-m5', { scale: 100, overlay: 'dark' }),
          text('bs-t5', 'CREATE\nSOMETHING\nWORTH\nSHARING', {
            position: { x: pX(32), y: pY(dims.height * 0.2) },
            fontSize: 44, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFFFFF',
            lineHeight: 1.1, width: pW(dims.width - 64), zIndex: 3,
            animation: 'slide-up',
          }),
          logo('bs-l5', dims, { filter: 'invert' }),
        ]},
        { id: 6, layers: [
          bg('bs-bg6', '#1A1A2E'),
          text('bs-t6', 'FOLLOW\nFOR MORE', {
            position: { x: pX(40), y: pY(dims.height * 0.35) },
            fontSize: 48, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFD700',
            textAlign: 'center', lineHeight: 1.2, width: pW(dims.width - 80),
            animation: 'zoom-in',
          }),
          logo('bs-l6', dims, { filter: 'invert' }),
        ]},
      ],
    },

    // ─── 4. DARK EDITORIAL ────────────────────────────────
    {
      name: 'Dark Editorial',
      description: 'Moody dark tones, gold accents, scattered text. ATMOS poetry-style.',
      slides: [
        { id: 1, layers: [
          bg('de-bg1', '#0D0D0D'),
          media('de-m1', { scale: 100, overlay: 'dark' }),
          text('de-t1', 'THE\nTITLE', {
            position: { x: pX(32), y: pY(dims.height * 0.15) },
            fontSize: 28, fontFamily: 'LL Kristall', fontWeight: 700, color: '#FFFFFF',
            letterSpacing: 2, width: 40, lineHeight: 1.2, zIndex: 3,
          }),
          text('de-t1b', 'Author Name', {
            position: { x: pX(32), y: pY(dims.height * 0.32) },
            fontSize: 18, fontFamily: 'Plantin', fontStyle: 'italic', color: '#D4AF37',
            width: 40, zIndex: 3,
          }),
          logo('de-l1', dims, { filter: 'invert', opacity: 0.7 }),
        ]},
        { id: 2, layers: [
          bg('de-bg2', '#0D0D0D'),
          media('de-m2', { scale: 100, overlay: 'dark' }),
          text('de-t2', '"Who are we if we are not speaking from the heart?"', {
            position: { x: 5, y: pY(dims.height * 0.1) },
            fontSize: 22, fontFamily: 'Plantin', color: '#F5F0E8',
            textAlign: 'justify-spread', width: 90, lineHeight: 2.5, zIndex: 3,
            animation: 'fade-in',
          }),
          text('de-t2b', 'ATTRIBUTION', {
            position: { x: 60, y: pY(dims.height * 0.88) },
            fontSize: 12, fontFamily: 'LL Kristall', color: '#D4AF37',
            letterSpacing: 4, width: 35, zIndex: 3,
          }),
          logo('de-l2', dims, { filter: 'invert', opacity: 0.7 }),
        ]},
        { id: 3, layers: [
          bg('de-bg3', '#1A1A1A'),
          text('de-t3', '"What is mysticism but paying attention?"', {
            position: { x: 5, y: pY(dims.height * 0.1) },
            fontSize: 24, fontFamily: 'Plantin', fontStyle: 'italic', color: '#F5F0E8',
            textAlign: 'justify-spread', width: 90, lineHeight: 2.5,
            animation: 'blur-in',
          }),
          logo('de-l3', dims, { filter: 'invert', opacity: 0.7 }),
        ]},
        { id: 4, layers: [
          bg('de-bg4', '#0D0D0D'),
          media('de-m4', { scale: 100, filter: 'grayscale', overlay: 'dark' }),
          logo('de-l4', dims, { filter: 'invert', opacity: 0.7 }),
        ]},
        { id: 5, layers: [
          bg('de-bg5', '#2D2D2D'),
          text('de-t5', '5 Things\nWorth\nKnowing\nThis\nMonth', {
            position: { x: pX(40), y: pY(dims.height * 0.15) },
            fontSize: 36, fontFamily: 'Plantin', color: '#FFFFFF',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.6,
            animation: 'slide-up',
          }),
          logo('de-l5', dims, { filter: 'invert' }),
        ]},
        { id: 6, layers: [
          bg('de-bg6', '#0D0D0D'),
          media('de-m6', { scale: 100, overlay: 'gradient' }),
          text('de-t6', 'Closing thought\nthat lingers', {
            position: { x: pX(32), y: pY(dims.height * 0.72) },
            fontSize: 26, fontFamily: 'Plantin', fontStyle: 'italic', color: '#D4AF37',
            width: 60, lineHeight: 1.4, zIndex: 3,
          }),
          logo('de-l6', dims, { filter: 'invert', opacity: 0.7 }),
        ]},
        { id: 7, layers: [
          bg('de-bg7', '#0D0D0D'),
          text('de-t7', 'READ THE\nFULL STORY', {
            position: { x: pX(40), y: pY(dims.height * 0.38) },
            fontSize: 32, fontFamily: 'LL Kristall', fontWeight: 700, color: '#D4AF37',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.3,
            letterSpacing: 2, animation: 'zoom-in',
          }),
          logo('de-l7', dims, { filter: 'invert' }),
        ]},
      ],
    },

    // ─── 5. DIPTYCH GALLERY ───────────────────────────────
    {
      name: 'Diptych Gallery',
      description: 'Two photos side by side with white space. Portfolio/lookbook style.',
      slides: [
        { id: 1, layers: [
          bg('dg-bg1', '#FFFFFF'),
          text('dg-t1', 'COLLECTION\nTITLE', {
            position: { x: pX(40), y: pY(dims.height * 0.35) },
            fontSize: 42, fontFamily: 'LL Kristall', fontWeight: 700, color: '#000000',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.1,
            animation: 'slide-up',
          }),
          text('dg-t1b', 'Season / Year', {
            position: { x: pX(40), y: pY(dims.height * 0.56) },
            fontSize: 16, fontFamily: 'Plantin', fontStyle: 'italic', color: '#888888',
            textAlign: 'center', width: pW(dims.width - 80), zIndex: 3,
          }),
          logo('dg-l1', dims),
        ]},
        // Diptych slide
        { id: 2, layers: [
          bg('dg-bg2', '#FFFFFF'),
          media('dg-m2a', { scale: 48, position: { x: 25, y: 30 }, zIndex: 1 }),
          media('dg-m2b', { scale: 48, position: { x: 75, y: 30 }, zIndex: 1 }),
          logo('dg-l2', dims),
        ]},
        { id: 3, layers: [
          bg('dg-bg3', '#FFFFFF'),
          text('dg-t3', 'A brief description\nof the work shown', {
            position: { x: pX(40), y: pY(dims.height * 0.35) },
            fontSize: 22, fontFamily: 'Plantin', fontStyle: 'italic', color: '#444444',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.6,
          }),
          logo('dg-l3', dims),
        ]},
        // Another diptych
        { id: 4, layers: [
          bg('dg-bg4', '#FFFFFF'),
          media('dg-m4a', { scale: 48, position: { x: 25, y: 30 }, zIndex: 1 }),
          media('dg-m4b', { scale: 48, position: { x: 75, y: 30 }, zIndex: 1 }),
          logo('dg-l4', dims),
        ]},
        { id: 5, layers: [
          bg('dg-bg5', '#FFFFFF'),
          media('dg-m5', { scale: 100 }),
          logo('dg-l5', dims),
        ]},
        { id: 6, layers: [
          bg('dg-bg6', '#F5F0E8'),
          text('dg-t6', 'VIEW\nFULL\nPROJECT', {
            position: { x: pX(40), y: pY(dims.height * 0.35) },
            fontSize: 36, fontFamily: 'LL Kristall', fontWeight: 700, color: '#000000',
            textAlign: 'center', width: pW(dims.width - 80), lineHeight: 1.2,
            letterSpacing: 2, animation: 'fade-in',
          }),
          logo('dg-l6', dims),
        ]},
      ],
    },
  ];
}
