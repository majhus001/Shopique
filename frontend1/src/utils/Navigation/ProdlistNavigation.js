import slugify from "../SlugifyUrl";

const HandleProdlistNavigation = (item, navigate) => {
    const prodSubCategory = slugify(item.subCategory);
    const prodCategory = slugify(item.category);
    const prodname = slugify(item.name);
    const productId = item._id;
    navigate(
      `/products/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`,
      {
        state: {
          product: item,
        },
      }
    );
  };

  export default HandleProdlistNavigation;