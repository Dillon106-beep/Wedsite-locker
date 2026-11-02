document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.getElementById("mobileNav");

    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener("click", function () {
    const isOpen = mobileNav.classList.toggle("open");
    hamburger.classList.toggle("active",isOpen);
    hamburger.setAttribute("aria-expand",isOpen);
    });

    // Close menu when a link is tapped 
mobileNav.
}