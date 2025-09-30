import React from 'react';

const AdBanner = () => {
  return (
    <div className="my-4 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* This is a placeholder for an ad. */}
        {/* Replace the data-ad-client and data-ad-slot with your own values. */}
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-1650067341320347"
             data-ad-slot="YOUR_AD_SLOT_ID"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script
          dangerouslySetInnerHTML={{
            __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});',
          }}
        />
      </div>
    </div>
  );
};

export default AdBanner;
