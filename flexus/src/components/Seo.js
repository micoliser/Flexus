import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const DEFAULT_SITE_URL = "https://www.flexussolutions.com";
const DEFAULT_TITLE = "Flexus Solutions";
const DEFAULT_DESCRIPTION =
  "Flexus Solutions exports premium agricultural products including cashew nuts, cocoa beans, ginger, and corn to global markets with quality assurance and reliable logistics.";
const DEFAULT_IMAGE = "/images/flexus-icon.png";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getSiteUrl = () => {
  const configured = process.env.REACT_APP_SITE_URL;
  return trimTrailingSlash(configured || DEFAULT_SITE_URL);
};

const toAbsoluteUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const siteUrl = getSiteUrl();
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${siteUrl}${normalized}`;
};

const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  keywords,
  structuredData,
}) => {
  const location = useLocation();
  const siteUrl = getSiteUrl();
  const pagePath = path || location.pathname;
  const canonical = toAbsoluteUrl(pagePath);
  const imageUrl = toAbsoluteUrl(image);
  const pageTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const robots = noindex ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Flexus Solutions" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <meta name="application-name" content="Flexus Solutions" />
      <meta name="apple-mobile-web-app-title" content="Flexus Solutions" />

      {!noindex ? <meta name="author" content="Flexus Solutions" /> : null}
      {!noindex ? <meta name="publisher" content="Flexus Solutions" /> : null}

      {!noindex && structuredData ? (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      ) : null}

      <meta property="og:locale" content="en_US" />
      <meta property="og:region" content="NG" />
      <meta property="business:contact_data:country_name" content="Nigeria" />

      <meta name="theme-color" content="#14532d" />
      <meta name="format-detection" content="telephone=no" />

      <meta property="og:see_also" content={siteUrl} />
    </Helmet>
  );
};

export default Seo;
