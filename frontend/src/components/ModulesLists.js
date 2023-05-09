import AddModuleButtons from "../components/AddModuleButtons";
import Alert from "../ui/Alert";
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

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

  console.log(listData)

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse">Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return !!listData.results.length ? (
    <ul
      role="list"
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col-5"
    >
      {listData.results.map((result) => {
        return (
          <li key={`${queryName}${result.module.id}`} className="bg-white border rounded-lg text-cente">
            <div className="flex flex-col items-center justify-center flex-1 p-8">
              <img
                className="flex-shrink-0 h-32 mx-auto"
                src={`${result.module.image}`}
                alt=""
              />
              <a href={`/module/${result.module.slug}/`}>
                <h3 className="mt-6 text-lg font-semibold text-center text-gray-900">
                  {result.module.name}
                </h3>
              </a>
              <p className="text-base text-center text-gray-400">
                {result.module.manufacturer.name}
              </p>
              <AddModuleButtons module={result} moduleId={result.module.id} queryName={queryName} />
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <Alert variant="transparent" centered>
      <span>
      There are no modules in your{" "}
      {queryName === "wtbModules" ? "want-to-build" : "modules"} list.{" "}
      <a className="text-blue-500" href="/">
        Add a module.
      </a>
      </span>
    </Alert>
  );
};

export default ModulesList;
