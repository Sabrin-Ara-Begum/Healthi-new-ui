import { Heart, Sparkles, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-sm border-t border-purple-100 px-6 py-2 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Healthi AI
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Your wellness companion, always here for you</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Mail className="w-3.5 h-3.5 text-purple-500" />
            <span>support@healthiai.com</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-purple-100 text-center">
          <p className="text-[10px] text-gray-500">
            © 2024 Healthi AI 💜
          </p>
        </div>
      </div>
    </footer>
  );
}