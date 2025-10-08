import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import Input from '../inputs';

const CustomProperties = ({ control, error }: any) => {
  const [properties, setProperties] = useState<
    { name: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-3">
        <Controller
          name="custom_properties"
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { name: newLabel, values: [] }]);
              setNewLabel('');
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue('');
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Custom Properties
                </label>
                <div className="flex flex-col gap-3">
                  {/* Existing Properties */}
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 p-3 rounded-lg bg-black/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {property.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>
                      {/* Add Value to Property */}
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          type="text"
                          placeholder="Enter value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full"
                        />

                        <button
                          type="button"
                          onClick={() => addValue(index)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Add
                        </button>
                      </div>

                      {/* Show Values */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="bg-gray-700 text-white px-2 py-1 rounded-full text-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add New Property */}
                  <div className="flex gap-2 items-center mt-1">
                    <Input
                      placeholder="Enter property label (e.g., Material, Size)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={addProperty}
                      className="px-3 flex justify-center items-center gap-2 py-2 bg-blue-600 text-white rounded-md"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        />

        {error.custom_properties && (
          <p className="text-red-500 text-xs mt-1">
            {error.custom_properties.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomProperties;
