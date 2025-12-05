function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function normalizeString(str) {
  return (str || "").trim().toLowerCase();
}

// Format city name for display (Capitalize first letters)
function formatCityName(name) {
  return name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city");
  const countryInput = document.getElementById("country");
  const cityInvalidFeedback = document.getElementById("city-invalid-feedback");
  const suggestionsBox = document.getElementById("city-suggestions");
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");
  const form = document.querySelector("form.needs-validation");

  // If something is missing, don't run anything
  if (
    !cityInput ||
    !countryInput ||
    !cityInvalidFeedback ||
    !suggestionsBox ||
    !latInput ||
    !lngInput ||
    !form
  ) {
    return;
  }

  // State to track if the current input is a valid selection
  let validSelectionState = {
    isVerified: !!latInput.value && !!lngInput.value,
    cityName: cityInput.value || "",
    countryName: countryInput.value || ""
  };



  function setInvalid(msg) {
    cityInput.setCustomValidity(msg);
    cityInput.classList.add("is-invalid");
    cityInput.classList.remove("is-valid");
    cityInvalidFeedback.textContent = msg;
    validSelectionState.isVerified = false;
  }

  function setValid() {
    cityInput.setCustomValidity("");
    cityInput.classList.add("is-valid");
    cityInput.classList.remove("is-invalid");
    cityInvalidFeedback.textContent = "";
  }

  function resetState() {
    cityInput.setCustomValidity("");
    cityInput.classList.remove("is-valid", "is-invalid");
    latInput.value = "";
    lngInput.value = "";
    validSelectionState.isVerified = false;
  }


  async function fetchCitySuggestions() {
    const cityVal = cityInput.value.trim();
    const countryVal = countryInput.value.trim();

    suggestionsBox.innerHTML = "";

    // Don't search if empty or too short
    if (cityVal.length < 2 || !countryVal) return;


    if (
      validSelectionState.isVerified &&
      normalizeString(cityVal) === normalizeString(validSelectionState.cityName) &&
      normalizeString(countryVal) === normalizeString(validSelectionState.countryName)
    ) {
      return;
    }

    try {
      const query = encodeURIComponent(`${cityVal}, ${countryVal}`);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${query}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        console.error("Suggestion fetch failed:", res.status);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const uniqueSuggestions = new Set();

      data.forEach((place) => {
        const addr = place.address || {};
        const cityName =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.hamlet ||
          addr.municipality;
        const countryName = addr.country;

        if (!cityName || !countryName) return;

        // Loose country match
        if (
          !normalizeString(countryName).includes(normalizeString(countryVal)) &&
          !normalizeString(countryVal).includes(normalizeString(countryName))
        ) {
          return;
        }

        const uniqueKey = `${cityName}-${countryName}`;
        if (uniqueSuggestions.has(uniqueKey)) return;
        uniqueSuggestions.add(uniqueKey);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "list-group-item list-group-item-action";
        btn.style.cursor = "pointer";
        btn.innerHTML = `<strong>${formatCityName(
          cityName
        )}</strong>, <small class="text-muted">${countryName}</small>`;

        btn.addEventListener("click", () => {
          const finalCityName = formatCityName(cityName);
          cityInput.value = finalCityName;

          latInput.value = place.lat;
          lngInput.value = place.lon;

          validSelectionState = {
            isVerified: true,
            cityName: finalCityName,
            countryName: countryName
          };

          suggestionsBox.innerHTML = "";
          setValid();
        });

        suggestionsBox.appendChild(btn);
      });
    } catch (err) {
      console.error("Fetch error (suggestions):", err);
    }
  }

  const onInputChanged = debounce(fetchCitySuggestions, 400);

  // Listeners
  cityInput.addEventListener("input", () => {
    resetState();
    onInputChanged();
  });

  countryInput.addEventListener("input", () => {
    resetState();
    suggestionsBox.innerHTML = "";
  });

  
  async function validateFinal() {
    const currentCity = normalizeString(cityInput.value);
    const currentCountry = normalizeString(countryInput.value);

    // If already verified and text is same and we have lat/lng, skip
    if (
      validSelectionState.isVerified &&
      currentCity === normalizeString(validSelectionState.cityName) &&
      currentCountry === normalizeString(validSelectionState.countryName) &&
      latInput.value &&
      lngInput.value
    ) {
      setValid();
      return true;
    }

    const cityVal = cityInput.value.trim();
    const countryVal = countryInput.value.trim();

    if (!cityVal || !countryVal) {
      setInvalid("City and Country are required.");
      return false;
    }

    try {
      const query = encodeURIComponent(`${cityVal}, ${countryVal}`);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${query}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.error("Final validation fetch failed:", res.status);
        setInvalid("Unable to validate location right now.");
        return false;
      }

      const data = await res.json();
      if (!data || data.length === 0) {
        setInvalid("City not found in this country.");
        return false;
      }

      const place = data[0];
      const addr = place.address || {};
      const apiCountry = normalizeString(addr.country);

      if (
        !apiCountry.includes(currentCountry) &&
        !currentCountry.includes(apiCountry)
      ) {
        setInvalid(`This city is in ${addr.country}, not ${countryInput.value}.`);
        return false;
      }

      latInput.value = place.lat;
      lngInput.value = place.lon;
      validSelectionState = {
        isVerified: true,
        cityName: cityVal,
        countryName: addr.country || countryVal
      };
      setValid();
      return true;
    } catch (e) {
      console.error("Final validation error:", e);
      setInvalid("Unable to validate location.");
      return false;
    }
  }

  // Blur: small delay so click on suggestion still works
  cityInput.addEventListener("blur", () => {
    setTimeout(() => {
      suggestionsBox.innerHTML = "";
      validateFinal();
    }, 250);
  });


  form.addEventListener("submit", async (e) => {
    // Let HTML5 validation run too
    e.preventDefault();
    e.stopPropagation();

    const isCustomValid = await validateFinal();
    const isBrowserValid = form.checkValidity();

    if (isCustomValid && isBrowserValid) {
      // No arguments.callee, no recursion bug; this is safe
      form.submit();
    } else {
      form.classList.add("was-validated");
    }
  });
});