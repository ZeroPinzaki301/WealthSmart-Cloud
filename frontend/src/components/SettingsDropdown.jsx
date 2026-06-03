import React, { useState, useRef, useEffect } from 'react';
import { UseTheme } from '../hooks/UseTheme';
import { UseCurrency } from '../hooks/UseCurrency';
import ToggleSwitch from './ToggleSwitch';

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  const [showReloadMessage, setShowReloadMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const { mode, toggleMode, colorScheme, changeColorScheme } = UseTheme();
  const { currency, currencySymbol, updateCurrency, formatCurrency, currenciesList } = UseCurrency();

  const colorSchemes = [
    { name: 'red', label: 'Red', color: 'bg-red-500', darkColor: 'bg-red-600' },
    { name: 'blue', label: 'Blue', color: 'bg-blue-500', darkColor: 'bg-blue-600' },
    { name: 'green', label: 'Green', color: 'bg-green-500', darkColor: 'bg-green-600' },
    { name: 'yellow', label: 'Yellow', color: 'bg-yellow-500', darkColor: 'bg-yellow-600' },
    { name: 'orange', label: 'Orange', color: 'bg-orange-500', darkColor: 'bg-orange-600' },
    { name: 'purple', label: 'Purple', color: 'bg-purple-500', darkColor: 'bg-purple-600' },
    { name: 'black', label: 'Gray', color: 'bg-gray-600', darkColor: 'bg-gray-500' },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsThemeDropdownOpen(false);
        setIsCurrencyDropdownOpen(false);
        setCurrencySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter currencies based on search
  const filteredCurrencies = currenciesList.filter(currency =>
    currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
    currency.country.toLowerCase().includes(currencySearchTerm.toLowerCase())
  );

  const selectedCurrency = currenciesList.find(c => c.code === currency);

  const handleCurrencyChange = (currencyCode) => {
    updateCurrency(currencyCode);
    setShowReloadMessage(true);
    setIsCurrencyDropdownOpen(false);
    setCurrencySearchTerm('');
    
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 cursor-pointer rounded-lg hover:bg-background-hover transition-colors"
        aria-label="Settings"
      >
        <svg 
          className="w-5 h-5 text-text" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Reload Message Toast */}
      {showReloadMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-out">
          <div className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Currency changed! Reloading page...</span>
          </div>
        </div>
      )}

      {/* Dropdown Menu - Responsive positioning */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          <div className={`
            ${isMobile 
              ? 'fixed bottom-20 left-4 right-4 z-50' 
              : 'absolute right-0 mt-2'
            }
            bg-background-subtle border border-border rounded-lg shadow-lg overflow-hidden
            max-h-[70vh] md:max-h-[90vh] overflow-y-auto
          `}>
            {/* Current Currency Display */}
            <div className="px-4 py-3 border-b border-border bg-primary/5 sticky top-0 bg-background-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">Current Currency</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{currencySymbol}</span>
                    <span className="text-lg font-semibold">{currency}</span>
                    <span className="text-sm text-text-muted hidden sm:inline">({selectedCurrency?.name})</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    Preview: {formatCurrency(1234.56)}
                  </p>
                </div>
                <div className="text-3xl">{selectedCurrency?.flag}</div>
              </div>
            </div>

            {/* Dark/Light Mode Toggle */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mode === 'light' ? (
                    <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span className="text-text cursor-pointer font-medium">
                    {mode === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
                <ToggleSwitch isOn={mode === 'dark'} onToggle={toggleMode} />
              </div>
            </div>

            {/* Currency Selector Section */}
            <div className="px-4 py-3 border-b border-border">
              <button
                onClick={() => {
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                  setIsThemeDropdownOpen(false);
                  setCurrencySearchTerm('');
                }}
                className="w-full flex items-center justify-between text-text hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Currency</span>
                  <span className="text-xs text-text-muted ml-2">({currency})</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Currency Sub-dropdown with Search */}
              {isCurrencyDropdownOpen && (
                <div className="mt-3 space-y-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by currency code, name, or country..."
                      value={currencySearchTerm}
                      onChange={(e) => setCurrencySearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-9 text-sm border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {currencySearchTerm && (
                      <button
                        onClick={() => setCurrencySearchTerm('')}
                        className="absolute right-3 top-2.5 text-text-muted hover:text-text"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Currency List */}
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => handleCurrencyChange(curr.code)}
                          className={`w-full cursor-pointer flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                            currency === curr.code
                              ? 'bg-primary-lightest text-primary-darkest'
                              : 'hover:bg-background-hover text-text'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{curr.flag}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{curr.code}</span>
                                <span className="text-sm text-text-muted">{curr.symbol}</span>
                              </div>
                              <div className="text-xs text-text-muted hidden sm:block">{curr.name}</div>
                              <div className="text-xs text-text-muted/70 hidden sm:block">{curr.country}</div>
                            </div>
                          </div>
                          {currency === curr.code && (
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p>No currencies found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    )}
                  </div>

                  {/* Currency Count */}
                  <div className="text-xs text-text-muted text-center pt-2 border-t border-border">
                    {filteredCurrencies.length} of {currenciesList.length} currencies
                  </div>
                </div>
              )}
            </div>

            {/* Color Themes Section */}
            <div className="px-4 py-3">
              <button
                onClick={() => {
                  setIsThemeDropdownOpen(!isThemeDropdownOpen);
                  setIsCurrencyDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between text-text hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="font-medium">Color Themes</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Color Themes Sub-dropdown */}
              {isThemeDropdownOpen && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => {
                        changeColorScheme(scheme.name);
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full cursor-pointer flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        colorScheme === scheme.name
                          ? 'bg-primary-lightest text-primary-darkest'
                          : 'hover:bg-background-hover text-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          <div className={`w-3 h-3 rounded-l-full ${scheme.color} ${mode === 'dark' ? 'opacity-80' : ''}`} />
                          <div className={`w-3 h-3 ${scheme.color} ${mode === 'dark' ? 'opacity-60' : 'opacity-70'}`} />
                          <div className={`w-3 h-3 rounded-r-full ${scheme.color} ${mode === 'dark' ? 'opacity-40' : 'opacity-50'}`} />
                        </div>
                        <span className="text-sm">{scheme.label}</span>
                      </div>
                      {colorScheme === scheme.name && (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="px-4 py-3 border-t border-border bg-background/50 sticky bottom-0 bg-background-subtle">
              <p className="text-xs text-text-muted mb-2">Theme Preview</p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-primary-darkest" title="Darkest" />
                <div className="w-8 h-8 rounded bg-primary" title="Base" />
                <div className="w-8 h-8 rounded bg-primary-lightest" title="Lightest" />
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}