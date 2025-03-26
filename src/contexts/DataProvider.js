import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from "react";

import { getAllCategories } from "../services/services";
import { getAllProducts } from "../services/services";
import { dataReducer, initialState } from "../reducer/dataReducer";

const DataContext = createContext();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!lastFetchTime) return false;
    const now = new Date().getTime();
    return now - lastFetchTime < CACHE_DURATION;
  }, [lastFetchTime]);

  // Memoized function to get all products
  const getAllSneakers = useCallback(async (forceRefresh = false) => {
    // If cache is valid and we're not forcing a refresh, use cached data
    if (isCacheValid() && !forceRefresh && state.allProductsFromApi.length > 0) {
      return;
    }

    try {
      setError(false);
      setLoading(true);
      const response = await getAllProducts();
      
      if (response.request.status === 200) {
        // Randomize products for variety
        const randomizedProducts = [...response.data.products]
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
        
        dispatch({
          type: "GET_ALL_PRODUCTS_FROM_API",
          payload: randomizedProducts,
        });
        
        // Update cache timestamp
        setLastFetchTime(new Date().getTime());
      }
    } catch (error) {
      setError(true);
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, state.allProductsFromApi.length]);

  // Memoized function to get all categories
  const getCategories = useCallback(async () => {
    // If we already have categories, don't fetch again
    if (state.allCategories.length > 0) return;
    
    try {
      const response = await getAllCategories();
      if (response.request.status === 200) {
        dispatch({
          type: "GET_ALL_CATEGORIES",
          payload: response.data.categories,
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [state.allCategories.length]);

  // Function to refresh data (exposed to components)
  const refreshData = useCallback(() => {
    getAllSneakers(true);
    getCategories();
  }, [getAllSneakers, getCategories]);

  useEffect(() => {
    getAllSneakers();
    getCategories();
  }, [getAllSneakers, getCategories]);

  return (
    <DataContext.Provider value={{ 
      state, 
      dispatch, 
      loading, 
      error,
      refreshData 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);