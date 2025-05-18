document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    const content = document.getElementById('content');

    // Call fetchCustomers to load customer data on page load
    fetchCustomers();

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function() {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && 
            !overlay.contains(e.target) && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    if (content) observer.observe(content);

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => observer.observe(card));

    // Customers management code

    const customersTableBody = document.querySelector('table tbody');
    const statusFilter = document.querySelector('select.form-select');
    const searchInput = document.getElementById('searchInput');

    let customersData = [];
    let selectedCustomer = null;
    let searchTerm = '';

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderCustomers();
    });

    statusFilter.addEventListener('change', () => {
        renderCustomers();
    });

    async function fetchCustomers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/customers', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            customersData = data.data || [];
            renderCustomers();
        } catch (error) {
            console.error('Error fetching customers:', error);
            customersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Error loading customers</td></tr>';
        }
    }

    // Add event listener for Save Changes button in Edit Customer Modal
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', async () => {
            if (!selectedCustomer) {
                alert('No customer selected for editing.');
                return;
            }
            const editModal = document.getElementById('editCustomerModal');
            const fullNameInput = editModal.querySelector('#editFullName');
            const emailInput = editModal.querySelector('#editEmail');
            const addressInput = editModal.querySelector('#editAddress');

            const updatedData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                address: addressInput.value.trim()
            };

            // Basic validation
            if (!updatedData.fullName || !updatedData.email || !updatedData.address) {
                alert('Please fill in all required fields.');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/customers/' + selectedCustomer._id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(updatedData)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update customer');
                }
                // Refresh customer list
                await fetchCustomers();
                // Hide modal
                const bsModal = bootstrap.Modal.getInstance(editModal);
                if (bsModal) {
                    bsModal.hide();
                }
                alert('Customer updated successfully.');
            } catch (error) {
                console.error('Error updating customer:', error);
                alert('Error updating customer: ' + error.message);
            }
        });
    }

    function renderCustomers() {
        let filteredCustomers = customersData;

        const status = statusFilter.value;

        if (searchTerm) {
            filteredCustomers = filteredCustomers.filter(c => {
                const fullName = c.fullName ? c.fullName.toLowerCase() : '';
                const email = c.email ? c.email.toLowerCase() : '';
                return fullName.includes(searchTerm) || email.includes(searchTerm);
            });
        }

        if (status && status !== 'all') {
            filteredCustomers = filteredCustomers.filter(c => c.status === status);
        }

if (!filteredCustomers.length) {
    customersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No customers found</td></tr>';
    return;
}

        customersTableBody.innerHTML = '';
        filteredCustomers.forEach(customer => {
            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.textContent = customer.fullName || 'N/A';
            tr.appendChild(tdName);

            const tdEmail = document.createElement('td');
            tdEmail.textContent = customer.email || 'N/A';
            tr.appendChild(tdEmail);

            const tdAddress = document.createElement('td');
            tdAddress.textContent = customer.address || 'N/A';
            tr.appendChild(tdAddress);

            const tdRegDate = document.createElement('td');
            const regDate = customer.createdAt ? new Date(customer.createdAt) : null;
            tdRegDate.textContent = regDate ? regDate.toLocaleDateString() : 'N/A';
            tr.appendChild(tdRegDate);

            const tdStatus = document.createElement('td');
            const spanBadge = document.createElement('span');
            let badgeClass = '';
            if (customer.status === 'active') badgeClass = 'badge-active';
            else if (customer.status === 'inactive') badgeClass = 'badge-inactive';
            else if (customer.status === 'pending') badgeClass = 'badge-pending';
            spanBadge.className = 'badge ' + badgeClass;
            spanBadge.textContent = customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : 'N/A';
            tdStatus.appendChild(spanBadge);
            tr.appendChild(tdStatus);

            const tdActions = document.createElement('td');

            // View button
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-sm btn-primary me-2';
            viewBtn.title = 'View Customer';
            viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
            viewBtn.setAttribute('data-bs-toggle', 'modal');
            viewBtn.setAttribute('data-bs-target', '#viewCustomerModal');
            viewBtn.addEventListener('click', () => {
                selectedCustomer = customer;
                const viewCustomerModal = document.getElementById('viewCustomerModal');
                const modalBody = viewCustomerModal.querySelector('.modal-body');
                modalBody.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Name:</strong> ${selectedCustomer.fullName || 'N/A'}</p>
                            <p><strong>Email:</strong> ${selectedCustomer.email || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Address:</strong> ${selectedCustomer.address || 'N/A'}</p>
                            <p><strong>Registration Date:</strong> ${selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                `;
            });
            tdActions.appendChild(viewBtn);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-warning me-2';
            editBtn.title = 'Edit Customer';
            editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
            editBtn.setAttribute('data-bs-toggle', 'modal');
            editBtn.setAttribute('data-bs-target', '#editCustomerModal');
            editBtn.addEventListener('click', () => {
                selectedCustomer = customer;
                populateEditCustomerModal(customer);
            });
            tdActions.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.title = 'Delete Customer';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.setAttribute('data-bs-toggle', 'modal');
            deleteBtn.setAttribute('data-bs-target', '#deleteCustomerModal');
            deleteBtn.addEventListener('click', () => {
                selectedCustomer = customer;
            });
            tdActions.appendChild(deleteBtn);

            tr.appendChild(tdActions);

            customersTableBody.appendChild(tr);
        });
    }

    async function deleteCustomer(customerId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/customers/' + customerId, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }
            await fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer');
        }
    }

    const deleteCustomerConfirmBtn = document.getElementById('confirmDeleteCustomerBtn');
    if (deleteCustomerConfirmBtn) {
        deleteCustomerConfirmBtn.addEventListener('click', () => {
            if (selectedCustomer) {
                deleteCustomer(selectedCustomer._id);
                const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteCustomerModal'));
                if (deleteModal) {
                    deleteModal.hide();
                }
            }
        });
    }

    const editCustomerModal = document.getElementById('editCustomerModal');
    function populateEditCustomerModal(customer) {
        const modalBody = editCustomerModal.querySelector('.modal-body form');
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-12 mb-3">
                    <label class="form-label" for="editFullName">Full Name</label>
                    <input id="editFullName" name="fullName" type="text" class="form-control" value="${customer.fullName || ''}" required>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label" for="editEmail">Email</label>
                    <input id="editEmail" name="email" type="email" class="form-control" value="${customer.email || ''}" required>
                </div>
                <div class="col-12 mb-3">
                    <label class="form-label" for="editAddress">Address</label>
                    <textarea id="editAddress" name="address" class="form-control" rows="3" required>${customer.address || ''}</textarea>
                </div>
            </div>
        `;
    }
});
