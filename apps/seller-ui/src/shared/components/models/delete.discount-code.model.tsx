import { X } from "lucide-react";

interface Props {
  discount: any;
  onClose: (e: boolean) => void;
  onConfirm: () => void;
}

const DeleteDiscountCodeModal = ({ discount, onClose, onConfirm }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-[450px] max-w-md">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl font-semibold text-white">
            Delete Discount Code
          </h3>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => onClose(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Warning Message */}
        <div className="my-4">
          <p className="text-gray-300">
            Are you sure you want to delete the discount code{' '}
            <span className="font-semibold text-white">{discount.name}</span>?
            This action <b>cannot be undone.</b>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            onClick={() => onClose(false)}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteDiscountCodeModal;
