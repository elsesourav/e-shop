'use client';

import Image from 'next/image';
import { MouseEvent, useState } from 'react';

interface ImageMagnifierProps {
  src: string;
  alt?: string;
  zoomLevel?: number;
  magnifierWidth?: number;
  magnifierHeight?: number;
  position?: 'left' | 'right';
  positionOffset?: number;
}

const ImageMagnifier = ({
  src,
  alt = '',
  zoomLevel = 2.5,
  magnifierWidth,
  magnifierHeight,
  position = 'right',
  positionOffset = 0,
}: ImageMagnifierProps) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setImgSize] = useState([0, 0]);
  const [imgPosition, setImgPosition] = useState({ top: 0, left: 0 });
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { width, height, top, left } = elem.getBoundingClientRect();
    setImgSize([width, height]);
    setImgPosition({ top, left });
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // Update image position for fixed rendering
    setImgPosition({ top, left });

    // Calculate cursor position relative to the image
    const x = e.clientX - left;
    const y = e.clientY - top;

    setXY([x, y]);
  };

  // Calculate rendered image dimensions and offsets
  let renderW = imgWidth;
  let renderH = imgHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (naturalSize && imgWidth && imgHeight) {
    const ratio = Math.min(
      imgWidth / naturalSize.width,
      imgHeight / naturalSize.height
    );
    renderW = naturalSize.width * ratio;
    renderH = naturalSize.height * ratio;
    offsetX = (imgWidth - renderW) / 2;
    offsetY = (imgHeight - renderH) / 2;
  }

  // Determine zoom window dimensions
  const zoomWindowWidth = magnifierWidth || imgWidth;
  const zoomWindowHeight = magnifierHeight || imgHeight;

  // Lens dimensions (relative to the small image)
  // The lens size determines how much of the image is seen in the zoom window.
  // If zoom window is same size as small image, lens size = small image size / zoomLevel
  const lensWidth = zoomWindowWidth / zoomLevel;
  const lensHeight = zoomWindowHeight / zoomLevel;

  // Clamp lens position so it doesn't go outside the image
  let lensX = x - lensWidth / 2;
  let lensY = y - lensHeight / 2;

  // Constrain X
  const minLensX = offsetX;
  const maxLensX = offsetX + renderW - lensWidth;
  if (lensWidth >= renderW) {
    // Lens wider than image: center it
    lensX = offsetX + (renderW - lensWidth) / 2;
  } else {
    if (lensX < minLensX) lensX = minLensX;
    if (lensX > maxLensX) lensX = maxLensX;
  }

  // Constrain Y
  const minLensY = offsetY;
  const maxLensY = offsetY + renderH - lensHeight;
  if (lensHeight >= renderH) {
    // Lens taller than image: center it
    lensY = offsetY + (renderH - lensHeight) / 2;
  } else {
    if (lensY < minLensY) lensY = minLensY;
    if (lensY > maxLensY) lensY = maxLensY;
  }

  return (
    <div className="relative w-full h-full">
      {/* Main Image Container */}
      <div
        className="relative w-full h-full cursor-crosshair bg-white flex items-center justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          priority
          onLoad={(e) => {
            setNaturalSize({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />

        {/* Lens */}
        {showMagnifier && naturalSize && (
          <div
            className="absolute border border-gray-300 bg-white/40 pointer-events-none"
            style={{
              height: `${lensHeight}px`,
              width: `${lensWidth}px`,
              top: `${lensY}px`,
              left: `${lensX}px`,
            }}
          />
        )}
      </div>

      {/* Magnified Image Portal */}
      {showMagnifier && naturalSize && (
        <div
          style={{
            position: 'fixed',
            left:
              position === 'right'
                ? imgPosition.left + imgWidth + 20 + positionOffset
                : imgPosition.left - (magnifierWidth || imgWidth) - 20 - positionOffset,
            top: imgPosition.top,
            zIndex: 100,
            width: magnifierWidth ? `${magnifierWidth}px` : `${imgWidth}px`, // Match main image width or use custom width
            height: magnifierHeight ? `${magnifierHeight}px` : `${imgHeight}px`, // Match main image height or use custom height
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            // Use rendered dimensions for background size to preserve aspect ratio
            backgroundSize: `${renderW * zoomLevel}px ${renderH * zoomLevel}px`,
            // Adjust position to account for offsets (white space)
            backgroundPositionX: `${
              -lensX * zoomLevel + offsetX * zoomLevel
            }px`,
            backgroundPositionY: `${
              -lensY * zoomLevel + offsetY * zoomLevel
            }px`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
