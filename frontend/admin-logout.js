async function logout() {
    showPopupMessage("Are you sure you want to log out?", async function(confirmed) {
        if (confirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/users/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    localStorage.removeItem('token');
                    window.location.href = "auth.html";
                } else {
                    alert('Logout failed');
                }
            } catch (error) {
                alert('Logout error: ' + error.message);
            }
        }
    });
}

// Function to show popup message with animation and transition
function showPopupMessage(message, callback) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'popup-message';

    // Message text
    const msg = document.createElement('p');
    msg.textContent = message;
    popup.appendChild(msg);

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'popup-buttons';

    // Yes button
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes';
    yesBtn.className = 'btn btn-primary';
    yesBtn.onclick = () => {
        closePopup();
        callback(true);
    };

    // No button
    const noBtn = document.createElement('button');
    noBtn.textContent = 'No';
    noBtn.className = 'btn btn-secondary';
    noBtn.onclick = () => {
        closePopup();
        callback(false);
    };

    btnContainer.appendChild(yesBtn);
    btnContainer.appendChild(noBtn);
    popup.appendChild(btnContainer);
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Animate popup and overlay
    setTimeout(() => {
        overlay.classList.add('show');
        popup.classList.add('show');
    }, 10);

    // Close popup function
    function closePopup() {
        popup.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
        }, 300);
    }
}
