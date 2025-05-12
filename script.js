// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Initialize the app
    initApp();
});

// -----------------------------------
// APP INITIALIZATION
// -----------------------------------
function initApp() {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    
    // Show welcome screen with delayed "Why Us" section
    if (!currentUser) {
        showScreen('welcomeScreen');
        setTimeout(() => {
            document.getElementById('whyUsSection').style.opacity = 1;
        }, 1500);
    } else {
        // User is logged in, show the app
        showScreen('appShell');
        updateUserInfo(currentUser);
        loadTrips();
        loadPopularDestinations();
    }
    
    // Setup event listeners for the entire app
    setupEventListeners();
}

// Set up all event listeners for the application
function setupEventListeners() {
    // Welcome screen
    document.getElementById('joinUsBtn').addEventListener('click', () => showScreen('authScreen'));
    
    // Auth screen
    document.getElementById('showSignupLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    });
    
    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            const returnPage = button.getAttribute('data-return');
            navigateTo(returnPage);
        });
    });
    
    // Home page
    document.getElementById('findTripBtn').addEventListener('click', () => navigateTo('tripForm'));
    
    // Trips page
    document.getElementById('newTripBtn').addEventListener('click', () => navigateTo('tripForm'));
    document.getElementById('createFirstTripBtn').addEventListener('click', () => navigateTo('tripForm'));
    
    // Trip form
    document.getElementById('tripForm').addEventListener('submit', handleTripFormSubmit);
    setupFormSelectionHandlers();
    
    // Profile page
    document.getElementById('editProfileBtn').addEventListener('click', showProfileForm);
    document.getElementById('cancelEditBtn').addEventListener('click', hideProfileForm);
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Set up option card selection handlers
function setupFormSelectionHandlers() {
    // Single select options (budget, travel type, region)
    const singleSelectCards = document.querySelectorAll('.options-grid:not(.multi-select) .option-card');
    singleSelectCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from siblings
            const parent = card.parentElement;
            parent.querySelectorAll('.option-card').forEach(sibling => {
                sibling.classList.remove('active');
            });
            
            // Add active class to clicked card
            card.classList.add('active');
        });
    });
    
    // Multi-select options (interests)
    const multiSelectCards = document.querySelectorAll('.interest-option');
    multiSelectCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });
}

// -----------------------------------
// NAVIGATION
// -----------------------------------
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    document.getElementById(screenId).classList.add('active');
}

function navigateTo(pageId) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the requested page
    document.getElementById(`${pageId}Page`).classList.add('active');
    
    // Additional setup based on the page
    if (pageId === 'trips') {
        loadTrips();
    } else if (pageId === 'tripForm') {
        resetTripForm();
    }
}

// -----------------------------------
// AUTHENTICATION
// -----------------------------------
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find matching user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user (without password)
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        // Show the app
        showScreen('appShell');
        updateUserInfo(userWithoutPassword);
        loadTrips();
        loadPopularDestinations();
        
        showNotification('Welcome back!', 'You have successfully logged in.');
    } else {
        alert('Invalid email or password');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        alert('An account with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store current user (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    // Show the app
    showScreen('appShell');
    updateUserInfo(userWithoutPassword);
    
    showNotification('Welcome to Wejhati!', 'Your account has been created successfully.');
}

function handleLogout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Show welcome screen
    showScreen('welcomeScreen');
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function updateUserInfo(user) {
    // Update header username
    document.getElementById('userNameDisplay').textContent = user.name.split(' ')[0];
    
    // Update profile info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('infoName').textContent = user.name;
    document.getElementById('infoEmail').textContent = user.email;
    
    // Update avatar
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    
    document.getElementById('profileAvatar').textContent = initials;
    
    // Set form values for edit profile
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
}

function showProfileForm() {
    document.getElementById('profileDisplay').style.display = 'none';
    document.getElementById('profileForm').style.display = 'block';
}

function hideProfileForm() {
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('profileDisplay').style.display = 'block';
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    
    if (!name || !email) {
        alert('Name and email cannot be empty');
        return;
    }
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('You must be logged in to update your profile');
        return;
    }
    
    // Update current user
    const updatedUser = {
        ...currentUser,
        name,
        email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            name,
            email
        };
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Update UI
    updateUserInfo(updatedUser);
    hideProfileForm();
    
    showNotification('Profile Updated', 'Your profile has been updated successfully.');
}

