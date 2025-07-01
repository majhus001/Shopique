import axios from "axios";

const getCoordinates = async (pincode, setLoading) => {
  try {
    console.log("Starting API call for pincode:", pincode); // Debug 1
    if (setLoading) setLoading(true);

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          postalcode: pincode,
          country: "IN",
          format: "json",
        },
        headers: {
          "User-Agent": "Shopique/1.0 (majidsmart7@gmail.com)", // REQUIRED
        },
        timeout: 5000,
      }
    );

    if (response.data?.length > 0) {
      const { lat, lon, display_name } = response.data[0];
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        address: display_name,
      };
    } else {
      throw new Error("Invalid Pincode");
    }
  } catch (error) {
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export default getCoordinates;
