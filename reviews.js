// Function to open review modal
function openReviewModal(productId, productName) {
    const modal = document.getElementById('reviewModal');
    modal.style.display = 'flex';
    modal.dataset.productId = productId;
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

// Function to setup star rating selection
function setupStarRating() {
    const stars = document.querySelectorAll('#reviewModal .star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            const modal = document.getElementById('reviewModal');
            modal.dataset.rating = rating;

            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('fa-solid');
                    s.classList.remove('fa-regular');
                } else {
                    s.classList.add('fa-regular');
                    s.classList.remove('fa-solid');
                }
            });

            // Hide error message if any
            document.getElementById('ratingError').style.display = 'none';
        });
    });
}


function closeReviewConfirmation() {
    const reviewConfirmationModal = document.getElementById('reviewConfirmationModal');
    reviewConfirmationModal.classList.remove('show');
    reviewConfirmationModal.style.display = 'none'; // or ''
}



// Function to submit a review to backend API
async function submitReview(event) {
    event.preventDefault();
    const modal = document.getElementById('reviewModal');
    const productId = modal.dataset.productId;
    const rating = modal.dataset.rating;
    const reviewText = document.getElementById('reviewText').value;

    if (!rating) {
        const errorDiv = document.getElementById('ratingError');
        errorDiv.textContent = 'Please select a star rating before submitting your review.';
        errorDiv.style.display = 'block';
        return false;
    }

    document.getElementById('ratingError').style.display = 'none';

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to submit a review.');
        return false;
    }

    try {
        const response = await fetch('http://localhost:3001/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                productId: productId,
                rating: parseInt(rating),
                text: reviewText
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
                alert('You are not logged in. Please log in to submit a review.');
            } else if (response.status === 403) {
                alert('Your session has expired or token is invalid. Please log in again.');
            } else {
                alert('Error submitting review: ' + (errorData.message || response.statusText));
            }
            return false;
        }

        closeReviewModal();
        document.getElementById('reviewText').value = '';

        const confirmationModal = document.getElementById('reviewConfirmationModal');
        confirmationModal.style.display = 'flex';
        confirmationModal.classList.add('show');

        updateProductRating(productId);

        return true;
    } catch (error) {
        alert('Network error: ' + error.message);
        return false;
    }
}

// Function to fetch and update product rating display from backend API
async function updateProductRating(productId) {
    try {
          // Log the product ID to confirm we're fetching reviews for the correct product
        console.log('Fetching reviews for productId:', productId);

         // Fetch reviews for the given productId from the backend API
        const response = await fetch(`http://localhost:3001/api/reviews/${productId}`);

         // Check if the response is OK (status 200), if not, log an error
        if (!response.ok) {
            console.error('Failed to fetch reviews for product:', productId);
            return; // Exit the function if fetching failed
        }

        // Parse the response data (reviews) as JSON
        const reviews = await response.json();
        console.log('Reviews fetched:', reviews); // Log the reviews data for debugging

         // Select the product container on the page using the productId
        const productContainer = document.querySelector(`[data-product-id="${productId}"]`);

          // Check if the product container exists on the page
        if (!productContainer) {
            console.warn('Product card not found for productId:', productId);
            return; // Exit if the product container was not found
        }

         // Find the specific product card inside the container
        const card = productContainer.querySelector('.product-card');

        // Check if the product card exists
        if (!card) {
            console.warn('Inner product card element not found for productId:', productId);
            return; // Exit if the product card element is not found
        }

          // Calculate the average rating from the reviews
        const stars = card.querySelectorAll('.rating-display .stars i');
        const reviewCount = card.querySelector('.review-count');

        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
            stars.forEach((star, index) => {
                if (index < Math.round(avgRating)) {
                    star.classList.add('fa-solid');
                    star.classList.remove('fa-regular');
                } else {
                    star.classList.add('fa-regular');
                    star.classList.remove('fa-solid');
                }
            });
        } else {
            // If no reviews, reset stars to empty and review count to 0
            stars.forEach(star => {
                star.classList.add('fa-regular');
                star.classList.remove('fa-solid');
            });
            reviewCount.textContent = '(0 reviews)';
        }

        reviewCount.textContent = `(${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`;
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

// Function to update all product ratings on page load
function updateAllProductRatings() {
    const productContainers = document.querySelectorAll('[data-product-id]');
    productContainers.forEach(container => {
        const productId = container.getAttribute('data-product-id');
        if (productId) {
            updateProductRating(productId);
        }
    });
}

// Also update ratings when additional products are shown
function viewMoreProducts() {
    const additionalProducts = document.getElementById('additional-products');
    const viewMoreButton = document.getElementById('viewMoreButton');

    if (additionalProducts.style.display === 'none') {
        additionalProducts.style.display = 'block'; // Show additional products
        viewMoreButton.style.display = 'none'; // Hide the button

        // Update ratings for newly shown products
        updateAllProductRatings();
    }
}
