import React from 'react';

export default function BrandLogo({ size = 72, alt = 'KathmanduWallet logo' }) {
  const px = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      src="/logo.jpeg"
      alt={alt}
      width={size}
      height={size}
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        objectFit: 'cover',
        boxShadow: '0 8px 24px rgba(43,31,24,0.12)',
        display: 'block',
      }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/fallback-logo.svg';
      }}
    />
  );
}
