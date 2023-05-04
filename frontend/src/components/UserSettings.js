import Button from "../ui/Button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import DeleteAccountButton from "./DeleteAccountButton";
import Dropdown from "../ui/Dropdown";
import { Link } from "react-router-dom";
import React from "react";

const CURRENCIES = Object.freeze({
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNH: "Chinese Yuan",
  EUR: "Euro",
  GBP: "British Pound",
  HKD: "Hong Kong Dollar",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  NZD: "New Zealand Dollar",
  USD: "US Dollar",
});

const Settings = () => {
  const currencyNames = Object.keys(CURRENCIES).map((currency) => {
    return CURRENCIES[currency];
  });

  return (
    <div className="mb-12 mt-36 py-8 px-4 md:px-24 lg:px-48">
      <Link
        to=".."
        relative="path"
        className="flex gap-2 items-center text-gray-400"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span>Back to Account</span>
      </Link>
      <div>
        <div className="px-4 sm:px-0">
          <h1 className="text-gray-700 text-3xl font-bold mb-12 mt-5">
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
                <Dropdown
                  options={currencyNames}
                  defaultText={CURRENCIES.USD}
                />
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
