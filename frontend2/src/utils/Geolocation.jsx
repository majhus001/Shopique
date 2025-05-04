import axios from "axios";

const getCoordinates = async (pincode, setLoading) => {
  try {
    if (setLoading) setLoading(true); 
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=IN&format=json`
    );
    if (response.data.length > 0) {
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
    console.error("Error fetching coordinates:", error);
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export default getCoordinates;
