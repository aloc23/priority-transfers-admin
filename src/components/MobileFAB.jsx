// Mobile Floating Action Button Component
import { useState } from 'react';
import { useAppStore } from '../context/AppStore';

const FABIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BookingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V5M16 2V5M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InvoiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAppStore();

  // Only show FAB on mobile screens
  const isMobile = () => window.innerWidth <= 768;

  if (!isMobile() || !currentUser) {
    return null;
  }

  const actions = [
    {
      label: 'New Booking',
      icon: BookingIcon,
      href: '#/schedule',
      color: 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600',
      permission: true // Available to all authenticated users
    },
    {
      label: 'Add Customer',
      icon: CustomerIcon,
      href: '#/customers',
      color: 'bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600',
      permission: ['Admin', 'Dispatcher'].includes(currentUser?.role)
    },
    {
      label: 'Add Invoice',
      icon: InvoiceIcon,
      href: '#/billing',
      color: 'bg-gradient-to-r from-orange-600 to-pink-500 hover:from-orange-700 hover:to-pink-600',
      permission: ['Admin'].includes(currentUser?.role)
    }
  ];

  const visibleActions = actions.filter(action => action.permission);

  const handleActionClick = (href) => {
    window.location.hash = href;
    setIsOpen(false);
  };

  return (
    <div className="fab-container">
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fab-backdrop" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action buttons */}
      {isOpen && (
        <div className="fab-actions">
          {visibleActions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => handleActionClick(action.href)}
              className={`fab-action ${action.color}`}
              style={{
                transform: `translateY(${-(60 * (index + 1))}px)`,
                transitionDelay: `${index * 50}ms`
              }}
              title={action.label}
            >
              <action.icon />
              <span className="fab-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-main ${isOpen ? 'fab-open' : ''}`}
        title="Quick Actions"
      >
        <FABIcon />
      </button>
    </div>
  );
}