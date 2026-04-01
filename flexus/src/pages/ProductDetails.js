import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductDetailsSkeleton from "../components/ProductDetailsSkeleton";
import NotFound from "./NotFound";
import MoreImagesCarousel from "../components/MoreImagesCarousel";
import QuoteForm from "../components/QuoteForm";
import api from "../api/api";
import { selectRelatedProducts } from "../utils/productSelection";
import Seo from "../components/Seo";

const toMetaDescription = (product) => {
  const text = product?.description || product?.longDescription || "";
  if (!text) {
    return "View detailed specifications, packaging, certifications, and export availability for this Flexus agricultural product.";
  }

  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
};

const ProductDetails = () => {
  const { id } = useParams();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const suggestedProducts = useMemo(() => {
    return selectRelatedProducts(product, allProducts, 3);
  }, [allProducts, product]);

  useEffect(() => {
    let isMounted = true;

    const loadProductData = async () => {
      try {
        setIsLoading(true);
        const [{ data: productResponse }, { data: productsResponse }] =
          await Promise.all([
            api.get(`/products/${id}`, { skipAuth: true }),
            api.get("/products", {
              params: { limit: 100, excludeId: id, status: "published" },
              skipAuth: true,
            }),
          ]);

        if (!isMounted) return;

        setProduct(productResponse.data || null);
        setAllProducts(productsResponse.data || []);
      } catch {
        if (!isMounted) return;
        setProduct(null);
        setAllProducts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="m-0 p-0 product-details-page">
        <Seo
          title="Product Details"
          description="Explore detailed information about this export-grade agricultural product from Flexus Solutions."
          path={`/products/${id}`}
        />
        <ProductDetailsSkeleton />
      </main>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  return (
    <main className="m-0 p-0 product-details-page">
      <Seo
        title={`${product.name} Export Product`}
        description={toMetaDescription(product)}
        path={`/products/${product.id || product._id || id}`}
        image={product.image || "/images/flexus-icon.png"}
        type="product"
        keywords={`${product.name}, agricultural export product, bulk ${product.name}, ${product.origin || "Nigeria"} produce exporter`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.longDescription || product.description,
          image: product.image,
          sku: product.id || product._id || id,
          brand: {
            "@type": "Brand",
            name: "Flexus Solutions",
          },
          additionalProperty: [
            { "@type": "PropertyValue", name: "Origin", value: product.origin },
            { "@type": "PropertyValue", name: "Grade", value: product.grade },
            {
              "@type": "PropertyValue",
              name: "Minimum Order",
              value: product.minOrder,
            },
          ].filter((item) => item.value),
        }}
      />
      <section
        className="product-details-section py-5 bg-light"
        data-aos="fade-up"
      >
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-12 px-lg-5">
              <div className="product-details-card bg-white rounded-4 p-4 p-lg-5 shadow-sm h-100">
                <div className="product-details-top mb-4">
                  <div className="product-details-summary">
                    <h2 className="fw-bold text-brand-dark mb-3">
                      {product.name}
                    </h2>
                    <p className="text-muted mb-0">
                      {product.longDescription || product.description}
                    </p>
                  </div>

                  <div className="product-image-side-meta">
                    <div className="product-meta-item product-meta-item-compact">
                      <span className="meta-label">Origin</span>
                      <p className="mb-0 fw-medium">{product.origin || "-"}</p>
                    </div>
                    <div className="product-meta-item product-meta-item-compact">
                      <span className="meta-label">Grade</span>
                      <p className="mb-0 fw-medium">{product.grade || "-"}</p>
                    </div>
                  </div>

                  <div className="product-details-main-image-wrap">
                    <div className="product-details-image-card rounded-4 overflow-hidden shadow-sm">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="img-fluid w-100 object-fit-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Moisture</span>
                      <p className="mb-0 fw-medium">
                        {product.moisture || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Minimum Order</span>
                      <p className="mb-0 fw-medium">
                        {product.minOrder || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Packaging</span>
                      <p className="mb-0 fw-medium">
                        {product.packaging || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="product-meta-item">
                      <span className="meta-label">Shelf Life</span>
                      <p className="mb-0 fw-medium">
                        {product.shelfLife || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {Array.isArray(product.certifications) &&
                  product.certifications.length > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-bold text-brand-dark mb-2">
                        Certifications
                      </h5>
                      <div className="d-flex flex-wrap gap-2">
                        {product.certifications.map((certification) => (
                          <span
                            key={certification}
                            className="badge product-badge"
                          >
                            {certification}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(product.exportMarkets) &&
                  product.exportMarkets.length > 0 && (
                    <div className="mb-4">
                      <h5 className="fw-bold text-brand-dark mb-2">
                        Export Markets
                      </h5>
                      <p className="mb-0 text-muted">
                        {product.exportMarkets.join(", ")}
                      </p>
                    </div>
                  )}

                <MoreImagesCarousel
                  images={product.otherImages || []}
                  productName={product.name}
                />

                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <button
                    type="button"
                    onClick={() => setIsQuoteOpen(true)}
                    className="btn btn-brand-primary px-4 py-2"
                  >
                    Request Quote
                  </button>
                  <span className="text-muted small">
                    Availability: {product.availability || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="other-products-section py-5 bg-white"
        data-aos="fade-up"
      >
        <div className="container px-5">
          <h3 className="fw-bold text-brand-dark mb-4 text-center">
            Other products you might like
          </h3>
          {suggestedProducts.length > 0 ? (
            <div className="row g-4">
              {suggestedProducts.map((suggestedProduct) => (
                <div
                  className="col-12 col-sm-6 col-lg-4"
                  key={suggestedProduct.id || suggestedProduct._id}
                >
                  <ProductCard product={suggestedProduct} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted mb-0">
              No related products are available right now.
            </p>
          )}
        </div>
      </section>

      <QuoteForm
        isOpen={isQuoteOpen}
        productName={product.name}
        onClose={() => setIsQuoteOpen(false)}
      />
    </main>
  );
};

export default ProductDetails;
