import "tippy.js/dist/tippy.css";

import React, { useEffect, useState } from 'react';

import Modal from '../../ui/Modal';
import { Rating } from 'react-simple-star-rating';
import Tippy from "@tippyjs/react";
import useGetAverageRating from '../../services/useGetAverageRating';
import useRateComponent from '../../services/useRateComponent';

const UserRating = ({ moduleBomListItemId, componentId, initialRating, moduleName, bomItemName }) => {
  const [rating, setRating] = useState(initialRating);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { rateComponentMutate, error: rateError } = useRateComponent();
  const { data, isLoading, isError, error: fetchError } = useGetAverageRating(moduleBomListItemId, componentId);

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

  if (isLoading) return <p>Loading...</p>;

  const errorMessage = fetchError?.response?.data?.detail;
  const averageRating = data?.average_rating?.toFixed(2) || 0;
  const numberOfRatings = data?.number_of_ratings || 0;
  const tooltipText = isError ? errorMessage : `${numberOfRatings} rating${numberOfRatings !== 1 ? 's' : ''}`;

  return (
    <>
      <Tippy
        content={
          "User ratings represent how well a component works for a specific BOM list item for a specific project. Rating are not a subjective measure of the quality of a component in abstract."
        }
      >
        <div role="button" onClick={() => setIsModalOpen(true)} className="flex flex-col h-auto">
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
                <p>To report inacuracies please use <a className="text-blue-500 hover:text-blue-700" href="https://forms.gle/5avb2JmrxJT2uw426">this form</a>.</p>
            </div>
            <div className="flex justify-center w-full mb-6">
              <Rating
                onClick={setRating}
                initialValue={rating}
                size={25}
                SVGclassName='inline-block'
              />
            </div>
        </div>
        {rateError && <p className="text-red-500">Failed to submit rating: {rateError.message}</p>}
      </Modal>
    </>
  );
};

export default UserRating;
