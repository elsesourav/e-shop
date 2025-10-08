import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

const defaultColors = [
  '#FF5733', // Red
  '#33FF57', // Green
  '#3357FF', // Blue
  '#F1C40F', // Yellow
  '#9B59B6', // Purple
  '#E67E22', // Orange
  '#1ABC9C', // Turquoise
  '#2C3E50', // Dark Blue
  '#7F8C8D', // Gray
  '#34495E', // Dark Gray
];

const ColorSelector = ({ control, error }: any) => {
  const [customColor, setCustomColor] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#FFFFFF');

  return (
    <div className="mt-2">
      <label
        htmlFor="color"
        className="block text-sm font-semibold text-gray-300 mb-1"
      >
        Colors
      </label>
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-3 ">
            {[...defaultColors, ...customColor].map((color, index) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ['#FFFFFF', '#FFFF00'].includes(
                color.toUpperCase()
              );

              return (
                <button
                  type="button"
                  key={`${color}-${index}`}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`size-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${
                    isSelected
                      ? 'scale-110 border-white'
                      : 'border-transparent scale-100'
                  } ${isLightColor ? 'border' : ''} ${
                    isLightColor ? 'border-gray-600' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Add new color */}
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="size-8 flex items-center justify-center rounded-full border-2 border-gray-500 bg-gray-800 hover:bg-gray-700 transition"
            >
              <Plus size={16} className="text-white" />
            </button>

            {/* Color Picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="size-10 p-0 border-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomColor((prev) => [...prev, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />

      {error.color && (
        <p className="text-red-500 text-xs mt-1">{error.color.message}</p>
      )}
    </div>
  );
};

export default ColorSelector;
