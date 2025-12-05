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
  
    // State to track if the current input is a valid selection
    let validSelectionState = {
      isVerified: false,
      cityName: "",
      countryName: ""
    };
  
    if (!cityInput || !countryInput || !suggestionsBox || !form) return;
  

  
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
      
      // Don't search if empty or if we already have a verified selection matching the input
      if (cityVal.length < 2 || !countryVal) return;
      if (validSelectionState.isVerified && normalizeString(cityVal) === normalizeString(validSelectionState.cityName)) return;
  
      try {
       
        const query = encodeURIComponent(`${cityVal}, ${countryVal}`);
        
       
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${query}`;
  
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        const data = await res.json();
  
        if (!Array.isArray(data) || data.length === 0) return;
  
        
        const uniqueSuggestions = new Set();
  
        data.forEach((place) => {
          const addr = place.address || {};
          
          
          const cityName = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality;
          const countryName = addr.country;
  
          
          if (!cityName || !countryName) return;
          
          // Verify country matches user input 
          if (!normalizeString(countryName).includes(normalizeString(countryVal)) && 
              !normalizeString(countryVal).includes(normalizeString(countryName))) {
              return;
          }
  
          // Prevent duplicates in dropdown
          const uniqueKey = `${cityName}-${countryName}`;
          if (uniqueSuggestions.has(uniqueKey)) return;
          uniqueSuggestions.add(uniqueKey);
  
          // Create List Item
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "list-group-item list-group-item-action";
          btn.style.cursor = "pointer";
          
          // DISPLAY: "City, Country"
          btn.innerHTML = `<strong>${formatCityName(cityName)}</strong>, <small class="text-muted">${countryName}</small>`;
          
          // Click Handler
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
        console.error("Fetch error:", err);
      }
    }
  
    
    const onInputChanged = debounce(fetchCitySuggestions, 400);
  
    
    cityInput.addEventListener("input", () => {
      resetState();
      onInputChanged();
    });
  
    // If country changes, invalid city immediately
    countryInput.addEventListener("input", () => {
      resetState();
      suggestionsBox.innerHTML = "";
    });
  
   
  
    async function validateFinal() {
      // If we already selected a valid suggestion and the text hasn't changed, we are good.
      const currentCity = normalizeString(cityInput.value);
      const savedCity = normalizeString(validSelectionState.cityName);
  
      if (validSelectionState.isVerified && currentCity === savedCity && latInput.value) {
        setValid();
        return true;
      }
  
      // If user typed manually and didn't click suggestion, we must validate via API one last time
      const countryVal = countryInput.value.trim();
      const cityVal = cityInput.value.trim();
  
      if (!cityVal || !countryVal) {
        setInvalid("City and Country are required.");
        return false;
      }
  
      try {
        const query = encodeURIComponent(`${cityVal}, ${countryVal}`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${query}`;
        
        const res = await fetch(url);
        const data = await res.json();
  
        if (!data || data.length === 0) {
          setInvalid("City not found in this country.");
          return false;
        }
  
        const place = data[0];
        const addr = place.address || {};
        const apiCountry = normalizeString(addr.country);
        const userCountry = normalizeString(countryVal);
  
        
        if (!apiCountry.includes(userCountry) && !userCountry.includes(apiCountry)) {
          setInvalid(`This city is in ${addr.country}, not ${countryInput.value}.`);
          return false;
        }
  
       
        latInput.value = place.lat;
        lngInput.value = place.lon;
        validSelectionState.isVerified = true;
        validSelectionState.cityName = cityVal;
        setValid();
        return true;
  
      } catch (e) {
        console.error(e);
        setInvalid("Unable to validate location.");
        return false;
      }
    }
  
    // Blur Event: Delay clearing suggestions to allow 'click' to register
    cityInput.addEventListener("blur", () => {
      setTimeout(() => {
        suggestionsBox.innerHTML = "";
        validateFinal();
      }, 250);
    });
  
   
    form.addEventListener("submit", async (e) => {
     
      e.preventDefault();
      e.stopPropagation();
  
      const isValid = await validateFinal();
  
      if (isValid && form.checkValidity()) {
       
        form.removeEventListener("submit", arguments.callee); 
        form.submit();
      } else {
        form.classList.add("was-validated");
        
      }
    });
  });