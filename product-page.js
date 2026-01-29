/* ============================= */
/* GLOBAL PRODUCT PAGE SYSTEM JS */
/* Repo: product-page.js         */
/* ============================= */


/* ============================= */
/* FAQ ACCORDION TOGGLE          */
/* ============================= */
(function(){if(window.self!==window.top)return;document.querySelectorAll(".product-faq-question").forEach(function(q){q.addEventListener("click",function(){q.classList.toggle("open");var a=q.nextElementSibling;if(a)a.classList.toggle("open");});});})();


/* ============================= */
/* STICKY CTA SCROLL LOGIC       */
/* ============================= */
(function(){if(window.self!==window.top)return;var bar=document.getElementById("stickyCta");if(!bar)return;var height=0;window.addEventListener("scroll",function(){if(window.scrollY>300){bar.style.display="flex";if(!height){height=bar.offsetHeight;document.body.style.paddingBottom=height+"px";}}else{bar.style.display="none";document.body.style.paddingBottom="0px";}});})();
