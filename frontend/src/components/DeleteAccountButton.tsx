import React, { useState, ChangeEvent } from "react";
import Button from "../ui/Button";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import useDeleteUserMe from "../services/useDeleteUserMe";

const DeleteAccountButton: React.FC = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [username, setUsername] = useState("");
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();
  const mutation = useDeleteUserMe();

  if (userIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }
  
  if (userIsError) {
    return <div className="text-red-500">Error loading user data.</div>;
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setUsername("");
  };

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleConfirmDelete = () => {
    if (!username) {
      alert("Please enter your username to confirm account deletion.");
      return;
    }

    if (username !== user?.username) {
      alert("Incorrect username. Please try again.");
      return;
    }

    mutation.mutate();
    setShowDeleteConfirmation(false);
    setUsername("");
  };

  return (
    <>
      {!showDeleteConfirmation ? (
        <Button onClick={handleDeleteAccount} variant="danger">
          Delete my account
        </Button>
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-col gap-2 mb-4">
            <label className="py-4" htmlFor="username">
              Type your username to confirm account deletion:
            </label>
            <input
              className="block w-full rounded-md border-0 p-2 h-[32px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#548a6a] focus:border-[#548a6a] sm:text-sm sm:leading-6"
              id="username"
              onChange={handleUsernameChange}
              type="text"
              value={username}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConfirmDelete} variant="danger">
              Confirm deletion
            </Button>
            <Button onClick={handleCancelDelete} variant="muted">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountButton;
