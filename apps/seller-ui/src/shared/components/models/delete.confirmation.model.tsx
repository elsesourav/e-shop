import { X } from 'lucide-react';
import { FC } from 'react';

type Props = {
  selectedProduct: any | null;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
};

const DeleteConfirmationModal: FC<Props> = ({
  selectedProduct,
  onCancel,
  onConfirm,
  isPending = false,
}) => {
  if (!selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">
            {selectedProduct.title}
          </span>
          ?
        </p>

        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-400">
            ⚠️ This product will be soft-deleted and permanently removed after 1
            day. You can recover it before then.
          </p>
        </div>

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
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-600"
          >
            {isPending ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
