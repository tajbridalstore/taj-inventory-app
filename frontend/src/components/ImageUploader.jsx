import React, { useState } from "react";

const ImageUploader = ({ name, label, form }) => {
  const { setValue, watch } = form;
  const imageURL = watch(name);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    // Set the value for the selected image in the form
    setValue(name, file); // Directly set the File object

    setLoading(false);
  };

  return (
    <div>
      {/* <label className="block mb-1 font-medium">{label}</label> */}
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {loading && <p className="text-sm text-blue-500">Uploading...</p>}
      {imageURL instanceof File && ( // Check if imageURL is a File object
        <p className="text-sm text-green-600 mt-1 truncate">
          Selected: {imageURL.name}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;





