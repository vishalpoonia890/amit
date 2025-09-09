import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductView.css'; // You'll need to create this CSS file

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://investmentpro-nu7s.onrender.com';
  } else {
    return '';
  }
};

const API_BASE_URL = getApiBaseUrl();

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
};

function ProductView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data.products);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="product-view-container">
      <h2>Our Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-display-card">
            <img src={product.imageUrl} alt={product.name} className="product-display-image" />
            <div className="product-display-details">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-display-price">{formatCurrency(product.price)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductView;
