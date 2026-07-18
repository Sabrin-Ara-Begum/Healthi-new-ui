const API_URL = "https://healthi-ai-bppm.onrender.com/api/tablet/identify";

export const identifyMedicine = async (image: File) => {
  const formData = new FormData();

  formData.append("image", image);

  const res = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to identify medicine");
  }

  return await res.json();
};