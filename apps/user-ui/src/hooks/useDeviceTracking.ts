"use client";
import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState<string>(""); 

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo(`
      Device: ${result.device?.type || 'Desktop'}
      OS: ${result.os?.name || 'Unknown'} ${result.os?.version || ''}
      Browser: ${result.browser?.name || 'Unknown'} ${result.browser?.version || ''}
    `);
  }, []);

  return deviceInfo;
}

export default useDeviceTracking;


