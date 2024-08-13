import React from "react";
import _ from 'lodash';
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
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md"
          defaultValue={tabs.find((tab) => tab.current)?.name}
        >
          {tabs?.map((tab, index) => (
            <option key={index}>{tab?.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs?.map((tab, index) => (
            <div
              key={index}
              className={cx(
                tab?.current
                  ? `${activeTabColor} ${activeBorder ? "border border-black" : ""}`
                  : inactiveTabColor,
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium"
              )}
              aria-current={tab?.current ? "page" : undefined}
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
