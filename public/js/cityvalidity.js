// ----------- BASIC HELPERS -----------
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function normalizeCityName(name) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeForCompare(str = "") {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}


function levenshtein(a, b) {
  a = a || "";
  b = b || "";
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix = [];

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      
        matrix[i][j - 1] + 1,      
        matrix[i - 1][j - 1] + cost 
      );
    }
  }

  return matrix[lenA][lenB];
}

function isCloseEnoughCity(apiCity, typedCity) {
  const resultCityNorm = normalizeForCompare(apiCity);
  const typedCityNorm = normalizeForCompare(typedCity);

  const distance = levenshtein(resultCityNorm, typedCityNorm);

  return (
    distance <= 3 ||                   
    resultCityNorm === typedCityNorm ||
    resultCityNorm.includes(typedCityNorm) ||
    typedCityNorm.includes(resultCityNorm)
  );
}


document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("city");
  const countryInput = document.getElementById("country");
  const cityInvalidFeedback = document.getElementById("city-invalid-feedback");
  const suggestionsBox = document.getElementById("city-suggestions");
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");
  const form = document.querySelector("form.needs-validation");

  if (!cityInput || !countryInput || !suggestionsBox || !form) return;

  let lastCityCheckValid = false;

  function setCityInvalid(message) {
    cityInput.setCustomValidity(message || "Invalid city");
    cityInput.classList.add("is-invalid");
    cityInput.classList.remove("is-valid");
    cityInvalidFeedback.textContent =
      message || "Invalid city.";
    lastCityCheckValid = false;
  }

  function setCityValid() {
    cityInput.setCustomValidity("");
    cityInput.classList.add("is-valid");
    cityInput.classList.remove("is-invalid");
    cityInvalidFeedback.textContent = "City looks valid!";
    lastCityCheckValid = true;
  }

  function resetCityState() {
    cityInput.setCustomValidity("");
    cityInput.classList.remove("is-valid", "is-invalid");
    cityInvalidFeedback.textContent =
      "Please enter a valid city for the selected country.";
    lastCityCheckValid = false;
  }

  // AUTOCOMPLETE SUGGESTIONS 
  async function fetchCitySuggestions() {
    const typedCity = cityInput.value.trim();
    const cleanCity = normalizeCityName(typedCity);
    const country = countryInput.value.trim();

    suggestionsBox.innerHTML = "";
    if (!typedCity || !country) return;

    try {
      const query = encodeURIComponent(`${cleanCity}, ${country}`);
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q=${query}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) return;

      data.forEach((place) => {
        const addr = place.address || {};
        const cityName =
          addr.city || addr.town || addr.village || addr.hamlet || cleanCity;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "list-group-item list-group-item-action";
        btn.textContent = `${cityName}, ${addr.state || ""} ${addr.country || ""}`;
        btn.dataset.city = cityName;
        btn.dataset.lat = place.lat;
        btn.dataset.lon = place.lon;

        // USER SELECTS A SUGGESTION
        btn.addEventListener("click", () => {
          const normalizedCity = normalizeCityName(btn.dataset.city);

          cityInput.value = normalizedCity;
          latInput.value = btn.dataset.lat;
          lngInput.value = btn.dataset.lon;

          suggestionsBox.innerHTML = "";
          setCityValid();
        });

        suggestionsBox.appendChild(btn);
      });
    } catch (err) {
      console.error("Suggestion error:", err);
    }
  }

  const debouncedSuggestions = debounce(fetchCitySuggestions, 500);

  cityInput.addEventListener("input", () => {
    resetCityState();
    latInput.value = "";
    lngInput.value = "";
    debouncedSuggestions();
  });

  countryInput.addEventListener("input", () => {
    resetCityState();
    latInput.value = "";
    lngInput.value = "";
    debouncedSuggestions();
  });


  async function validateCityFinal() {
    const typedCity = cityInput.value.trim();
    const cleanCity = normalizeCityName(typedCity);
    const country = countryInput.value.trim();

    const latVal = (latInput.value || "").trim();
    const lngVal = (lngInput.value || "").trim();

    if (!typedCity || !country) {
      setCityInvalid("City and country are required.");
      return false;
    }

    // If user selected from suggestions and we already marked valid
    if (latVal && lngVal && lastCityCheckValid) {
      return true;
    }

    try {
      const query = encodeURIComponent(`${cleanCity}, ${country}`);
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${query}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setCityInvalid("City not found in this country. Please check spelling.");
        return false;
      }

      const place = data[0];
      const addr = place.address || {};
      const cityName =
        addr.city || addr.town || addr.village || addr.hamlet || "";

      if (!cityName) {
        setCityInvalid("City not found in this country. Please check spelling.");
        return false;
      }

      // Fuzzy comparison between API city & typed city
      if (!isCloseEnoughCity(cityName, typedCity)) {
        setCityInvalid("City not found in this country. Please check spelling.");
        return false;
      }

      // Country check (loose match)
      const resultCountryNorm = normalizeForCompare(addr.country || "");
      const countryNorm = normalizeForCompare(country);

      if (
        resultCountryNorm &&
        countryNorm &&
        !resultCountryNorm.includes(countryNorm) &&
        !countryNorm.includes(resultCountryNorm)
      ) {
        setCityInvalid("City not found in this country. Please check spelling.");
        return false;
      }

      // OK: valid
      latInput.value = place.lat;
      lngInput.value = place.lon;
      cityInput.value = cleanCity;

      setCityValid();
      return true;
    } catch (err) {
      console.error("Validation error:", err);
      setCityInvalid("Could not validate city.");
      return false;
    }
  }

  cityInput.addEventListener("blur", () => {

    validateCityFinal();


    setTimeout(() => {
      suggestionsBox.innerHTML = "";
    }, 200);
  });

  //  SUBMIT HANDLER 
  async function onFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const cityOk = await validateCityFinal();

    if (!cityOk) {
      form.classList.add("was-validated");
      return;
    }

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    form.removeEventListener("submit", onFormSubmit);
    form.submit();
  }

  form.addEventListener("submit", onFormSubmit);
});