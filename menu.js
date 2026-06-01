(function () {
  "use strict";

  var phoneSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>' +
    "</svg>";

  var end = document.querySelector(".navbar-end");
  if (end && !end.querySelector(".navbar-phone")) {
    var phone = document.createElement("a");
    phone.className = "navbar-phone";
    phone.href = "tel:+48123456789";
    phone.innerHTML =
      '<span class="navbar-phone-label">Zadzwoń</span>' +
      '<span class="navbar-phone-num">' +
      phoneSvg +
      " +48 123 456 789</span>";
    end.insertBefore(phone, end.firstChild);
  }

  var nav = document.querySelector(".navbar-nav");
  if (nav && !nav.querySelector(".navbar-phone-mobile")) {
    var li = document.createElement("li");
    li.className = "navbar-phone-mobile";
    var mobilePhone = document.createElement("a");
    mobilePhone.className = "navbar-phone navbar-phone--mobile";
    mobilePhone.href = "tel:+48123456789";
    mobilePhone.innerHTML =
      '<span class="navbar-phone-label">Zadzwoń</span>' +
      '<span class="navbar-phone-num">' +
      phoneSvg +
      " +48 123 456 789</span>";
    li.appendChild(mobilePhone);
    nav.appendChild(li);
  }
})();
