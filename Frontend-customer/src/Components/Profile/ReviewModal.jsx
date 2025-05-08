import React, { useState } from 'react';
import { X, Star, Upload, Trash2 } from 'lucide-react';
import axios from 'axios';

const ReviewModal = ({ isOpen, onClose, product, orderId }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prev => [...prev, ...newImages]);
    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // Change this URL to point to the correct endpoint
      const response = await axios.post('http://localhost:5000/api/reviews/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.image_url || response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // First, create the review
      const reviewData = {
        order_id: orderId,
        product_id: product.id,
        rating,
        review_text: reviewText
      };
      
      // Submit the review to get the review_id
      const reviewResponse = await axios.post('http://localhost:5000/api/reviews', reviewData);
      const reviewId = reviewResponse.data.review_id;
      
      // Upload each image to Cloudinary and save the URLs
      if (images.length > 0) {
        for (const image of images) {
          try {
            const imageUrl = await uploadImageToCloudinary(image.file);
            
            // Save the image URL in the review_images table
            await axios.post('http://localhost:5000/api/reviews/images', {
              review_id: reviewId,
              image_url: imageUrl
            });
          } catch (imageError) {
            console.error('Error processing image:', imageError);
          }
        }
      }
      
      setSuccess('Review submitted successfully!');
      setTimeout(() => {
        // Reset form
        setRating(0);
        setReviewText('');
        setImages([]);
        setSuccess('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-bold">Write a Review</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-gray-500">Rs.{product.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}
            
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Photos (max 3)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Review ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple={images.length === 0}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 transition">
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Upload up to 3 images to show your experience
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rating || !reviewText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewModal;
