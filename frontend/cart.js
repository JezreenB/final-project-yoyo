document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-container');
  const totalAmountElement = document.getElementById('total-amount');
  const cartCountElement = document.getElementById('cart-count');
  const checkoutButton = document.getElementById('checkout-btn');
  const totalAmountCheckout = document.getElementById('totalAmountCheckout');
  const checkoutForm = document.getElementById('checkoutForm');
  const selectAllCheckbox = document.getElementById('select-all-checkbox');

  let cart = [];
  let selectedIndices = new Set();

  // Helper function to get auth token (adjust as per your auth implementation)
  function getAuthToken() {
    return localStorage.getItem('token'); // example: token stored in localStorage
  }

  // Fetch cart items from backend
  async function fetchCartItems() {
    try {
       // Make a GET request to the server to fetch the cart items
      const response = await fetch('/api/cart', {
        headers: {
          // Include the authentication token in the request headers for authorization
          'Authorization': 'Bearer ' + getAuthToken()
        }
      });
       // Check if the response was successful (status 200)
      if (!response.ok) throw new Error('Failed to fetch cart items');

      // Parse the response as JSON (the cart data returned from the backend)
      const data = await response.json();

      // Map the response data to a format that will be used in the UI
      cart = data.map(item => ({
        _id: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
      imgSrc: (item.productId.images && item.productId.images.length > 0) ? item.productId.images[0] : ''
      }));

      // Update the UI with the fetched cart items
      updateCartUI();

    } catch (error) {
       // Log any errors that occur during the fetch process
      console.error(error);
    }
  }

  // Update cart UI
  function updateCartUI() {
    cartContainer.innerHTML = '';
    if (cart.length === 0) {
      cartContainer.innerHTML = '<p>Your cart is empty.</p>';
      totalAmountElement.textContent = '0.00';
      cartCountElement.textContent = '0';
      checkoutButton.disabled = true;
      return;
    }

    cart.forEach((product, index) => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('cart-item', 'd-flex', 'align-items-center', 'mb-3');

      productDiv.innerHTML = `
        <img src="${product.imgSrc}" alt="${product.name}" class="cart-item-image"/>
        <div class="details">
          <h5>${product.name}</h5>
          <p>$${product.price.toFixed(2)}</p>
          <p>Quantity: ${product.quantity}</p>
          <label>
            <input type="checkbox" class="checkout-checkbox" data-index="${index}">
            Select for Checkout
          </label>
        </div>
        <button class="remove-btn btn" data-index="${index}"><i class="fas fa-trash"></i> Remove</button>
      `;

      cartContainer.appendChild(productDiv);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const index = e.target.closest('button').dataset.index;
        await removeCartItem(cart[index]._id);
        cart.splice(index, 1);
        updateCartUI();
        updateSelectedTotals();
      });
    });

    // Add event listeners for checkout checkboxes
    document.querySelectorAll('.checkout-checkbox').forEach(checkbox => {
      checkbox.checked = selectedIndices.has(parseInt(checkbox.dataset.index));
      checkbox.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (e.target.checked) {
          selectedIndices.add(idx);
        } else {
          selectedIndices.delete(idx);
        }
        updateSelectedTotals();
        updateSelectAllCheckbox();
      });
    });

    updateSelectedTotals();
  }

  // Update selected totals
  function updateSelectedTotals() {
    let totalAmount = 0;
    let productCount = 0;
    selectedIndices.forEach(idx => {
      if (cart[idx]) {
        totalAmount += cart[idx].quantity * cart[idx].price;
        productCount++;
      }
    });
    totalAmountElement.textContent = totalAmount.toFixed(2);
    cartCountElement.textContent = productCount;
    totalAmountCheckout.value = `$${totalAmount.toFixed(2)}`;
    checkoutButton.disabled = productCount === 0;
  }

  // Update select all checkbox state
  function updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('.checkout-checkbox');
    const checkedCount = document.querySelectorAll('.checkout-checkbox:checked').length;
    selectAllCheckbox.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
  }

  // Select all checkbox event
  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = document.querySelectorAll('.checkout-checkbox');
    if (selectAllCheckbox.checked) {
      checkboxes.forEach(cb => {
        cb.checked = true;
        selectedIndices.add(parseInt(cb.dataset.index));
      });
    } else {
      checkboxes.forEach(cb => {
        cb.checked = false;
      });
      selectedIndices.clear();
    }
    updateSelectedTotals();
  });

  // API call to remove cart item
  async function removeCartItem(cartItemId) {
    try {
    const response = await fetch('/api/cart/' + cartItemId, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + getAuthToken()
      }
    });
      if (!response.ok) throw new Error('Failed to remove cart item');
    } catch (error) {
      console.error(error);
    }
  }

  // Checkout button click handler
  checkoutButton.addEventListener('click', async () => {
    if (selectedIndices.size === 0) return;

    // Fetch user profile data to prefill Full Name and Address
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': 'Bearer ' + getAuthToken()
        }
      });
      if (response.ok) {
        const userData = await response.json();
        const fullNameInput = document.getElementById('fullName');
        const addressInput = document.getElementById('address');
        if (fullNameInput) fullNameInput.value = userData.fullName || '';
        if (addressInput) addressInput.value = userData.address || '';
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }

    $('#checkoutModal').modal('show');
  });

  // Checkout form submission handler
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }
    const deliveryAddress = document.getElementById('address').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const shippingMethod = document.getElementById('shippingMethod').value;
    const items = Array.from(selectedIndices).map(idx => ({
      productId: cart[idx].productId,
      quantity: cart[idx].quantity,
      price: cart[idx].price
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          deliveryAddress,
          paymentMethod,
          shippingMethod,
          items,
          clearCart: true
        })
      });

      if (!response.ok) throw new Error('Failed to place order');

      const responseData = await response.json();
      const orderNumber = responseData.orderNumber;

      $('#checkoutModal').modal('hide');

      // Remove ordered items from cart locally
      cart = cart.filter((item, idx) => !selectedIndices.has(idx));
      selectedIndices.clear();
      updateCartUI();

      // Redirect or show modal based on payment method
      const paymentRedirectUrls = {
        'paypal': 'https://www.paypal.com/signin',
        'gcash': 'https://www.gcash.com/',
        'paymaya': 'https://www.paymaya.com/'
      };

      if (paymentMethod === 'cash-on-delivery') {
        // Show order number modal for cash on delivery
        const completeModalBody = document.querySelector('#completePurchaseModal .modal-body');
        completeModalBody.innerHTML = `
          <p>Your purchase has been successfully completed! Thank you for shopping with us.</p>
          <p><strong>Your Order Number:</strong> <span id="displayOrderNumber">${orderNumber}</span></p>
          <p>Please save this order number for tracking your order.</p>
        `;

        $('#completePurchaseModal').modal('show');
        setTimeout(() => {
          $('#completePurchaseModal').modal('hide');
          // Reset modal body content to original after hiding
          completeModalBody.innerHTML = 'Your purchase has been successfully completed! Thank you for shopping with us.';
        }, 8000);
      } else if (paymentRedirectUrls[paymentMethod]) {
        // Redirect to payment provider for other payment methods
        window.location.href = paymentRedirectUrls[paymentMethod];
      }

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  });

  // Initial fetch and render
  fetchCartItems();
});
