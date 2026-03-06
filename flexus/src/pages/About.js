import { useState } from "react";
import TeamCard from "../components/TeamCard";

const About = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const teamMembers = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      image: "https://placehold.co/600x400/006c43/ffffff?text=John+Doe",
      description:
        "John brings extensive expertise and dedication to Flexus Solutions. With a passion for excellence and agricultural innovation, he plays a vital role in our mission to deliver premium produce to global markets.",
    },
    {
      name: "Sarah Smith",
      role: "Operations Manager",
      image: "https://placehold.co/600x400/3e6d09/ffffff?text=Sarah+Smith",
      description:
        "Sarah manages our day-to-day operations with precision and care. Her commitment to efficiency and quality ensures smooth processes from sourcing to delivery.",
    },
    {
      name: "Michael Johnson",
      role: "Quality Assurance Lead",
      image: "https://placehold.co/600x400/80b940/ffffff?text=Michael+Johnson",
      description:
        "Michael oversees our quality control processes, ensuring that every product meets international standards. His attention to detail guarantees excellence in every shipment.",
    },
    {
      name: "Emily Brown",
      role: "Export Specialist",
      image: "https://placehold.co/600x400/006c43/ffffff?text=Emily+Brown",
      description:
        "Emily handles international logistics and compliance with expertise. Her knowledge of global markets helps us deliver products efficiently worldwide.",
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? teamMembers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === teamMembers.length - 1 ? 0 : prev + 1));
  };

  const getSlideClass = (index) => {
    if (index === activeIndex) return "active";

    const prevIndex =
      activeIndex === 0 ? teamMembers.length - 1 : activeIndex - 1;
    const nextIndex =
      activeIndex === teamMembers.length - 1 ? 0 : activeIndex + 1;

    if (index === prevIndex) return "adjacent left";
    if (index === nextIndex) return "adjacent right";

    return "hidden";
  };

  return (
    <main className="m-0 p-0">
      {/* Hero Section */}
      <section className="about hero-section d-flex align-items-center position-relative">
        <div className="container">
          <div className="hero-content position-relative text-center text-white">
            <h1 className="display-4 fw-bold mb-4">About Flexus Solutions</h1>
            <p className="fs-5 mb-4">
              Your trusted partner in quality agricultural exports
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-5 about-content-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-8">
              <h2 className="fw-bold mb-4 text-brand-dark">Who We Are</h2>
              <p className="text-muted mb-3 fs-6">
                Flexus Solutions is a leading agricultural export company
                dedicated to bringing premium farm produce from Africa to global
                markets. With years of industry experience, we've built strong
                relationships with farmers and international buyers.
              </p>
              <p className="text-muted mb-3 fs-6">
                Our mission is to create sustainable value chains that benefit
                farmers, businesses, and consumers alike. We believe in fair
                trade practices and environmental responsibility.
              </p>
              <p className="text-muted fs-6">
                From sourcing to quality control to logistics, we manage every
                step of the process to ensure you receive only the best
                products.
              </p>
            </div>

            <div className="col-12 col-lg-4">
              <div className="about-image-placeholder rounded-4 overflow-hidden">
                <img
                  src={require("../images/three-in-van.png")}
                  alt="About Flexus"
                  className="img-fluid w-100 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        className="py-5 values-section bg-light"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container">
          <h2 className="fw-bold mb-5 text-center text-brand-dark">
            Our Values
          </h2>

          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card-r text-center p-4 rounded-4 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-shield-check fs-1 text-brand-light"></i>
                </div>
                <h4 className="fw-bold mb-3 text-brand-dark">Quality</h4>
                <p className="text-muted mb-0 fs-6">
                  Stringent quality checks at every stage of production and
                  export
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card-r text-center p-4 rounded-4 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-heart fs-1 text-brand-light"></i>
                </div>
                <h4 className="fw-bold mb-3 text-brand-dark">Integrity</h4>
                <p className="text-muted mb-0 fs-6">
                  Honest dealings and transparent practices in all business
                  relationships
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card-r text-center p-4 rounded-4 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-flower1 fs-1 text-brand-light"></i>
                </div>
                <h4 className="fw-bold mb-3 text-brand-dark">Sustainability</h4>
                <p className="text-muted mb-0 fs-6">
                  Committed to environmental protection and sustainable farming
                  practices
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card-r text-center p-4 rounded-4 bg-white shadow-sm h-100">
                <div className="mb-3">
                  <i className="bi bi-person-check fs-1 text-brand-light"></i>
                </div>
                <h4 className="fw-bold mb-3 text-brand-dark">Partnership</h4>
                <p className="text-muted mb-0 fs-6">
                  Building long-term relationships with farmers and global
                  clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section
        className="py-5 team-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container">
          <h2 className="fw-bold mb-5 text-center text-brand-dark">
            Meet the Team
          </h2>

          <div className="team-carousel-wrapper position-relative">
            <div className="team-carousel-container">
              <div className="carousel-track">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className={`carousel-slide ${getSlideClass(index)}`}
                  >
                    <TeamCard
                      name={member.name}
                      role={member.role}
                      image={member.image}
                      description={member.description}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <button
              className="carousel-arrow carousel-arrow-prev"
              onClick={handlePrev}
              aria-label="Previous team member"
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <button
              className="carousel-arrow carousel-arrow-next"
              onClick={handleNext}
              aria-label="Next team member"
            >
              <i className="bi bi-chevron-right"></i>
            </button>

            {/* Carousel Indicators */}
            <div className="carousel-indicators-bottom d-flex justify-content-center gap-2 mt-4">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  className={`indicator-dot ${index === activeIndex ? "active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
