import React from 'react';

const Logo = ({ size = 48, style = {} }) => {
  return (
    <img 
      src="/logo.jpeg" 
      alt="Gomukh Diamond Logo" 
      style={{ 
        width: size, 
        height: size, 
        objectFit: 'contain',
        display: 'block',
        background: 'transparent',
        ...style 
      }} 
    />
  );
};

export default Logo;

