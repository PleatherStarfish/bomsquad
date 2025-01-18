import React from "react";
import cx from "classnames";

const Tabs = ({
  tabs,
  onClick,
  activeTabColor = "bg-gray-200 text-gray-800 hover:bg-gray-300",
  inactiveTabColor = "bg-gray-50 text-gray-800 hover:bg-gray-100",
  activeBorder = false
}) => {
  return (
    <div className="sm:my-4">
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="tabs">
          Select a tab
        </label>
        <select
          className="block w-full rounded-md"
          defaultValue={tabs.find((tab) => tab.current)?.name}
          id="tabs"
          name="tabs"
        >
          {tabs?.map((tab, index) => (
            <option key={index}>{tab?.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav aria-label="Tabs" className="flex space-x-4">
          {tabs?.map((tab, index) => (
            <div
              aria-current={tab?.current ? "page" : undefined}
              className={cx(
                tab?.current
                  ? `${activeTabColor} ${activeBorder ? "border border-black" : ""}`
                  : inactiveTabColor,
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium"
              )}
              key={index}
              onClick={() => onClick(tab?.name)}
              type="button"
            >
              {tab?.name}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Tabs;
