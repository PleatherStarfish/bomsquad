const units = {
  farad: ['F', 'mF', 'µF', 'nF', 'pF'],
  ohm: ['Ω', 'kΩ', 'MΩ']
};

const conversionFactors = {
  F: 1,
  mF: 1e-3,
  µF: 1e-6,
  μF: 1e-6,
  nF: 1e-9,
  pF: 1e-12,
  Ω: 1,
  kΩ: 1e3,
  MΩ: 1e6
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(num);
};

const generateConversions = (value, unit, unitType) => {
  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) {
    // console.error(`Invalid value: ${value}`);
    return `<li>Invalid value</li>`;
  }

  const baseValue = parsedValue * conversionFactors[unit];
  if (isNaN(baseValue)) {
    // console.error(`Invalid unit: ${unit}`);
    return `<li>Invalid unit</li>`;
  }

  return units[unitType]
    .map(u => `<li>${formatNumber(baseValue / conversionFactors[u])} ${u}</li>`)
    .join('');
};

export const getFaradConversions = (value, unit = 'µF') => {
  return `<ul>${generateConversions(value, unit, 'farad')}</ul>`;
};

export const getOhmConversions = (value, unit = 'Ω') => {
  return `<ul>${generateConversions(value, unit, 'ohm')}</ul>`;
};
