// src/components/AdminProductManagementView.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const getApiBaseUrl = () => process.env.NODE_ENV === 'production' ? 'https://investmentpro-nu7s.onrender.com' : '';
const API_BASE_URL = getApiBaseUrl();

const initialFormState = { name: '', category: '', price: '', daily_roi: '', duration_days: '', image: null };

function AdminProductManagementView({ token }) {
    const [products, setProducts] = useState([]);
    const [productForm, setProductForm] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(res.data.products || []);
        } catch (error) { console.error("Failed to fetch products", error); }
    }, [token]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleInputChange = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setProductForm({ ...productForm, image: e.target.files[0] });

    const handleEditClick = (product) => {
        setIsEditing(true);
        setSelectedProductId(product.id);
        setProductForm({ name: product.name, category: product.category, price: product.price, daily_roi: product.daily_roi, duration_days: product.duration_days, image: null });
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (error) { alert("Failed to delete product."); }
    };

    const resetForm = () => {
        setIsEditing(false);
        setSelectedProductId(null);
        setProductForm(initialFormState);
        document.getElementById("product-form").reset(); // Reset file input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(productForm).forEach(key => {
            if (productForm[key] !== null) formData.append(key, productForm[key]);
        });

        const url = isEditing
            ? `${API_BASE_URL}/api/products/${selectedProductId}`
            : `${API_BASE_URL}/api/products`;
        
        const method = isEditing ? 'put' : 'post';

        try {
            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
            resetForm();
            fetchProducts();
        } catch (error) {
            alert(`Failed to ${isEditing ? 'update' : 'create'} product.`);
        }
    };

    return (
        <div className="admin-view">
            <h2>Product Management</h2>
            <div className="product-management-layout">
                <div className="product-form-container">
                    <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                    <form id="product-form" onSubmit={handleSubmit}>
                        <input type="text" name="name" placeholder="Product Name" value={productForm.name} onChange={handleInputChange} required />
                        <input type="text" name="category" placeholder="Category (e.g., Premium)" value={productForm.category} onChange={handleInputChange} required />
                        <input type="number" name="price" placeholder="Price (INR)" value={productForm.price} onChange={handleInputChange} required />
                        <input type="number" name="daily_roi" placeholder="Daily ROI (%)" value={productForm.daily_roi} onChange={handleInputChange} required />
                        <input type="number" name="duration_days" placeholder="Duration (Days)" value={productForm.duration_days} onChange={handleInputChange} required />
                        <label>Product Image</label>
                        <input type="file" name="image" onChange={handleFileChange} />
                        <div className="form-buttons">
                            <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
                            {isEditing && <button type="button" onClick={resetForm}>Cancel Edit</button>}
                        </div>
                    </form>
                </div>
                <div className="product-list-container">
                    <h3>Existing Products</h3>
                    <div className="product-list">
                        {products.length > 0 ? products.map(p => (
                            <div key={p.id} className="product-card-admin">
                                <img src={p.imageUrl} alt={p.name} />
                                <div className="product-details">
                                    <h4>{p.name}</h4>
                                    <p>Category: {p.category}</p>
                                    <p>Price: {formatCurrency(p.price)}</p>
                                    <p>Daily ROI: {p.daily_roi}%</p>
                                </div>
                                <div className="product-actions">
                                    <button onClick={() => handleEditClick(p)}>Edit</button>
                                    <button onClick={() => handleDelete(p.id)} className="delete-btn">Delete</button>
                                </div>
                            </div>
                        )) : <p>No products found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add a helper here since it's used
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

export default AdminProductManagementView;
