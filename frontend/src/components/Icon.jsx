// components/Icon.jsx
import FinaSmartIconRaw from '../assets/FinaSmartLogo.svg?react';

const FinaSmartIcon = ({ size = '1.5em', className = '' }) => (
  <FinaSmartIconRaw
    style={{ 
      width: size, 
      height: size,
      display: 'inline-block'
    }}
    className={className}
  />
);

export default FinaSmartIcon;