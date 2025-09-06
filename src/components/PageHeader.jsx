// Standardized Page Header Component
import { useResponsive } from "../hooks/useResponsive";

export default function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  tabs = null, 
  activeTab = null, 
  onTabChange = null,
  className = "",
  sticky = false 
}) {
  const { isMobile } = useResponsive();
  
  const headerClasses = `
    ${sticky ? 'sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/50' : ''}
    ${className}
    pb-6
  `;
  
  const headerStyle = sticky ? {
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingLeft: 'env(safe-area-inset-left, 0px)',
    paddingRight: 'env(safe-area-inset-right, 0px)',
  } : {};

  return (
    <div className={headerClasses.trim()} style={headerStyle}>
      <div className="pt-6">
        {/* Main Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          
          {/* Actions - Avoid conflicts with FAB on mobile */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Hide some actions on mobile to avoid FAB conflicts */}
              <div className={`flex items-center gap-2 ${isMobile ? 'mr-16' : ''}`}>
                {actions}
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs Navigation */}
        {tabs && tabs.length > 0 && (
          <div className="border-b border-slate-200">
            <nav 
              className="-mb-px flex space-x-2 md:space-x-8 px-1 md:px-0" 
              aria-label="Page tabs"
              style={{
                paddingLeft: 'env(safe-area-inset-left, 0px)',
                paddingRight: 'env(safe-area-inset-right, 0px)',
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`py-3 px-4 md:py-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-all duration-200 min-h-[44px] flex items-center justify-center md:min-h-auto ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50 md:bg-transparent shadow-sm md:shadow-none'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 md:hover:bg-transparent'
                  }`}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                      activeTab === tab.id 
                        ? 'text-purple-600 bg-purple-100' 
                        : 'text-slate-500 bg-slate-100'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}