import Button from "../ui/Button";
import BackButton from "../ui/BackButton";
import { CURRENCIES } from "../utils/currencies";
import DeleteAccountButton from "./DeleteAccountButton";
import Dropdown from "../ui/Dropdown";
import React from "react";

const Settings = () => {
  const currencyNames = Object.keys(CURRENCIES).map((currency) => {
    return CURRENCIES[currency];
  });

  return (
    <div className="px-4 py-8 mb-12 mt-36 md:px-24 lg:px-48">
      <BackButton prevPageName="Account" />
      <div>
        <div className="px-4 sm:px-0">
          <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">
            Settings
          </h1>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Default Currency
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div className="w-[200px]">
                  <Dropdown
                    options={currencyNames}
                    defaultText={CURRENCIES.USD}
                  />
                </div>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Change Password
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <a href="/accounts/password/change/">
                  <Button variant="muted" size="md">
                    Update Password
                  </Button>
                </a>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Delete Account
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <DeleteAccountButton />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Settings;
