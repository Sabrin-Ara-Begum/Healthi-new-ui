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
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all">
        {/* Icon and Text Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Bottom Section with Title and Arrow */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-100/50">
          <span className="text-gray-700 font-semibold">{title}</span>
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <ArrowRight className="w-4 h-4 text-purple-600" />
          </div>
        </div>
      </div>
    </Link>
  );
}
