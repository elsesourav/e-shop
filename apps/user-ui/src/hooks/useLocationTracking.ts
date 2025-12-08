'user client';
import { useState, useEffect } from 'react';
const LOCATION_STORAGE_KEY = 'user_location_tracking';
const LOCATION_EXPIRY_DAYS = 20;


type Location = {
  continent_code: string;
  city: string;
  city_code: string;
  region: string;
  region_code: string;
  country_name: string;
  country_code: string;
  country_capital: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

const getStoredLocation = () => {
  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!storedData) return null;

  const parsedData = JSON.parse(storedData);
  const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const isExpired = new Date().getTime() - parsedData.timestamp > expiryTime;
  return isExpired ? null : parsedData;
};


const useLocationTracking = () => {
  const [location, setLocation] = useState<Location | null>(getStoredLocation());

  useEffect(() => {
    if (location) return;

    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const locationData = {
          country_name: data?.country_name,
          country_code: data?.country_code,
          country_capital: data?.country_capital,
          continent_code: data?.continent_code,
          region: data?.region,
          region_code: data?.region_code,
          city: data?.city,
          city_code: data?.city_code,
          latitude: data?.latitude,
          longitude: data?.longitude,
          timezone: data?.timezone,
        };
        const timestamp = new Date().getTime();
        setLocation(locationData);

        localStorage.setItem(
          LOCATION_STORAGE_KEY,
          JSON.stringify({ ...locationData, timestamp })
        );
      } catch (error) {
        console.log('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, [location]);

  return location;
};

export default useLocationTracking;