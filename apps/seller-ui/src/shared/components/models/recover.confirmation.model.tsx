import { X } from 'lucide-react';
import { FC } from 'react';

type Props = {
  selectedProduct: any | null;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  hoursLeft?: number;
  minutesLeft?: number;
};

const RecoverConfirmationModal: FC<Props> = ({
  selectedProduct,
  onCancel,
  onConfirm,
  isPending = false,
  hoursLeft = 0,
  minutesLeft = 0,
}) => {
  if (!selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Confirm Recovery</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          Are you sure you want to recover{' '}
          <span className="font-semibold text-white">
            {selectedProduct.title}
          </span>
          ?
        </p>

        {(hoursLeft > 0 || minutesLeft > 0) && (
          <div className="mb-4 p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg">
            <p className="text-sm text-orange-400">
              ⏰ Time remaining: {hoursLeft > 0 && `${hoursLeft}h `}
              {minutesLeft}m before permanent deletion
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-600"
          >
            {isPending ? 'Recovering...' : 'Recover Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecoverConfirmationModal;
