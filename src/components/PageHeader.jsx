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
  sticky = false,
  plain = false // New prop for plain text headers
}) {
  const { isMobile } = useResponsive();
  
  const headerClasses = `
    ${sticky ? 'sticky top-0 z-40 bg-white border-b border-slate-200' : ''}
    ${className}
    ${plain ? 'pb-4' : 'pb-6'}
  `;
  
  const headerStyle = sticky ? {
    paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)',
    paddingLeft: 'max(env(safe-area-inset-left, 0px), 1rem)',
    paddingRight: 'max(env(safe-area-inset-right, 0px), 1rem)',
  } : {};

  return (
    <div className={headerClasses.trim()} style={headerStyle}>
      <div className={plain ? "pt-4" : "pt-6"}>
        {/* Plain text header or standard header */}
        {plain ? (
          <div className="mb-4">
            <h1 className="text-lg font-medium text-gray-900 mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        ) : (
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
        )}
        
        {/* Tabs Navigation - Now moved to separate tab bar area */}
        {tabs && tabs.length > 0 && (
          <div className="bg-white border-b border-slate-200 -mx-6 px-6 sticky top-16 z-30">
            <nav 
              className="flex space-x-1 overflow-x-auto scrollbar-hide" 
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
                  className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ease-in-out min-h-[44px] flex items-center justify-center outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-900
                    ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 shadow-[0_0_16px_var(--tw-ring-color)] ring-2 ring-accent ring-offset-2 ring-offset-slate-900'
                      : 'border-transparent text-slate-500 hover:text-purple-700 hover:border-purple-300 hover:shadow-[0_0_12px_var(--tw-ring-color)] hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-slate-900'}
                  `}
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