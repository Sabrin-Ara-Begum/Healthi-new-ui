import { X, Lock } from "lucide-react";
import { useNavigate } from "react-router";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Please log in or create an account to use Healthi AI's personalized features. Your conversations, mood logs, notifications, and health information are securely stored in your account.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              navigate("/auth");
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#B9A9FB] to-[#FFB7C5] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity shadow-sm"
          >
            Log In or Sign Up
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
