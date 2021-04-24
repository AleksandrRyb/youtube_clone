import axios from "axios";

export async function uploadMedia({ type, preset, file }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const data = await axios
    .post(`https://api.cloudinary.com/v1_1/dxeltznxu/${type}/upload`, formData)
    .then((res) => res.data);

  return data.secure_url;
}
