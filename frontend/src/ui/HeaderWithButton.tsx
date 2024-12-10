import React, {useState, useEffect, useRef} from "react";
import { useInView } from "react-intersection-observer";
import { useSpring, animated } from "@react-spring/web";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import cv from "classnames"

interface HeaderWithButtonProps {
  title: string;
  onButtonClick: () => void;
  buttonText: string;
  icon?: React.ReactNode;
}

const HeaderWithButton: React.FC<HeaderWithButtonProps> = ({
  title,
  onButtonClick,
  buttonText,
  icon = <ArrowDownOnSquareIcon className="w-5 h-5" />, // Default to ArrowDownOnSquareIcon
}) => {
  const [isNear, setIsNear] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({ triggerOnce: true });

  // Threshold for applying the pulse animation (in pixels)
  const THRESHOLD = 300;

  const handleMouseMove = (event: MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      // Calculate the distance from the cursor to the button's center
      const distance = Math.sqrt(
        Math.pow(event.clientX - buttonCenterX, 2) +
          Math.pow(event.clientY - buttonCenterY, 2)
      );

      setIsNear(distance < THRESHOLD);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const styles = useSpring({
    config: { bounce: 0.4, friction: 12, tension: 180 },
    opacity: inView ? 1 : 0,
    transform: inView ? "translateX(0px)" : "translateX(300px)",
  });

  return (
    <div className="relative mb-6">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-y-4 md:flex-nowrap">
        <div className="w-full md:w-auto">
          <h1 className="pr-3 text-3xl font-semibold text-center text-gray-900 bg-white font-display">
            {title}
          </h1>
        </div>
        <div className={cv("flex justify-center w-full md:w-auto", {"animate-bounce": isNear})} ref={buttonRef}>
          <animated.button
            className={cv("justify-center md:justify-start text-gray-600 hover:bg-gray-600 ring-gray-600 inline-flex items-center gap-x-1.5 rounded-md md:rounded-full bg-white px-3 py-1.5 text-md ring-1 ring-inset font-semibold shadow-sm hover:text-white transition-all duration-500 w-full mt-10 md:mt-0 md:w-auto", {"text-pink-600 hover:bg-pink-600 ring-pink-600": isNear})}
            onClick={onButtonClick}
            ref={ref}
            style={styles}
            type="button"
          >
            {icon}
            <span>{buttonText}</span>
          </animated.button>
        </div>
      </div>
    </div>
  );
};

export default HeaderWithButton;
