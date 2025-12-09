import React, { useEffect, useRef } from "react";
import BannerExpand from "../../Component/home/BannerExpand";
import RecentPosts from "../../Component/home/RecentPosts";
import CollectionGallery from "../../Component/home/CollectionGallery";
import ContributeCall from "../../Component/home/ContributeCall";
import ContributeImpact from "../../Component/home/ContributeImpact";
import "../../Styles/home/HomeAnimations.css";

const Home = () => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          } else {
            entry.target.classList.remove("animate-in");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentSections = sectionsRef.current;

    currentSections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      currentSections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  return (
    <div>
      <div ref={(el) => (sectionsRef.current[0] = el)} className="home-section">
        <BannerExpand />
      </div>
      <div ref={(el) => (sectionsRef.current[1] = el)} className="home-section">
        <CollectionGallery />
      </div>
      <div ref={(el) => (sectionsRef.current[2] = el)} className="home-section">
        <ContributeCall />
      </div>
      <div ref={(el) => (sectionsRef.current[3] = el)} className="home-section">
        <RecentPosts />
      </div>
      <div ref={(el) => (sectionsRef.current[4] = el)} className="home-section">
        <ContributeImpact />
      </div>
    </div>
  );
};

export default Home;
