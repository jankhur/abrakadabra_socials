import { useState } from 'react';
import LayerBasedSocialMediaEditor from './components/LayerBasedSocialMediaEditor';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return <WelcomeScreen onStart={() => setHasStarted(true)} />;
  }

  return <LayerBasedSocialMediaEditor />;
}