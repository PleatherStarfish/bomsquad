import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  FolderIcon,
  HomeIcon,
  ListBulletIcon,
  WrenchIcon
} from "@heroicons/react/24/outline";
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
    icon: ListBulletIcon,
    current: false,
  },
];

const UserPage = () => {
  const [selectedTab, setSelectedTab] = useState(
    navigation.find((tab) => tab.current).name
  );
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  if (userIsLoading)
    return <div className="text-gray-500 animate-pulse">Loading...</div>;
  if (userIsError) return <div>Error!</div>;

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  return (
    <div className="flex gap-6 mt-[64px]">
      <div
        className="w-[70px] group/slideout hover:w-[200px] bg-gray-100 fixed transition-all duration-300 ease-in"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="flex flex-col h-full px-6 pb-4 overflow-y-auto bg-gray-100 gap-y-5">
          <nav className="flex flex-col flex-1 h-full">
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
                            : "text-gray-700 hover:text-[#548a6a]",
                          "group/item flex gap-x-3 rounded-md px-2 py-3 text-sm leading-6 font-semibold hover:bg-gray-200"
                        )}
                        aria-current={item.name === selectedTab ? "page" : undefined}
                        onClick={() => handleTabChange(tab.name)}
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
                        <span className="invisible transition-all opacity-0 whitespace-nowrap group-hover/slideout:visible group-hover/slideout:opacity-100">{item.name}</span>
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
                      <span aria-hidden="true" className="invisible transition-all opacity-0 whitespace-nowrap group-hover/settings:visible group-hover/settings:opacity-100">
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
      <main className="grow py-10 ml-[70px]">
        <div className="px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
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
//       <div className="flex items-center w-full py-6 mt-12">
//         <div>
//           <Gravatar
//             className="rounded-full"
//             email={user.email}
//             rating="pg"
//             size={100}
//           />
//         </div>
//         <div className="ml-6 grow">
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
//             <nav className="flex -mb-px space-x-8">
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