// -----------------------------------
// TRIPS FUNCTIONALITY
// -----------------------------------
function loadTrips() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return;
    }
    
    // Get trips from localStorage
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const userTrips = allTrips.filter(trip => trip.userId === currentUser.id);
    
    // Update trip count
    document.getElementById('infoTrips').textContent = userTrips.length;
    
    // Show empty state or trips list
    const noTripsMessage = document.getElementById('noTripsMessage');
    const tripsList = document.getElementById('tripsList');
    
    if (userTrips.length === 0) {
        noTripsMessage.style.display = 'block';
        tripsList.style.display = 'none';
        return;
    }
    
    noTripsMessage.style.display = 'none';
    tripsList.style.display = 'grid';
    
    // Clear current trips
    tripsList.innerHTML = '';
    
    // Add each trip
    userTrips.forEach(trip => {
        const tripCard = createTripCard(trip);
        tripsList.appendChild(tripCard);
    });
}

function createTripCard(trip) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    
    // Create card image (mystery or real)
    const cardImage = document.createElement('div');
    cardImage.className = 'trip-image';
    
    if (trip.revealed) {
        cardImage.style.backgroundImage = `url('${trip.destination.image}')`;
    } else {
        cardImage.style.background = 'linear-gradient(135deg, var(--primary-light), var(--primary))';
    }
    
    // Trip info overlay
    const tripInfo = document.createElement('div');
    tripInfo.className = 'trip-info';
    
    if (trip.revealed) {
        tripInfo.innerHTML = `
            <h3 class="trip-title">${trip.destination.name}</h3>
            <div class="trip-date">${formatDate(trip.date)}</div>
        `;
    } else {
        tripInfo.innerHTML = `
            <h3 class="trip-title">Mystery Destination</h3>
            <div class="trip-date">${formatDate(trip.date)}</div>
        `;
    }
    
    cardImage.appendChild(tripInfo);
    card.appendChild(cardImage);
    
    // Card content
    const cardContent = document.createElement('div');
    cardContent.className = 'trip-content';
    
    // Tags
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'trip-tags';
    
    const regionTag = document.createElement('div');
    regionTag.className = 'trip-tag';
    regionTag.innerHTML = `<i data-lucide="map-pin" class="tag-icon"></i> ${trip.region}`;
    tagsContainer.appendChild(regionTag);
    
    const budgetTag = document.createElement('div');
    budgetTag.className = 'trip-tag';
    budgetTag.innerHTML = `<i data-lucide="wallet" class="tag-icon"></i> ${trip.budget}`;
    tagsContainer.appendChild(budgetTag);
    
    const travelTypeTag = document.createElement('div');
    travelTypeTag.className = 'trip-tag';
    travelTypeTag.innerHTML = `<i data-lucide="users" class="tag-icon"></i> ${trip.travelType}`;
    tagsContainer.appendChild(travelTypeTag);
    
    cardContent.appendChild(tagsContainer);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'trip-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-primary';
    viewBtn.innerHTML = '<i data-lucide="eye" class="btn-icon"></i> View';
    viewBtn.addEventListener('click', () => viewTrip(trip.id));
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline';
    editBtn.innerHTML = '<i data-lucide="edit" class="btn-icon"></i>';
    editBtn.addEventListener('click', () => editTrip(trip.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline btn-danger';
    deleteBtn.innerHTML = '<i data-lucide="trash" class="btn-icon"></i>';
    deleteBtn.addEventListener('click', () => deleteTrip(trip.id));
    
    const actionGroup = document.createElement('div');
    actionGroup.className = 'trip-action-group';
    actionGroup.appendChild(editBtn);
    actionGroup.appendChild(deleteBtn);
    
    actions.appendChild(viewBtn);
    actions.appendChild(actionGroup);
    
    cardContent.appendChild(actions);
    card.appendChild(cardContent);
    
    // Initialize icons
    lucide.createIcons({
        icons: {
            'map-pin': {},
            'wallet': {},
            'users': {},
            'eye': {},
            'edit': {},
            'trash': {}
        },
        nameAttr: 'data-lucide',
        attrs: { 
            width: '16',
            height: '16' 
        }
    }, card);
    
    return card;
}

function viewTrip(tripId) {
    const trip = getTrip(tripId);
    
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    // Store current trip ID for the result page
    localStorage.setItem('currentTripId', tripId);
    
    // Navigate to result page
    navigateTo('tripResult');
    displayTripResult(trip);
}

function displayTripResult(trip) {
    const imageContainer = document.getElementById('tripImageContainer');
    const detailsContainer = document.getElementById('tripDetails');
    
    // Clear containers
    imageContainer.innerHTML = '';
    detailsContainer.innerHTML = '';
    
    if (trip.revealed) {
        // Show destination details
        imageContainer.innerHTML = `
            <div class="trip-image-container" style="background-image: url('${trip.destination.image}')">
                <div class="trip-image-content">
                    <h1 class="trip-image-title">${trip.destination.name}</h1>
                    <div class="trip-image-badges">
                        <div class="trip-image-badge">${trip.region}</div>
                        <div class="trip-image-badge">${trip.budget}</div>
                    </div>
                </div>
            </div>
        `;
        
        detailsContainer.innerHTML = `
            <div class="trip-details-grid">
                <div class="trip-details-main">
                    <div class="trip-section">
                        <h2>About This Destination</h2>
                        <p>${trip.destination.description}</p>
                    </div>
                    
                    <div class="trip-section">
                        <h2>Top Attractions</h2>
                        <ul class="attractions-list">
                            ${trip.destination.attractions.map(attraction => `
                                <li><i data-lucide="check-circle" class="attraction-icon"></i> ${attraction}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="trip-section">
                        <h2>Best Time to Visit</h2>
                        <p>${trip.destination.bestTime}</p>
                    </div>
                </div>
                
                <div class="trip-details-sidebar">
                    <div class="trip-summary">
                        <h3>Trip Summary</h3>
                        
                        <div class="summary-item">
                            <span class="summary-label">Destination</span>
                            <span>${trip.destination.name}</span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Region</span>
                            <span>${trip.region}</span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Budget</span>
                            <span>${trip.budget}</span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Travel Type</span>
                            <span>${trip.travelType}</span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Created</span>
                            <span>${formatDate(trip.date)}</span>
                        </div>
                        
                        <div class="summary-item">
                            <span class="summary-label">Interests</span>
                            <div class="tag-container">
                                ${trip.interests.map(interest => `<span class="tag">${interest}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="trip-actions">
                        <button class="btn btn-outline" onclick="editTrip('${trip.id}')">
                            <i data-lucide="edit" class="btn-icon"></i>
                            Edit Trip
                        </button>
                        
                        <button class="btn btn-primary" onclick="navigateTo('trips')">
                            <i data-lucide="check" class="btn-icon"></i>
                            Finish
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Show mystery container with reveal/surprise options
        imageContainer.innerHTML = `
            <div class="trip-mystery">
                <div>
                    <h2>Your Mystery Trip</h2>
                    <p>Ready to discover your perfect destination?</p>
                    
                    <div class="trip-mystery-actions">
                        <button class="btn btn-primary" onclick="revealTrip('${trip.id}')">
                            <i data-lucide="eye" class="btn-icon"></i>
                            Reveal Now
                        </button>
                        
                        <button class="btn btn-primary" onclick="startCountdown('${trip.id}')">
                            <i data-lucide="clock" class="btn-icon"></i>
                            Keep as Surprise
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize icons
    lucide.createIcons();
}

function revealTrip(tripId) {
    const trip = getTrip(tripId);
    
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    // Update trip to revealed
    updateTrip({
        ...trip,
        revealed: true
    });
    
    // Show notification
    showNotification('Destination Revealed!', `Your destination is ${trip.destination.name}`);
    
    // Refresh display
    displayTripResult(getTrip(tripId));
}

function startCountdown(tripId) {
    const trip = getTrip(tripId);
    
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    // Create countdown container
    const imageContainer = document.getElementById('tripImageContainer');
    imageContainer.innerHTML = `
        <div class="trip-mystery">
            <div>
                <h2>Your Mystery Trip</h2>
                <p>The destination will be revealed in:</p>
                
                <div class="countdown-container">
                    <svg class="countdown-ring" width="150" height="150">
                        <circle cx="75" cy="75" r="65" fill="none" stroke="#ffffff33" stroke-width="10" />
                        <circle id="countdownCircle" cx="75" cy="75" r="65" fill="none" 
                                stroke="white" stroke-width="10" 
                                stroke-dasharray="408" stroke-dashoffset="0"
                                transform="rotate(-90 75 75)" />
                    </svg>
                    <div class="countdown-number" id="countdownNumber">10</div>
                </div>
            </div>
        </div>
    `;
    
    // Show notification
    showNotification('Countdown Started', 'Your destination will be revealed soon');
    
    // Start countdown
    const countdownSeconds = 10;
    let remainingSeconds = countdownSeconds;
    const circumference = 408; // 2 * Math.PI * 65
    
    const countdownInterval = setInterval(() => {
        remainingSeconds--;
        
        // Update countdown display
        const countdownNumber = document.getElementById('countdownNumber');
        if (countdownNumber) {
            countdownNumber.textContent = remainingSeconds;
        }
        
        // Update progress circle
        const countdownCircle = document.getElementById('countdownCircle');
        if (countdownCircle) {
            const progress = (countdownSeconds - remainingSeconds) / countdownSeconds;
            countdownCircle.style.strokeDashoffset = circumference * progress;
        }
        
        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            
            // Show revealed state
            const revealed = document.createElement('div');
            revealed.className = 'trip-mystery';
            revealed.innerHTML = `
                <div class="fade-in">
                    <h2>Revealed!</h2>
                    <h3 style="color: white; font-size: 2rem; margin-bottom: 1.5rem;">${trip.destination.name}</h3>
                    
                    <button class="btn btn-primary" onclick="revealTrip('${trip.id}')">
                        <i data-lucide="eye" class="btn-icon"></i>
                        View Full Details
                    </button>
                </div>
            `;
            
            imageContainer.innerHTML = '';
            imageContainer.appendChild(revealed);
            
            // Initialize icons
            lucide.createIcons({
                icons: {
                    'eye': {}
                },
                nameAttr: 'data-lucide'
            }, revealed);
            
            // Show notification
            showNotification('Surprise Destination Ready!', 'Your mystery destination has been revealed');
        }
    }, 1000);
}

function editTrip(tripId) {
    const trip = getTrip(tripId);
    
    if (!trip) {
        alert('Trip not found');
        return;
    }
    
    // Store current trip ID for editing
    localStorage.setItem('editingTripId', tripId);
    
    // Navigate to trip form
    navigateTo('tripForm');
    
    // Update form title
    document.getElementById('tripFormTitle').textContent = 'Edit Your Trip';
    document.getElementById('submitButtonText').textContent = 'Update Trip';
    
    // Fill form with trip data
    // Budget
    const budgetOptions = document.querySelectorAll('.form-section:nth-child(1) .option-card');
    budgetOptions.forEach(option => {
        if (option.getAttribute('data-value') === trip.budget) {
            option.click();
        }
    });
    
    // Travel Type
    const travelTypeOptions = document.querySelectorAll('.form-section:nth-child(2) .option-card');
    travelTypeOptions.forEach(option => {
        if (option.getAttribute('data-value') === trip.travelType) {
            option.click();
        }
    });
    
    // Region
    const regionOptions = document.querySelectorAll('.form-section:nth-child(3) .option-card');
    regionOptions.forEach(option => {
        if (option.getAttribute('data-value') === trip.region) {
            option.click();
        }
    });
    
    // Interests
    const interestOptions = document.querySelectorAll('.interest-option');
    interestOptions.forEach(option => {
        if (trip.interests.includes(option.getAttribute('data-value'))) {
            option.click();
        }
    });
}

function resetTripForm() {
    // Clear editing trip ID
    localStorage.removeItem('editingTripId');
    
    // Reset form title
    document.getElementById('tripFormTitle').textContent = 'Create Your Trip';
    document.getElementById('submitButtonText').textContent = 'Find Destination';
    
    // Reset all selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('active');
    });
}

function handleTripFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const budget = document.querySelector('.form-section:nth-child(1) .option-card.active')?.getAttribute('data-value');
    const travelType = document.querySelector('.form-section:nth-child(2) .option-card.active')?.getAttribute('data-value');
    const region = document.querySelector('.form-section:nth-child(3) .option-card.active')?.getAttribute('data-value');
    
    const interestElements = document.querySelectorAll('.interest-option.active');
    const interests = Array.from(interestElements).map(el => el.getAttribute('data-value'));
    
    // Validate form
    if (!budget || !travelType || !region) {
        alert('Please select all required options');
        return;
    }
    
    if (interests.length < 2) {
        alert('Please select at least 2 interests');
        return;
    }
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('You must be logged in to create a trip');
        return;
    }
    
    // Check if editing or creating
    const editingTripId = localStorage.getItem('editingTripId');
    
    if (editingTripId) {
        // Update existing trip
        const existingTrip = getTrip(editingTripId);
        
        if (!existingTrip) {
            alert('Trip not found');
            return;
        }
        
        // Find a new destination based on updated criteria
        const destination = findBestMatch(region, budget, interests);
        
        if (!destination) {
            alert('No matching destination found');
            return;
        }
        
        const updatedTrip = {
            ...existingTrip,
            budget,
            travelType,
            region,
            interests,
            destination,
            revealed: false
        };
        
        updateTrip(updatedTrip);
        
        // Clear editing state
        localStorage.removeItem('editingTripId');
        
        // Show success message
        showNotification('Trip Updated', 'Your trip has been updated successfully');
        
        // Navigate to trips page
        navigateTo('trips');
    } else {
        // Create new trip
        const destination = findBestMatch(region, budget, interests);
        
        if (!destination) {
            alert('No matching destination found');
            return;
        }
        
        const newTrip = {
            id: Date.now().toString(),
            userId: currentUser.id,
            budget,
            travelType,
            region,
            interests,
            date: new Date().toISOString(),
            revealed: false,
            destination
        };
        
        createTrip(newTrip);
        
        // Show success message
        showNotification('Trip Created', 'Your new trip has been created successfully');
        
        // Navigate to trip result page
        viewTrip(newTrip.id);
    }
}

