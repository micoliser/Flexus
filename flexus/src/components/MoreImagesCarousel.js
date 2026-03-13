import { useEffect, useMemo, useRef, useState } from "react";

const DESKTOP_ITEMS_VISIBLE = 4;
const MOBILE_ITEMS_VISIBLE = 2;
const MOBILE_QUERY = "(max-width: 767.98px)";

const MoreImagesCarousel = ({ images = [], productName }) => {
  const viewportRef = useRef(null);
  const [itemsVisible, setItemsVisible] = useState(DESKTOP_ITEMS_VISIBLE);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const updateVisibleCount = () => {
      setItemsVisible(
        mediaQuery.matches ? MOBILE_ITEMS_VISIBLE : DESKTOP_ITEMS_VISIBLE,
      );
    };

    updateVisibleCount();
    mediaQuery.addEventListener("change", updateVisibleCount);

    return () => {
      mediaQuery.removeEventListener("change", updateVisibleCount);
    };
  }, []);

  const maxStart = useMemo(
    () => Math.max(images.length - itemsVisible, 0),
    [images.length, itemsVisible],
  );

  const visibleStart = images.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(startIndex + itemsVisible, images.length);

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStart));
  }, [maxStart]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const items = viewport.querySelectorAll(".more-images-item");
    const targetItem = items[startIndex];
    if (!targetItem) return;

    viewport.scrollTo({ left: targetItem.offsetLeft, behavior: "smooth" });
  }, [startIndex]);

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + 1, maxStart));
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="more-images-section mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
        <h5 className="fw-bold text-brand-dark mb-0">More Images</h5>
        <span className="text-muted small">
          Showing {visibleStart}-{visibleEnd} of {images.length}
        </span>
      </div>

      <div className="more-images-carousel mb-3">
        <button
          type="button"
          className="more-images-arrow more-images-arrow-prev"
          onClick={handlePrevious}
          disabled={startIndex === 0}
          aria-label="Previous images"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="more-images-viewport" ref={viewportRef}>
          <div className="more-images-track">
            {images.map((imgSrc, index) => (
              <div className="more-images-item" key={`${imgSrc}-${index}`}>
                <img
                  src={imgSrc}
                  alt={`${productName} ${index + 1}`}
                  className="img-fluid w-100 h-100 object-fit-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="more-images-arrow more-images-arrow-next"
          onClick={handleNext}
          disabled={startIndex >= maxStart}
          aria-label="Next images"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

export default MoreImagesCarousel;
