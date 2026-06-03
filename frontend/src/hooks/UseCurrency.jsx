// hooks/UseCurrency.js
import { useState, useEffect } from 'react';

export const UseCurrency = () => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('app-currency') || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Comprehensive currency data with country info and locales
  const currenciesList = [
    { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', flag: '🇺🇸', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union', flag: '🇪🇺', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', locale: 'ja-JP' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China', flag: '🇨🇳', locale: 'zh-CN' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', flag: '🇮🇳', locale: 'en-IN' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦', locale: 'en-CA' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺', locale: 'en-AU' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭', locale: 'de-CH' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea', flag: '🇰🇷', locale: 'ko-KR' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia', flag: '🇷🇺', locale: 'ru-RU' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil', flag: '🇧🇷', locale: 'pt-BR' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', country: 'Mexico', flag: '🇲🇽', locale: 'es-MX' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬', locale: 'en-SG' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong', flag: '🇭🇰', locale: 'zh-HK' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand', flag: '🇳🇿', locale: 'en-NZ' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden', flag: '🇸🇪', locale: 'sv-SE' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway', flag: '🇳🇴', locale: 'nb-NO' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark', flag: '🇩🇰', locale: 'da-DK' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', country: 'Poland', flag: '🇵🇱', locale: 'pl-PL' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey', flag: '🇹🇷', locale: 'tr-TR' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'UAE', flag: '🇦🇪', locale: 'ar-AE' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia', flag: '🇸🇦', locale: 'ar-SA' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa', flag: '🇿🇦', locale: 'en-ZA' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria', flag: '🇳🇬', locale: 'en-NG' },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt', flag: '🇪🇬', locale: 'ar-EG' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭', locale: 'th-TH' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam', flag: '🇻🇳', locale: 'vi-VN' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia', flag: '🇮🇩', locale: 'id-ID' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia', flag: '🇲🇾', locale: 'ms-MY' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines', flag: '🇵🇭', locale: 'en-PH' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', country: 'Pakistan', flag: '🇵🇰', locale: 'ur-PK' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh', flag: '🇧🇩', locale: 'bn-BD' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', country: 'Sri Lanka', flag: '🇱🇰', locale: 'si-LK' },
    { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', country: 'Nepal', flag: '🇳🇵', locale: 'ne-NP' },
    { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', country: 'Iran', flag: '🇮🇷', locale: 'fa-IR' },
    { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', country: 'Iraq', flag: '🇮🇶', locale: 'ar-IQ' },
    { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', country: 'Kuwait', flag: '🇰🇼', locale: 'ar-KW' },
    { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', country: 'Qatar', flag: '🇶🇦', locale: 'ar-QA' },
    { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', country: 'Bahrain', flag: '🇧🇭', locale: 'ar-BH' },
    { code: 'OMR', symbol: '﷼', name: 'Omani Rial', country: 'Oman', flag: '🇴🇲', locale: 'ar-OM' },
    { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', country: 'Jordan', flag: '🇯🇴', locale: 'ar-JO' },
    { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', country: 'Israel', flag: '🇮🇱', locale: 'he-IL' },
    { code: 'CLP', symbol: '$', name: 'Chilean Peso', country: 'Chile', flag: '🇨🇱', locale: 'es-CL' },
    { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina', flag: '🇦🇷', locale: 'es-AR' },
    { code: 'COP', symbol: '$', name: 'Colombian Peso', country: 'Colombia', flag: '🇨🇴', locale: 'es-CO' },
    { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', country: 'Peru', flag: '🇵🇪', locale: 'es-PE' },
    { code: 'UYU', symbol: '$', name: 'Uruguayan Peso', country: 'Uruguay', flag: '🇺🇾', locale: 'es-UY' },
    { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani', country: 'Paraguay', flag: '🇵🇾', locale: 'es-PY' },
    { code: 'BOB', symbol: 'Bs', name: 'Bolivian Boliviano', country: 'Bolivia', flag: '🇧🇴', locale: 'es-BO' },
    { code: 'VEF', symbol: 'Bs', name: 'Venezuelan Bolivar', country: 'Venezuela', flag: '🇻🇪', locale: 'es-VE' },
    { code: 'CRC', symbol: '₡', name: 'Costa Rican Colon', country: 'Costa Rica', flag: '🇨🇷', locale: 'es-CR' },
    { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Cordoba', country: 'Nicaragua', flag: '🇳🇮', locale: 'es-NI' },
    { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', country: 'Panama', flag: '🇵🇦', locale: 'es-PA' },
    { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', country: 'Dominican Republic', flag: '🇩🇴', locale: 'es-DO' },
    { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', country: 'Honduras', flag: '🇭🇳', locale: 'es-HN' },
    { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', country: 'Guatemala', flag: '🇬🇹', locale: 'es-GT' },
    { code: 'SVC', symbol: '$', name: 'Salvadoran Colon', country: 'El Salvador', flag: '🇸🇻', locale: 'es-SV' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic', flag: '🇨🇿', locale: 'cs-CZ' },
    { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', country: 'Hungary', flag: '🇭🇺', locale: 'hu-HU' },
    { code: 'RON', symbol: 'lei', name: 'Romanian Leu', country: 'Romania', flag: '🇷🇴', locale: 'ro-RO' },
    { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', country: 'Bulgaria', flag: '🇧🇬', locale: 'bg-BG' },
    { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', country: 'Croatia', flag: '🇭🇷', locale: 'hr-HR' },
    { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar', country: 'Serbia', flag: '🇷🇸', locale: 'sr-RS' },
    { code: 'ALL', symbol: 'L', name: 'Albanian Lek', country: 'Albania', flag: '🇦🇱', locale: 'sq-AL' },
    { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar', country: 'North Macedonia', flag: '🇲🇰', locale: 'mk-MK' },
    { code: 'BAM', symbol: 'KM', name: 'Bosnian Mark', country: 'Bosnia', flag: '🇧🇦', locale: 'bs-BA' },
    { code: 'GEL', symbol: '₾', name: 'Georgian Lari', country: 'Georgia', flag: '🇬🇪', locale: 'ka-GE' },
    { code: 'AMD', symbol: '֏', name: 'Armenian Dram', country: 'Armenia', flag: '🇦🇲', locale: 'hy-AM' },
    { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', country: 'Azerbaijan', flag: '🇦🇿', locale: 'az-AZ' },
    { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', country: 'Kazakhstan', flag: '🇰🇿', locale: 'kk-KZ' },
    { code: 'UZS', symbol: 'soʻm', name: 'Uzbekistani Som', country: 'Uzbekistan', flag: '🇺🇿', locale: 'uz-UZ' },
    { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni', country: 'Tajikistan', flag: '🇹🇯', locale: 'tg-TJ' },
    { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', flag: '🇰🇬', locale: 'ky-KG' },
    { code: 'TMT', symbol: 'm', name: 'Turkmenistan Manat', country: 'Turkmenistan', flag: '🇹🇲', locale: 'tk-TM' },
    { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik', country: 'Mongolia', flag: '🇲🇳', locale: 'mn-MN' },
    { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', country: 'Afghanistan', flag: '🇦🇫', locale: 'ps-AF' }
  ];

  useEffect(() => {
    const savedCurrency = localStorage.getItem('app-currency');
    if (savedCurrency) {
      const currencyData = currenciesList.find(c => c.code === savedCurrency);
      if (currencyData) {
        setCurrency(savedCurrency);
        setCurrencySymbol(currencyData.symbol);
      } else {
        setCurrency('USD');
        setCurrencySymbol('$');
      }
    } else {
      // Try to detect user's locale currency
      const userLocale = navigator.language;
      try {
        const formatter = new Intl.NumberFormat(userLocale, { style: 'currency', currency: 'USD' });
        const parts = formatter.formatToParts(0);
        const detectedCurrency = parts.find(part => part.type === 'currency')?.value;
        
        if (detectedCurrency && currenciesList.find(c => c.code === detectedCurrency)) {
          setCurrency(detectedCurrency);
          const currencyData = currenciesList.find(c => c.code === detectedCurrency);
          if (currencyData) setCurrencySymbol(currencyData.symbol);
        } else {
          setCurrency('USD');
          setCurrencySymbol('$');
        }
      } catch (e) {
        setCurrency('USD');
        setCurrencySymbol('$');
      }
    }
  }, []);

  const updateCurrency = (currencyCode) => {
    const currencyData = currenciesList.find(c => c.code === currencyCode);
    if (currencyData) {
      setCurrency(currencyCode);
      setCurrencySymbol(currencyData.symbol);
      localStorage.setItem('app-currency', currencyCode);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('currencyChanged', { 
        detail: { currency: currencyCode, symbol: currencyData.symbol } 
      }));
    }
  };

  // Main formatting function - this is what you'll use in your components
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    
    try {
      const currencyData = currenciesList.find(c => c.code === currency);
      const locale = currencyData?.locale || 'en-US';
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch (error) {
      // Fallback formatting
      console.warn(`Currency ${currency} formatting failed, using fallback:`, error);
      const symbol = currencySymbol || currency;
      const formattedNumber = numAmount.toFixed(2);
      return `${symbol}${formattedNumber}`;
    }
  };

  const getCurrencyInfo = (currencyCode) => {
    return currenciesList.find(c => c.code === currencyCode);
  };

  const getCurrentCurrencyInfo = () => {
    return currenciesList.find(c => c.code === currency);
  };

  return {
    currency,
    currencySymbol,
    updateCurrency,
    formatCurrency,  // This is the main function - renamed from formatAmount
    getCurrencyInfo,
    getCurrentCurrencyInfo,
    currenciesList
  };
};