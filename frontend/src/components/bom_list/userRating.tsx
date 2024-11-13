import "tippy.js/dist/tippy.css";

import React, { useEffect, useState } from 'react';

import Alert from '../../ui/Alert';
import Modal from '../../ui/Modal';
import { Rating } from 'react-simple-star-rating';
import Tippy from "@tippyjs/react";
import useAddToBuiltMutation from '../../services/useAddToBuiltMutation';
import useAuthenticatedUser from '../../services/useAuthenticatedUser';
import useGetAverageRating from '../../services/useGetAverageRating';
import useModuleStatus from '../../services/useModuleStatus';
import useRateComponent from '../../services/useRateComponent';

interface UserRatingProps {
  moduleBomListItemId: string;
  componentId: string;
  initialRating: number;
  moduleName: string;
  bomItemName: string;
  moduleId: string;
}

const UserRating: React.FC<UserRatingProps> = ({ moduleBomListItemId, componentId, initialRating, moduleName, bomItemName, moduleId }) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  const { rateComponentMutate, error: rateError } = useRateComponent();
  const { data, isLoading, isError, error: fetchError } = useGetAverageRating(moduleBomListItemId, componentId);
  const { user } = useAuthenticatedUser();
  const { data: moduleStatus, isLoading: moduleStatusIsLoading, refetch: refetchModuleStatus } = useModuleStatus(moduleId, !!user);

  const addToBuilt = useAddToBuiltMutation(moduleId, {
    onSuccess: () => {
      refetchModuleStatus();
    },
  });

  const handleSubmit = async () => {
    await rateComponentMutate({
      component: componentId,
      module_bom_list_item: moduleBomListItemId,
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

  const errorMessage = (fetchError as any)?.response?.data?.detail;
  const averageRating = data?.average_rating?.toFixed(2) || '0';
  const numberOfRatings = data?.number_of_ratings || 0;
  const tooltipText = isError ? errorMessage : `${numberOfRatings} rating${numberOfRatings !== 1 ? 's' : ''}`;

  const handleOpenModal = () => {
    if (!user) {
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
        content="User ratings represent how well a component works for a specific BOM list item for a specific project. Ratings are not a subjective measure of the quality of a component in abstract."
      >
        <div className="flex flex-col h-auto" onClick={handleOpenModal} role="button">
          <Rating
            allowFraction
            allowHover={false}
            initialValue={parseFloat(averageRating)}
            readonly
            showTooltip
            size={15}
            SVGclassName="inline-block"
            tooltipArray={[tooltipText]}
            tooltipDefaultText={tooltipText}
            tooltipStyle={{ backgroundColor: 'transparent', boxShadow: 'none', color: 'gray', fontSize: '0.75rem', margin: 0, padding: 0 }}
          />
        </div>
      </Tippy>
      <Modal
        onSubmit={handleSubmit}
        open={isModalOpen}
        setOpen={setIsModalOpen}
        submitButtonText="Submit"
        title={`Rate how well this component works for the ${bomItemName} item in the ${moduleName} BOM`}
        type="info"
      >
        <div className="flex flex-col">
          <div className="mb-6">
            <p className="mb-3">
              User ratings represent how well a component works for a specific BOM list item for a specific project. Ratings are not a subjective measure of the quality of a component in abstract.
            </p>
            <p>To report inaccuracies please use <a className="text-blue-500 hover:text-blue-700" href="https://forms.gle/5avb2JmrxJT2uw426">this form</a>.</p>
          </div>
          <div className="relative flex justify-center w-full mb-6">
            {showError ? (
              <Alert icon variant="warning">
                <p>
                  Please <span className="text-blue-500 cursor-pointer hover:text-blue-700" onClick={() => addToBuilt.mutate()} role="button" tabIndex={0} >add the project to your &quot;built&quot; list </span> before reviewing components for BOM list items.
                </p>
              </Alert>
            ) : <Rating initialValue={rating} onClick={setRating} readonly={!moduleStatus?.is_built} size={25} SVGclassName="inline-block" />
            }
          </div>
        </div>
        {rateError instanceof Error && (
          <p className="text-red-500">
            Failed to submit rating: {rateError.message}
          </p>
        )}
      </Modal>
      <Modal
        onSubmit={() => { window.location.href = '/accounts/login/'; }}
        open={showLoginModal}
        setOpen={setShowLoginModal}
        submitButtonText="Login"
        title="Login Required"
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

export default UserRating
