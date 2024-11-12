import React, { useEffect, useState } from "react";

import AddModuleButtons from "../components/AddModuleButtons";
import { Module } from "../types/modules";
import chroma from "chroma-js";
import { motion } from "framer-motion";
import useAuthenticatedUser from "../services/useAuthenticatedUser";

interface ModulesListProps {
  modules: Module[];
  filtersApplied?: boolean;
  isLoading?: boolean;
}

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.2, // Stagger each child by 0.2 seconds
    },
  },
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 200 },
  visible: (index: number) => ({
    opacity: 1,
    transition: {
      delay: index * 0.2, // Additional delay per item based on index
      duration: 0.4,
      ease: "easeIn",
    },
    x: 0,
  }),
};

const ModulesList: React.FC<ModulesListProps> = ({ modules, filtersApplied = false, isLoading = true }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hpColorScale = chroma.scale(["#a4d3b5", "#558a6b", "#2d5d46"]).domain([1, 34]);
  const { user } = useAuthenticatedUser();

  useEffect(() => {
    // Delay animation by 0.5 seconds
    const timeout = setTimeout(() => setShouldAnimate(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  if (modules.length === 0 && !isLoading) {
    return (
      <div className="text-center text-gray-600">
        {filtersApplied ? (
          <p>No modules found matching your filter settings.</p>
        ) : (
          <p>No modules available. Please check back later.</p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      animate={shouldAnimate ? "visible" : "hidden"}
      className="grid grid-cols-1 gap-y-10 lg:gap-y-14"
      initial="hidden"
      variants={containerVariants}
    >
      {modules.map((module, index) => (
        <motion.div
          className="flex flex-col items-center overflow-hidden bg-white rounded-lg md:flex-row"
          custom={index}
          key={module.id}
          variants={slideInFromRight}
        >
          <div className="flex justify-center w-full h-64 md:w-48 md:h-48">
            {module.thumb_image_webp && module.thumb_image_jpeg ? (
              <picture>
                <source srcSet={module.thumb_image_webp} type="image/webp" />
                <source srcSet={module.thumb_image_jpeg} type="image/jpeg" />
                <img
                  alt={module.name}
                  className="object-cover w-full h-full md:object-contain"
                  src={module.thumb_image_jpeg}
                />
              </picture>
            ) : null}
          </div>
          <div className="flex-1 p-4 md:px-4 md:py-5 sm:p-6">
            <div className="flex flex-wrap justify-between">
              <a href={`/module/${module.slug}`}>
                <h2 className="text-xl font-medium text-gray-900">{module.name}</h2>
              </a>
              {user && (
                <div className="flex py-2 space-x-2 md:py-0">
                  <AddModuleButtons moduleId={module.id} queryName="built" />
                  <AddModuleButtons moduleId={module.id} queryName="want-to-build" />
                </div>
              )}
            </div>
            <a className="text-gray-500 hover:text-gray-400" href={`/manufacturer/${module.manufacturer_slug}`}>
              {module.manufacturer.name}
            </a>
            <div className="flex flex-wrap gap-2 mt-2">
              {module.rack_unit && (
                <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full bg-blue-700">
                  {module.rack_unit}
                </span>
              )}
              {module.hp && (
                <span
                  className="px-2 py-0.5 text-xs font-semibold text-white rounded-full"
                  style={{ backgroundColor: hpColorScale(module.hp).hex() }}
                >
                  {module.hp} HP
                </span>
              )}
              {module.category && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${
                    module.category.toLowerCase() === "eurorack"
                      ? "bg-slate-500"
                      : module.category.toLowerCase() === "pedals"
                      ? "bg-purple-500"
                      : module.category.toLowerCase() === "serge"
                      ? "bg-yellow-800"
                      : "bg-gray-500"
                  }`}
                >
                  {module.category}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500 line-clamp-5">
              {module.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ModulesList;
