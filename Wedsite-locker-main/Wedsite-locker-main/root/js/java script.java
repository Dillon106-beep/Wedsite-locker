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
mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
    });
});
});

//Close menu if window resizes above mobile breakpoint
window.addEventListener("resize", function () {
    if (window.innerWidth > 800) {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        }   
        });
    });