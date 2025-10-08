'use client';

import { useEffect, useState } from 'react';

export default function TestComponent() {
  const [message, setMessage] = useState('Loading...');
  const [step, setStep] = useState(0);

  useEffect(() => {
    const testSteps = async () => {
      setStep(1);
      setMessage('Step 1: Component mounted');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep(2);
      setMessage('Step 2: Making API call...');
      
      try {
        const response = await fetch('/api/ingram/products?pageSize=2');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMessage(`Step 3: API working! Found ${data.catalog?.length || 0} products`);
        setStep(3);
      } catch (error) {
        setMessage(`Step 3: API error: ${error.message}`);
        setStep(3);
      }
    };
    
    testSteps();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Test Component (Step {step})</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
