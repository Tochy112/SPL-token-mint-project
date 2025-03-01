"use client";
import axios from "axios";


const uploadToCloudinary = async (file: any) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUD_PRESET!); // Replace with your Cloudinary upload preset
  
  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME!}/image/upload`, 
    formData
  );

  return response.data.secure_url; //the image URL
};


const uploadMetadataToCloudinary = async (metadata: any) => {
  const formData = new FormData();
  formData.append("file", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUD_PRESET!);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME!}/raw/upload`, 
    formData
  );

  return response.data.secure_url; //metadata URL
};



export { uploadToCloudinary, uploadMetadataToCloudinary };
