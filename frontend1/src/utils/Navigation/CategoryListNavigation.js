import slugify from "../SlugifyUrl";
const HandleCategoryClick = (
  clickedProduct,
  subCategory,
  products,
  navigate
) => {
  let prodCategory = null;
  let prodSubCategory = null;
  let prodname = null;
  let productId = null;

  if (clickedProduct) {
    prodCategory = slugify(clickedProduct.category);
    prodSubCategory = slugify(clickedProduct.subCategory);
   
    prodname = slugify(clickedProduct.name);
    productId = clickedProduct._id;
  } else {
    console.log("else part")
    // products.forEach((item) => {
      // if (item.subCategory === subCategory) {
        prodSubCategory = slugify(products[0].subCategory);
        prodCategory = slugify(products[0].category);
        prodname = slugify(products[0].name);
        productId = products[0]._id;
      // }
    // });
  }
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
