const colorMap: { [key: string]: { bg: string; border: string; text: string; bgLight: string; textDark: string; } } = {
  blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500', bgLight: 'bg-blue-100', textDark: 'text-blue-800' },
  green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500', bgLight: 'bg-green-100', textDark: 'text-green-800' },
  purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500', bgLight: 'bg-purple-100', textDark: 'text-purple-800' },
  red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500', bgLight: 'bg-red-100', textDark: 'text-red-800' },
  yellow: { bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-400', bgLight: 'bg-yellow-100', textDark: 'text-yellow-800' },
  indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-500', bgLight: 'bg-indigo-100', textDark: 'text-indigo-800' },
};

export const getColorClass = (colorName: string, type: 'bg' | 'border' | 'text' | 'bgLight' | 'textDark'): string => {
  const defaultColor = { 
    bg: 'bg-gray-500', 
    border: 'border-gray-500', 
    text: 'text-gray-500',
    bgLight: 'bg-gray-100',
    textDark: 'text-gray-800'
  };
  return colorMap[colorName]?.[type] || defaultColor[type];
};