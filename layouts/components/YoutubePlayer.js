import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamic import ile react-lite-youtube-embed'i yükle
const LiteYouTubeEmbed = dynamic(() => import('react-lite-youtube-embed'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '315px', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      YouTube Video Yükleniyor...
    </div>
  )
});

const YoutubePlayer = ({ id, title, ...others }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // CSS'i dinamik olarak yükle
    if (typeof window !== 'undefined') {
      import('react-lite-youtube-embed/dist/LiteYouTubeEmbed.css');
    }
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        width: '100%', 
        height: '315px', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        YouTube Video Yükleniyor...
      </div>
    );
  }

  return <LiteYouTubeEmbed id={id} title={title} {...others} />;
};

export default YoutubePlayer;
