import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Gravatar from 'react-gravatar'
import ModuleButtons from "../components/AddModuleButtons";
import DataTable from "react-data-table-component";


const tabs = [
  { name: "Built", href: "#", current: true },
  { name: "Want to Build", href: "#", current: false },
  { name: "Inventory", href: "#", current: false },
  { name: "Shopping List", href: "#", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const BuiltModules = () => {
  const { data, isLoading, error } = useQuery(['builtModules'], async () => {
    const response = await axios.get("http://127.0.0.1:8000/api/get-built-modules/", {
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

  return (
    <ul role="list" className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.results.map((built) => (
        <li
        key={built.module.id}
        className="rounded-lg bg-white text-cente border max-w-[250px] lg:max-w-[300px]"
      >
        <div className="flex flex-1 flex-col p-8 justify-center items-center">
          <img className="mx-auto h-32 flex-shrink-0" src={`http://127.0.0.1:8000/${built.module.image}`} alt="" />
          <h3 className="mt-6 text-lg font-semibold text-gray-900">{built.module.name}</h3>
          <p className="text-gray-400 text-base">{built.module.manufacturer}</p>
          <ModuleButtons module={built} hideBuilt />
        </div>
      </li>
      ))}
    </ul>
  )
}

const WtbModules = () => {
  const { data, isLoading, error } = useQuery(['wtbModules'], async () => {
    const response = await axios.get("http://127.0.0.1:8000/api/get-wtb-modules/", {
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

  return (
    <ul role="list" className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.results.map((wtb) => (
        <li
        key={wtb.module.id}
        className="rounded-lg bg-white text-cente border w-[250px] lg:w-[300px]"
      >
        <div className="flex flex-1 flex-col p-8 justify-center items-center">
          <img className="mx-auto h-32 flex-shrink-0" src={`http://127.0.0.1:8000/${wtb.module.image}`} alt="" />
          <h3 className="mt-6 text-lg font-semibold text-gray-900">{wtb.module.name}</h3>
          <p className="text-gray-400 text-base">{wtb.module.manufacturer}</p>
          <ModuleButtons module={wtb} hideWtb />
        </div>
      </li>
      ))}
    </ul>
  )
}

const Inventory = () => {
  const columns = [
    {
        name: 'Title',
        selector: row => row.title,
    },
    {
        name: 'Year',
        selector: row => row.year,
    },
];

const data = [
    {
        id: 1,
        title: 'Beetlejuice',
        year: '1988',
    },
    {
        id: 2,
        title: 'Ghostbusters',
        year: '1984',
    },
]
  return (
          <DataTable
              columns={columns}
              data={data}
          />
      );
  }


const UserPage = () => {
  const [selectedTab, setSelectedTab] = useState(
    tabs.find((tab) => tab.current).name
  );

  const { data: user, isLoading, isError } = useQuery(["authenticatedUser"], async () => {
    const response = await axios.get("http://127.0.0.1:8000/api/get-user-me/", {
      withCredentials: true,
    });
    return response.data;
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error!</p>;

  function handleTabChange(e) {
    setSelectedTab(e.target.value);
  }

  return (
    <>
      <div className="flex items-center py-6">
        <div>
          <Gravatar className="rounded-full" email={user.email} rating="pg" size={100} />
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-medium text-gray-700 group-hover:text-gray-900">
            {user.username}
          </h1>
        </div>
      </div>
      <div className="relative border-b border-gray-200">
        <div className="mt-4">
          <div className="sm:hidden">
            <label htmlFor="current-tab" className="sr-only">
              Select a tab
            </label>
            <select
              id="current-tab"
              name="current-tab"
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-500"
              value={selectedTab}
              onChange={handleTabChange}
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  className={classNames(
                    tab.name === selectedTab
                      ? "pb-4 border-pink-500 text-pink-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-1 text-sm font-medium"
                  )}
                  aria-current={tab.name === selectedTab ? "page" : undefined}
                  onClick={() => setSelectedTab(tab.name)}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <section className="my-12">
        {selectedTab === "Built" &&  <BuiltModules />}
        {selectedTab === "Want to Build" &&  <WtbModules />}
        {selectedTab === "Inventory" &&  <Inventory />}
      </section>
    </>
  );
};

export default UserPage;
