document.addEventListener("DOMContentLoaded", () => {
  
    const flashElements = document.querySelectorAll(".flash-container");

    flashElements.forEach(flash => {

      const alertMsg = flash.querySelector('.flash-msg');
      
      if (alertMsg) {
        setTimeout(() => {

          alertMsg.classList.add("flash-hide");
          

          setTimeout(() => {
            flash.remove();
          }, 500); 
        }, 3000); 
      }
    });
  });