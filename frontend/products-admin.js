document.addEventListener('DOMContentLoaded', function() {
    const productsTableBody = document.querySelector('table tbody');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const bulkUpdateStockBtn = document.getElementById('bulkUpdateStockBtn');
    const bulkCategoryBtn = document.getElementById('bulkCategoryBtn');
    const selectAllCheckbox = document.getElementById('selectAll');

    const searchInput = document.getElementById('searchProducts');
    const categorySelect = document.getElementById('filterCategory');
    const filterButton = document.querySelector('.card-body .btn-secondary');

    // Modals and modal buttons
    const deleteConfirmModalElement = document.getElementById('deleteConfirmModal');
    const deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalElement);
    const confirmDeleteBtn = document.getElementById('confirmDelete');

    const bulkUpdateStockModalElement = document.getElementById('bulkUpdateStockModal');
    const bulkUpdateStockModal = new bootstrap.Modal(bulkUpdateStockModalElement);
    const confirmBulkStockBtn = document.getElementById('confirmBulkStock');
    const bulkStockQuantityInput = document.getElementById('bulkStockQuantity');

    const bulkChangeCategoryModalElement = document.getElementById('bulkChangeCategoryModal');
    const bulkChangeCategoryModal = new bootstrap.Modal(bulkChangeCategoryModalElement);
    const confirmBulkCategoryBtn = document.getElementById('confirmBulkCategory');
    const bulkCategorySelect = document.getElementById('bulkCategory');

    const addProductModalElement = document.getElementById('addProductModal');
    const addProductModal = new bootstrap.Modal(addProductModalElement);
    const addProductForm = document.getElementById('addProductForm');

    const editProductModalElement = document.getElementById('editProductModal');
    const editProductModal = new bootstrap.Modal(editProductModalElement);
    const editProductForm = document.getElementById('editProductForm');

    let selectedProductIds = [];
    let productIdToDelete = null; // For individual delete
    let currentEditProductId = null;

    // Setup image upload previews and click-to-upload for add product modal
    const addImageUploadPreviews = document.querySelectorAll('#addProductModal .image-upload-preview');
    addImageUploadPreviews.forEach(previewDiv => {
        const fileInput = previewDiv.querySelector('input[type="file"]');
        const placeholder = previewDiv.querySelector('.upload-placeholder');
        const removeBtn = previewDiv.querySelector('.remove-image-btn');
        const imagePreview = previewDiv.querySelector('.image-preview');

        previewDiv.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('d-none');
                    placeholder.classList.add('d-none');
                    removeBtn.classList.remove('d-none');
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                imagePreview.src = '';
                imagePreview.classList.add('d-none');
                placeholder.classList.remove('d-none');
                removeBtn.classList.add('d-none');
            }
        });

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.value = '';
            imagePreview.src = '';
            imagePreview.classList.add('d-none');
            placeholder.classList.remove('d-none');
            removeBtn.classList.add('d-none');
        });
    });


    // Setup image upload previews and click-to-upload for edit product modal
    const editImageUploadPreviews = document.querySelectorAll('#editProductModal .image-upload-preview');
    editImageUploadPreviews.forEach(previewDiv => {
        const fileInput = previewDiv.querySelector('input[type="file"]');
        const placeholder = previewDiv.querySelector('.upload-placeholder');
        const removeBtn = previewDiv.querySelector('.remove-image-btn');

        previewDiv.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    placeholder.style.backgroundImage = `url(${e.target.result})`;
                    placeholder.textContent = '';
                    placeholder.style.backgroundSize = 'cover';
                    placeholder.style.backgroundPosition = 'center';
                    removeBtn.classList.remove('d-none');
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                placeholder.style.backgroundImage = '';
                placeholder.textContent = 'Click to upload';
                removeBtn.classList.add('d-none');
            }
        });

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Remove the corresponding image from existingImages array if it exists
            const bgImageUrl = placeholder.style.backgroundImage.slice(5, -2);
            const index = existingImages.findIndex(img => img === bgImageUrl);
            if (index !== -1) {
                existingImages.splice(index, 1);
            }
            fileInput.value = '';
            placeholder.style.backgroundImage = '';
            placeholder.textContent = 'Click to upload';
            removeBtn.classList.add('d-none');
        });
    });

    // Add event listener for edit buttons to populate edit modal fields including image previews
    function setupEditButtons(products) {
        const editButtons = document.querySelectorAll('.edit-product-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                const product = products.find(p => p._id === productId);
                if (!product) {
                    alert('Product data not found');
                    return;
                }
                currentEditProductId = productId;
                // Populate form fields
                editProductForm.editProductName.value = product.name || '';
                editProductForm.editCategory.value = product.category || '';
                editProductForm.editPrice.value = product.price != null ? product.price.toFixed(2) : '';
                editProductForm.editStock.value = product.stock != null ? product.stock : '';

                // Clear previous image previews
                editImageUploadPreviews.forEach(previewDiv => {
                    const placeholder = previewDiv.querySelector('.upload-placeholder');
                    const removeBtn = previewDiv.querySelector('.remove-image-btn');
                    const fileInput = previewDiv.querySelector('input[type="file"]');
                    placeholder.style.backgroundImage = '';
                    placeholder.textContent = 'Click to upload';
                    removeBtn.classList.add('d-none');
                    fileInput.value = '';
                });

                // Populate image previews if images exist
                if (product.images && product.images.length > 0) {
                    product.images.forEach((imgSrc, idx) => {
                        if (idx < editImageUploadPreviews.length) {
                            const previewDiv = editImageUploadPreviews[idx];
                            const placeholder = previewDiv.querySelector('.upload-placeholder');
                            const removeBtn = previewDiv.querySelector('.remove-image-btn');
                            placeholder.style.backgroundImage = `url(${imgSrc})`;
                            placeholder.textContent = '';
                            placeholder.style.backgroundSize = 'cover';
                            placeholder.style.backgroundPosition = 'center';
                            removeBtn.classList.remove('d-none');
                        }
                    });
                }
            });
        });
    }

    async function fetchProducts(search = '', category = '', stockStatus = '') {
        try {
            let url = '/api/products';
            if (search) {
                url = `/api/products/search?q=${encodeURIComponent(search)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            let products = await response.json();
            if (category) {
                products = products.filter(p => p.category === category);
            }
            if (stockStatus) {
                products = products.filter(p => {
                    if (stockStatus === 'In Stock') {
                        return p.stock > 10;
                    } else if (stockStatus === 'Low Stock') {
                        return p.stock > 0 && p.stock <= 10;
                    } else if (stockStatus === 'Out of Stock') {
                        return p.stock === 0;
                    }
                    return true;
                });
            }
            renderProducts(products);
            setupCheckboxListeners();
            setupIndividualDeleteButtons();
            setupEditButtons(products);
            updateBulkActionButtons(); // ensure UI state is updated after fetch
        } catch (error) {
            console.error('Error fetching products:', error);
            productsTableBody.innerHTML = '<tr><td colspan="8">Error loading products</td></tr>';
        }
    }

    // Add event listener for bulk delete button
    bulkDeleteBtn.addEventListener('click', () => {
        if (selectedProductIds.length === 0) {
            alert('Please select at least one product to delete.');
            return;
        }
        deleteConfirmModal.show();
    });

    // Confirm bulk delete action
    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            const requestBody = { ids: selectedProductIds };
            const response = await fetch('/api/products/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                throw new Error('Failed to delete products');
            }
            alert('Selected products deleted successfully.');
            deleteConfirmModal.hide();
            fetchProducts();
        } catch (error) {
            console.error('Error deleting products:', error);
            alert('Error deleting products.');
        }
    });

    // Add event listener for bulk update stock button
    bulkUpdateStockBtn.addEventListener('click', () => {
        if (selectedProductIds.length === 0) {
            alert('Please select at least one product to update stock.');
            return;
        }
        bulkUpdateStockModal.show();
    });

    // Confirm bulk update stock action
    confirmBulkStockBtn.addEventListener('click', async () => {
        const stockValue = parseInt(bulkStockQuantityInput.value, 10);
        if (isNaN(stockValue) || stockValue < 0) {
            alert('Please enter a valid stock quantity.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products/bulk-update-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ ids: selectedProductIds, stock: stockValue })
            });
            if (!response.ok) {
                throw new Error('Failed to update stock');
            }
            alert('Stock updated successfully.');
            bulkUpdateStockModal.hide();
            bulkStockQuantityInput.value = '';
            fetchProducts();
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Error updating stock.');
        }
    });

    // Add event listener for bulk change category button
    bulkCategoryBtn.addEventListener('click', () => {
        if (selectedProductIds.length === 0) {
            alert('Please select at least one product to change category.');
            return;
        }
        bulkChangeCategoryModal.show();
    });

    // Confirm bulk change category action
    confirmBulkCategoryBtn.addEventListener('click', async () => {
        const categoryValue = bulkCategorySelect.value;
        if (!categoryValue) {
            alert('Please select a category.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products/bulk-change-category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ ids: selectedProductIds, category: categoryValue })
            });
            if (!response.ok) {
                throw new Error('Failed to change category');
            }
            alert('Category changed successfully.');
            bulkChangeCategoryModal.hide();
            bulkCategorySelect.value = '';
            fetchProducts();
        } catch (error) {
            console.error('Error changing category:', error);
            alert('Error changing category.');
        }
    });

    function getImageUrl(imagePath) {
        if (!imagePath) return '/images/default-product.jpg';
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        return '/' + imagePath;
    }

    function renderProducts(products) {
        if (!products.length) {
            productsTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No products found</td></tr>';
            return;
        }
        productsTableBody.innerHTML = '';
        products.forEach((product, index) => {
            const tr = document.createElement('tr');

            const tdSelect = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input product-select';
            checkbox.name = 'product-select';
            checkbox.id = `product-select-${index + 1}`;
            checkbox.dataset.productId = product._id;
            tdSelect.appendChild(checkbox);
            tr.appendChild(tdSelect);

            const tdImage = document.createElement('td');
            const img = document.createElement('img');
            img.src = (product.images && product.images.length > 0) ? getImageUrl(product.images[0]) : '/images/default-product.jpg';
            img.alt = product.name;
            img.className = 'product-image-preview';
            tdImage.appendChild(img);
            tr.appendChild(tdImage);

            const tdName = document.createElement('td');
            const h6 = document.createElement('h6');
            h6.className = 'mb-0';
            h6.textContent = product.name;
            tdName.appendChild(h6);
            tr.appendChild(tdName);

            const tdCategory = document.createElement('td');
            tdCategory.textContent = product.category || 'N/A';
            tr.appendChild(tdCategory);

            const tdPrice = document.createElement('td');
            tdPrice.textContent = `$${product.price.toFixed(2)}`;
            tr.appendChild(tdPrice);

            const tdStock = document.createElement('td');
            tdStock.textContent = product.stock;
            tr.appendChild(tdStock);

            const tdStatus = document.createElement('td');
            const spanBadge = document.createElement('span');
            spanBadge.className = 'badge';
            if (product.stock > 10) {
                spanBadge.classList.add('bg-success');
                spanBadge.textContent = 'In Stock';
            } else if (product.stock > 0) {
                spanBadge.classList.add('bg-warning');
                spanBadge.textContent = 'Low Stock';
            } else {
                spanBadge.classList.add('bg-danger');
                spanBadge.textContent = 'Out of Stock';
            }
            tdStatus.appendChild(spanBadge);
            tr.appendChild(tdStatus);

            const tdActions = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-outline-primary me-1 edit-product-btn';
            editBtn.setAttribute('data-bs-toggle', 'modal');
            editBtn.setAttribute('data-bs-target', '#editProductModal');
            editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
            editBtn.dataset.productId = product._id;
            editBtn.disabled = true; // disable edit button initially
            tdActions.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger individual-delete-btn';
            deleteBtn.setAttribute('data-bs-toggle', 'modal');
            deleteBtn.setAttribute('data-bs-target', '#deleteConfirmModal');
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.dataset.productId = product._id;
            tdActions.appendChild(deleteBtn);

            tr.appendChild(tdActions);

            productsTableBody.appendChild(tr);
        });
    }

    function updateBulkActionButtons() {
        const selectedCheckboxes = document.querySelectorAll('.product-select:checked');
        selectedProductIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.productId);
        const hasSelection = selectedCheckboxes.length > 0;
        bulkDeleteBtn.disabled = !hasSelection;
        bulkUpdateStockBtn.disabled = !hasSelection;
        bulkCategoryBtn.disabled = !hasSelection;
        const allCheckboxes = document.querySelectorAll('.product-select');
        selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === selectedCheckboxes.length;

        // Enable edit buttons only if exactly one product is selected
        const editButtons = document.querySelectorAll('.edit-product-btn');
        if (selectedCheckboxes.length === 1) {
            editButtons.forEach(btn => {
                btn.disabled = btn.dataset.productId !== selectedCheckboxes[0].dataset.productId;
            });
        } else {
            editButtons.forEach(btn => {
                btn.disabled = true;
            });
        }
    }

    function setupCheckboxListeners() {
        const productCheckboxes = document.querySelectorAll('.product-select');
        productCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener('change', updateBulkActionButtons); // remove previous to avoid duplicates
            checkbox.addEventListener('change', updateBulkActionButtons);
        });
        selectAllCheckbox.removeEventListener('change', selectAllChangeHandler);
        selectAllCheckbox.addEventListener('change', selectAllChangeHandler);
        updateBulkActionButtons();
    }

    function selectAllChangeHandler() {
        const checked = this.checked;
        const productCheckboxes = document.querySelectorAll('.product-select');
        productCheckboxes.forEach(cb => cb.checked = checked);
        updateBulkActionButtons();
    }

    function setupIndividualDeleteButtons() {
        const individualDeleteButtons = document.querySelectorAll('.individual-delete-btn');
        individualDeleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                productIdToDelete = button.dataset.productId;
                deleteConfirmModal.show();
            });
        });
    }

    function setupEditButtons(products) {
        const editButtons = document.querySelectorAll('.edit-product-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                const product = products.find(p => p._id === productId);
                if (!product) {
                    alert('Product data not found');
                    return;
                }
                currentEditProductId = productId;
                // Populate form fields
                editProductForm.editProductName.value = product.name || '';
                editProductForm.editCategory.value = product.category || '';
                editProductForm.editPrice.value = product.price != null ? product.price.toFixed(2) : '';
                editProductForm.editStock.value = product.stock != null ? product.stock : '';
             

                // Clear previous image previews
                editImageUploadPreviews.forEach(previewDiv => {
                    const placeholder = previewDiv.querySelector('.upload-placeholder');
                    const removeBtn = previewDiv.querySelector('.remove-image-btn');
                    const fileInput = previewDiv.querySelector('input[type="file"]');
                    placeholder.style.backgroundImage = '';
                    placeholder.textContent = 'Click to upload';
                    removeBtn.classList.add('d-none');
                    fileInput.value = '';
                });

                // Populate image previews if images exist
                if (product.images && product.images.length > 0) {
                    product.images.forEach((imgSrc, idx) => {
                        if (idx < editImageUploadPreviews.length) {
                            const previewDiv = editImageUploadPreviews[idx];
                            const placeholder = previewDiv.querySelector('.upload-placeholder');
                            const removeBtn = previewDiv.querySelector('.remove-image-btn');
                            placeholder.style.backgroundImage = `url(${imgSrc})`;
                            placeholder.textContent = '';
                            placeholder.style.backgroundSize = 'cover';
                            placeholder.style.backgroundPosition = 'center';
                            removeBtn.classList.remove('d-none');
                        }
                    });
                }
            });
        });
    }

    // Edit product form submission
    let existingImages = [];
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentEditProductId) {
            alert('No product selected for editing.');
            return;
        }

        // Basic validation
        if (!editProductForm.editProductName.value || isNaN(parseFloat(editProductForm.editPrice.value)) || isNaN(parseInt(editProductForm.editStock.value, 10))) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        const formData = new FormData();
        formData.append('productName', document.getElementById('editProductName').value);
        formData.append('category', document.getElementById('editCategory').value);
        formData.append('price', parseFloat(document.getElementById('editPrice').value));
        formData.append('stock', parseInt(document.getElementById('editStock').value, 10));

        // Determine if new images are uploaded
        let newImagesUploaded = false;
        editImageUploadPreviews.forEach(previewDiv => {
            const fileInput = previewDiv.querySelector('input[type="file"]');
            if (fileInput.files && fileInput.files[0]) {
                newImagesUploaded = true;
            }
        });

        // Append existing images only if no new images uploaded
        if (!newImagesUploaded) {
            formData.append('existingImages', JSON.stringify(existingImages));
        } else {
            // If new images uploaded, do not send existingImages to replace old images
            formData.append('existingImages', JSON.stringify([]));
        }

        // Append image files from file inputs
        editImageUploadPreviews.forEach(previewDiv => {
            const fileInput = previewDiv.querySelector('input[type="file"]');
            if (fileInput.files && fileInput.files[0]) {
                formData.append('images', fileInput.files[0]);
            }
        });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/products/${currentEditProductId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }
            alert('Product updated successfully.');
            editProductModal.hide();
            editProductForm.reset();
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product: ' + error.message);
        }
    });

    // Update existingImages when populating edit modal
    function setupEditButtons(products) {
        const editButtons = document.querySelectorAll('.edit-product-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                const product = products.find(p => p._id === productId);
                if (!product) {
                    alert('Product data not found');
                    return;
                }
                currentEditProductId = productId;
                // Populate form fields
                editProductForm.editProductName.value = product.name || '';
                editProductForm.editCategory.value = product.category || '';
                editProductForm.editPrice.value = product.price != null ? product.price.toFixed(2) : '';
                editProductForm.editStock.value = product.stock != null ? product.stock : '';

                // Clear previous image previews
                editImageUploadPreviews.forEach(previewDiv => {
                    const placeholder = previewDiv.querySelector('.upload-placeholder');
                    const removeBtn = previewDiv.querySelector('.remove-image-btn');
                    const fileInput = previewDiv.querySelector('input[type="file"]');
                    placeholder.style.backgroundImage = '';
                    placeholder.textContent = 'Click to upload';
                    removeBtn.classList.add('d-none');
                    fileInput.value = '';
                });

                // Populate image previews if images exist
                existingImages = [];
                if (product.images && product.images.length > 0) {
                    existingImages = [...product.images];
                    product.images.forEach((imgSrc, idx) => {
                        if (idx < editImageUploadPreviews.length) {
                            const previewDiv = editImageUploadPreviews[idx];
                            const placeholder = previewDiv.querySelector('.upload-placeholder');
                            const removeBtn = previewDiv.querySelector('.remove-image-btn');
                            placeholder.style.backgroundImage = `url(${imgSrc})`;
                            placeholder.textContent = '';
                            placeholder.style.backgroundSize = 'cover';
                            placeholder.style.backgroundPosition = 'center';
                            removeBtn.classList.remove('d-none');
                        }
                    });
                }
            });
        });
    }

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const search = searchInput.value.trim();
            const category = categorySelect.value;
            fetchProducts(search, category);
        }
    });

    filterButton.addEventListener('click', () => {
        const search = searchInput.value.trim();
        const category = categorySelect.value;
        const stockStatus = document.getElementById('filterStatus').value;
        fetchProducts(search, category, stockStatus);
    });

    // Add New Product form submission
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation
        if (!addProductForm.productName.value || isNaN(parseFloat(addProductForm.price.value)) || isNaN(parseInt(addProductForm.stock.value, 10))) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        const formData = new FormData(addProductForm);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });
            if (!response.ok) {
                throw new Error('Failed to add product');
            }
            alert('Product added successfully.');
            addProductModal.hide();
            addProductForm.reset();

            // Clear image previews
            const imageUploadPreviews = document.querySelectorAll('#addProductModal .image-upload-preview');
            imageUploadPreviews.forEach(previewDiv => {
                const placeholder = previewDiv.querySelector('.upload-placeholder');
                const removeBtn = previewDiv.querySelector('.remove-image-btn');
                placeholder.style.backgroundImage = '';
                placeholder.textContent = 'Click to upload';
                removeBtn.classList.add('d-none');
                const fileInput = previewDiv.querySelector('input[type="file"]');
                fileInput.value = '';
            });

            fetchProducts();
        } catch (error) {
            if (error.response) {
                const errorText = await error.response.text();
                console.error('Backend error response:', errorText);
            }
            console.error('Error adding product:', error);
            alert('Error adding product.');
        }
    });

    fetchProducts();

    // Reset Add Product modal when hidden to clear image previews and form inputs
    addProductModalElement.addEventListener('hidden.bs.modal', () => {
        addProductForm.reset();
        const imageUploadPreviews = document.querySelectorAll('#addProductModal .image-upload-preview');
        imageUploadPreviews.forEach(previewDiv => {
            const placeholder = previewDiv.querySelector('.upload-placeholder');
            const removeBtn = previewDiv.querySelector('.remove-image-btn');
            const imagePreview = previewDiv.querySelector('.image-preview');
            const fileInput = previewDiv.querySelector('input[type="file"]');
            placeholder.style.backgroundImage = '';
            // Fix: Ensure "Click to upload" text is shown when resetting add product modal
            placeholder.textContent = 'Click to upload';
            removeBtn.classList.add('d-none');
            fileInput.value = '';
            imagePreview.src = '';
            imagePreview.classList.add('d-none');
        });
    });

    // Reset Add Product modal when shown to ensure fresh state each time it opens
    addProductModalElement.addEventListener('show.bs.modal', () => {
        addProductForm.reset();
        const imageUploadPreviews = document.querySelectorAll('#addProductModal .image-upload-preview');
        imageUploadPreviews.forEach(previewDiv => {
            const placeholder = previewDiv.querySelector('.upload-placeholder');
            const removeBtn = previewDiv.querySelector('.remove-image-btn');
            const fileInput = previewDiv.querySelector('input[type="file"]');
            placeholder.style.backgroundImage = '';
            placeholder.textContent = 'Click to upload';
            removeBtn.classList.add('d-none');
            fileInput.value = '';
        });
    });
});
