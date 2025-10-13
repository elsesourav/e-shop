import { Controller } from 'react-hook-form';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

function SizeSelector({ control, errors }: any) {
  return (
    <div className="mt-4">
      <label htmlFor="sizes" className="block font-semibold text-gray-300 mb-1">
        Sizes
      </label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => {
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size]
                    );
                  }}
                  className={`py-1 w-10 rounded-lg font-Poppins transition duration-200 focus:outline-none border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-700'
                  }`}
                >
                  {size}
                </button>
              );
            })}
            {errors.sizes && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sizes.message as string}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
}
export default SizeSelector;
