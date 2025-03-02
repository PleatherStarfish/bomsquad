import {
  BuildingOffice2Icon,
  FolderIcon,
  ShoppingCartIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { Link, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

import Gravatar from "react-gravatar";
import cx from "classnames";
import useAuthenticatedUser from "../services/useAuthenticatedUser";

type NavigationItem = {
  name: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current: boolean;
};

const initialNavigation: NavigationItem[] = [
  { current: true, icon: BuildingOffice2Icon, name: "Built", to: "built" },
  { current: false, icon: WrenchIcon, name: "Want to Build", to: "want-to-build" },
  { current: false, icon: FolderIcon, name: "Inventory", to: "inventory" },
  { current: false, icon: ShoppingCartIcon, name: "Shopping List", to: "shopping-list" },
];

const UserPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(
    initialNavigation.find((tab) => tab.current)?.name || ""
  );
  const [navigation, setNavigation] = useState<NavigationItem[]>(initialNavigation);
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();
  const location = useLocation();

  const updateNavigationCurrentStatus = (tabName: string): NavigationItem[] => {
    return navigation.map((tab) => ({
      ...tab,
      current: tab.name === tabName,
    }));
  };

  useEffect(() => {
    const matchingTab = initialNavigation.find((tab) =>
      location.pathname.includes(tab.to)
    );
    if (matchingTab) {
      setSelectedTab(matchingTab.name);
      setNavigation(updateNavigationCurrentStatus(matchingTab.name));
    }
  }, [location]);

  if (userIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }
  if (userIsError) {
    return <div>Error!</div>;
  }

  const handleTabChange = (tabName: string) => {
    setSelectedTab(tabName);
    setNavigation(updateNavigationCurrentStatus(tabName));
  };

  const MobileNav: React.FC = () => (
    <div className="fixed inset-x-0 bottom-0 md:hidden">
      <nav className="z-50 bg-white shadow-md">
        <ul className="flex justify-between">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                aria-current={item.name === selectedTab ? "page" : undefined}
                className={cx(
                  item.current
                    ? "bg-gray-200 text-[#548a6a]"
                    : "text-gray-400 hover:text-[#548a6a]",
                  "flex flex-col items-center justify-center py-2 px-4 text-sm font-semibold"
                )}
                onClick={() => handleTabChange(item.name)}
                to={item.to}
              >
                <item.icon
                  aria-hidden="true"
                  className={cx(
                    item.current
                      ? "text-[#548a6a]"
                      : "text-gray-400 group-hover/item:text-[#548a6a]",
                    "h-6 w-6"
                  )}
                />
                <span className="mt-1 text-center">{item.name}</span>
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
              <ul className="flex flex-col flex-1 h-full gap-y-7" role="list">
                <li>
                  <ul className="mt-8 -mx-2 space-y-1" role="list">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          aria-current={item.name === selectedTab ? "page" : undefined}
                          className={cx(
                            item.current
                              ? "bg-gray-200 text-[#548a6a]"
                              : "text-gray-400 hover:text-[#548a6a]",
                            "group/item flex gap-x-3 rounded-md px-2 py-3 text-sm leading-6 font-semibold hover:bg-gray-200"
                          )}
                          onClick={() => handleTabChange(item.name)}
                          to={item.to}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={cx(
                              item.current
                                ? "text-[#548a6a]"
                                : "text-gray-400 group-hover/item:text-[#548a6a]",
                              "h-6 w-6 shrink-0"
                            )}
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
                  <Link to="settings/">
                    <div className="flex items-center px-6 py-3 text-sm font-semibold leading-6 text-gray-900 group/settings gap-x-4 hover:bg-gray-200">
                      {!!user?.emails?.[0].email ? (
                        <Gravatar
                          className="rounded-full"
                          email={(user?.emails ?? []).find((e) => e.primary)?.email || user?.emails?.[0].email}
                          rating="pg"
                          size={40}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      )}
                      <span className="sr-only">Your profile</span>
                      <span
                        aria-hidden="true"
                        className="invisible transition-all opacity-0 whitespace-nowrap group-hover/slideout:visible group-hover/slideout:opacity-100"
                      >
                        {user?.first_name && user?.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username || "User"}
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
