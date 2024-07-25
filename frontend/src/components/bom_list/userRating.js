import "tippy.js/dist/tippy.css";

import React, { useEffect, useState } from 'react';

import Modal from '../../ui/Modal';
import { Rating } from 'react-simple-star-rating';
import Tippy from "@tippyjs/react";
import useGetAverageRating from '../../services/useGetAverageRating';
import useRateComponent from '../../services/useRateComponent';
import useModuleStatus from '../../services/useModuleStatus';
import useAuthenticatedUser from '../../services/useAuthenticatedUser';

const UserRating = ({ moduleBomListItemId, componentId, initialRating, moduleName, bomItemName, moduleId, isLoggedIn }) => {
  const [rating, setRating] = useState(initialRating);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { rateComponentMutate, error: rateError } = useRateComponent();
  const { data, isLoading, isError, error: fetchError } = useGetAverageRating(moduleBomListItemId, componentId);
  const { user } = useAuthenticatedUser();
  const { data: moduleStatus, isLoading: moduleStatusIsLoading, isError: moduleStatusIsError } = useModuleStatus(moduleId, !!user);

  const handleSubmit = async () => {
    await rateComponentMutate({
      module_bom_list_item: moduleBomListItemId,
      component: componentId,
      rating
    });
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (data) {
      setRating(data.average_rating);
    }
  }, [data]);

  if (isLoading || moduleStatusIsLoading) return <p className="animate-pulse">Loading...</p>;

  const errorMessage = fetchError?.response?.data?.detail;
  const averageRating = data?.average_rating?.toFixed(2) || 0;
  const numberOfRatings = data?.number_of_ratings || 0;
  const tooltipText = isError ? errorMessage : `${numberOfRatings} rating${numberOfRatings !== 1 ? 's' : ''}`;

  const handleOpenModal = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else if (moduleStatus?.is_built) {
      setShowError(false);
      setIsModalOpen(true);
    } else {
      setShowError(true);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Tippy
        content={
          "User ratings represent how well a component works for a specific BOM list item for a specific project. Rating are not a subjective measure of the quality of a component in abstract."
        }
      >
        <div role="button" onClick={handleOpenModal} className="flex flex-col h-auto">
          <Rating tooltipDefaultText={tooltipText} tooltipArray={[tooltipText]} allowHover={false} initialValue={averageRating} size={15} SVGclassName='inline-block' tooltipStyle={{ backgroundColor: 'transparent', margin: 0, color: 'gray', fontSize: '0.75rem', boxShadow: 'none', padding: 0 }} allowFraction readonly showTooltip />
        </div>
      </Tippy>
      <Modal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title={`Rate how well this component works for the ${bomItemName} item in the ${moduleName} BOM`}
        submitButtonText="Submit"
        onSubmit={handleSubmit}
        type="info"
      >
        <div className="flex flex-col">
            <div className="mb-6">
                <p className="mb-3">
                    User ratings represent how well a component works for a specific BOM list item for a specific project. Rating are not a subjective measure of the quality of a component in abstract.
                </p>
                <p>To report inaccuracies please use <a className="text-blue-500 hover:text-blue-700" href="https://forms.gle/5avb2JmrxJT2uw426">this form</a>.</p>
            </div>
            <div className="flex justify-center w-full mb-6">
              <Rating
                onClick={setRating}
                initialValue={rating}
                size={25}
                SVGclassName='inline-block'
                readonly={!moduleStatus?.is_built}
              />
            </div>
            {showError && (
              <p className="my-4 text-red-500">Please add the project to your "built" list before reviewing components for BOM list items.</p>
            )}
        </div>
        {rateError && <p className="text-red-500">Failed to submit rating: {rateError.message}</p>}
      </Modal>
      <Modal
        open={showLoginModal}
        setOpen={setShowLoginModal}
        title="Login Required"
        submitButtonText="Login"
        onSubmit={() => { window.location.href = '/accounts/login/'; }}
        type="info"
      >
        <div className="flex flex-col">
          <p className="mb-3">
            You need to be logged in to rate components. Please login to continue.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default UserRating;
