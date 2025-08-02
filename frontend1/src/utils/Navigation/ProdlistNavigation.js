import slugify from "../SlugifyUrl";

const HandleProdlistNavigation = (item, navigate) => {
  console.log(item._id);
  const prodSubCategory = slugify(item.subCategory);
  const prodCategory = slugify(item.category);
  const prodname = slugify(item.name);
  const productId = item.productId || item._id;
  navigate(
    `/products/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`
  );
};

export default HandleProdlistNavigation;
