import React, { useState } from "react";

import Button from "../ui/Button";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import useDeleteUserMe from "../services/useDeleteUserMe";

const DeleteAccountButton = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [username, setUsername] = useState("");
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();
  const mutation = useDeleteUserMe();

  if (userIsLoading)
    return <div className="text-gray-500 animate-pulse">Loading...</div>;
  if (userIsError) return <div>Error!</div>;

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setUsername("");
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleConfirmDelete = () => {
    if (username === "") {
      alert("Please enter your username to confirm account deletion.");
      return;
    }

    if (username !== user.username) {
      alert("Incorrect username. Please try again.");
      return;
    }

    mutation.mutate();
    setShowDeleteConfirmation(false);
    setUsername("");
  };

  return (
    <>
      {!showDeleteConfirmation && (
        <Button variant="danger" onClick={handleDeleteAccount}>
          Delete my account
        </Button>
      )}
      {showDeleteConfirmation && (
        <div className="flex flex-col">
          <div className="flex flex-col gap-2 mb-4">
            <label className="py-4" htmlFor="username">
              Type your username to confirm account deletion:
            </label>
            <input
              type="text"
              id="username"
              className="block w-full rounded-md border-0 p-2 h-[32px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#548a6a] focus:border-[#548a6a] sm:text-sm sm:leading-6"
              value={username}
              onChange={(e) => handleUsernameChange(e)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleConfirmDelete}>
              Confirm deletion
            </Button>
            <Button variant="muted" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountButton;
