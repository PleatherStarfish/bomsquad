import { Link, Outlet } from "react-router-dom";
import React, { useState } from "react";

import Button from "../ui/Button";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import Gravatar from "react-gravatar";
import cx from "classnames";
import useAuthenticatedUser from "../services/useAuthenticatedUser";

const tabs = [
  { name: "Built", to: "built", current: true },
  { name: "Want to Build", to: "want-to-build", current: false },
  { name: "Inventory", to: "inventory", current: false },
  { name: "Shopping List", to: "shopping-list", current: false },
];

const UserPage = () => {
  const [selectedTab, setSelectedTab] = useState(
    tabs.find((tab) => tab.current).name
  );

  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  if (userIsLoading)
    return <div className="text-gray-500 animate-pulse">Loading...</div>;
  if (userIsError) return <div>Error!</div>;

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  return (
    <>
      <div className="w-full flex items-center py-6 mt-12">
        <div>
          <Gravatar
            className="rounded-full"
            email={user.email}
            rating="pg"
            size={100}
          />
        </div>
        <div className="grow ml-6">
          <h1 className="text-2xl font-medium text-gray-700 group-hover:text-gray-900">
            {user.username}
          </h1>
        </div>
        <Link to="settings">
          <Button
            variant="muted"
            size="md"
            Icon={Cog6ToothIcon}
            iconLocation="left"
          >
            Account settings
          </Button>
        </Link>
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
              onChange={(e) => handleTabChange(e.target.value)}
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
                <Link
                  key={tab.name}
                  to={tab.to}
                  className={cx(
                    tab.name === selectedTab
                      ? "pb-4 border-pink-500 text-pink-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-1 text-sm font-medium"
                  )}
                  aria-current={tab.name === selectedTab ? "page" : undefined}
                  onClick={() => handleTabChange(tab.name)}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <section className="my-12">
        <Outlet />
      </section>
    </>
  );
};

export default UserPage;
