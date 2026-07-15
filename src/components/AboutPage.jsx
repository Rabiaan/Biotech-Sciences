import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Video, Sparkles, RefreshCw, Leaf, ShieldCheck, Headphones, Lock, FlaskConical, Droplets, Dna } from "lucide-react";
import { NumaStore } from "../utils/store";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    let rafId;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [started, end, duration]);

  return { count, ref };
}

function AboutPage({ onAddProductToCart, onNavigateHome, showToast }) {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const coffeeCounter = useCountUp(750, 2200);
  const reviewsCounter = useCountUp(120, 2000);
  const stockCounter = useCountUp(25, 1800);
  const productsCounter = useCountUp(2135, 2500);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const bottleContainerRef = useRef(null);
  const bottleRef = useRef(null);
  const pedestalRef = useRef(null);

  const liposomalProduct = NumaStore.getProducts().find((p) => p.id === "biotech-anti-acne-facewash");

  const handleContactSubmit = (e) => {
    e.preventDefault();
    NumaStore.submitContactMessage(contactName, contactEmail, contactSubject, contactMessage);
    if (showToast) {
      showToast("Thank you! Your message has been received by our lab team.", "success");
    }
    setContactName("");
    setContactEmail("");
    setContactSubject("");
    setContactMessage("");
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    let ctx;

    const setupAnimation = () => {
      if (ctx) {
        ctx.revert();
      }

      if (!triggerRef.current || !bottleContainerRef.current || !pedestalRef.current) {
        return;
      }

      ctx = gsap.context(() => {
        gsap.set(bottleContainerRef.current, {
          top: "50vh",
          left: "50%",
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50,
          rotation: -25,
          scale: 2,
        });

        const bottleRect = bottleContainerRef.current.getBoundingClientRect();
        const pedestalRect = pedestalRef.current.getBoundingClientRect();

        const bottleCenterX = bottleRect.left + bottleRect.width / 2;
        const bottleCenterY = bottleRect.top + bottleRect.height / 2;
        const pedestalCenterX = pedestalRect.left + pedestalRect.width / 2;
        const pedestalCenterY = pedestalRect.top + pedestalRect.height / 2;

        const deltaX = pedestalCenterX - bottleCenterX;
        const deltaY = pedestalCenterY - bottleCenterY;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          bottleContainerRef.current,
          {
            x: deltaX,
            y: deltaY,
            scale: 1,
            rotation: 12,
            ease: "power1.inOut",
          },
          0
        );

        gsap.from(".hero-text-animate", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
        });

        gsap.to(".orbit-line-1", {
          rotation: 360,
          duration: 60,
          repeat: -1,
          ease: "none",
        });

        gsap.to(".orbit-line-2", {
          rotation: -360,
          duration: 90,
          repeat: -1,
          ease: "none",
        });
      }, containerRef);

      ScrollTrigger.refresh();
    };

    const initializeAnimation = () => {
      const run = () => requestAnimationFrame(setupAnimation);
      const img = bottleRef.current;
      const fontsReady = document.fonts?.ready ?? Promise.resolve();

      Promise.all([
        fontsReady,
        img?.complete ? Promise.resolve() : new Promise((resolve) => {
          if (!img) return resolve();
          img.onload = resolve;
          img.onerror = resolve;
        }),
      ]).then(run);
    };

    initializeAnimation();

    const handleResize = () => setupAnimation();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[#f3f6ed] text-[#19221f] selection:bg-[#b08df3]/30 overflow-x-hidden relative"
    >
      <div className="absolute top-15 left-6 md:left-12 z-30">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2 bg-white/80 hover:bg-white text-[#19221f] text-xs font-display tracking-widest uppercase font-bold py-3 px-5 rounded-full border border-[#19221f]/5 backdrop-blur-md shadow-sm transition-all hover:translate-x-[-2px]"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      </div>

      {/* Pinned scroll zone: section 1 + section 2 only */}
      <div ref={triggerRef} className="relative w-full">
        {/* Section 1 — Hero */}
        <section className="relative min-h-screen flex flex-col justify-between pt-32 pb-16 px-6 md:px-12 bg-[#f3f6ed] transition-colors overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="orbit-line-1 absolute w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] md:w-[680px] md:h-[680px] border border-[#19221f]/8 rounded-full flex items-center justify-center">
              <div className="absolute top-[25%] left-[-4%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 bg-[#a7c3ba] rounded-full animate-ping absolute" style={{ boxShadow: "0 4px 6px -1px rgba(167, 195, 186, 0.6)" }} />
                <span className="w-2.5 h-2.5 bg-[#19221f] rounded-full shadow-md relative z-10" />
                <span className="mt-2 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50">RETINOL</span>
                <div className="w-[40px] h-[1px] bg-[#19221f]/10 rotate-[25deg] origin-left mt-1 hidden sm:block" />
              </div>
              <div className="absolute top-[35%] right-[-5%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 bg-[#19221f] rounded-full shadow-md" />
                <span className="mt-2 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50">HYALURONIC ACID</span>
                <div className="w-[40px] h-[1px] bg-[#19221f]/10 -rotate-[25deg] origin-right mt-1 hidden sm:block" />
              </div>
            </div>
            <div className="orbit-line-2 absolute w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] border border-[#19221f]/12 rounded-full flex items-center justify-center">
              <div className="absolute bottom-[10%] right-[15%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 bg-[#19221f] rounded-full shadow-md" />
                <span className="mt-2 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-bold text-[#19221f]/50">ARGIRELINE</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center w-full max-w-[1440px] mx-auto">
            <h1 className="font-syne text-[11vw] font-black tracking-tighter leading-none text-[#19221f] uppercase select-none flex items-center justify-center flex-wrap">
              <span>BIOTECH</span>
              <span className="inline-block w-[6vw] h-[6vw] ml-3 flex-shrink-0">
                <svg className="w-full h-full text-[#a0cce3]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-4-4V2zm0 20a4 4 0 0 1-4-4v-2a4 4 0 0 1 4 4v2zm-10-10a4 4 0 0 1 4-4h2a4 4 0 0 1-4 4H2zm20 0a4 4 0 0 1-4 4h-2a4 4 0 0 1 4-4h2z" />
                  <circle cx="12" cy="12" r="2.5" fill="white" />
                </svg>
              </span>
            </h1>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-[1440px] mx-auto w-full pt-12 md:pt-24">
            <div className="md:col-span-5">
              <span className="hero-text-animate font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#19221f]/50 block">
                Timeless Rejuvenation
              </span>
              <p className="hero-text-animate font-syne text-lg md:text-xl font-semibold tracking-tight text-[#19221f] mt-2">
                Sculpting skin architecture from the microscopic level.
              </p>
            </div>
            <div className="md:col-span-2 h-12 md:h-0" />
            <div className="md:col-span-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-[280px]">
                <span className="hero-text-animate font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#a7c3ba] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  CELLULAR SCIENCE
                </span>
                <p className="hero-text-animate text-xs font-display font-medium leading-relaxed uppercase text-[#19221f]/70">
                  Experience the future of wellness with Renucell&apos;s tailored cellular rejuvenation.
                </p>
              </div>
              <button className="hero-text-animate group flex items-center space-x-2 bg-[#b08df3] text-white rounded-full py-3.5 px-6 text-xs font-display font-bold tracking-widest uppercase shadow-md hover:bg-[#976fe6] hover:scale-103 transition-all duration-300">
                <Video className="w-3.5 h-3.5 stroke-[2] fill-white" />
                <span>Explore Video</span>
              </button>
            </div>
          </div>

        </section>

        {/* Section 2 — Product detail */}
        <section className="relative min-h-screen bg-[#fafbf9] py-28 px-6 md:px-12 overflow-hidden flex items-center border-t border-[#19221f]/5">
          <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-8 relative z-15">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-[#19221f]/5 border border-[#19221f]/10 rounded-full py-1.5 px-4 text-[10px] uppercase font-display font-bold tracking-widest text-[#19221f]/80">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  <span>Clinical Formulation</span>
                </div>
                <h2 className="font-syne text-4xl sm:text-5xl font-bold tracking-tight text-[#19221f] leading-tight">
                  Biotech Sciences
                  <br />
                  Liposomal Facewash
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#19221f]/75 font-display leading-relaxed max-w-[500px]">
                We have 20 years' experience of Skin care pharmaceutical industry, 20 years of learning, research and cosmetology brands development.
              </p>
              <p className="text-sm sm:text-base text-[#19221f]/75 font-display leading-relaxed max-w-[500px]">
                We create "LIPOSOMAL"—a brand infused with love and care, dedicated to make a real difference in people's lives, because of its uniqueness that is "Galenic Formulations, encapsulated in Liposomes" Because at Biotech Sciences, Your skin matters for us.
              </p>
              <div className="pt-6 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => liposomalProduct && onAddProductToCart(liposomalProduct)}
                  className="group flex items-center space-x-3 bg-[#19221f] text-[#fafbf9] hover:bg-[#515f5a] hover:scale-102 transition-all duration-300 py-4 px-8 rounded-full text-xs font-display font-bold uppercase tracking-widest shadow-md"
                >
                  <ShoppingCart className="w-4 h-4 stroke-[2]" />
                  <span>Add Liposomal Facewash</span>
                </button>

              </div>
            </div>

            {/* Pedestal target — bottle animates here on scroll */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-[340px] sm:w-[400px] h-[340px] sm:h-[400px] flex items-center justify-center">
                {/* <div className="absolute w-[80%] h-[30px] bg-black/10 blur-xl rounded-full bottom-8 rotate-[5deg] opacity-70" /> */}
                
                <div
                  ref={pedestalRef}
                  className="absolute w-56 h-56 bg-[transparent] rounded-[2rem] transform rotate-12 pointer-events-none"
                />
               

              </div>
            </div>
          </div>
        </section>

        {/* Bottle — child of triggerRef, positioned over section 1, scrolls to pedestal */}
        <div
          ref={bottleContainerRef}
          className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px] pointer-events-none z-20 flex items-center justify-center"
        >
          {/* <div className="absolute w-[80%] h-[30px] bg-black/10 blur-xl rounded-full bottom-8 rotate-[5deg] opacity-70" /> */}
          <img
            ref={bottleRef}
            src="/src/assets/images/biotech_facewash.png"
            alt="Biotech Liposomal Facewash"
            className="absolute w-full h-full object-contain filter drop-shadow-xl select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Biotech Uniqueness Section */}
      <section className="bg-[#fafbf9] py-28 px-6 md:px-12 border-t border-[#19221f]/5">
        <div className="max-w-[1440px] mx-auto space-y-20">
          <div className="text-center space-y-4">
            <span className="font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#19221f]/50">What Makes Us Different</span>
            <h2 className="font-syne text-4xl md:text-5xl font-bold tracking-tight text-[#19221f]">Biotech Uniqueness</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#19221f]/5 shadow-sm space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#a7c3ba]/20 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-[#19221f]" />
              </div>
              <h3 className="font-syne text-xl font-bold text-[#19221f]">Galenic Formulation</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                At Biotech Sciences, every product is based on Galenic skincare formulation. Galenic refers to the scientific and systematic process of designing and creating skincare products by combining active ingredients with various excipients in a manner that ensures optimal stability, bioavailability, and efficacy. This involves understanding the physicochemical properties of each ingredient — such as solubility, viscosity, and compatibility — and then formulating them into specific dosage forms like creams, lotions, gels, or serums.
              </p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#19221f]/5 shadow-sm space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#b08df3]/20 flex items-center justify-center">
                <Droplets className="w-7 h-7 text-[#19221f]" />
              </div>
              <h3 className="font-syne text-xl font-bold text-[#19221f]">Liposomal Ingredients</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                At Biotech Sciences, we only use ingredients which are in Liposomal forms. Hyaluronic acid and a liposomal hyaluronic acid is different. Vitamin C and a liposomal Vitamin C is different. We are the only cosmetology company in Pakistan using Liposomal form of ingredients. Liposomal encapsulation offers improved stability, bioavailability, targeted delivery, enhanced absorption, and deeper penetration of active ingredients.
              </p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-[#19221f]/5 shadow-sm space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#e8c9a0]/30 flex items-center justify-center">
                <Dna className="w-7 h-7 text-[#19221f]" />
              </div>
              <h3 className="font-syne text-xl font-bold text-[#19221f]">Cross Linked Dual Hyaluronic Acid</h3>
              <p className="text-sm text-[#19221f]/70 font-display leading-relaxed">
                At Biotech Sciences, we use 2 different molecules of Hyaluronic acid — LMW HA (smaller weight) and HMW HA (higher weight). Cross-linked dual hyaluronic acid has significantly greater efficacy compared to the normal single molecule every company in Pakistan is using. It delivers enhanced hydration, improved skin elasticity, reduced fine lines and wrinkles, and long-lasting effects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-[#19221f] text-[#fafbf9] py-28 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full py-1.5 px-4 text-[10px] uppercase font-display font-bold tracking-widest">
              <span className="w-1.5 h-1.5 bg-[#a7c3ba] rounded-full" />
              <span>Our Story</span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Every Skin Matters To Us
            </h2>
            <div className="space-y-4 text-sm text-[#fafbf9]/75 font-display leading-relaxed">
              <p>
                We have 20 years' experience of skin care pharmaceutical industry — 20 years of learning, research and cosmetology brands development. Despite that, one day in moments of despair and sadness, my wife and I felt lost in a sea of failed remedies for our skin problems.
              </p>
              <p>
                Countless trips to doctors and thousands spent on treatments left us disillusioned. As lovers of skincare, we saw a glaring need for quality products in Pakistan — as there are 8 brands that are substandard with no results out of every 10 brands.
              </p>
              <p>
                Driven by our frustration and determination, we set out on a quest for solutions about this lacking of quality skin care in Pakistan. Through trial and error, we discovered our own recipe for success. But it wasn't just about us — we realized that many others are facing the same struggles.
              </p>
              <p>
                With newfound purpose, we created "LIPOSOMAL" — a brand infused with love and care, dedicated to make a real difference in people's lives, because of its uniqueness that is "Galenic Formulations, encapsulated in Liposomes." Because at Biotech Sciences, your skin matters for us.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div ref={coffeeCounter.ref} className="bg-white/10 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-center space-y-2">
                <span className="font-dmsans text-3xl sm:text-4xl md:text-5xl font-bold text-[#a7c3ba] tabular-nums">{coffeeCounter.count.toLocaleString()}+</span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#fafbf9]/60 font-bold">Happy Customers</span>
              </div>
              <div ref={reviewsCounter.ref} className="bg-white/10 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-center space-y-2">
                <span className="font-dmsans text-3xl sm:text-4xl md:text-5xl font-bold text-[#b08df3] tabular-nums">{reviewsCounter.count.toLocaleString()}+</span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#fafbf9]/60 font-bold">Reviews</span>
              </div>
              <div ref={stockCounter.ref} className="bg-white/10 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-center space-y-2">
                <span className="font-dmsans text-3xl sm:text-4xl md:text-5xl font-bold text-[#e8c9a0] tabular-nums">{stockCounter.count}+</span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#fafbf9]/60 font-bold">Products</span>
              </div>
              <div ref={productsCounter.ref} className="bg-white/10 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-center space-y-2">
                <span className="font-dmsans text-3xl sm:text-4xl md:text-5xl font-bold text-[#fafbf9] tabular-nums">{productsCounter.count.toLocaleString()}+</span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#fafbf9]/60 font-bold">Stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-[#f5f4f0] py-28 px-6 md:px-12 border-t border-[#19221f]/5">
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#19221f]/50">Our Specialities</span>
            <h2 className="font-syne text-4xl md:text-5xl font-bold tracking-tight text-[#19221f]">Services</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#a7c3ba]/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#19221f]" />
              </div>
              <h4 className="font-syne text-sm font-bold text-[#19221f]">Pure Vegan</h4>
              <span className="text-[9px] font-mono uppercase tracking-widest text-green-600 font-bold">100% Approved</span>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#b08df3]/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#19221f]" />
              </div>
              <h4 className="font-syne text-sm font-bold text-[#19221f]">Halal Certified</h4>
              <span className="text-[9px] font-mono uppercase tracking-widest text-green-600 font-bold">100% Approved</span>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#e8c9a0]/30 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-[#19221f]" />
              </div>
              <h4 className="font-syne text-sm font-bold text-[#19221f]">Online Support 24/7</h4>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold">Technical Support</span>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#19221f]/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#19221f]" />
              </div>
              <h4 className="font-syne text-sm font-bold text-[#19221f]">Secure Payment</h4>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold">Cash On Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact — outside triggerRef so it doesn't affect bottle positioning */}
      <section className="bg-[#f5f4f0] py-28 px-6 md:px-12 border-t border-[#19221f]/5">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-transparent border border-[#19221f]/30 rounded-full py-1 px-4 text-[10px] md:text-xs uppercase font-display font-medium tracking-widest select-none">
              <span className="w-1.5 h-1.5 bg-[#19221f] rounded-full" />
              <span>Contact Our Lab</span>
            </div>
            <h2 className="font-syne text-4xl md:text-5xl font-bold tracking-tight text-[#19221f] leading-none">
              Get in touch with our expert team
            </h2>
            <p className="text-xs sm:text-sm text-[#19221f]/70 font-display leading-relaxed max-w-md">
              Whether you have a question about our biotech formulations, ingredients, stock availability, order delivery, or simply want custom skin wellness advice, our scientific support team is here to assist you.
            </p>
            <div className="space-y-4 pt-4 text-xs font-mono text-[#19221f]/80 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <span className="text-[#7a493b] font-bold">ADDRESS:</span>
                <span>Karachi - Pakistan</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#7a493b] font-bold">EMAIL:</span>
                <span className="lowercase">info@biotechsciences.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#7a493b] font-bold">PHONE:</span>
                <span>+92-333-2927735</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-[#f3f6ed] p-8 md:p-10 rounded-[2.25rem] border border-[#19221f]/5 shadow-sm space-y-6">
            <h3 className="font-syne text-xl font-bold text-[#19221f]">Send a Message</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-white border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]"
                  placeholder="E.g., Jane Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]"
                  placeholder="E.g., jane@gmail.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold">Subject</label>
              <input
                type="text"
                required
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="w-full bg-white border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]"
                placeholder="E.g., Delivery Inquiries"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-widest text-[#19221f]/60 font-bold">Message</label>
              <textarea
                required
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full bg-white border border-[#19221f]/10 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#7a493b] font-display resize-none text-[#19221f]"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#19221f] text-[#f3f6ed] text-[10px] font-mono font-bold uppercase tracking-widest py-4 rounded-full hover:bg-[#7a493b] transition-all duration-300 shadow-sm"
            >
              Submit message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
