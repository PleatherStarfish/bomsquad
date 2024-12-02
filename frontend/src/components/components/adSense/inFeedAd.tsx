import React, { useEffect } from "react";

const AdSenseAdInline: React.FC = () => {
  useEffect(() => {
    try {
      // Push adsbygoogle configuration to load the ad
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <>
      <ins
        className="adsbygoogle"
        data-ad-client="ca-pub-1549230942850511"
        data-ad-format="fluid"
        data-ad-layout-key="-cb-b+1t-6d+9m"
        data-ad-slot="6413550510"
        style={{ display: "block" }}
      />
      {/* This is optional if you want to add a script dynamically */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({});
          `,
        }}
      />
    </>
  );
};

export default AdSenseAdInline;
