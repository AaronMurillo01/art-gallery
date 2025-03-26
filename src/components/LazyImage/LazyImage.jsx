import React, { useState, useEffect } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [imageRef, setImageRef] = useState();

  const onLoad = (event) => {
    event.target.classList.add('loaded');
  };

  const onError = (event) => {
    event.target.classList.add('has-error');
  };

  useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef && imageSrc !== src) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setImageSrc(src);
                observer.unobserve(imageRef);
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: '75%',
          }
        );
        observer.observe(imageRef);
      } else {
        // Fallback for older browsers
        setImageSrc(src);
      }
    }
    return () => {
      didCancel = true;
      if (observer && observer.unobserve && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef]);

  return (
    <div className={`lazy-image-container ${className || ''}`}>
      {imageSrc ? (
        <img
          className="lazy-image"
          src={imageSrc}
          alt={alt}
          onLoad={onLoad}
          onError={onError}
        />
      ) : (
        <div
          ref={setImageRef}
          className="lazy-image-placeholder"
        />
      )}
    </div>
  );
};

export default LazyImage;