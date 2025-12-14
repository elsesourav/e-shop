'use client';
import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';

export type DeviceInfoType = {
  device: string;
  os: string;
  browser: string;
};

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoType>({
    device: '',
    os: '',
    browser: '',
  });

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo({
      device: `${result.device?.type || 'Desktop'}`,
      os: `${result.os?.name || 'Unknown'} ${result.os?.version || ''}`,
      browser: `${result.browser?.name || 'Unknown'} ${
        result.browser?.version || ''
      }`,
    });
  }, []);

  return deviceInfo;
};

export default useDeviceTracking;
