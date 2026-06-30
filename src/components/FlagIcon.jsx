import React from 'react';
import ReactCountryFlag from 'react-country-flag';

const FlagIcon = ({ countryCode, size = 18 }) => (
  <ReactCountryFlag
    countryCode={countryCode}
    svg
    style={{
      width: size,
      height: size,
      borderRadius: '3px',
      objectFit: 'cover',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    }}
    title={countryCode}
  />
);

export default FlagIcon;
