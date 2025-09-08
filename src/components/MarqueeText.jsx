import React, { useRef, useEffect, useState, memo } from 'react';

const MarqueeText = memo(({ text, className }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
        setIsOverflowing(isOverflow);
      }
    };

    checkOverflow();
    const timeoutId = setTimeout(checkOverflow, 100);
    
    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [text]);

  const animationDuration = isOverflowing ? `${Math.max(text.length * 0.2, 8)}s` : '0s';

  return (
    <div ref={textRef} className={`${className} overflow-hidden whitespace-nowrap relative`}>
      <div
        className={isOverflowing ? 'animate-marquee inline-block' : ''}
        style={{ animationDuration }}
      >
        {text}
        {isOverflowing && <span className="ml-8">{text}</span>}
      </div>
    </div>
  );
});

MarqueeText.displayName = 'MarqueeText';

export default MarqueeText;