/* ============================= */
/* GLOBAL PRODUCT PAGE SYSTEM JS */
/* Repo: product-page.js         */
/* ============================= */

(function(){

  /* Do not run inside Squarespace editor */
  if(window.self!==window.top)return;

  /* Only run on product pages */
  if(!document.getElementById("product-root"))return;


  /* ============================= */
  /* FAQ ACCORDION TOGGLE          */
  /* ============================= */
  document.querySelectorAll(".product-faq-question").forEach(function(q){
    q.addEventListener("click",function(){
      q.classList.toggle("open");
      var a=q.nextElementSibling;
      if(a)a.classList.toggle("open");
    });
  });


  /* ============================= */
  /* STICKY CTA SCROLL LOGIC       */
  /* ============================= */
  var bar=document.getElementById("stickyCta");
  if(!bar)return;

  window.addEventListener("scroll",function(){
    bar.style.display=window.scrollY>300?"flex":"none";
  });

})();
