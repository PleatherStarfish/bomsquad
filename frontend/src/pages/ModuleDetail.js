import AddModuleButtons from '../components/AddModuleButtons';
import BomList from "../components/bom_list";
import ModuleLinks from '../components/ModuleLinks';
import React from "react";
import chroma from 'chroma-js';
import useModule from '../services/useModule';
import { useParams } from "react-router-dom";

const categoryColors = {
  eurorack: 'bg-slate-500',
  pedals: 'bg-purple-500',
  serge: 'bg-yellow-800',
  default: 'bg-gray-500',
};

const ModuleDetail = () => {
  let { slug } = useParams();
  const { module, moduleIsLoading, moduleIsError } = useModule(slug);

  if (moduleIsLoading) return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (moduleIsError) return <div>Error!</div>;

  const manufacturerDetailUrl = `/manufacturer/${module.manufacturer_slug}/`;

  const hpColorScale = chroma.scale(["#a4d3b5", "#558a6b", "#2d5d46"]).domain([1, 34]);
  const hpColor = module.hp ? hpColorScale(module.hp).hex() : categoryColors.default;

  return (
    <>
      <div className="flex justify-center">
        {module.large_image_webp && (
          <picture>
            <source srcSet={`${module.large_image_webp}`} type="image/webp" />
            <source srcSet={`${module.large_image_jpeg}`} type="image/jpeg" />
            <img
              className="max-h-[30rem]"
              src={`${module.large_image_jpeg}`}
              alt={module.name}
            />
          </picture>
        )}
      </div>
      <div>
        <div>
          <div className="mt-12">
            <div>
              <h1 className="py-8 text-3xl font-semibold">{module.name}</h1>
              <a href={manufacturerDetailUrl} className="text-gray-500 hover:text-gray-300">
                {module.manufacturer.name}
              </a>
            </div>

            {/* Color-coded Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {/* Rack Unit Pill with Static Color */}
              {module.rack_unit && (
                <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full bg-blue-600">
                  {module.rack_unit}
                </span>
              )}

              {/* HP Pill with Chroma.js Gradient */}
              {module.hp && (
                <span
                  className="px-2 py-0.5 text-xs font-semibold text-white rounded-full"
                  style={{ backgroundColor: hpColor }}
                >
                  {module.hp} HP
                </span>
              )}

              {/* Category Pill with Static Colors */}
              {module.category && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${categoryColors[module.category.toLowerCase()] || categoryColors.default}`}
                >
                  {module.category}
                </span>
              )}
            </div>
            
            <div className="flex justify-between h-full mt-6">
              <ModuleLinks module={module} />
              <div className="flex flex-col justify-center h-full">
                <div className="flex space-x-4">
                  <AddModuleButtons moduleId={module.id} queryName="built" />
                  <AddModuleButtons moduleId={module.id} queryName="want-to-build" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="py-4 text-xl font-semibold ">Description</h2>
            <p className="card-text">{module.description}</p>
          </div>
        </div>
      </div>
      <h1 className="py-8 text-xl font-semibold">Components</h1>
      <BomList moduleId={module?.id} moduleName={module?.name} />
    </>
  );
};

export default ModuleDetail;
