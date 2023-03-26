import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const ModuleDetail = ({ slug }) => {
  const { data, isLoading, isError } = useQuery(["module", slug], async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/module/${slug}/`, {
          withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Network response was not ok");
    }
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error!</p>;

  return (
    <>
      <div className="flex justify-center">
        {data.image && (
          <img
          className="max-h-60"
            src={`${data.image}`}
          />
        )}
      </div>
      <div>
        <div>
          <div className="mt-12">
            <div>
              <h1 className="text-3xl font-semibold py-4">{data.name}</h1>
              <p>
                <a>
                  {data.manufacturer_name}
                </a>
              </p>
            </div>
            <div className="mt-6">
              {/* {built && built.includes(module) ? (
              <BuiltSvgButton add={false} moduleId={module.id} requestPath={requestPath} />
            ) : (
              <BuiltSvgButton add moduleId={module.id} requestPath={requestPath} />
            )}
            {to_build && to_build.includes(module) ? (
              <ToBuildSvgButton add={false} moduleId={module.id} requestPath={requestPath} />
            ) : (
              <ToBuildSvgButton add moduleId={module.id} requestPath={requestPath} />
            )} */}
            </div>
          </div>
          <div>
            <h2 className="text-xl py-4 font-semibold ">Description</h2>
            <p className="card-text">{data.description}</p>
          </div>
        </div>
      </div>
      <h2 className="mb-4">Components</h2>
    </>
  );
};

export default ModuleDetail;
