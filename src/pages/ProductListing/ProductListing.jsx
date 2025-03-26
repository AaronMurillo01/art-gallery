import React, { useEffect } from "react";
import "./ProductListing.css";
import { Filter } from "./components/Filter/Filter";
import { ProductListingSection } from "./components/ProductListingSection/ProductListingSection";
import { useData } from "../../contexts/DataProvider.js";

export const ProductListing = () => {
  const { loading, error, refreshData } = useData();

  // Retry loading if there was an error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        refreshData();
      }, 5000); // Retry after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error, refreshData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong.</h2>
        <p>We're having trouble loading the products. Please try again later.</p>
        <button onClick={refreshData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Filter className="filters" />
      <ProductListingSection className="products-container" />
    </div>
  );
};