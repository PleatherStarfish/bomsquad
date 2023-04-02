import React from "react";
import { XMarkIcon, ArrowLongRightIcon } from "@heroicons/react/24/solid";
import cx from "classnames"

const Pill = ({color = 'bg-slate-500', showArrow = true, children}) => {
  return (
		<li className="flex my-0.5">
			<div className={cx("flex py-0.5 px-1.5 no-underline rounded-full text-white font-sans font-semibold border-blue btn-primary", color)}>
				{children}
				<XMarkIcon className="fill-white w-4 h-4" onClick={() => console.log("delete")} role="button" />
			</div>
			{showArrow && <ArrowLongRightIcon className="w-5 h-5" />}
		</li>
	)
};

export default Pill;
