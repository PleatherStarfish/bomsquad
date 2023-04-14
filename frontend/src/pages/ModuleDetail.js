import React from "react";
import ModuleLinks from '../components/ModuleLinks'
import useModule from '../services/useModule'
import BomList from "../components/bom_list";

const ModuleDetail = ({ slug }) => {
  const { module, moduleIsLoading, moduleIsError } = useModule(slug)

  if (moduleIsLoading) return <p>Loading...</p>;
  if (moduleIsError) return <p>Error!</p>;

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
              <h1 className="text-3xl font-semibold py-4">{module.name}</h1>
              <p>
                <a>
                  {module.manufacturer_name}
                </a>
              </p>
            </div>
            <div className="mt-6">
              <ModuleLinks module={module} />
            </div>
          </div>
          <div>
            <h2 className="text-xl py-4 font-semibold ">Description</h2>
            <p className="card-text">{module.description}</p>
          </div>
        </div>
      </div>
      <h1  className="text-3xl font-semibold py-8">Components</h1>
      <BomList module_id={module?.id} />
    </>
  );
};

export default ModuleDetail;