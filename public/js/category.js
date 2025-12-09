const taxSwitch = document.getElementById("taxSwitchCategory");
  
  if (taxSwitch) {
    taxSwitch.addEventListener("change", () => {
      const taxInfo = document.getElementsByClassName("tax-info");
      const taxDes = document.getElementsByClassName("tax-des");

      if (taxSwitch.checked) {
        for (let t of taxInfo) t.style.display = "inline";
        for (let t of taxDes) t.style.display = "none";
      } else {
        for (let t of taxInfo) t.style.display = "none";
        for (let t of taxDes) t.style.display = "inline";
      }
    });
  }
  const taxSwitchCategory = document.getElementById("taxSwitchCategory");
 

 
    
   
    taxSwitchCategory.addEventListener("change", () => {
      taxSwitchMobile.checked = taxSwitchCategory.checked;
    });
