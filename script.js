// Initial data with no pianists (empty array)
let pianists = [];

// User management
let currentUser = null;
let users = [];

// DOM element references
const pianistChart = document.getElementById('pianistChart');
const pianistsList = document.getElementById('pianistsList');
const votingForm = document.getElementById('votingForm');
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

// Authentication state
let isLoginMode = true;

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
                const { ctx } = chart;
                ctx.save();
                
                // Font settings for the names
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#484848';
                ctx.textAlign = 'center';
                
                // Get points
                const points = chart.getDatasetMeta(0).data;
                const dataset = chart.data.datasets[0];
                
                // Loop through each point and add text
                points.forEach((point, index) => {
                    const position = point.getCenterPoint();
                    const name = dataset.data[index].name;
                    
                    // Draw name slightly above the point
                    ctx.fillText(name, position.x, position.y - 15);
                });
                
                ctx.restore();
            }
        }]
    });
    
    // If no data, show guidelines for the axes
    if (pianists.length === 0) {
        // Draw some reference points to show the scale
        const emptyCtx = pianistChart.getContext('2d');
        emptyCtx.font = '12px Arial';
        emptyCtx.fillStyle = '#cccccc';
        emptyCtx.textAlign = 'center';
        
        // Add a message in the middle of the chart
        emptyCtx.font = 'bold 16px Arial';
        emptyCtx.fillText('No pianists yet. Be the first to add one!', pianistChart.width / 2, pianistChart.height / 2);
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
        pianistsList.appendChild(li);
        
        // Allow clicking on a pianist to pre-fill the form
        li.addEventListener('click', () => {
            pianistNameInput.value = pianist.name;
            techniqueRating.value = pianist.technique;
            musicalityRating.value = pianist.musicality;
            techniqueValue.textContent = pianist.technique;
            musicalityValue.textContent = pianist.musicality;
        });
    });
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
        
        // Check if user has already voted for this pianist
        const existingVote = currentUser.votes && currentUser.votes.find(v => v.pianist.toLowerCase() === name.toLowerCase());
        
        if (existingVote) {
            alert(`You have already voted for ${name}. One vote per pianist per user!`);
            return;
        }
        
        if (existingPianistIndex !== -1) {
            // Update values and add a vote for an existing pianist
            const existingPianist = pianists[existingPianistIndex];
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
            
            saveUsers();
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
            
            saveUsers();
        }
        
        // Update the chart and list
        initChart();
        updatePianistsList();
        
        // Reset the form
        votingForm.reset();
        techniqueValue.textContent = '10';
        musicalityValue.textContent = '10';
        
        saveData();
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
    }
    
    authForm.reset();
});

function updateAuthUI() {
    if (currentUser) {
        userStatus.innerHTML = `
            Logged in as <strong>${currentUser.name}</strong> (${currentUser.email})
            <button class="logout-btn" id="logoutBtn">Logout</button>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            currentUser = null;
            updateAuthUI();
            disableVoting();
        });
    } else {
        userStatus.innerHTML = 'Not logged in. Please log in to vote.';
    }
}

function enableVoting() {
    voteButton.disabled = false;
}

function disableVoting() {
    voteButton.disabled = true;
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
    initChart();
    updatePianistsList();
    updateAuthUI();
}

// Save data when the page is about to be closed
window.addEventListener('beforeunload', saveData);

// Load data and initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Clear all existing data when page loads (only for this update)
    clearAllData();
    
    loadData();
    initChart();
    updatePianistsList();
    updateAuthUI();
});