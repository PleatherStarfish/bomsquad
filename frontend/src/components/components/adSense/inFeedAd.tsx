import React, { useEffect } from "react";

// Define prop types for the component
interface InFeedAdProps {
  slot: string; // AdSense slot ID
  layoutKey: string; // AdSense layout key
  style?: React.CSSProperties; // Optional inline styles
}

const InFeedAd: React.FC<InFeedAdProps> = ({
  layoutKey,
  slot,
  style = {},
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      data-ad-client="ca-pub-1549230942850511"
      data-ad-format="fluid"
      data-ad-layout-key={layoutKey}
      data-ad-slot={slot}
      style={{ display: "block", ...style }}
    />
  );
};

export default InFeedAd;
