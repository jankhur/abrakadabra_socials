import { Sparkles, Image, Type, Layers, Zap, Download } from 'lucide-react';
import logo from '../../assets/6705475f4c357a167b42625959f8ccbb9d9a1ccb.png';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cream-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="ABRAKADABRA" 
              className="h-16 object-contain"
            />
          </div>
          <h1 className="text-6xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'LL Kristall', sans-serif" }}>
            SOCIAL MEDIA
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
              TEMPLATE STUDIO
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: "'Plantin', serif" }}>
            Create stunning, on-brand social media content for Instagram, LinkedIn, and beyond.
            Layer-based design meets effortless customization.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Layer System</h3>
            <p className="text-gray-600 text-sm">
              Organize content with intuitive layers. Drag, reorder, and control visibility with ease.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Type className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Text Animations</h3>
            <p className="text-gray-600 text-sm">
              Bring your message to life with 9 professional animations. Fade, slide, bounce, and more.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Media Ready</h3>
            <p className="text-gray-600 text-sm">
              Drop in images and videos. Scale, position, and layer your media perfectly.
            </p>
          </div>
        </div>

        {/* Formats */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-8 shadow-xl mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Multi-Platform Support</h2>
            <p className="text-gray-600">Export-ready dimensions for every platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">9:16</div>
              <div className="text-xs text-gray-600">Instagram Story</div>
              <div className="text-xs text-gray-500">1080×1920px</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">1:1</div>
              <div className="text-xs text-gray-600">Instagram Post</div>
              <div className="text-xs text-gray-500">1080×1080px</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">4:5</div>
              <div className="text-xs text-gray-600">Portrait Post</div>
              <div className="text-xs text-gray-500">1080×1350px</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 mb-1">1.91:1</div>
              <div className="text-xs text-gray-600">Landscape</div>
              <div className="text-xs text-gray-500">1080×566px</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600 mb-1">1:1</div>
              <div className="text-xs text-gray-600">LinkedIn</div>
              <div className="text-xs text-gray-500">1080×1080px</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-full text-lg font-bold shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 animate-pulse-slow"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Start Creating
            <Sparkles className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
          </button>
          <p className="mt-4 text-sm text-gray-500">
            10 customizable slides • Layer-based editing • Professional exports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">10</div>
            <div className="text-sm text-gray-600">Template Slides</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-1">9</div>
            <div className="text-sm text-gray-600">Text Animations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-1">5</div>
            <div className="text-sm text-gray-600">Export Formats</div>
          </div>
        </div>
      </div>
    </div>
  );
}
