import {
  FolderIcon,
  HomeIcon,
  ListBulletIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { Link, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

import Gravatar from "react-gravatar";
import cx from "classnames";
import useAuthenticatedUser from "../services/useAuthenticatedUser";

const initialNavigation = [
  { name: "Built", to: "built", icon: HomeIcon, current: true },
  {
    name: "Want to Build",
    to: "want-to-build",
    icon: WrenchIcon,
    current: false,
  },
  { name: "Inventory", to: "inventory", icon: FolderIcon, current: false },
  {
    name: "Shopping List",
    to: "shopping-list",
    icon: ListBulletIcon,
    current: false,
  },
];

const UserPage = () => {
  const [selectedTab, setSelectedTab] = useState(
    initialNavigation.find((tab) => tab.current).name
  );
  const [navigation, setNavigation] = useState(initialNavigation);
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();
  const location = useLocation();

  const updateNavigationCurrentStatus = (tabName) => {
    return navigation.map((tab) => {
      return { ...tab, current: tab.name === tabName };
    });
  };

  useEffect(() => {
    const matchingTab = navigation.find((tab) =>
      location.pathname.includes(tab.to)
    );
    if (matchingTab) {
      setSelectedTab(matchingTab.name);
      setNavigation(updateNavigationCurrentStatus(matchingTab.name));
    }
  }, [location]);

  if (userIsLoading)
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (userIsError) return <div>Error!</div>;

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
    setNavigation(updateNavigationCurrentStatus(tabName));
  };

  const MobileNav = () => (
    <div className="fixed inset-x-0 bottom-0 md:hidden">
      <nav className="z-50 bg-white shadow-md">
        <ul className="flex justify-between">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.to}
                className={cx(
                  item.current
                    ? "bg-gray-200 text-[#548a6a]"
                    : "text-gray-400 hover:text-[#548a6a]",
                  "flex flex-col items-center justify-center py-2 px-4 text-sm font-semibold"
                )}
                aria-current={item.name === selectedTab ? "page" : undefined}
                onClick={() => {
                  handleTabChange(item.name);
                }}
              >
                <item.icon
                  className={cx(
                    item.current
                      ? "text-[#548a6a]"
                      : "text-gray-400 group-hover/item:text-[#548a6a]",
                    "h-6 w-6"
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="relative gap-6 mt-[64px] z-10">
      <div className="hidden md:block">
        <div
          className="w-[70px] group/slideout hover:w-[200px] bg-gray-100 fixed transition-all duration-300 ease-in"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="flex flex-col h-full px-6 pb-4 overflow-y-auto bg-gray-100 gap-y-5">
            <nav className="z-20 flex flex-col flex-1 h-full">
              <ul role="list" className="flex flex-col flex-1 h-full gap-y-7">
                <li>
                  <ul role="list" className="mt-8 -mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          key={item.name}
                          to={item.to}
                          className={cx(
                            item.current
                              ? "bg-gray-200 text-[#548a6a]"
                              : "text-gray-400 hover:text-[#548a6a]",
                            "group/item flex gap-x-3 rounded-md px-2 py-3 text-sm leading-6 font-semibold hover:bg-gray-200"
                          )}
                          aria-current={
                            item.name === selectedTab ? "page" : undefined
                          }
                          onClick={() => handleTabChange(item.name)}
                        >
                          <item.icon
                            className={cx(
                              item.current
                                ? "text-[#548a6a]"
                                : "text-gray-400 group-hover/item:text-[#548a6a]",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          <span className="invisible transition-all opacity-0 whitespace-nowrap group-hover/slideout:visible group-hover/slideout:opacity-100">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="justify-between mt-auto -mx-6">
                  <Link to="settings">
                    <div className="flex items-center px-6 py-3 text-sm font-semibold leading-6 text-gray-900 group/settings gap-x-4 hover:bg-gray-200">
                      <Gravatar
                        className="rounded-full"
                        email={user.email}
                        rating="pg"
                        size={40}
                      />
                      <span className="sr-only">Your profile</span>
                      <span
                        aria-hidden="true"
                        className="invisible transition-all opacity-0 whitespace-nowrap group-hover/slideout:visible group-hover/slideout:opacity-100"
                      >
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
                      </span>
                    </div>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <MobileNav />
      <main className="relative grow py-10 ml-0 md:ml-[70px] pointer-events-auto -z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserPage;
