import { CheckCircle, Save, X } from "lucide-react";
import React, { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmColor?: string;
  confirmIcon?: ReactNode;
  onCancel?: () => void;
  cancelText?: string;
  cancelColor?: string;
  cancelIcon: ReactNode;
  onBtn1: () => void;
  btn1Text: string;
  btn1Color: string;
  btn1Icon: ReactNode;
  width?: string;
  height?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Save Changes",
  confirmColor = "bg-blue-600 text-white rounded-lg hover:bg-blue-700",
  confirmIcon = <Save className="w-5 h-5 mr-2" />,
  onCancel,
  cancelText = "Cancel",
  cancelColor = "border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100",
  cancelIcon = <X className="w-5 h-5 mr-2" />,
  onBtn1,
  btn1Text = "Button 1",
  btn1Color = "bg-blue-600 text-white rounded-lg hover:bg-blue-700",
  btn1Icon = <CheckCircle className="w-5 h-5 mr-2" />,
  width = "w-96",
  height = "h-96",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-40">
      <div className={`bg-white p-3 rounded-lg shadow-xl ${width}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className={`mb-3 ${height} overflow-y-auto px-1 py-2 border-t ${onConfirm ? "border-b" : ""} border-gray-200`}
        >
          {children}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end mt-2">
          {onCancel && (
            <button
              className={`flex items-center justify-center cursor-pointer px-4 py-2 rounded-md transition-colors ease-in-out duration-200 ${cancelColor}`}
              onClick={onCancel}
              type="button"
            >
              {cancelIcon}
              {cancelText}
            </button>
          )}
          {onBtn1 && (
            <button
              className={`flex items-center justify-center cursor-pointer px-4 py-2 rounded-md transition-colors border ease-in-out duration-200 ${btn1Color}`}
              onClick={onBtn1}
              type="button"
            >
              {btn1Icon}
              {btn1Text}
            </button>
          )}
          {onConfirm && (
            <button
              className={`flex items-center justify-center cursor-pointer px-4 py-2 rounded-md transition-colors border ease-in-out duration-200 ${confirmColor}`}
              onClick={onConfirm}
              type="button"
            >
              {confirmIcon}
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
