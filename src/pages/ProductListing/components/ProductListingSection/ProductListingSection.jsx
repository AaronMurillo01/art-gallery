import "./ProductListingSection.css";
import Tilt from "react-parallax-tilt";
import React, { useState, useEffect, useCallback, useMemo } from "react";

import { useData } from "../../../../contexts/DataProvider.js";
import { Link } from "react-router-dom";
import { getCategoryWiseProducts } from "../../../../helpers/filter-functions/category";
import { getRatedProducts } from "../../../../helpers/filter-functions/ratings";
import { getPricedProducts } from "../../../../helpers/filter-functions/price";
import { getSortedProducts } from "../../../../helpers/filter-functions/sort";
import { getSearchedProducts } from "../../../../helpers/searchedProducts";
import { AiOutlineHeart } from "react-icons/ai";
import { AiTwotoneHeart } from "react-icons/ai";
import { useUserData } from "../../../../contexts/UserDataProvider.js";
import LazyImage from "../../../../components/LazyImage/LazyImage";

import { BsFillStarFill } from "react-icons/bs";

// Product Card component for better code organization
const ProductCard = ({ product, isProductInCart, isProductInWishlist, wishlistHandler, addToCartHandler, cartLoading }) => {
  const {
    _id,
    id,
    name,
    original_price,
    discounted_price,
    category_name,
    is_stock,
    rating,
    reviews,
    trending,
    img,
  } = product;

  return (
    <Tilt
      key={_id}
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      glareEnable={false}
      transitionSpeed={2000}
      scale={1.02}
    >
      <div className="product-card" key={_id}>
        <Link to={`/product-details/${id}`}>
          <div className="product-card-image">
            <Tilt
              transitionSpeed={2000}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              scale={1.08}
            >
              <LazyImage src={img} alt={name} />
            </Tilt>
          </div>
        </Link>

        <div className="product-card-details">
          <h3>{name}</h3>
          <p className="ratings">
            {rating}
            <BsFillStarFill color="orange" /> ({reviews} reviews){" "}
          </p>
          <div className="price-container">
            <p className="original-price">${original_price}</p>
            <p className="discount-price">${discounted_price}</p>
          </div>

          <p>Genre: {category_name}</p>
          <div className="info">
            {!is_stock && <p className="out-of-stock">Out of stock</p>}
            {trending && <p className="trending">Trending</p>}
          </div>
        </div>

        <div className="product-card-buttons">
          <button
            disabled={cartLoading}
            onClick={() => addToCartHandler(product)}
            className="cart-btn"
          >
            {!isProductInCart(product) ? "Add To Cart" : "Go to Cart"}
          </button>
          <button
            onClick={() => wishlistHandler(product)}
            className="wishlist-btn"
          >
            {!isProductInWishlist(product) ? (
              <AiOutlineHeart size={30} />
            ) : (
              <AiTwotoneHeart
                color="red"
                size={30}
              />
            )}
          </button>
        </div>
      </div>
    </Tilt>
  );
};

export const ProductListingSection = () => {
  const { state } = useData();
  const {
    isProductInCart,
    isProductInWishlist,
    wishlistHandler,
    addToCartHandler,
    cartLoading,
  } = useUserData();

  const {
    allProductsFromApi,
    inputSearch,
    filters: { rating, categories, price, sort },
  } = state;

  // Use useMemo to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    const searchedProducts = getSearchedProducts(allProductsFromApi, inputSearch);
    const ratedProducts = getRatedProducts(searchedProducts, rating);
    const categoryProducts = getCategoryWiseProducts(ratedProducts, categories);
    const pricedProducts = getPricedProducts(categoryProducts, price);
    return getSortedProducts(pricedProducts, sort);
  }, [allProductsFromApi, inputSearch, rating, categories, price, sort]);

  // Virtual list implementation for better performance
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  // Load more products when scrolling
  const loadMoreProducts = useCallback(() => {
    const startIndex = 0;
    const endIndex = page * productsPerPage;
    setVisibleProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, page]);

  // Handle scroll event to implement infinite scrolling
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500 &&
      visibleProducts.length < filteredProducts.length
    ) {
      setPage(prevPage => prevPage + 1);
    }
  }, [visibleProducts.length, filteredProducts.length]);

  useEffect(() => {
    loadMoreProducts();
  }, [loadMoreProducts, page]);

  useEffect(() => {
    setPage(1);
  }, [filteredProducts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="product-card-container">
      {!filteredProducts.length ? (
        <h2 className="no-products-found">
          Sorry, there are no matching products!
        </h2>
      ) : (
        visibleProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isProductInCart={isProductInCart}
            isProductInWishlist={isProductInWishlist}
            wishlistHandler={wishlistHandler}
            addToCartHandler={addToCartHandler}
            cartLoading={cartLoading}
          />
        ))
      )}
      {visibleProducts.length < filteredProducts.length && (
        <div className="loading-more">Loading more products...</div>
      )}
    </div>
  );
};