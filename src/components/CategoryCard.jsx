import React from "react";
import { motion } from "framer-motion";

const CategoryCard = ({ category, onClick, imageMap, pastelMap }) => {
  // Pastel color palette matching Mentimeter style exactly
  const pastelColors = [
    "#e8f1ff", // blue
    "#fde8f3", // pink
    "#fff9cc", // yellow
    "#f0e8ff", // purple
  ];

  // Get color based on category ID or use a default
  const getBackgroundColor = () => {
    if (pastelMap && pastelMap[category.id]) {
      return pastelMap[category.id];
    }
    // Use modulo to cycle through pastel colors
    const colorIndex = category.id % pastelColors.length;
    return pastelColors[colorIndex];
  };

  const bgColor = getBackgroundColor();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className="rounded-3xl p-6 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
      style={{ backgroundColor: bgColor }}
    >
      {/* Image container */}
      <div className="aspect-video mb-4 rounded-2xl overflow-hidden bg-white/60 flex items-center justify-center shadow-inner">
        {imageMap && imageMap[category.id] ? (
          <img
            src={imageMap[category.id]}
            alt={category.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100/50 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">Image</span>
          </div>
        )}
      </div>

      {/* Category name */}
      <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">
        {category.name}
      </h3>

      {/* Subtitle */}
      <p className="text-sm text-gray-600 mb-4 font-normal">
        Tap to view quizzes
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
        <span>Multiple difficulty levels</span>
        <span className="text-gray-300">•</span>
        <span>Timed quizzes</span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
