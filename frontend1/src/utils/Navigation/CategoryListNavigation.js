import slugify from "../SlugifyUrl";

const HandleCategoryClick = (clickedProduct, navigate) => {
  const prodCategory = slugify(clickedProduct.category);
  const prodSubCategory = slugify(clickedProduct.subCategory);

  const prodname = slugify(clickedProduct.name);
  const productId = clickedProduct._id;

  navigate(
    `/products/search/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`,
    {
      state: {
        clickedProduct,
        productCategory: prodCategory,
        productSubCategory: prodSubCategory,
      },
    }
  );
};

export default HandleCategoryClick;
