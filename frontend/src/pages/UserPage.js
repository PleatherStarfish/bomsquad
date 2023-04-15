import React, { useState } from "react";
import Gravatar from 'react-gravatar'
import Inventory from "../components/Inventory"
import ModulesList from "../components/ModulesLists"
import cx from "classnames"
import useAuthenticatedUser from "../services/useAuthenticatedUser"

const tabs = [
  { name: "Built", href: "#", current: true },
  { name: "Want to Build", href: "#", current: false },
  { name: "Inventory", href: "#", current: false },
  { name: "Shopping List", href: "#", current: false },
];

const UserPage = () => {
  const [selectedTab, setSelectedTab] = useState(
    tabs.find((tab) => tab.current).name
  );

  const { user, userIsLoading, userIsError } = useAuthenticatedUser()

  if (userIsLoading) return <div className="text-gray-700 animate-pulse">Loading...</div>;
  if (userIsError) return <div>Error!</div>;

  function handleTabChange(e) {
    setSelectedTab(e.target.value);
  }

  return (
    <>
      <div className="flex items-center py-6 mt-12">
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
                  className={cx(
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
        {selectedTab === "Built" &&  <ModulesList queryName="builtModules" url="/api/get-built-modules/" />}
        {selectedTab === "Want to Build" &&  <ModulesList queryName="wtbModules" url="/api/get-wtb-modules/" />}
        {selectedTab === "Inventory" &&  <Inventory />}
      </section>
    </>
  );
};

export default UserPage;
