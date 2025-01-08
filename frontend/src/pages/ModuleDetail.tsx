import { LinkIcon } from "@heroicons/react/24/outline";
import React, {useState} from "react";
import { Helmet } from "react-helmet-async";

import HeaderWithButton from "../ui/HeaderWithButton"
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
  const [loading, setLoading] = useState(false);
  const { slug } = useParams<Params>();
  const { user } = useAuthenticatedUser();
  const { module, moduleIsLoading, moduleIsError } = useModule(slug);
  console.log(module)

  const handleModalOpenClose = (state: boolean) => setIsModalOpen(state);
  const handleLoading = (state: boolean) => {
    setLoading(state)
  }

  if (moduleIsLoading)
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  if (moduleIsError) return <div>Error!</div>;

  const hpColorScale = chroma
    .scale(["#a4d3b5", "#558a6b", "#2d5d46"])
    .domain([1, 34]);
  const hpColor = module.hp
    // @ts-ignore
    ? hpColorScale(module.hp).hex()
    : categoryColors.default;

  return (
    <div className="space-y-16">
      <Helmet>
      <title>
        Build Your Own {module.name} by {module.manufacturer.name} | DIY Guitar Pedals, Modular Synth Kits
      </title>
        <meta
          content={`Learn more about ${module.name}, a DIY project by ${module.manufacturer.name}. Manage your inventory, explore schematics, and build your modular synth or guitar pedal today.`}
          name="description"
        />
        <meta content="DIY modular synth kits, easy DIY guitar pedals, build modular synth, modular synth schematics, {module.name}, {module.manufacturer.name}, {module.category}" name="keywords" />
        <link href={`https://bom-squad.com/module/${module.slug}`} rel="canonical" />
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "${module.name}",
            "brand": {
              "@type": "Brand",
              "name": "${module.manufacturer.name}"
            },
            "description": "${module.description}",
            "image": "${module.large_image_webp || module.large_image_jpeg}",
            "url": "https://bom-squad.com/modules/${module.slug}",
            "category": "${module.category}",
            "additionalProperty": [
              {
                "@type": "PropertyValue",
                "name": "Rack Unit",
                "value": "${module.rack_unit || "N/A"}"
              },
              {
                "@type": "PropertyValue",
                "name": "HP Size",
                "value": "${module.hp || "N/A"}"
              }
            ]
          }
          `}
        </script>
      </Helmet>
      <div className="grid grid-cols-1 gap-8 p-6 rounded-lg md:grid-cols-5 bg-gradient-to-r from-slate-50 to-gray-100">
        {/* Left Side: Image */}
        <div className="flex justify-center py-12 md:col-span-2">
          {module.large_image_webp && (
            <picture>
              <source srcSet={`${module.large_image_webp}`} type="image/webp" />
              <source srcSet={`${module.large_image_jpeg}`} type="image/jpeg" />
              <img
                alt={module.name}
                className="max-h-[30rem] object-contain"
                loading="lazy"
                src={`${module.large_image_jpeg}`}
              />
            </picture>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="relative p-12 md:col-span-3">
          {user && <div className="absolute top-0 right-0 mr-4">
            <div className="flex space-x-3">
              <AddModuleButtons moduleId={module.id} queryName="built" />
              <AddModuleButtons
                moduleId={module.id}
                queryName="want-to-build"
              />
            </div>
          </div>}
          <div>
            <h1 className="py-4 text-3xl font-semibold font-display">
              {module.name}
            </h1>
            {"by "}<a
              className="text-gray-500 hover:text-gray-700"
              href={`/manufacturer/${module.manufacturer_slug}/`}
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
            <p className="pt-8 pb-4 card-text">{module.description}</p>
            <div role="list">
              {module.manufacturer_page_link && <a href={module.manufacturer_page_link} role="listitem">
                <div className="flex justify-between w-full py-3 border-b border-gray-200 group">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    Manufacturer page
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>}
              {module.bom_link && <a href={module.bom_link} role="listitem">
                <div className="flex justify-between w-full py-3 border-b border-gray-200 group">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    Bill of materials
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>}
              {module.manual_link && <a href={module.manual_link} role="listitem">
                <div className="flex justify-between w-full py-3 border-b border-gray-200 group">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    User manual
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>}
              {module.modulargrid_link && <a href={module.modulargrid_link} role="listitem">
                <div className="flex justify-between w-full py-3 border-b border-gray-200 group">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    Modulargrid link
                  </div>
                  <LinkIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-500" />
                </div>
              </a>}
            </div>
          </div>
          {/* <div className="flex justify-between mt-6">
            <ModuleLinks module={module} />
          </div> */}
        </div>
      </div>
      <div>
        {!loading && <div className="pb-5">
          <HeaderWithButton
            buttonText={`Get Cart for ${module.name}`}
            onButtonClick={() => handleModalOpenClose(true)}
            title="Components"
          />
          {!user && (<span className="text-xs">
            <a
              className="text-blue-500 hover:text-blue-700"
              href="/accounts/login/"
            >
              <b>Login</b>
            </a>{" "}
            to compare the BOM against your personal inventory.
          </span>)}
          <div>
            <p className="mt-6 text-gray-500">Click any row in the BOM to see a list of components that fulfill that component requirement.</p>
          </div>
        </div>}
        
        <div className="pb-6">
          <BomList
            bomUnderConstruction={!!module.bom_under_construction}
            exportModalOpen={isModalOpen}
            handleExportButtonClick={handleModalOpenClose}
            handleLoading={handleLoading}
            moduleId={module.id}
            moduleName={module.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
