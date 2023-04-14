import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ModuleButtons from "../components/AddModuleButtons";
import Alert from "../ui/Alert";

const ModulesList = ({ queryName, url }) => {
  const { data, isLoading, error } = useQuery([queryName], async () => {
    const response = await axios.get(url, {
      withCredentials: true,
    });
    return response.data;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return !!data.results.length ? (
    <ul
      role="list"
      className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col-5 gap-4"
    >
      {data.results.map((result) => (
        <li
          key={result.module.id}
          className="rounded-lg bg-white text-cente border"
        >
          <div className="flex flex-1 flex-col p-8 justify-center items-center">
            <img
              className="mx-auto h-32 flex-shrink-0"
              src={`${result.module.image}`}
              alt=""
            />
            <h3 className="mt-6 text-lg font-semibold text-gray-900 text-center">
              {result.module.name}
            </h3>
            <p className="text-gray-400 text-base text-center">
              {result.module.manufacturer}
            </p>
            <ModuleButtons module={result} queryName={queryName} />
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <Alert>
      There are no modules in your {queryName === "wtbModules" ? "want-to-build" : "modules"} list.{" "}
      <a className="text-blue-500" href="/">
        Add a module.
      </a>
    </Alert>
  );
};

export default ModulesList;
