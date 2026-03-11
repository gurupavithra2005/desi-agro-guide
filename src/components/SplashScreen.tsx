import { useState, useEffect } from 'react';
import appIcon from '@/assets/app-icon.png';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1600);
    const timer2 = setTimeout(onFinish, 2000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <img src={appIcon} alt="Smart Crop Advisory System" className="w-48 h-48 object-contain animate-fade-in" />
    </div>
  );
}
