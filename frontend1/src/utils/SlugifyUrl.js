  const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, "");     // trim starting/ending hyphens
};

export default slugify;