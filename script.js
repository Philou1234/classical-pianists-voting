// Initial data with no pianists (empty array)
let pianists = [];

// User management
let currentUser = null;
let users = [];

// DOM element references
const pianistChart = document.getElementById('pianistChart');
const pianistsList = document.getElementById('pianistsList');
const votingForm = document.getElementById('votingForm');
const loginRequiredMessage = document.getElementById('login-required-message');
const pianistNameInput = document.getElementById('pianistName');
const techniqueRating = document.getElementById('techniqueRating');
const musicalityRating = document.getElementById('musicalityRating');
const techniqueValue = document.getElementById('techniqueValue');
const musicalityValue = document.getElementById('musicalityValue');
const voteButton = document.getElementById('voteButton');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const toggleAuth = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');
const emailInput = document.getElementById('email');
const usernameInput = document.getElementById('username');
const nameField = document.getElementById('name-field');
const userStatus = document.getElementById('user-status');
const userCount = document.getElementById('user-count');

// Authentication state
let isLoginMode = true;
let isEditingVote = false;
let currentEditingPianist = null;

// Initialize chart
let myChart;

function initChart() {
    const ctx = pianistChart.getContext('2d');
    
    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pianists',
                data: pianists.map(pianist => ({
                    x: pianist.technique,
                    y: pianist.musicality,
                    name: pianist.name,
                    votes: pianist.votes
                })),
                backgroundColor: 'rgba(255, 56, 92, 0.7)',
                borderColor: 'rgba(255, 56, 92, 1)',
                borderWidth: 1,
                pointRadius: function(context) {
                    const index = context.dataIndex;
                    const votes = context.dataset.data[index].votes;
                    // Point size based on the number of votes (min 5, max 15)
                    return Math.min(Math.max(votes + 5, 5), 15);
                },
                pointHoverRadius: function(context) {
                    const index = context.dataIndex;
                    const votes = context.dataset.data[index].votes;
                    return Math.min(Math.max(votes + 5, 5), 15) + 2;
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Technique',
                        font: {
                            size: 16
                        }
                    },
                    min: 0,
                    max: 20,
                    ticks: {
                        stepSize: 5
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Musicality',
                        font: {
                            size: 16
                        }
                    },
                    min: 0,
                    max: 20,
                    ticks: {
                        stepSize: 5
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.name} - Technique: ${point.x}, Musicality: ${point.y}, Votes: ${point.votes}`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        },
        plugins: [{
            id: 'pianistLabels',
            afterDatasetsDraw(chart) {
                if (!chart || !chart.ctx) return;
                
                const { ctx } = chart;
                ctx.save();
                
                // Font settings for the names
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#484848';
                ctx.textAlign = 'center';
                
                // Get points
                if (!chart.getDatasetMeta || !chart.data) return;
                
                const points = chart.getDatasetMeta(0).data;
                const dataset = chart.data.datasets[0];
                
                if (!points || !dataset || !dataset.data) return;
                
                // Loop through each point and add text
                points.forEach((point, index) => {
                    if (!point || !point.getCenterPoint) return;
                    
                    const position = point.getCenterPoint();
                    const name = dataset.data[index].name;
                    
                    if (!position || !name) return;
                    
                    // Draw name slightly above the point
                    ctx.fillText(name, position.x, position.y - 15);
                });
                
                ctx.restore();
            }
        }]
    });
    
    // If no data, show message in the chart area
    if (pianists.length === 0) {
        // Wait for chart to render
        setTimeout(() => {
            const centerX = pianistChart.width / 2;
            const centerY = pianistChart.height / 2;
            
            if (!centerX || !centerY) return;
            
            const ctx = pianistChart.getContext('2d');
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#cccccc';
            ctx.textAlign = 'center';
            ctx.fillText('No pianists yet. Be the first to add one!', centerX, centerY);
        }, 100);
    }
}

// Update the pianists list
function updatePianistsList() {
    pianistsList.innerHTML = '';
    
    if (pianists.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No pianists have been added yet. Add the first one!';
        emptyMessage.style.color = '#999';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.padding = '1rem 0';
        pianistsList.appendChild(emptyMessage);
        return;
    }
    
    // Sort pianists by number of votes (descending)
    const sortedPianists = [...pianists].sort((a, b) => b.votes - a.votes);
    
    sortedPianists.forEach(pianist => {
        const li = document.createElement('li');
        
        const pianistInfo = document.createElement('div');
        pianistInfo.className = 'pianist-info';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'pianist-name';
        nameSpan.textContent = pianist.name;
        
        const ratingsDiv = document.createElement('div');
        ratingsDiv.className = 'ratings';
        
        const techniqueSpan = document.createElement('span');
        techniqueSpan.className = 'technique-rating';
        techniqueSpan.textContent = `T: ${pianist.technique}`;
        
        const musicalitySpan = document.createElement('span');
        musicalitySpan.className = 'musicality-rating';
        musicalitySpan.textContent = `M: ${pianist.musicality}`;
        
        const votesSpan = document.createElement('span');
        votesSpan.className = 'votes';
        votesSpan.textContent = `Votes: ${pianist.votes}`;
        
        ratingsDiv.appendChild(techniqueSpan);
        ratingsDiv.appendChild(musicalitySpan);
        ratingsDiv.appendChild(votesSpan);
        
        pianistInfo.appendChild(nameSpan);
        pianistInfo.appendChild(ratingsDiv);
        
        li.appendChild(pianistInfo);
        
        // Add edit button if the user has voted for this pianist
        if (currentUser && currentUser.votes && currentUser.votes.find(v => v.pianist.toLowerCase() === pianist.name.toLowerCase())) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-vote-btn';
            editBtn.textContent = 'Edit Vote';
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the li click event
                
                // Set form to edit mode
                isEditingVote = true;
                currentEditingPianist = pianist.name;
                
                // Find user's previous vote
                const userVote = currentUser.votes.find(v => v.pianist.toLowerCase() === pianist.name.toLowerCase());
                
                // Pre-fill the form with the user's previous vote values
                pianistNameInput.value = pianist.name;
                techniqueRating.value = userVote.technique;
                musicalityRating.value = userVote.musicality;
                techniqueValue.textContent = userVote.technique;
                musicalityValue.textContent = userVote.musicality;
                
                // Change button text to indicate editing
                voteButton.textContent = 'Update Vote';
                
                // Scroll to form
                votingForm.scrollIntoView({ behavior: 'smooth' });
            });
            
            li.appendChild(editBtn);
        }
        
        pianistsList.appendChild(li);
        
        // Allow clicking on a pianist to pre-fill the form
        li.addEventListener('click', () => {
            // Reset edit mode
            isEditingVote = false;
            currentEditingPianist = null;
            voteButton.textContent = 'Vote';
            
            pianistNameInput.value = pianist.name;
            techniqueRating.value = pianist.technique;
            musicalityRating.value = pianist.musicality;
            techniqueValue.textContent = pianist.technique;
            musicalityValue.textContent = pianist.musicality;
        });
    });
}

// Update user count display
function updateUserCountDisplay() {
    // Count unique users who have voted at least once
    const votedUsers = users.filter(user => user.votes && user.votes.length > 0).length;
    const userText = votedUsers === 1 ? 'user has' : 'users have';
    userCount.textContent = `${votedUsers} ${userText} voted`;
}

// Handle form submission
votingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        alert('Please log in to vote.');
        return;
    }
    
    const name = pianistNameInput.value.trim();
    const technique = parseFloat(techniqueRating.value);
    const musicality = parseFloat(musicalityRating.value);
    
    if (name) {
        const existingPianistIndex = pianists.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
        
        // Check if user has already voted for this pianist and isn't in edit mode
        const existingVoteIndex = currentUser.votes ? 
            currentUser.votes.findIndex(v => v.pianist.toLowerCase() === name.toLowerCase()) : -1;
        
        const existingVote = existingVoteIndex !== -1;
        
        // If editing a vote or voting for the first time
        if (isEditingVote || !existingVote) {
            if (existingPianistIndex !== -1) {
                // Get the existing pianist
                const existingPianist = pianists[existingPianistIndex];
                
                if (existingVote && !isEditingVote) {
                    alert(`You have already voted for ${name}. Use the Edit button to modify your vote.`);
                    return;
                }
                
                if (isEditingVote) {
                    // We're editing an existing vote
                    // First, remove the user's previous vote from the average
                    const previousVote = currentUser.votes[existingVoteIndex];
                    
                    // Recalculate the total excluding this user's vote
                    const newVotes = existingPianist.votes;
                    
                    // Remove previous vote from the total (if votes > 1)
                    let newTechnique, newMusicality;
                    
                    if (newVotes > 1) {
                        // Remove the previous vote from the average
                        const totalTechniqueWithoutPreviousVote = (existingPianist.technique * newVotes) - previousVote.technique;
                        const totalMusicalityWithoutPreviousVote = (existingPianist.musicality * newVotes) - previousVote.musicality;
                        
                        // Add the new vote
                        newTechnique = (totalTechniqueWithoutPreviousVote + technique) / newVotes;
                        newMusicality = (totalMusicalityWithoutPreviousVote + musicality) / newVotes;
                    } else {
                        // If this is the only vote, just use the new values
                        newTechnique = technique;
                        newMusicality = musicality;
                    }
                    
                    // Update the pianist record
                    pianists[existingPianistIndex] = {
                        ...existingPianist,
                        technique: parseFloat(newTechnique.toFixed(1)),
                        musicality: parseFloat(newMusicality.toFixed(1))
                    };
                    
                    // Update the user's vote record
                    currentUser.votes[existingVoteIndex] = {
                        pianist: name,
                        technique: technique,
                        musicality: musicality
                    };
                    
                    // Reset the editing state
                    isEditingVote = false;
                    currentEditingPianist = null;
                    voteButton.textContent = 'Vote';
                } else {
                    // It's a new vote for an existing pianist
                    const newVotes = existingPianist.votes + 1;
                    const newTechnique = (existingPianist.technique * existingPianist.votes + technique) / newVotes;
                    const newMusicality = (existingPianist.musicality * existingPianist.votes + musicality) / newVotes;
                    
                    pianists[existingPianistIndex] = {
                        ...existingPianist,
                        technique: parseFloat(newTechnique.toFixed(1)),
                        musicality: parseFloat(newMusicality.toFixed(1)),
                        votes: newVotes
                    };
                    
                    // Record the vote for this user
                    if (!currentUser.votes) currentUser.votes = [];
                    currentUser.votes.push({
                        pianist: name,
                        technique: technique,
                        musicality: musicality
                    });
                }
            } else {
                // Add a new pianist
                pianists.push({
                    name,
                    technique,
                    musicality,
                    votes: 1
                });
                
                // Record the vote for this user
                if (!currentUser.votes) currentUser.votes = [];
                currentUser.votes.push({
                    pianist: name,
                    technique: technique,
                    musicality: musicality
                });
            }
            
            saveUsers();
            saveData();
            
            // Update the chart and list
            initChart();
            updatePianistsList();
            updateUserCountDisplay();
            
            // Reset the form
            votingForm.reset();
            techniqueValue.textContent = '10';
            musicalityValue.textContent = '10';
        } else {
            alert(`You have already voted for ${name}. Use the Edit button to modify your vote.`);
        }
    }
});

// Update displayed values when sliders move
techniqueRating.addEventListener('input', () => {
    techniqueValue.textContent = techniqueRating.value;
});

musicalityRating.addEventListener('input', () => {
    musicalityValue.textContent = musicalityRating.value;
});

// Authentication toggle
toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        nameField.style.display = 'none';
        authButton.textContent = 'Login';
        toggleText.textContent = "Don't have an account?";
        toggleAuth.textContent = 'Sign up';
    } else {
        nameField.style.display = 'block';
        authButton.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleAuth.textContent = 'Login';
    }
});

// Handle authentication form
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    if (isLoginMode) {
        // Login
        const user = users.find(u => u.email === email);
        
        if (user) {
            currentUser = user;
            updateAuthUI();
            enableVoting();
        } else {
            alert('User not found. Please sign up.');
        }
    } else {
        // Sign up
        const username = usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter your name.');
            return;
        }
        
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            alert('User with this email already exists. Please login.');
            return;
        }
        
        const newUser = {
            email,
            name: username,
            votes: []
        };
        
        users.push(newUser);
        currentUser = newUser;
        saveUsers();
        updateAuthUI();
        enableVoting();
        updateUserCountDisplay();
    }
    
    authForm.reset();
    updatePianistsList(); // Refresh list to show edit buttons
});

function updateAuthUI() {
    if (currentUser) {
        userStatus.innerHTML = `
            Logged in as <strong>${currentUser.name}</strong> (${currentUser.email})
            <button class="logout-btn" id="logoutBtn">Logout</button>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            currentUser = null;
            isEditingVote = false;
            currentEditingPianist = null;
            voteButton.textContent = 'Vote';
            updateAuthUI();
            disableVoting();
            updatePianistsList(); // Refresh to hide edit buttons
        });
        
        // Hide login message
        loginRequiredMessage.style.display = 'none';
    } else {
        userStatus.innerHTML = 'Not logged in. Please log in to vote.';
        
        // Show login message
        loginRequiredMessage.style.display = 'block';
    }
}

function enableVoting() {
    voteButton.disabled = false;
    // Remove the form-inputs-disabled class if it exists
    votingForm.classList.remove('form-inputs-disabled');
}

function disableVoting() {
    voteButton.disabled = true;
    // Add the form-inputs-disabled class
    votingForm.classList.add('form-inputs-disabled');
}

// Function to save data to local storage
function saveData() {
    localStorage.setItem('pianists', JSON.stringify(pianists));
}

// Function to save users to local storage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Function to load data from local storage
function loadData() {
    const savedData = localStorage.getItem('pianists');
    if (savedData) {
        pianists = JSON.parse(savedData);
    }
    
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// Function to clear all data
function clearAllData() {
    localStorage.removeItem('pianists');
    localStorage.removeItem('users');
    pianists = [];
    users = [];
    currentUser = null;
    isEditingVote = false;
    currentEditingPianist = null;
    initChart();
    updatePianistsList();
    updateAuthUI();
    updateUserCountDisplay();
}

// Load data and initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initChart();
    updatePianistsList();
    updateAuthUI();
    updateUserCountDisplay();
    
    // Initial user interface state - disable form inputs until login
    disableVoting();
});