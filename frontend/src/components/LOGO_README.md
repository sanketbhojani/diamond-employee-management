# Logo Component Usage

## Current Implementation
The logo is currently implemented as an SVG component that creates a golden yellow "GD" logo with a diamond shape, matching your brand identity.

## Locations Where Logo is Displayed

1. **Sidebar Header (Layout.jsx)**
   - Shows logo + "GOMUKH DIAMOND" text when sidebar is expanded
   - Shows only logo icon when sidebar is collapsed
   - Size: 40px (expanded) / 36px (collapsed)

2. **Login Page (Login.jsx)**
   - Shows large logo (80px) above the "GOMUKH DIAMOND" heading
   - Replaces the previous emoji icon

## Using Your Own Logo Image

If you have your actual logo image file (PNG, JPG, or SVG), you can replace the SVG component with an image:

### Option 1: Using an Image File

1. Place your logo image in: `frontend/public/logo.png` (or `.jpg`, `.svg`)

2. Update `Logo.jsx`:

```jsx
import React from 'react';
import logoImage from '../../public/logo.png'; // or use absolute path: '/logo.png'

const Logo = ({ size = 48, style = {} }) => {
  return (
    <img 
      src="/logo.png" 
      alt="Gomukh Diamond Logo" 
      style={{ 
        width: size, 
        height: size, 
        objectFit: 'contain',
        ...style 
      }} 
    />
  );
};

export default Logo;
```

### Option 2: Keep SVG but Adjust Colors

If you want to keep the SVG but adjust colors, edit `Logo.jsx`:

```jsx
const logoColor = '#FFD700'; // Change this to your desired color
const strokeColor = '#000000'; // Change this for outline color
```

## Customization

The Logo component accepts these props:
- `size`: Number (default: 48) - Size in pixels
- `style`: Object - Additional CSS styles

Example usage:
```jsx
<Logo size={100} style={{ margin: '20px' }} />
```

