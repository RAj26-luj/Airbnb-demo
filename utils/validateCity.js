const axios = require("axios");

function normalize(str = "") {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

async function validateCity(city, country) {
  if (!city || !country) return null;

  const cleanCity = city.trim().replace(/\s+/g, " ");
  const cleanCityNorm = normalize(cleanCity);
  const cleanCountryNorm = normalize(country);

  const q = `${cleanCity}, ${country}`;

  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        format: "json",
        limit: 1,
        addressdetails: 1,
        q,
      },
      headers: {
        "User-Agent": "airbnb-demo-app/1.0 (your-email@example.com)",
        "Accept-Language": "en",
      },
      timeout: 5000,
    });

    const data = res.data;

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const place = data[0];
    const addr = place.address || {};

    const rawCity =
      addr.city || addr.town || addr.village || addr.hamlet || "";

    if (!rawCity) {
      return null;
    }

    const resultCityNorm = normalize(rawCity);
    const resultCountryNorm = normalize(addr.country || "");

    // City must match what user sent
    if (resultCityNorm !== cleanCityNorm) {
      return null;
    }

    // Country must also match reasonably
    if (
      resultCountryNorm &&
      cleanCountryNorm &&
      !resultCountryNorm.includes(cleanCountryNorm) &&
      !cleanCountryNorm.includes(resultCountryNorm)
    ) {
      return null;
    }

    return {
      normalizedCity: rawCity,
      latitude: place.lat,
      longitude: place.lon,
    };
  } catch (err) {
    console.error("validateCity – geocoding error:", {
      status: err.response?.status,
      message: err.message,
    });

    
    if (err.response?.status === 403) {
      return {
        normalizedCity: cleanCity,
        
      };
    }

    
    return null;
  }
}

module.exports = validateCity;