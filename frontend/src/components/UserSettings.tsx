import React, { useState } from "react";
import BackButton from "../ui/BackButton";
import Button from "../ui/Button";
import DeleteAccountButton from "./DeleteAccountButton";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import useUpdateUserCurrency from "../services/useUpdateUserCurrency";
import { currencyLookup, Currency } from "../types/currency";

const Settings: React.FC = () => {
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();
  const { mutate: updateCurrency } = useUpdateUserCurrency();

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (user?.default_currency as Currency) || Currency.USD
  );

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency in currencyLookup) {
      setSelectedCurrency(newCurrency as Currency);
      updateCurrency(newCurrency as Currency);
    } else {
      console.error("Invalid currency selected");
    }
  };

  if (userIsError) {
    return <div>Error loading user</div>;
  }

  if (userIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  const formattedDateJoined = user?.date_joined
  ? new Date(user.date_joined).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  : null;

  return (
    <div className="px-4 py-8 mb-12 mt-36 md:px-24 lg:px-48">
      <BackButton prevPageName="Account" />
      <div>
        <div className="px-4 sm:px-0">
          <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">Settings</h1>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            {/* Username */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Username</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {user?.username}
              </dd>
            </div>
            {/* Emails */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Emails</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {(user?.emails ?? []).map((item, index) => (
                  <div className="mb-1" key={index}>
                    {item.email}
                    {item.primary && (
                      <>
                        <span className="ml-2"> - </span>
                        <span className="ml-2 text-xs font-bold text-black">Primary</span>
                      </>
                    )}
                    <a className="ml-2 text-blue-600" href="#">
                      Edit
                    </a>
                  </div>
                ))}
              </dd>
            </div>
            {/* Date Joined */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Date Joined
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {formattedDateJoined}
              </dd>
            </div>
            {/* Default Currency */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Default Currency
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div className="w-[300px]">
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    value={selectedCurrency}
                  >
                    {Object.entries(currencyLookup).map(([code, { name }]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </dd>
            </div>
            {/* Change Password */}
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">
                Change Password
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <a href="/accounts/password/change/">
                  <Button size="md" variant="muted">
                    Update Password
                  </Button>
                </a>
              </dd>
            </div>
            {/* Delete Account */}
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
