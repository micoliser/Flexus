const normalizeTags = (tags = []) => {
  if (!Array.isArray(tags)) return [];

  return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
};

const getTimeValue = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const selectRelatedProducts = (
  currentProduct,
  products = [],
  limit = 3,
) => {
  if (!currentProduct || !Array.isArray(products)) return [];

  const currentId = currentProduct.id || currentProduct._id;
  const currentTags = new Set(normalizeTags(currentProduct.tags));

  return [...products]
    .filter((product) => {
      const productId = product.id || product._id;
      return productId && productId !== currentId;
    })
    .map((product) => {
      const tagOverlap = normalizeTags(product.tags).reduce((count, tag) => {
        return count + (currentTags.has(tag) ? 1 : 0);
      }, 0);

      return {
        product,
        tagOverlap,
      };
    })
    .sort((left, right) => {
      if (right.tagOverlap !== left.tagOverlap) {
        return right.tagOverlap - left.tagOverlap;
      }

      if (
        (right.product.isFeatured === true) !==
        (left.product.isFeatured === true)
      ) {
        return (
          Number(right.product.isFeatured === true) -
          Number(left.product.isFeatured === true)
        );
      }

      return (
        getTimeValue(right.product.updatedAt || right.product.createdAt) -
        getTimeValue(left.product.updatedAt || left.product.createdAt)
      );
    })
    .slice(0, limit)
    .map((entry) => entry.product);
};
