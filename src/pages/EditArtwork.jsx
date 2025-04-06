import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtworkById, updateArtwork } from '../api';
import '../styles/EditArtwork.css';

const EditArtwork = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        is_available: true,
        image: null,
        imagePreview: null
    });

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const data = await getArtworkById(id);
                setArtwork(data);
                setFormData({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    is_available: data.is_available,
                    image: null,
                    imagePreview: data.image
                });
            } catch (err) {
                console.error('Error fetching artwork:', err);
                setError('Failed to load artwork');
            } finally {
                setLoading(false);
            }
        };

        fetchArtwork();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('is_available', formData.is_available);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            console.log('Submitting artwork with is_available:', formData.is_available);
            await updateArtwork(id, formDataToSend);
            navigate(`/artwork/${id}`);
        } catch (err) {
            console.error('Error updating artwork:', err);
            setError('Failed to update artwork');
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading artwork...</p>
        </div>
    );

    if (error) return <div className="error-message">{error}</div>;
    if (!artwork) return <div className="error-message">Artwork not found</div>;

    return (
        <div className="edit-artwork-container">
            <h1>Edit Artwork</h1>
            <form onSubmit={handleSubmit} className="edit-artwork-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
                
                <div className="form-group checkbox-group">
                    <label htmlFor="is_available" className="checkbox-label">
                        <input
                            type="checkbox"
                            id="is_available"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleInputChange}
                        />
                        Available for Purchase
                    </label>
                    <div className="availability-hint">
                        {formData.is_available 
                            ? "This artwork can be added to cart and purchased." 
                            : "This artwork is not available for purchase."}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    {formData.imagePreview && (
                        <div className="image-preview">
                            <img src={formData.imagePreview} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Update Artwork
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(`/artwork/${id}`)}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditArtwork; 