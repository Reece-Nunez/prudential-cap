'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMapsCallback?: () => void;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing to search...',
  required = false,
  className = '',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkLoaded);
            setIsLoaded(true);
          }
        }, 100);
        setTimeout(() => clearInterval(checkLoaded), 10000);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components', 'geometry'],
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (place && place.formatted_address) {
          const address = place.formatted_address;
          setInputValue(address);
          onChangeRef.current(address);
        } else {
          const currentValue = inputRef.current?.value || '';
          if (currentValue) {
            setInputValue(currentValue);
            onChangeRef.current(currentValue);
          }
        }
      });

      autocompleteRef.current = autocomplete;
    } catch {
      // Silently fail if initialization fails
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
    const currentValue = inputRef.current?.value || '';
    if (currentValue && currentValue !== value) {
      onChangeRef.current(currentValue);
    }
  }, [value]);

  const inputClass = `w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0f79be]/20 focus:border-[#0f79be] transition-colors bg-white text-gray-900 ${className}`;

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      className={inputClass}
      autoComplete="off"
    />
  );
}
