import { useState } from 'react';
import { SocialMediaCarousel } from './components/SocialMediaCarousel';
import { AnimatedSocialMediaCarousel } from './components/AnimatedSocialMediaCarousel';
import LayerBasedSocialMediaEditor from './components/LayerBasedSocialMediaEditor';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  const [format, setFormat] = useState<'story' | 'post' | 'post-portrait' | 'post-landscape' | 'linkedin'>('story');
  const [showAnimated, setShowAnimated] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return <WelcomeScreen onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Abrakadabra Social Media Package</h1>
          <p className="text-gray-600">Create and customize your social media posts with layers</p>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setFormat('story')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  format === 'story'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Story (9:16)
              </button>
              <button
                onClick={() => setFormat('post')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  format === 'post'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Post Square (1:1)
              </button>
              <button
                onClick={() => setFormat('post-portrait')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  format === 'post-portrait'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Post Portrait (4:5)
              </button>
              <button
                onClick={() => setFormat('post-landscape')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  format === 'post-landscape'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Post Landscape (1.91:1)
              </button>
              <button
                onClick={() => setFormat('linkedin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  format === 'linkedin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                LinkedIn (1:1)
              </button>
            </div>
          </div>
        </div>

        {/* Layer Editor */}
        <LayerBasedSocialMediaEditor format={format} />
      </div>
    </div>
  );
}