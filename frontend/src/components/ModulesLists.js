import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AddModuleButtons from "../components/AddModuleButtons";
import Alert from "../ui/Alert";

const useModulesList = (queryName, url) => {
  const { data: listData, isLoading, isError, error } = useQuery([queryName], async () => {
    const response = await axios.get(url, {
      withCredentials: true,
    });
    return response.data;
  });

  return {listData, isLoading, isError, error};
};

const ModulesList = ({ queryName, url }) => {
  const {listData, isLoading, isError, error} = useModulesList(queryName, url);

  if (isLoading) {
    return <div className="text-gray-700 animate-pulse">Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return !!listData.results.length ? (
    <ul
      role="list"
      className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col-5 gap-4"
    >
      {listData.results.map((result) => {
        return (
          <li key={`${queryName}${result.module.id}`} className="rounded-lg bg-white text-cente border">
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
              <AddModuleButtons module={result} moduleId={result.module.id} queryName={queryName} />
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <Alert>
      There are no modules in your{" "}
      {queryName === "wtbModules" ? "want-to-build" : "modules"} list.{" "}
      <a className="text-blue-500" href="/">
        Add a module.
      </a>
    </Alert>
  );
};

export default ModulesList;
