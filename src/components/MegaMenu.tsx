
import React from 'react';
import { 
  Video, 
  Edit3, 
  Upload, 
  Mic, 
  FileText, 
  Bot, 
  Users, 
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MegaMenuProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onMouseEnter, onMouseLeave }) => {
  const productItems = [
    { icon: Video, title: 'Create', description: 'Create videos from scratch' },
    { icon: Edit3, title: 'Edit', description: 'Edit videos with powerful tools' },
    { icon: Upload, title: 'Publish', description: 'Publish and share your videos' }
  ];

  const createItems = [
    { icon: Mic, title: 'Recorder', description: 'Record screen and webcam' },
    { icon: FileText, title: 'Script Generator', description: 'AI-powered script writing' },
    { icon: Bot, title: 'Video GPT', description: 'AI video generation' },
    { icon: Users, title: 'AI Avatars', description: 'Create AI presenter videos' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-16 left-0 w-full bg-white shadow-2xl border-t border-gray-100 z-40 animate-slide-down"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Product Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              PRODUCT
            </h3>
            <div className="space-y-4">
              {productItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-purple-100' : 
                    index === 1 ? 'bg-purple-100' : 
                    'bg-green-100'
                  }`}>
                    <item.icon className={`w-4 h-4 ${
                      index === 0 ? 'text-purple-600' : 
                      index === 1 ? 'text-purple-600' : 
                      'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-black">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Create Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              CREATE
            </h3>
            <div className="space-y-4">
              {createItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-black">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* What's New Section */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              WHAT'S NEW
            </h3>
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">
                  Meet VEED 3.0,
                </h4>
                <p className="text-purple-100 mb-4 text-sm">
                  your complete AI production studio
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-purple-700 hover:bg-gray-100"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Decorative video preview */}
              <div className="absolute right-4 top-4 w-32 h-24 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-transparent"></div>
            </div>
          </div>

          {/* More Tools Section */}
          <div className="lg:col-span-4 pt-4 border-t border-gray-100">
            <button className="flex items-center text-gray-600 hover:text-black transition-colors">
              <span className="font-medium">More Tools</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
