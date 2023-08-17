import BackButton from "../ui/BackButton";
import Button from "../ui/Button";
import { CURRENCIES } from "../utils/currencies";
import DeleteAccountButton from "./DeleteAccountButton";
import Dropdown from "../ui/Dropdown";
import React from "react";
import useAuthenticatedUser from "../services/useAuthenticatedUser";

const Settings = () => {
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  const currencyNames = Object.keys(CURRENCIES).map((currency) => {
    return CURRENCIES[currency];
  });

  if (userIsError) {
    return <div>Error loading user</div>;
  }

  if (userIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

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
                Supporter Status
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {!user?.is_premium ? <a href="https://ko-fi.com/bomsquad">
                  <Button Image="/static/images/ko-fi-logo.png" variant="primary" size="md" classNames="!bg-[#13C3FF]">
                    Get BOM Squad Supporter Status on Ko-fi
                  </Button>
                </a> : `Until ${user?.end_of_premium_display_date}`}
                {user?.is_premium && <small className="block mt-2 text-xs text-gray-500">May renew if subscribed through crowdfunding platform</small>}
              </dd>
            </div>
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
