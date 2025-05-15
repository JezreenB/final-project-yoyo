// Function to open review modal
function openReviewModal(productName) {
    const modal = document.getElementById('reviewModal');
    modal.style.display = 'flex';
    modal.dataset.productName = productName;
    
    // Reset stars and rating
    const stars = document.querySelectorAll('#reviewModal .star-rating i');
    stars.forEach(star => {
        star.classList.remove('fa-solid');
        star.classList.add('fa-regular');
    });
    delete modal.dataset.rating;
    
    // Clear any previous error
    document.getElementById('ratingError').style.display = 'none';
    document.getElementById('reviewText').value = '';
    
    // Reinitialize star rating
    setupStarRating();

    // Close when clicking outside modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Function to close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

// Function to close review confirmation modal
function closeReviewConfirmation() {
    document.getElementById('reviewConfirmationModal').style.display = 'none';
}

// Function to handle star rating selection
function setupStarRating() {
    const stars = document.querySelectorAll('#reviewModal .star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('fa-solid');
                    s.classList.remove('fa-regular');
                } else {
                    s.classList.add('fa-regular');
                    s.classList.remove('fa-solid');
                }
            });
            
            // Store selected rating
            document.getElementById('reviewModal').dataset.rating = rating;
        });
    });
}

// Function to submit a review
function submitReview() {
    const modal = document.getElementById('reviewModal');
    const productName = modal.dataset.productName;
    const rating = modal.dataset.rating;
    const reviewText = document.getElementById('reviewText').value;
    
    if (!rating) {
        // Show error message
        const errorDiv = document.getElementById('ratingError');
        errorDiv.textContent = 'Please select a star rating before submitting your review.';
        errorDiv.style.display = 'block';
        return false;
    }
    
    // Clear any previous error
    document.getElementById('ratingError').style.display = 'none';
    
    // Get existing reviews from localStorage or initialize
    let reviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    
    // Add new review
    if (!reviews[productName]) {
        reviews[productName] = [];
    }
    
    reviews[productName].push({
        rating: parseInt(rating),
        text: reviewText,
        date: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('productReviews', JSON.stringify(reviews));
    
    // Close modal and reset
    closeReviewModal();
    document.getElementById('reviewText').value = '';
    
    // Update product rating display
    updateProductRating(productName);
    
    // Show confirmation
    document.getElementById('reviewConfirmationModal').style.display = 'flex';
    return true;
}

// Function to update product rating display
function updateProductRating(productName) {
    console.log('Updating rating for product:', productName);
    const reviews = JSON.parse(localStorage.getItem('productReviews')) || {};
    const productReviews = reviews[productName] || [];
    console.log('Found reviews:', productReviews);
    
    // Find all instances of this product's rating display
    document.querySelectorAll('.product-card').forEach(card => {
        const cardProductName = card.querySelector('h3').textContent.trim();
        if (cardProductName === productName.trim()) {
            const stars = card.querySelectorAll('.rating-display .stars i');
            const reviewCount = card.querySelector('.review-count');
            
            // Update stars if there are reviews
            if (productReviews.length > 0) {
                const avgRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
                stars.forEach((star, index) => {
                    if (index < Math.round(avgRating)) {
                        star.classList.add('fa-solid');
                        star.classList.remove('fa-regular');
                    } else {
                        star.classList.add('fa-regular');
                        star.classList.remove('fa-solid');
                    }
                });
            }
            
            // Always update review count, even if 0
            reviewCount.textContent = `(${productReviews.length} ${productReviews.length === 1 ? 'review' : 'reviews'})`;
        }
    });
}

// Initialize star rating functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupStarRating();
    
    // Update all product ratings on page load
    const products = document.querySelectorAll('.product-card h3');
    products.forEach(product => {
        updateProductRating(product.textContent);
    });
});