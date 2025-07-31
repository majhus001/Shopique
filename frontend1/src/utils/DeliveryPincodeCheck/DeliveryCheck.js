import { toast } from "react-toastify";
import getCoordinates from "./Geolocation";

const HandleCheckDelivery = async (
  value,
  setExpectedDelivery = () => {},
  setExpectedDeliverydate = () => {},
  setIsPincodeDone = () => {},
  setDeliveryFee = () => {},
  setPincodeLoad = () => {}
) => {
  console.log("came i ")
  const warehousePincode = "641008";
  if (String(value).length != 6) {
    setExpectedDelivery("Please enter a valid 6-digit pincode");
    setExpectedDeliverydate("");
    setIsPincodeDone(false);
    return;
  }

  setPincodeLoad(true);
  setExpectedDelivery("");
  setExpectedDeliverydate("");
  setIsPincodeDone(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Distance in km
  };

  try {
    const warehouseCoords = await getCoordinates(warehousePincode);

    const userCoords = await getCoordinates(value);

    if (!warehouseCoords || !userCoords) {
      throw new Error("Could not get coordinates for pincodes");
    }

    const distanceKm = calculateDistance(
      warehouseCoords.lat,
      warehouseCoords.lon,
      userCoords.lat,
      userCoords.lon
    );

    let deliveryDays = Math.min(Math.ceil(distanceKm / 100) + 1, 6);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    if (distanceKm > 0 && distanceKm < 100) {
      setDeliveryFee(50);
    } else if (distanceKm > 100 && distanceKm < 800) {
      setDeliveryFee(100);
      
    } else {
      setExpectedDelivery("Delivery not available for this pincode");
      setIsPincodeDone(false);
      setPincodeLoad(false);
      return "Delivery not available for this pincode.. Try Different";
    }

    setExpectedDelivery(`${userCoords.address}`);

    setExpectedDeliverydate(
      ` in ${deliveryDays} day(s) (by ${deliveryDate.toLocaleDateString()})`
    );

    setIsPincodeDone(true);
    return "";
  } catch (error) {
    toast.error("Failed to Check Delivery Address");
    console.error("Error checking delivery:", error);
    setExpectedDelivery(
      "Sorry We cant check Delivery for this Pincode Now.. Try again later"
    );
    setIsPincodeDone(false);
    return "Sorry We cant check Delivery for this Pincode Now.. Try again later";
  } finally {
    setPincodeLoad(false);
  }
};

export default HandleCheckDelivery;
