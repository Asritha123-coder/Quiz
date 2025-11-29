import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Sidebar = ({ categoryGroups, categories = [], onNavigate, mobileMenuOpen, setMobileMenuOpen }) => {
  // Default "Quizzes" expanded (matching Mentimeter)
  const [expandedItems, setExpandedItems] = useState({
    "Entertainment": true, // Default open like "Quizzes" in Mentimeter
  });

  const toggleExpand = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const handleItemClick = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  // Helper to get category name by ID
  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : `Category ${catId}`;
  };

  const sidebarItems = [
    {
      name: "Featured",
      id: "featured-categories",
      subItems: [],
    },
    ...Object.keys(categoryGroups).map((groupName) => ({
      name: groupName,
      id: `group-${groupName}`,
      subItems: categoryGroups[groupName].map((catId) => ({
        id: catId,
        name: getCategoryName(catId),
      })),
    })),
    {
      name: "Community Categories",
      id: "community-categories",
      subItems: [],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 w-[260px] h-screen overflow-y-auto bg-white lg:ml-16 transition-transform duration-300 ease-in-out`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <nav className="py-6">
          {/* Explore Heading */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Explore
            </h3>
          </div>

          <div className="space-y-0">
            {sidebarItems.map((item) => {
              const isExpanded = expandedItems[item.name];
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.name} className="mb-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasSubItems) {
                        toggleExpand(item.name);
                      } else {
                        handleItemClick(item.id);
                      }
                    }}
                    className="w-full text-left py-2 hover:text-black text-gray-700 flex items-center justify-between group transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-lg font-medium text-gray-800">
                      {item.name}
                    </span>
                    {hasSubItems && (
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 flex-shrink-0 ml-2 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Sub-items with smooth accordion animation */}
                  {hasSubItems && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pt-1 pb-1 space-y-0">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            type="button"
                            onClick={() => handleItemClick(item.id)}
                            className="w-full text-left pl-3 py-2 hover:text-black text-gray-600 text-base font-normal transition-colors duration-200 cursor-pointer"
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
