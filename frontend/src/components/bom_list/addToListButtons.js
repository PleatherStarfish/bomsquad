import React from "react";
import Button from "../../ui/Button";
import { ShoppingCartIcon, ListBulletIcon } from "@heroicons/react/24/outline";

const AddToListButtons = () => {
  return (
    <div classNames="flex flex-nowrap w-full">
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log("clicked")}
          Icon={ShoppingCartIcon}
          iconOnly={true}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log("clicked")}
          Icon={ListBulletIcon}
          iconOnly={true}
        />
    </div>
  );
};

export default AddToListButtons;
