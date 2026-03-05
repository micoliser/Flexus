import { useState, useEffect } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: "", message: "" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const sendEmail = async (formData) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_ADDRESS}/api/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return { success: true };
    } catch (error) {
      console.error("Email Error:", error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.message) errors.message = "Message is required";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const result = await sendEmail(formData);

    if (result.success) {
      setAlert({
        show: true,
        type: "success",
        message: "Message sent successfully! We'll get back to you shortly.",
      });

      setFormData({ name: "", email: "", message: "" });
    } else {
      setAlert({
        show: true,
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    }
  };

  return (
    <main className="m-0 p-0">
      <section className="contact hero-section d-flex align-items-center position-relative">
        <div className="container">
          <div className="hero-content position-relative text-center text-white">
            <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
            <p className="fs-5 mb-4">
              Reach out to us for more information on quotes, orders, or any
              other inquiries.
            </p>
          </div>
        </div>
      </section>

      <section className="py-5" data-aos="fade-up" data-aos-duration="800">
        <div className="container">
          <div className="row g-4 mb-5">
            <div
              className="col-12 col-md-4"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="contact-card text-center p-4 h-100 rounded-3 bg-white shadow-sm">
                <i className="bi bi-check-circle fs-1 text-brand-primary mb-3"></i>
                <h5 className="fw-bold text-brand-dark mb-3">Contact Info</h5>
                <div className="d-flex justify-content-center align-items-center mb-4">
                  <i className="bi bi-telephone fs-4 text-brand-primary me-2"></i>
                  <p className="mb-2">+234 70 123 4567</p>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                  <i className="bi bi-envelope fs-4 text-brand-primary me-2"></i>
                  <p className="mb-0">info@flexussolutions.com</p>
                </div>
                <p className="text-muted small">We respond within 24 hours.</p>
              </div>
            </div>

            <div
              className="col-12 col-md-4"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="contact-card text-center p-4 h-100 rounded-3 bg-white shadow-sm">
                <i className="bi bi-geo-alt fs-1 text-brand-primary mb-3"></i>
                <h5 className="fw-bold text-brand-dark mb-3">Visit Us</h5>
                <p className="fw-bold mb-2">
                  4th Floor, Right Wing, Mulliner Towers
                </p>
                <p className="fw-bold mb-2">
                  Plot 39 Alfred Rewane Road, Ikoyi, Lagos.
                </p>
                <p className="text-muted small mb-0">Nigeria</p>
              </div>
            </div>

            <div
              className="col-12 col-md-4"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="contact-card text-center p-4 h-100 rounded-3 bg-white shadow-sm">
                <i className="bi bi-headset fs-1 text-brand-primary mb-3"></i>
                <h5 className="fw-bold text-brand-dark mb-3">Quick Support</h5>
                <p className="text-muted small mb-4">
                  Need assistance? Our support team is available 24/7 to answer
                  your questions.
                </p>
                <div className="d-flex flex-column gap-2 align-items-center">
                  <a
                    href="tel:+234701234567"
                    className="btn btn-brand-secondary w-75"
                  >
                    <i className="bi bi-telephone me-2"></i>Place a Call
                  </a>
                  <a
                    href="https://wa.me/2347012345670"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-brand-primary w-75"
                  >
                    <i className="bi bi-whatsapp me-2"></i>Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="row justify-content-center"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <div className="col-12 col-lg-8">
              <div className="contact-form-card p-4 p-lg-5 rounded-3 bg-light">
                {alert.show && (
                  <div className={`custom-alert ${alert.type}`}>
                    <div className="alert-content">
                      <i
                        className={`bi ${
                          alert.type === "success"
                            ? "bi-check-circle-fill"
                            : "bi-exclamation-triangle-fill"
                        }`}
                      ></i>
                      <span>{alert.message}</span>
                    </div>
                    <button
                      className="alert-close"
                      onClick={() =>
                        setAlert({ show: false, type: "", message: "" })
                      }
                    >
                      &times;
                    </button>
                  </div>
                )}
                <h3 className="text-brand-dark fw-bold text-center mb-2">
                  Send Us a Message
                </h3>
                <p className="text-center text-muted mb-4">
                  Have a question or want to discuss your needs? Fill out the
                  form below and our team will get back to you as soon as
                  possible.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    {formErrors.name && (
                      <div className="text-danger small">{formErrors.name}</div>
                    )}
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Your Name"
                      onChange={handleChange}
                      name="name"
                      value={formData.name}
                    />
                  </div>
                  <div className="mb-3">
                    {formErrors.email && (
                      <div className="text-danger small">
                        {formErrors.email}
                      </div>
                    )}
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Your Email"
                      onChange={handleChange}
                      name="email"
                      value={formData.email}
                    />
                  </div>
                  <div className="mb-4">
                    {formErrors.message && (
                      <div className="text-danger small">
                        {formErrors.message}
                      </div>
                    )}
                    <textarea
                      className="form-control form-control-lg"
                      rows="6"
                      placeholder="Your Message"
                      onChange={handleChange}
                      name="message"
                      value={formData.message}
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-brand-primary btn-lg px-5"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="map-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container-fluid p-0">
          <div
            className="map-placeholder bg-secondary"
            style={{ height: "400px" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.5516110448325!2d3.4264879749948824!3d6.451561923995123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4cf9a9228a9%3A0xeb66a75f66803cdb!2sRegus%20-%20Lagos%2C%20Mulliner%20Towers!5e0!3m2!1sen!2sng!4v1772614008109!5m2!1sen!2sng"
              width="100%"
              height="400"
              style={{ border: 0 }}
              title="Location Map"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
