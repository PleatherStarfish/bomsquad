import React, { useEffect } from "react";

// Define prop types for the component
interface AdSenseAdProps {
  slot: string; // AdSense slot ID
  style?: React.CSSProperties; // Inline styles for the ad
  format?: string; // Ad format, default is "auto"
  responsive?: string; // Responsive setting, default is "true"
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  slot,
  style = {},
  format = "auto",
  responsive = "true",
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
      data-ad-format={format}
      data-ad-slot={slot}
      data-full-width-responsive={responsive}
      style={{ display: "block", ...style }}
    />
  );
};

export default AdSenseAd;
