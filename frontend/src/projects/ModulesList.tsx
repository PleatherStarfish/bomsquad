import React, { useCallback } from "react";

// Extend the Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: { push: (arg: any) => void };
  }
}
import { Link } from "react-router-dom";
import chroma from "chroma-js";
import AddModuleButtons from "../components/AddModuleButtons";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import { Module } from "../types/modules";

interface ModulesListProps {
  modules: Module[];
  shouldAnimate?: boolean;
  filtersApplied?: boolean;
  isLoading?: boolean;
}

interface AdPlaceholder {
  id: number;
  type: "ad";
}

type ModuleOrAd = AdPlaceholder | Module;

interface AdUnitProps {
  loadAd: () => void;
}

const AdUnit: React.FC<AdUnitProps> = ({ loadAd }) => {
  React.useEffect(() => {
    loadAd();
  }, [loadAd]);

  return (
    <div className="flex justify-center w-full h-64">
      <script
        async
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549230942850511"
      />
      <ins
        className="adsbygoogle"
        data-ad-client="ca-pub-1549230942850511"
        data-ad-format="fluid"
        data-ad-layout-key="-cb-b+1t-6d+9m"
        data-ad-slot="6413550510"
        style={{ display: "block", width: "100%" }}
      />
    </div>
  );
};


// Type guard to check if the item is an AdPlaceholder
const isAdPlaceholder = (item: ModuleOrAd): item is AdPlaceholder => {
  return (item as AdPlaceholder).type === "ad";
};

const ModulesList: React.FC<ModulesListProps> = ({
  modules,
  filtersApplied = false,
  isLoading = true,
}) => {
  const hpColorScale = chroma
    .scale(["#a4d3b5", "#558a6b", "#2d5d46"])
    .domain([1, 34]);
  const { user } = useAuthenticatedUser();

  const loadAd = useCallback(() => {
    if (window.adsbygoogle && typeof window.adsbygoogle.push === "function") {
      try {
        window.adsbygoogle.push({});
      } catch (err) {
        console.error("Ad error:", err);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-600 animate-pulse">
        <p>Loading...</p>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="py-12 text-center text-gray-600">
        {filtersApplied ? (
          <p>No modules found matching your filter settings.</p>
        ) : (
          <p>No modules available. Please check back later.</p>
        )}
      </div>
    );
  }

  // Extend the modules list with ad placeholders
  const extendedList: ModuleOrAd[] = modules.flatMap((module, index) =>
    (index + 1) % 3 === 0
      ? [module, { id: index, type: "ad" }]
      : [module]
  );

  return (
    <div className="grid grid-cols-1 gap-y-10 lg:gap-y-14">
      {extendedList.map((item) => {
        if (isAdPlaceholder(item)) {
          return (
            <div className="flex justify-center" key={item.id}>
              <AdUnit loadAd={loadAd} />
            </div>
          );
        }

        const module = item as Module;

        return (
          <div
            className="flex flex-col items-center gap-4 overflow-hidden bg-white rounded-lg md:flex-row"
            key={module.id}
          >
            <div className="flex justify-center w-full h-64 md:w-48 md:h-48">
              {module.slug && (
                <Link reloadDocument to={`/projects/${module.slug}`}>
                  {module.thumb_image_webp && module.thumb_image_jpeg ? (
                    <picture>
                      <source
                        srcSet={module.thumb_image_webp}
                        type="image/webp"
                      />
                      <source
                        srcSet={module.thumb_image_jpeg}
                        type="image/jpeg"
                      />
                      <img
                        alt={module.name}
                        className="object-contain w-full h-full"
                        src={module.thumb_image_jpeg}
                      />
                    </picture>
                  ) : null}
                </Link>
              )}
            </div>
            <div className="flex-1 p-4 md:px-4 md:py-5 sm:p-6">
              <div className="flex flex-col flex-wrap justify-between w-full md:flex-row">
                {module.slug && (
                  <Link reloadDocument to={`/projects/${module.slug}`}>
                    <h2 className="text-xl font-medium text-center text-gray-900 md:text-left">
                      {module.name}
                    </h2>
                  </Link>
                )}
                <div className="flex justify-center w-full md:justify-start md:hidden">
                  <span>
                    {"by "}
                    <a
                      className="text-gray-500 hover:text-gray-400"
                      href={`/manufacturer/${module.manufacturer_slug}`}
                    >
                      {module.manufacturer.name}
                    </a>
                  </span>
                </div>
                {user && (
                  <div className="flex justify-center py-2 space-x-2 md:justify-end md:py-0">
                    <AddModuleButtons
                      moduleId={module.id}
                      queryName="built"
                    />
                    <AddModuleButtons
                      moduleId={module.id}
                      queryName="want-to-build"
                    />
                  </div>
                )}
              </div>
              <div className="justify-center hidden w-full md:justify-start md:flex">
                <span>
                  {"by "}
                  <a
                    className="text-gray-500 hover:text-gray-400"
                    href={`/manufacturer/${module.manufacturer_slug}`}
                  >
                    {module.manufacturer.name}
                  </a>
                </span>
              </div>
              <div className="flex flex-wrap justify-center w-full gap-2 mt-2 md:justify-start">
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
              <p className="mt-4 text-sm text-center text-gray-500 line-clamp-5 md:text-left">
                {module.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModulesList;
