import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from '../../assets/6705475f4c357a167b42625959f8ccbb9d9a1ccb.png';

interface AnimatedSocialMediaCarouselProps {
  format: 'story' | 'post' | 'linkedin';
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
};

// Sample slides data - EDIT THIS to customize your content
const slidesData = [
  {
    id: 1,
    type: 'opening',
    topText: 'CASE STUDY:\nTRANSFORMING DIGITAL\nEXPERIENCES',
    backgroundColor: colors.cream,
    showLogo: true,
  },
  {
    id: 2,
    type: 'text-only',
    title: 'The Challenge',
    body: 'Our client needed a complete digital transformation to compete in the modern marketplace.',
    backgroundColor: colors.blue,
    textColor: 'white',
    showLogo: true,
  },
  {
    id: 3,
    type: 'image-text',
    text: 'Research & Discovery',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
    showLogo: true,
  },
  {
    id: 4,
    type: 'text-only',
    title: 'Our Approach',
    body: 'We developed a comprehensive strategy focusing on user experience, brand identity, and scalable technology.',
    backgroundColor: colors.yellow,
    textColor: colors.purple,
    showLogo: true,
  },
  {
    id: 5,
    type: 'image-text',
    text: 'Design & Development',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200',
    showLogo: true,
  },
  {
    id: 6,
    type: 'text-only',
    title: 'Key Features',
    body: '• Responsive design\n• Intuitive navigation\n• Enhanced performance\n• Modern aesthetics',
    backgroundColor: colors.orange,
    textColor: 'white',
    showLogo: true,
  },
  {
    id: 7,
    type: 'image-text',
    text: 'Implementation',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200',
    showLogo: true,
  },
  {
    id: 8,
    type: 'text-only',
    title: 'Results',
    body: '300% increase in user engagement\n150% boost in conversions\nAward-winning design',
    backgroundColor: colors.green,
    textColor: 'white',
    showLogo: true,
  },
  {
    id: 9,
    type: 'image-text',
    text: 'Client Success',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200',
    showLogo: true,
  },
  {
    id: 10,
    type: 'closing',
    title: 'Ready to transform your brand?',
    subtitle: 'Let\'s work together',
    backgroundColor: colors.purple,
    textColor: 'white',
    showLogo: true,
  },
];

// Animated Logo Component
function AnimatedLogo({ invert = false }: { invert?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center"
    >
      <motion.img
        src={logo}
        alt="ABRAKADABRA"
        className="h-8 object-contain"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          filter: invert ? 'invert(1) brightness(2)' : 'none',
        }}
      />
    </motion.div>
  );
}

export function AnimatedSocialMediaCarousel({ format }: AnimatedSocialMediaCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(slidesData);

  const dimensions =
    format === 'story'
      ? { width: 405, height: 720 } // 9:16 ratio
      : { width: 600, height: 600 }; // 1:1 ratio

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleLogo = (index: number) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, showLogo: !slide.showLogo } : slide
      )
    );
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Carousel Container */}
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        {/* Slide Content */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full relative overflow-hidden rounded-lg shadow-2xl"
          style={{
            backgroundColor: currentSlideData.backgroundColor || colors.cream,
          }}
        >
          {/* Opening Slide */}
          {currentSlideData.type === 'opening' && (
            <div className="w-full h-full flex flex-col justify-between p-8">
              <div className="flex-1 flex items-start">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold uppercase leading-tight whitespace-pre-line"
                  style={{
                    color: currentSlideData.textColor || colors.purple,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {currentSlideData.topText}
                </motion.h1>
              </div>
              {currentSlideData.showLogo && <AnimatedLogo invert />}
            </div>
          )}

          {/* Text-Only Slide */}
          {currentSlideData.type === 'text-only' && (
            <div className="w-full h-full flex flex-col justify-between p-8">
              <div className="flex-1 flex flex-col justify-center">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl font-bold mb-4"
                  style={{
                    color: currentSlideData.textColor || 'black',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {currentSlideData.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-lg leading-relaxed whitespace-pre-line"
                  style={{
                    color: currentSlideData.textColor || 'black',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {currentSlideData.body}
                </motion.p>
              </div>
              {currentSlideData.showLogo && (
                <AnimatedLogo invert={currentSlideData.textColor === 'white'} />
              )}
            </div>
          )}

          {/* Image-Text Slide */}
          {currentSlideData.type === 'image-text' && (
            <div className="w-full h-full relative">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <ImageWithFallback
                  src={currentSlideData.imageUrl!}
                  alt="Slide background"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-8">
                <div className="flex-1 flex items-start">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-4xl font-bold text-white"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {currentSlideData.text}
                  </motion.h2>
                </div>
                {currentSlideData.showLogo && <AnimatedLogo invert />}
              </div>
            </div>
          )}

          {/* Closing Slide */}
          {currentSlideData.type === 'closing' && (
            <div className="w-full h-full flex flex-col justify-between p-8">
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                <motion.h2
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl font-bold mb-4"
                  style={{
                    color: currentSlideData.textColor || 'white',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {currentSlideData.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl"
                  style={{
                    color: currentSlideData.textColor || 'white',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {currentSlideData.subtitle}
                </motion.p>
              </div>
              {currentSlideData.showLogo && <AnimatedLogo invert />}
            </div>
          )}
        </motion.div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
      </div>

      {/* Controls Below */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="text-center">
          <p className="text-lg font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </p>
        </div>

        <button
          onClick={() => toggleLogo(currentSlide)}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {currentSlideData.showLogo ? 'Hide Logo' : 'Show Logo'} on This Slide
        </button>
      </div>
    </div>
  );
}
