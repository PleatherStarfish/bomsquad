import {
  Bars3Icon,
  BellIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import React, { Fragment, useState } from "react";

import Button from "../ui/Button";
import Gravatar from "react-gravatar";
import cx from "classnames";
import useAuthenticatedUser from "../services/useAuthenticatedUser";

const navigation = [
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
    icon: ChartPieIcon,
    current: false,
  },
];

const UserPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  if (userIsLoading)
    return <div className="text-gray-500 animate-pulse">Loading...</div>;
  if (userIsError) return <div>Error!</div>;

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  return (
    <div className="mt-20">
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-30 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6 pb-4">
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <a
                                  href={item.to}
                                  className={cx(
                                    item.current
                                      ? "bg-gray-50 text-[#548a6a]"
                                      : "text-gray-700 hover:text-[#548a6a] hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                >
                                  <item.icon
                                    className={cx(
                                      item.current
                                        ? "text-[#548a6a]"
                                        : "text-gray-400 group-hover:text-[#548a6a]",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="mt-auto">
                          <a
                            href="#"
                            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                          >
                            <Cog6ToothIcon
                              className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-[#548a6a]"
                              aria-hidden="true"
                            />
                            Settings
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="mt-[64px] hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-50 px-6 pb-4">
            <nav className="flex flex-1 flex-col mt-10">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                <li className="grow">
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item, index) => (
                      <li key={item.name}>
                        <a
                          href={item.to}
                          className={cx(
                            item.current
                              ? "bg-gray-100 text-[#548a6a]"
                              : "text-gray-700 hover:text-[#548a6a] hover:bg-gray-100",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className={cx(
                              item.current
                                ? "text-[#548a6a]"
                                : "text-gray-400 group-hover:text-[#548a6a]",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <Link to="settings">
                    <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100">
                      <Gravatar
                        className="rounded-full"
                        email={user.email}
                        rating="pg"
                        size={40}
                      />
                      <span className="sr-only">Your profile</span>
                      <span aria-hidden="true">
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
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// import { Link, Outlet, useLocation } from "react-router-dom";
// import React, { useEffect, useState } from "react";

// import Button from "../ui/Button";
// import { Cog6ToothIcon } from "@heroicons/react/24/outline";
// import Gravatar from "react-gravatar";
// import cx from "classnames";
// import useAuthenticatedUser from "../services/useAuthenticatedUser";

// const tabs = [
//   { name: "Built", to: "built", current: true },
//   { name: "Want to Build", to: "want-to-build", current: false },
//   { name: "Inventory", to: "inventory", current: false },
//   { name: "Shopping List", to: "shopping-list", current: false },
// ];

// const UserPage = () => {
//   const [selectedTab, setSelectedTab] = useState(
//     tabs.find((tab) => tab.current).name
//   );
//   const location = useLocation();
//   const { user, userIsLoading, userIsError } = useAuthenticatedUser();

//   useEffect(() => {
//     const matchingTab = tabs.find((tab) => location.pathname.includes(tab.to));
//     if (matchingTab) {
//       setSelectedTab(matchingTab.name);
//     }
//   }, [location]);

//   if (userIsLoading)
//     return <div className="text-gray-500 animate-pulse">Loading...</div>;
//   if (userIsError) return <div>Error!</div>;

//   const handleTabChange = (tabName) => {
//     setSelectedTab(tabName);
//   };

//   return (
//     <>
//       <div className="w-full flex items-center py-6 mt-12">
//         <div>
//           <Gravatar
//             className="rounded-full"
//             email={user.email}
//             rating="pg"
//             size={100}
//           />
//         </div>
//         <div className="grow ml-6">
//           <h1 className="text-2xl font-medium text-gray-700 group-hover:text-gray-900">
//             {user.username}
//           </h1>
//         </div>
//         <Link to="settings">
//           <Button
//             variant="muted"
//             size="md"
//             Icon={Cog6ToothIcon}
//             iconLocation="left"
//           >
//             Account settings
//           </Button>
//         </Link>
//       </div>
//       <div className="relative border-b border-gray-200">
//         <div className="mt-4">
//           <div className="sm:hidden">
//             <label htmlFor="current-tab" className="sr-only">
//               Select a tab
//             </label>
//             <select
//               id="current-tab"
//               name="current-tab"
//               className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-500"
//               value={selectedTab}
//               onChange={(e) => handleTabChange(e.target.value)}
//             >
//               {tabs.map((tab) => (
//                 <option key={tab.name} value={tab.name}>
//                   {tab.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="hidden sm:block">
//             <nav className="-mb-px flex space-x-8">
//               {tabs.map((tab) => (
//                 <Link
//                   key={tab.name}
//                   to={tab.to}
//                   className={cx(
//                     tab.name === selectedTab
//                       ? "pb-4 border-pink-500 text-pink-600"
//                       : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
//                     "whitespace-nowrap border-b-2 px-1 text-sm font-medium"
//                   )}
//                   aria-current={tab.name === selectedTab ? "page" : undefined}
//                   onClick={() => handleTabChange(tab.name)}
//                 >
//                   {tab.name}
//                 </Link>
//               ))}
//             </nav>
//           </div>
//         </div>
//       </div>
//       <section className="my-12">
//         <Outlet />
//       </section>
//     </>
//   );
// };

export default UserPage;
