import React from "react";
import PropTypes from "prop-types";
import "../styles/CategoryFilter.css";

const CategoryFilter = ({ categories, category, setCategory }) => {
  return (
    <div className="faq-category-filter">
      {categories.map((cat) => (
        <button
          key={cat.value}
          className={category === cat.value ? "faq-active" : ""}
          onClick={() => setCategory(cat.value)}
          aria-current={category === cat.value ? "true" : undefined}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired, 
      name: PropTypes.string.isRequired, 
    })
  ).isRequired,
  category: PropTypes.string.isRequired, 
  setCategory: PropTypes.func.isRequired, 
};

export default CategoryFilter;
