
import React from 'react';

const HomeContentLoader = () => {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Slider skeleton */}
      <div className="w-full h-64 md:h-96 bg-gray-200"></div>
      
      {/* Header image skeleton */}
      <div className="w-full h-32 md:h-48 bg-gray-100 mt-2"></div>
      
      {/* Description skeleton */}
      <div className="w-full py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-5/6 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
      
      {/* Services grid skeleton */}
      <div className="w-full py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContentLoader;
