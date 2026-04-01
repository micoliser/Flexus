import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeletonGrid from "../components/ProductCardSkeletonGrid";
import api from "../api/api";
import Seo from "../components/Seo";

const INITIAL_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const sentinelRef = useRef(null);

  const loadProducts = useCallback(async (targetPage, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const { data } = await api.get("/products", {
        params: {
          page: targetPage,
          limit: 12,
          status: "published",
        },
        skipAuth: true,
      });

      const nextBatch = data.data || [];

      setProducts((prev) => {
        if (!append) return nextBatch;

        const seen = new Set(prev.map((item) => item.id || item._id));
        const merged = [...prev];

        nextBatch.forEach((item) => {
          const key = item.id || item._id;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        });

        return merged;
      });

      setPagination(
        data.pagination || { ...INITIAL_PAGINATION, page: targetPage },
      );
      setPage(targetPage);
    } catch {
      if (!append) {
        setProducts([]);
        setPagination(INITIAL_PAGINATION);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(1, false);
  }, [loadProducts]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (isLoading || isLoadingMore) return;
        if (!pagination.hasNext) return;

        loadProducts(page + 1, true);
      },
      { root: null, rootMargin: "200px 0px", threshold: 0.1 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isLoading, isLoadingMore, loadProducts, page, pagination.hasNext]);

  return (
    <main className="m-0 p-0">
      <Seo
        title="Export Products"
        description="Browse Flexus export-ready agricultural products including cashew nuts, cocoa beans, ginger, turmeric, coconut, shea nut, and bitter kola for global wholesale buyers."
        path="/products"
        keywords="export products, bulk agricultural products, wholesale farm produce, cashew nuts wholesale, cocoa beans supply"
      />
      <section className="products hero-section d-flex align-items-center position-relative">
        <div className="container">
          <div className="hero-content position-relative text-center text-white">
            <h1 className="display-4 fw-bold mb-4">Our Export Products</h1>
            <p className="fs-5 mb-4">
              Premium agricultural products sourced from trusted farers for
              global markets
            </p>
          </div>
        </div>
      </section>

      <section
        className="py-5 products-section bg-light"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <h4 className="fw-bold mb-4 text-center px-2">
          Explore Our Diverse Product Range available for Export
        </h4>
        <div className="container mt-4">
          {isLoading ? (
            <ProductCardSkeletonGrid count={8} />
          ) : products.length > 0 ? (
            <>
              <div className="row g-4">
                {products.map((product, index) => (
                  <div
                    className="col-6 col-lg-3 col-md-4"
                    key={product.id || product._id}
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div ref={sentinelRef} className="text-center mt-4">
                {isLoadingMore && <ProductCardSkeletonGrid count={4} />}
              </div>
            </>
          ) : (
            <p className="text-center text-muted">No products found.</p>
          )}
        </div>
      </section>

      <section
        className="cta-section py-5 text-center"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="container py-5">
          <h2 className="fw-bold mb-4">Need something else?</h2>
          <Link
            to="/contact"
            className="btn btn-light text-white px-5 py-2 fw-bold rounded-pill"
          >
            Reach Out
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Products;
