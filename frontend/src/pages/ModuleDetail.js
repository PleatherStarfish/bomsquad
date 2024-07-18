import BomList from "../components/bom_list";
import ModuleLinks from '../components/ModuleLinks'
import React from "react";
import useModule from '../services/useModule'
import AddModuleButtons from '../components/AddModuleButtons';
import {
  useParams
} from "react-router-dom";

const ModuleDetail = () => {
  let { slug } = useParams();
  const { module, moduleIsLoading, moduleIsError } = useModule(slug)

  if (moduleIsLoading) return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (moduleIsError) return <div>Error!</div>;

  return (
    <>
      <div className="flex justify-center">
        {module.image && (
          <img
          className="max-h-60"
            src={`${module.image}`}
          />
        )}
      </div>
      <div>
        <div>
          <div className="mt-12">
            <div>
              <h1 className="py-8 text-3xl font-semibold">{module.name}</h1>
              {module.manufacturer.link ? <a href={module.manufacturer.link}>
                {module.manufacturer.name}
              </a> : <p>{module.manufacturer.name}</p>}
            </div>
            <div className="flex justify-between h-full mt-6">
              <ModuleLinks module={module} />
              <div className="flex flex-col justify-center h-full">
                <div className="flex space-x-4">
                  <AddModuleButtons moduleId={module.id} queryName="builtModules" />
                  <AddModuleButtons moduleId={module.id} queryName="wtbModules" />
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
      <h1  className="py-8 text-xl font-semibold">Components</h1>
      <BomList moduleId={module?.id} moduleName={module?.name} />
    </>
  );
};

export default ModuleDetail;