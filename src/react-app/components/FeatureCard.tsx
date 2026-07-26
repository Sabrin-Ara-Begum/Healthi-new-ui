import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  path: string;
}

export default function FeatureCard({ title, description, icon, gradient, path }: FeatureCardProps) {
  return (
    <Link to={path} className="group">
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-6 border border-purple-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
        {/* Icon and Text Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-20 h-20 rounded-2xl ${gradient} dark:opacity-80 flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Bottom Section with Title and Arrow */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-100/50 dark:border-gray-700">
          <span className="text-gray-700 dark:text-gray-200 font-semibold">{title}</span>
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-gray-600 transition-colors">
            <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}
