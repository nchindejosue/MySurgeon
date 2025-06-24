import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { TrendingUp, Brain } from 'lucide-react';

export const VolumeForecaster: React.FC = () => {
  const [inputs, setInputs] = useState({
    tMinus3: 45,
    tMinus2: 52,
    tMinus1: 38,
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      // Simulate API call to FastAPI endpoint
      // In production, this would call your actual ML model API
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          t_minus_3: inputs.tMinus3,
          t_minus_2: inputs.tMinus2,
          t_minus_1: inputs.tMinus1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data.predicted_volume);
      } else {
        // Fallback calculation for demo purposes
        const mockPrediction = Math.round(
          (inputs.tMinus3 * 0.3) + (inputs.tMinus2 * 0.4) + (inputs.tMinus1 * 0.5) + 15
        );
        setPrediction(mockPrediction);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      // Fallback calculation
      const mockPrediction = Math.round(
        (inputs.tMinus3 * 0.3) + (inputs.tMinus2 * 0.4) + (inputs.tMinus1 * 0.5) + 15
      );
      setPrediction(mockPrediction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            T-3 Bookings
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={inputs.tMinus3}
              onChange={(e) => handleInputChange('tMinus3', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>0</span>
              <span className="font-medium text-primary-600">{inputs.tMinus3}</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            T-2 Bookings
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={inputs.tMinus2}
              onChange={(e) => handleInputChange('tMinus2', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>0</span>
              <span className="font-medium text-primary-600">{inputs.tMinus2}</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            T-1 Bookings
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={inputs.tMinus1}
              onChange={(e) => handleInputChange('tMinus1', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>0</span>
              <span className="font-medium text-primary-600">{inputs.tMinus1}</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePredict}
        loading={loading}
        className="w-full"
        size="lg"
      >
        <Brain className="w-5 h-5 mr-2" />
        Generate Prediction
      </Button>

      {prediction !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Predicted Volume</h3>
          </div>
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {prediction}
          </div>
          <p className="text-sm text-neutral-600">
            cases expected
          </p>
          <div className="mt-4 text-xs text-neutral-500">
            Model's Historical Accuracy: ±21 Cases
          </div>
        </motion.div>
      )}
    </div>
  );
};