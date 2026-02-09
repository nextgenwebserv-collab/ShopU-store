import React, { useEffect, useState } from 'react';

const SmallScreenBanner: React.FC = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    // Check screen size on initial render
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isSmallScreen) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 bg-blue-600 p-4 text-center text-white">
      <p>
        Download the <strong>ShopU</strong> app from Playstore or use on bigger screens.
      </p>
    </div>
  );
};

export default SmallScreenBanner;