function deleteTrip(tripId) {
    if (confirm('Are you sure you want to delete this trip?')) {
        // Get all trips
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        
        // Remove the trip
        const updatedTrips = trips.filter(trip => trip.id !== tripId);
        
        // Save back to localStorage
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
        
        // Reload trips
        loadTrips();
        
        // Show notification
        showNotification('Trip Deleted', 'Your trip has been deleted successfully');
    }
}

function getTrip(tripId) {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    return trips.find(trip => trip.id === tripId);
}

function createTrip(trip) {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    trips.push(trip);
    localStorage.setItem('trips', JSON.stringify(trips));
}

function updateTrip(updatedTrip) {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const index = trips.findIndex(trip => trip.id === updatedTrip.id);
    
    if (index !== -1) {
        trips[index] = updatedTrip;
        localStorage.setItem('trips', JSON.stringify(trips));
    }
}

// -----------------------------------
// DESTINATION MATCHING
// -----------------------------------
async function loadTravelData() {
    try {
        // Fetch travel.json
        const response = await fetch('travel.json');
        
        if (!response.ok) {
            throw new Error('Failed to load travel data');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading travel data:', error);
        
        // Fallback static data in case the file can't be loaded
        return {
            regions: {
                europe: [
                    {
                        name: 'France',
                        visa: 'Visa required (apply 3 months in advance)',
                        flights: 'Gulf Air: BHD 350 round trip\nEmirates: BHD 400 round trip',
                        hotels: '3-star avg: BHD 50/night\n5-star avg: BHD 150/night',
                        budget: 'Recommended daily: BHD 100-200',
                        tips: 'Learn basic French phrases\nCarry cash for small shops\nValidate train tickets before boarding',
                        emergency: 'Bahrain Embassy: +33 1 53 67 19 19\nLocal Emergency: 112',
                        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
                        description: 'France offers world-class art, architecture, and cuisine. Paris, the City of Light, is home to iconic landmarks, while the French countryside features charming villages, vineyards, and lavender fields.',
                        attractions: ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Mont Saint-Michel', 'French Riviera'],
                        bestTime: 'April to June and September to October for mild temperatures and thinner crowds'
                    },
                    {
                        name: 'Italy',
                        visa: 'Visa required (apply 3 months in advance)',
                        flights: 'Emirates: BHD 400 round trip\nQatar Airways: BHD 450 round trip',
                        hotels: '3-star avg: BHD 60/night\n5-star avg: BHD 180/night',
                        budget: 'Recommended daily: BHD 120-250',
                        tips: 'Dinner starts late (8-10 PM)\nValidate train tickets\nCarry small change for public restrooms',
                        emergency: 'Bahrain Embassy: +39 06 853 7551\nLocal Emergency: 112',
                        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
                        description: 'Italy offers an irresistible combination of art, culture, and food. From the ancient ruins of Rome to the canals of Venice and the Renaissance treasures of Florence, Italy is filled with iconic sights and experiences.',
                        attractions: ['Colosseum in Rome', 'Venice Canals', 'Florence Cathedral', 'Amalfi Coast', 'Leaning Tower of Pisa'],
                        bestTime: 'April to June or September to October for pleasant weather and fewer crowds'
                    }
                ],
                'middle east': [
                    {
                        name: 'United Arab Emirates',
                        visa: 'Visa on arrival (30 days)',
                        flights: 'Emirates: BHD 150 round trip\nGulf Air: BHD 180 round trip',
                        hotels: '3-star avg: BHD 40/night\n5-star avg: BHD 120/night',
                        budget: 'Recommended daily: BHD 80-150',
                        tips: 'Respect local dress codes\nFriday is weekend day\nAvoid public displays of affection',
                        emergency: 'Bahrain Embassy: +971 4 394 9999\nLocal Emergency: 999',
                        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
                        description: 'The UAE is a modern country known for its futuristic cities, luxury shopping, and stunning architecture. Experience the tallest building in the world, artificial islands, and rich cultural heritage.',
                        attractions: ['Burj Khalifa', 'Palm Jumeirah', 'Sheikh Zayed Grand Mosque', 'Dubai Mall', 'Ferrari World'],
                        bestTime: 'November to March for pleasant temperatures and outdoor activities'
                    },
                    {
                        name: 'Oman',
                        visa: 'Visa on arrival (14 days)',
                        flights: 'Oman Air: BHD 200 round trip\nSalamAir: BHD 180 round trip',
                        hotels: '3-star avg: BHD 35/night\n5-star avg: BHD 110/night',
                        budget: 'Recommended daily: BHD 70-130',
                        tips: 'Dress modestly in public\nAvoid photography of government buildings\nRespect prayer times',
                        emergency: 'Bahrain Embassy: +968 24 699 500\nLocal Emergency: 9999',
                        image: 'https://images.unsplash.com/photo-1621680751550-b218e7ce4396',
                        description: 'Oman offers stunning landscapes from desert dunes to mountain ranges and pristine coastlines. Known for its rich heritage, friendly locals, and traditional architecture.',
                        attractions: ['Mutrah Souq', 'Sultan Qaboos Grand Mosque', 'Wahiba Sands', 'Jebel Shams', 'Wadi Shab'],
                        bestTime: 'October to April for pleasant weather and outdoor activities'
                    }
                ],
                asia: [
                    {
                        name: 'Japan',
                        visa: 'Visa-free for 90 days',
                        flights: 'Japan Airlines: BHD 600 round trip\nANA: BHD 650 round trip',
                        hotels: '3-star avg: BHD 70/night\n5-star avg: BHD 200/night',
                        budget: 'Recommended daily: BHD 150-300',
                        tips: 'Carry cash for rural areas\nLearn basic Japanese greetings\nRemove shoes indoors',
                        emergency: 'Bahrain Embassy: +81 3 5485 8400\nLocal Emergency: 110',
                        image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3',
                        description: 'Japan is a fascinating blend of ancient traditions and cutting-edge technology. Explore historic temples, futuristic cities, and stunning natural landscapes while enjoying some of the world\'s best cuisine.',
                        attractions: ['Mount Fuji', 'Kyoto Temples', 'Tokyo Skytree', 'Hiroshima Peace Memorial', 'Arashiyama Bamboo Grove'],
                        bestTime: 'March to May for cherry blossoms or October to November for autumn colors'
                    },
                    {
                        name: 'Thailand',
                        visa: 'Visa-free for 30 days',
                        flights: 'Thai Airways: BHD 450 round trip\nBangkok Air: BHD 400 round trip',
                        hotels: '3-star avg: BHD 30/night\n5-star avg: BHD 100/night',
                        budget: 'Recommended daily: BHD 50-120',
                        tips: 'Respect the monarchy\nBargain at markets\nAvoid touching heads',
                        emergency: 'Bahrain Embassy: +66 2 305 2100\nLocal Emergency: 191',
                        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
                        description: 'Thailand offers something for every traveler - from bustling Bangkok to serene beaches and mountain villages. Experience rich culture, delicious street food, and warm hospitality.',
                        attractions: ['Grand Palace in Bangkok', 'Phi Phi Islands', 'Chiang Mai Night Markets', 'Ayutthaya Historical Park', 'Railay Beach'],
                        bestTime: 'November to February for dry and cool weather'
                    }
                ],
                americas: [
                    {
                        name: 'United States',
                        visa: 'ESTA required for visa waiver',
                        flights: 'Delta: BHD 800 round trip\nAmerican Airlines: BHD 750 round trip',
                        hotels: '3-star avg: BHD 80/night\n5-star avg: BHD 250/night',
                        budget: 'Recommended daily: BHD 200-400',
                        tips: 'Tip 15-20% at restaurants\nCheck voltage compatibility\nCarry ID at all times',
                        emergency: 'Bahrain Embassy: +1 202 342-1111\nLocal Emergency: 911',
                        image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
                        description: 'The United States offers incredible diversity in landscapes, cities, and experiences. From the Grand Canyon to New York City, the country has something for every type of traveler.',
                        attractions: ['Grand Canyon', 'New York City', 'Yellowstone National Park', 'Hawaii Beaches', 'New Orleans'],
                        bestTime: 'Varies by region, but May to September is generally good for most of the country'
                    },
                    {
                        name: 'Brazil',
                        visa: 'eVisa required (apply online)',
                        flights: 'LATAM: BHD 700 round trip\nGOL: BHD 650 round trip',
                        hotels: '3-star avg: BHD 45/night\n5-star avg: BHD 150/night',
                        budget: 'Recommended daily: BHD 100-200',
                        tips: 'Learn basic Portuguese\nAvoid flashy jewelry\nUse registered taxis',
                        emergency: 'Bahrain Embassy: +55 61 3248-5118\nLocal Emergency: 190',
                        image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
                        description: 'Brazil is known for its vibrant culture, beautiful beaches, and the Amazon rainforest. From the rhythm of Rio to the biodiversity of the Amazon, Brazil offers unforgettable experiences.',
                        attractions: ['Christ the Redeemer', 'Iguazu Falls', 'Amazon Rainforest', 'Copacabana Beach', 'Salvador Historic Center'],
                        bestTime: 'September to October for good weather and fewer crowds'
                    }
                ]
            }
        };
    }
}

function findBestMatch(region, budget, interests) {
    // Load travel data (will use static data for initial implementation)
    return loadTravelData().then(data => {
        // Convert region to lowercase to match the keys in the travelData
        const regionKey = region.toLowerCase().replace(' east', ' east');
        
        // Get destinations for the selected region
        const destinations = data.regions[regionKey];
        
        if (!destinations || destinations.length === 0) {
            return null;
        }
        
        // For now, just return a random destination from the region
        // In a real implementation, you'd implement a matching algorithm
        const randomIndex = Math.floor(Math.random() * destinations.length);
        return destinations[randomIndex];
    });
}

// -----------------------------------
// HOME PAGE
// -----------------------------------
function loadPopularDestinations() {
    // Featured destinations for the popular destinations section
    const featuredDestinations = [
        {
            id: '1',
            name: 'Santorini, Greece',
            region: 'Europe',
            budget: 'Mid Budget',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
            tags: ['Scenic', 'Cuisine', 'Historical']
        },
        {
            id: '2',
            name: 'Kyoto, Japan',
            region: 'Asia',
            budget: 'High Budget',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
            tags: ['Cultural', 'Scenic', 'Shopping']
        },
        {
            id: '3',
            name: 'Bali, Indonesia',
            region: 'Asia',
            budget: 'Low Budget',
            image: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7',
            tags: ['Beach', 'Wellness', 'Nature']
        }
    ];
    
    const container = document.getElementById('popularDestinations');
    container.innerHTML = '';
    
    featuredDestinations.forEach(destination => {
        const card = document.createElement('div');
        card.className = 'destination-card';
        
        card.innerHTML = `
            <div class="destination-image" style="background-image: url('${destination.image}')"></div>
            <div class="destination-content">
                <h3 class="destination-title">${destination.name}</h3>
                <p class="destination-region"><i data-lucide="map-pin" style="width: 16px; height: 16px; vertical-align: -3px;"></i> ${destination.region} • ${destination.budget}</p>
                
                <div class="tag-container">
                    ${destination.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <button class="btn btn-outline" onclick="navigateTo('tripForm')">
                    Find Similar
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Initialize icons
    lucide.createIcons();
}

// -----------------------------------
// UTILITY FUNCTIONS
// -----------------------------------
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

function showNotification(title, body) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/icons/icon-192x192.png'
        });
    }
    
    // Could also implement an in-app toast notification here
    console.log(`Notification: ${title} - ${body}`);
}