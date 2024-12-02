import React, { useEffect } from "react";

const InFeedAd: React.FC = () => {
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
      data-ad-layout-key="-cb-b+1t-6d+9m"
      data-ad-slot="6413550510"
      style={{ display: "block" }}
    />
  );
};

export default InFeedAd;
