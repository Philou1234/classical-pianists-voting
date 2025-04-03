// Initial data with some famous pianists
let pianists = [
    { name: "Martha Argerich", technique: 10, musicality: 9, votes: 1 },
    { name: "Vladimir Horowitz", technique: 9.5, musicality: 9, votes: 1 },
    { name: "Glenn Gould", technique: 9, musicality: 8.5, votes: 1 },
    { name: "Arthur Rubinstein", technique: 8.5, musicality: 9.5, votes: 1 },
    { name: "Sviatoslav Richter", technique: 9.5, musicality: 9, votes: 1 },
    { name: "Lang Lang", technique: 9, musicality: 7.5, votes: 1 },
    { name: "Daniil Trifonov", technique: 9.5, musicality: 9, votes: 1 }
];

// DOM element references
const pianistChart = document.getElementById('pianistChart');
const pianistsList = document.getElementById('pianistsList');
const votingForm = document.getElementById('votingForm');
const pianistNameInput = document.getElementById('pianistName');
const techniqueRating = document.getElementById('techniqueRating');
const musicalityRating = document.getElementById('musicalityRating');
const techniqueValue = document.getElementById('techniqueValue');
const musicalityValue = document.getElementById('musicalityValue');

// Initialize the chart
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
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1,
                pointRadius: function(context) {
                    const index = context.dataIndex;
                    const votes = context.dataset.data[index].votes;
                    // Point size based on the number of votes (min 5, max 15)
                    return Math.min(Math.max(votes * 2, 5), 15);
                },
                pointHoverRadius: function(context) {
                    const index = context.dataIndex;
                    const votes = context.dataset.data[index].votes;
                    return Math.min(Math.max(votes * 2, 5), 15) + 2;
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
                    max: 10.5
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
                    max: 10.5
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
        }
    });
}

// Update the pianists list
function updatePianistsList() {
    pianistsList.innerHTML = '';
    
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
    
    const name = pianistNameInput.value.trim();
    const technique = parseFloat(techniqueRating.value);
    const musicality = parseFloat(musicalityRating.value);
    
    if (name) {
        const existingPianistIndex = pianists.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
        
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
        } else {
            // Add a new pianist
            pianists.push({
                name,
                technique,
                musicality,
                votes: 1
            });
        }
        
        // Update the chart and list
        initChart();
        updatePianistsList();
        
        // Reset the form
        votingForm.reset();
        techniqueValue.textContent = '5';
        musicalityValue.textContent = '5';
    }
});

// Update displayed values when sliders move
techniqueRating.addEventListener('input', () => {
    techniqueValue.textContent = techniqueRating.value;
});

musicalityRating.addEventListener('input', () => {
    musicalityValue.textContent = musicalityRating.value;
});

// Function to save data to local storage
function saveData() {
    localStorage.setItem('pianists', JSON.stringify(pianists));
}

// Function to load data from local storage
function loadData() {
    const savedData = localStorage.getItem('pianists');
    if (savedData) {
        pianists = JSON.parse(savedData);
    }
}

// Save data when the page is about to be closed
window.addEventListener('beforeunload', saveData);

// Load data and initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initChart();
    updatePianistsList();
});