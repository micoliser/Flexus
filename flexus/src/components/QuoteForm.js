import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { countries } from "../data/countries";
import api from "../api/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  note: "",
};

const QuoteForm = ({ isOpen, productName, onClose }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCountry = useMemo(
    () =>
      countries.find(
        (country) =>
          country.name.toLowerCase() === formData.country.trim().toLowerCase(),
      ),
    [formData.country],
  );
  const selectedDialCode = selectedCountry ? selectedCountry.dialCode : "+";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const validateField = (name, value) => {
    const trimmedValue = value.trim();

    if (name === "note") return "";

    if (!trimmedValue) {
      return "This field is required.";
    }

    if (name === "firstName" || name === "lastName") {
      if (!/^[A-Za-z][A-Za-z' -]{1,49}$/.test(trimmedValue)) {
        return "Please enter a valid name.";
      }
    }

    if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(trimmedValue)) {
        return "Please enter a valid email address.";
      }
    }

    if (name === "phone") {
      if (!selectedCountry) {
        return "Please select a valid country first.";
      }

      const normalizedPhone = trimmedValue.replace(/\s|-/g, "");
      if (!/^[0-9]{6,15}$/.test(normalizedPhone)) {
        return "Enter phone number without country code (6-15 digits).";
      }
    }

    if (name === "country") {
      const countryExists = countries.some(
        (country) => country.name.toLowerCase() === trimmedValue.toLowerCase(),
      );

      if (!countryExists) {
        return "Please select a country from the list.";
      }
    }

    return "";
  };

  const validateAll = () => {
    const nextErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        nextErrors[field] = error;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) return;

    const finalPhone = `${selectedDialCode}${formData.phone.replace(/\s|-/g, "")}`;
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/email/quote", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: finalPhone,
        country: formData.country,
        productName: productName,
        note: formData.note,
      });

      if (data.success) {
        toast.success(
          "Quote request submitted successfully! We will contact you soon.",
        );
        setFormData(initialForm);
        setErrors({});
        onClose();
      } else {
        toast.error(
          data.message || "Failed to submit quote request. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error submitting quote request:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while submitting your request. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`quote-overlay ${isOpen ? "show" : ""}`} onClick={onClose}>
      <aside
        className={`quote-sidebar ${isOpen ? "show" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="quote-sidebar-header d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold text-brand-dark mb-1">Request Quote</h4>
            <p className="text-muted mb-0 small">Product: {productName}</p>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>

        <form onSubmit={handleSubmit} className="quote-form" noValidate>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="firstName" className="form-label fw-medium">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.firstName && (
                <div className="invalid-feedback d-block">
                  {errors.firstName}
                </div>
              )}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="lastName" className="form-label fw-medium">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.lastName && (
                <div className="invalid-feedback d-block">
                  {errors.lastName}
                </div>
              )}
            </div>

            <div className="col-12">
              <label htmlFor="email" className="form-label fw-medium">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div>

            <div className="col-12">
              <label htmlFor="phone" className="form-label fw-medium">
                Phone Number *
              </label>
              <div className="input-group">
                <span className="input-group-text" id="countryCode">
                  {selectedDialCode}
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 8012345678"
                  aria-describedby="countryCode"
                />
              </div>
              {errors.phone && (
                <div className="invalid-feedback d-block">{errors.phone}</div>
              )}
            </div>

            <div className="col-12">
              <label htmlFor="country" className="form-label fw-medium">
                Country *
              </label>
              <input
                id="country"
                name="country"
                type="text"
                list="country-options"
                className={`form-control ${errors.country ? "is-invalid" : ""}`}
                value={formData.country}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Start typing to search country"
              />
              <datalist id="country-options">
                {countries.map((country) => (
                  <option key={country.name} value={country.name} />
                ))}
              </datalist>
              {errors.country && (
                <div className="invalid-feedback d-block">{errors.country}</div>
              )}
            </div>

            <div className="col-12">
              <label htmlFor="note" className="form-label fw-medium">
                Additional Note
              </label>
              <textarea
                id="note"
                name="note"
                className="form-control"
                rows="4"
                value={formData.note}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-brand-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default QuoteForm;
