import { ArrowDownOnSquareIcon, LinkIcon } from "@heroicons/react/24/outline";
import React, {useState} from "react";

import AddModuleButtons from "../components/AddModuleButtons";
import BomList from "../components/bom_list";
import chroma from "chroma-js";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import useModule from "../services/useModule";
import { useParams } from "react-router-dom";

interface Params extends Record<string, string | undefined> {
  slug: string;
}

const categoryColors: Record<string, string> = {
  default: "bg-gray-500",
  eurorack: "bg-slate-500",
  pedals: "bg-purple-500",
  serge: "bg-yellow-800",
};

const ModuleDetail: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { slug } = useParams<Params>();
  const { user } = useAuthenticatedUser();
  const { module, moduleIsLoading, moduleIsError } = useModule(slug);

  const handleModalOpenClose = (state: boolean) => setIsModalOpen(state);

  if (moduleIsLoading)
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  if (moduleIsError) return <div>Error!</div>;

  const manufacturerDetailUrl = `/manufacturer/${module.manufacturer.slug}/`;

  const hpColorScale = chroma
    .scale(["#a4d3b5", "#558a6b", "#2d5d46"])
    .domain([1, 34]);
  const hpColor = module.hp
    // @ts-ignore
    ? hpColorScale(module.hp).hex()
    : categoryColors.default;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-6 bg-gray-100 rounded-lg">
        {/* Left Side: Image */}
        <div className="flex justify-center md:col-span-2 py-12">
          {module.large_image_webp && (
            <picture>
              <source srcSet={`${module.large_image_webp}`} type="image/webp" />
              <source srcSet={`${module.large_image_jpeg}`} type="image/jpeg" />
              <img
                alt={module.name}
                className="max-h-[30rem] object-contain"
                src={`${module.large_image_jpeg}`}
              />
            </picture>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="relative md:col-span-3 p-12">
          <div className="absolute top-0 right-0 mr-4">
            <div className="flex space-x-3">
              <AddModuleButtons moduleId={module.id} queryName="built" />
              <AddModuleButtons
                moduleId={module.id}
                queryName="want-to-build"
              />
            </div>
          </div>
          <div>
            <h1 className="py-4 text-3xl font-semibold font-display">
              {module.name}
            </h1>
            <a
              className="text-gray-500 hover:text-gray-300"
              href={manufacturerDetailUrl}
            >
              {module.manufacturer.name}
            </a>
          </div>

          {/* Color-coded Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {module.rack_unit && (
              <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full bg-blue-600">
                {module.rack_unit}
              </span>
            )}
            {module.hp && (
              <span
                className="px-2 py-0.5 text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: hpColor }}
              >
                {module.hp} HP
              </span>
            )}
            {module.category && (
              <span
                className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${
                  categoryColors[module.category.toLowerCase()] ||
                  categoryColors.default
                }`}
              >
                {module.category}
              </span>
            )}
          </div>
          <div>
            <h2 className="py-4 text-xl font-semibold sr-only">Description</h2>
            <p className="card-text pt-8 pb-4">{module.description}</p>
            <div role="list">
              <a href={module.manufacturer_page_link} role="listitem">
                <div className="group flex justify-between w-full border-b border-gray-200 py-3">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    Manufacturer page
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>
              <a href={module.bom_link} role="listitem">
                <div className="group flex justify-between w-full border-b border-gray-200 py-3">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    Bill of materials
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>
              <a href={module.manual_link} role="listitem">
                <div className="group flex justify-between w-full border-b border-gray-200 py-3">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    User manual
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>
              <a href={module.modulargrid_link} role="listitem">
                <div className="group flex justify-between w-full border-b border-gray-200 py-3">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    Modulargrid link
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>
            </div>
          </div>
          {/* <div className="flex justify-between mt-6">
            <ModuleLinks module={module} />
          </div> */}
        </div>
      </div>
      <div>
        <div className="pb-5">
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex items-center justify-between">
              <h1 className="bg-white pr-3 text-3xl font-semibold text-gray-900 font-display">Components</h1>
              <button
                className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:text-white hover:bg-[#4f7f63] transition-all"
                onClick={() =>  handleModalOpenClose(true)}
                type="button"
              >
                <ArrowDownOnSquareIcon className="w-5 h-5" />
                <span>Quick BOM Export</span>
              </button>
            </div>
          </div>
          {!user && (<span className="text-xs">
            <a
              className="text-blue-500 hover:text-blue-700"
              href="/accounts/login/"
            >
              <b>Login</b>
            </a>{" "}
            to compare the BOM against your personal inventory.
          </span>)}
        </div>
        <div className="pb-6">
          <BomList
            bomUnderConstruction={!!module.bom_under_construction}
            exportModalOpen={isModalOpen}
            handleExportButtonClick={handleModalOpenClose}
            moduleId={module.id}
            moduleName={module.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
