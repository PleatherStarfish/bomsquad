import React from "react";
import _ from 'lodash';
import cx from "classnames";

const Tabs = ({ tabs, onClick }) => {
  return (
    <div className="sm:my-4">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
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
                  ? "bg-gray-200"
                  : "bg-gray-50 hover:bg-slate-100",
                "cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-800"
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