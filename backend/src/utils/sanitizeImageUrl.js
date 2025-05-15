// utils/sanitizeImageUrl.js

function sanitizeImageUrl(imageLocatorArray) {
    if (!Array.isArray(imageLocatorArray)) return [];
  
    return imageLocatorArray
      .map((item) => {
        const url = item?.media_location?.media_location;
        return url
          ? {
              marketplace_id: "A21TJRUUN4KGV",
              media_location: url,
            }
          : null;
      })
      .filter(Boolean);
  }
  
  module.exports = sanitizeImageUrl;
  