import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ModuleButtons from "../components/AddModuleButtons";

const ModulesList = ({queryName, url}) => {
  const { data, isLoading, error } = useQuery([queryName], async () => {
    const response = await axios.get(
        url,
      {
        withCredentials: true,
      }
    );
    return response.data;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ul
      role="list"
      className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col-5 gap-4"
    >
      {data.results.map((result) => (
        <li
          key={result.module.id}
          className="rounded-lg bg-white text-cente border w-[250px] lg:w-[300px] min-w-1/5"
        >
          <div className="flex flex-1 flex-col p-8 justify-center items-center">
            <img
              className="mx-auto h-32 flex-shrink-0"
              src={`/${result.module.image}`}
              alt=""
            />
            <h3 className="mt-6 text-lg font-semibold text-gray-900">
              {result.module.name}
            </h3>
            <p className="text-gray-400 text-base">{result.module.manufacturer}</p>
            <ModuleButtons module={result} hideWtb />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ModulesList;