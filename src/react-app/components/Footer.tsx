import { Heart, Sparkles, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-sm border-t border-purple-100 px-8 py-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Healthi AI
            </span>
          </div>

          {/* Center - Message */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Your wellness companion, always here for you</span>
          </div>

          {/* Right - Contact */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-purple-500" />
            <span>support@healthiai.com</span>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="mt-4 pt-4 border-t border-purple-100 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Healthi AI. Caring for your mental wellness, one day at a time. 💜
          </p>
        </div>
      </div>
    </footer>
  );
}
