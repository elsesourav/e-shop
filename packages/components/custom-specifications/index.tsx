import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../inputs';
import { PlusCircle, Trash2 } from 'lucide-react';

const CustomSpecifications = ({ control, error }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_specifications',
  });
  return (
    <div className="mt-3">
      <label className="block font-semibold text-gray-300 mb-1">
        Custom Specifications
      </label>
      <div className="flex flex-col gap-3">
        {fields?.map((item, index: number) => (
          <div key={index} className="flex gap-2 items-center">
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: 'Specification name is required' }}
              render={({ field }) => (
                <Input
                  label="Specification Name"
                  placeholder="e.g., Battery Life, Weight, Material"
                  {...field}
                />
              )}
            />
            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: 'Specification value is required' }}
              render={({ field }) => (
                <Input
                  label="Specification Value"
                  placeholder="e.g., 400mAh, 1.5 kg, Aluminum"
                  {...field}
                />
              )}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ name: '', value: '' })}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <PlusCircle size={20} /> Add Specification
        </button>

        {error.custom_specifications && (
          <p className="text-red-500 text-xs mt-1">
            {error.custom_specifications.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomSpecifications;
