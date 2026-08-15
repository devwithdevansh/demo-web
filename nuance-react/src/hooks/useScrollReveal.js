import { useEffect } from 'react';

export default function useScrollReveal() {
  useEffect(() => {
    const rvEls = document.querySelectorAll(".rv");
    if("IntersectionObserver" in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if(en.isIntersecting){ 
            en.target.classList.add("is-in"); 
            io.unobserve(en.target); 
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      rvEls.forEach((el) => { io.observe(el); });
      
      return () => {
        rvEls.forEach((el) => { io.unobserve(el); });
      }
    } else {
      rvEls.forEach((el) => { el.classList.add("is-in"); });
    }
  }, []);
}
