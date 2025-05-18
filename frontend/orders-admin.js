document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    const content = document.getElementById('content');
    const adminPanel = document.getElementById('adminPanel');

    // Check if the user is authenticated as admin
    const token = localStorage.getItem('token');
    if (!token || !isAdmin(token)) {
        window.location.href = '/auth.html'; // Redirect to auth.html if not authenticated as admin
    }

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

    // Orders management
    const ordersTableBody = document.getElementById('ordersTableBody');
    const filterButton = document.getElementById('filterButton');
    const searchOrdersInput = document.getElementById('searchOrders');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const updateStatusModal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    const updateStatusForm = document.getElementById('updateStatusForm');
    const orderStatusSelect = document.getElementById('orderStatus');
    const statusNotesTextarea = document.getElementById('statusNotes');
    const viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    const orderDetailsBody = document.getElementById('orderDetailsBody');

    let ordersData = [];

    function formatDateMMDDYYYY(dateInput) {
        const date = new Date(dateInput);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }

    async function fetchOrders() {
        const status = statusFilter.value;
        const search = searchOrdersInput.value.trim();
        const date = dateFilter.value;

        let url = '/api/orders/admin-orders?';

        if (status) url += `status=${encodeURIComponent(status)}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (date) {
            // Convert MM/DD/YYYY to YYYY-MM-DD for reliable Date parsing
            const parts = date.split('/');
            if (parts.length === 3) {
                const isoDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                const startDate = new Date(isoDate);
                const endDate = new Date(isoDate);
                endDate.setHours(23, 59, 59, 999);
                url += `startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}&`;
            } else {
                // fallback if date format unexpected
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                url += `startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}&`;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            ordersData = data.orders || [];
            renderOrders();
        } catch (error) {
            console.error('Error fetching orders:', error);
            ordersTableBody.innerHTML = '<tr><td colspan="6">Error loading orders</td></tr>';
        }
    }

    function renderOrders() {
        if (!ordersData.length) {
            ordersTableBody.innerHTML = '<tr><td colspan="6">No orders found</td></tr>';
            return;
        }
        ordersTableBody.innerHTML = '';
        ordersData.forEach(order => {
            const tr = document.createElement('tr');

            const tdOrderNo = document.createElement('td');
            tdOrderNo.textContent = order.orderNumber;
            tr.appendChild(tdOrderNo);

            const tdCustomer = document.createElement('td');
            tdCustomer.textContent = order.userId?.fullName || order.userId?.email || 'N/A';
            tr.appendChild(tdCustomer);

            const tdDate = document.createElement('td');
            const formattedDate = formatDateMMDDYYYY(order.orderDate);
            tdDate.textContent = formattedDate;
            tr.appendChild(tdDate);

            const tdTotal = document.createElement('td');
            tdTotal.textContent = `$${order.total.toFixed(2)}`;
            tr.appendChild(tdTotal);

            const tdStatus = document.createElement('td');
            const spanBadge = document.createElement('span');
            spanBadge.className = 'badge';
            const status = order.status.toLowerCase();
            spanBadge.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);

            switch (status) {
                case 'order placed':
                    spanBadge.classList.add('badge-order-placed');
                    break;
                case 'order processed':
                    spanBadge.classList.add('badge-order-processed');
                    break;
                case 'processing':
                    spanBadge.classList.add('badge-processing');
                    break;
                case 'shipped':
                    spanBadge.classList.add('badge-shipped');
                    break;
                case 'out for delivery':
                    spanBadge.classList.add('badge-out-for-delivery');
                    break;
                case 'delivered':
                    spanBadge.classList.add('badge-delivered');
                    break;
                case 'cancelled':
                    spanBadge.classList.add('badge-cancelled');
                    break;
                default:
                    spanBadge.classList.add('badge-secondary');
            }
            tdStatus.appendChild(spanBadge);
            tr.appendChild(tdStatus);

            const tdActions = document.createElement('td');

            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-sm btn-outline-primary me-2';
            viewBtn.title = 'View Order Details';
            viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
            viewBtn.addEventListener('click', async () => { await openViewOrderModal(order); });
            tdActions.appendChild(viewBtn);

            const updateBtn = document.createElement('button');
            updateBtn.className = 'btn btn-sm btn-outline-secondary';
            updateBtn.title = 'Update Order Status';
            updateBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
            updateBtn.addEventListener('click', () => openUpdateStatusModal(order));
            tdActions.appendChild(updateBtn);

            tr.appendChild(tdActions);

            ordersTableBody.appendChild(tr);
        });
    }

    function openUpdateStatusModal(order) {
        updateStatusForm.dataset.orderId = order.orderNumber;
        orderStatusSelect.value = order.status.toLowerCase();
        statusNotesTextarea.value = '';
        updateStatusModal.show();
    }

    async function openViewOrderModal(order) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in as an admin to view order details.');
                return;
            }
            const response = await fetch(`/api/orders/admin-orders/${encodeURIComponent(order.orderNumber)}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('Access denied. Please log in as an admin.');
                    return;
                }
                throw new Error('Failed to fetch order details');
            }
            const fullOrder = await response.json();

            orderDetailsBody.innerHTML = '';

            let userName = 'N/A';
            let userEmail = 'N/A';
            if (fullOrder.userId) {
                userName = fullOrder.userId.fullName || 'N/A';
                userEmail = fullOrder.userId.email || 'N/A';
            }

            const shippingAddress = fullOrder.deliveryAddress || 'N/A';

            const detailsHtml = `
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6>Order Information</h6>
                        <p class="mb-1">Order No.: ${fullOrder.orderNumber}</p>
                        <p class="mb-1">Date: ${formatDateMMDDYYYY(fullOrder.orderDate)}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Customer Information</h6>
                        <p class="mb-1">Name: ${userName}</p>
                        <p class="mb-1">Email: ${userEmail}</p>
                    </div>
                </div>
                <div class="mb-4">
                    <h6>Shipping Address</h6>
                    <p>${shippingAddress}</p>
                </div>
                <div class="mb-4">
                    <h6>Order Items</h6>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${fullOrder.items.map(item => `
                                    <tr>
                                        <td>${item.productId?.name || item.productName || 'N/A'}</td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                    <td><strong>$${fullOrder.total.toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;
            orderDetailsBody.innerHTML = detailsHtml;

            viewOrderModal.show();
        } catch (error) {
            console.error('Error loading order details:', error);
            alert('Failed to load order details');
        }
    }

    async function updateOrderStatus() {
        const orderNumber = updateStatusForm.dataset.orderId;
        const status = orderStatusSelect.value;
        const notes = statusNotesTextarea.value.trim();

        if (!status) {
            alert('Please select a status');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/orders/admin-orders/${encodeURIComponent(orderNumber)}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ status, notes })
            });
            if (!response.ok) {
                throw new Error('Failed to update order status');
            }
            await fetchOrders();
            updateStatusModal.hide();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        }
    }

    filterButton.addEventListener('click', fetchOrders);
    searchOrdersInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            fetchOrders();
        }
    });

    window.updateOrderStatus = updateOrderStatus;

    fetchOrders();

    // Helper function to check if the user is an admin
    function isAdmin(token) {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            return decoded.role === 'admin';
        } catch (e) {
            return false;
        }
    }

    // Implement printOrder function to print order details
    window.printOrder = function() {
        const printContents = orderDetailsBody.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Order</title>');
        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
});
