// ThreeWayToggle: Toggle component for three view modes
import { useResponsive } from '../hooks/useResponsive';

export default function ThreeWayToggle({ 
  options = [], // [{ id: 'value', label: 'Label', icon: IconComponent }, ...]
  selected = '',
  onChange = () => {},
  className = ''
}) {
  const { isMobile } = useResponsive();

  return (
    <div className={`flex rounded-lg bg-gray-100 p-1 ${className}`}>
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = selected === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium
              ${isSelected 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }
              ${isMobile ? 'flex-1 justify-center' : ''}
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className={isMobile && option.mobileLabel ? 'hidden sm:inline' : ''}>
              {option.label}
            </span>
            {isMobile && option.mobileLabel && (
              <span className="sm:hidden">{option.mobileLabel}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}