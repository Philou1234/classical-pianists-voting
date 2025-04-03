// Données initiales avec quelques pianistes célèbres
let pianists = [
    { name: "Martha Argerich", technique: 10, musicality: 9, votes: 1 },
    { name: "Vladimir Horowitz", technique: 9.5, musicality: 9, votes: 1 },
    { name: "Glenn Gould", technique: 9, musicality: 8.5, votes: 1 },
    { name: "Arthur Rubinstein", technique: 8.5, musicality: 9.5, votes: 1 },
    { name: "Sviatoslav Richter", technique: 9.5, musicality: 9, votes: 1 },
    { name: "Lang Lang", technique: 9, musicality: 7.5, votes: 1 },
    { name: "Daniil Trifonov", technique: 9.5, musicality: 9, votes: 1 }
];

// Référence aux éléments du DOM
const pianistChart = document.getElementById('pianistChart');
const pianistsList = document.getElementById('pianistsList');
const votingForm = document.getElementById('votingForm');
const pianistNameInput = document.getElementById('pianistName');
const techniqueRating = document.getElementById('techniqueRating');
const musicalityRating = document.getElementById('musicalityRating');
const techniqueValue = document.getElementById('techniqueValue');
const musicalityValue = document.getElementById('musicalityValue');

// Initialiser le graphique
let myChart;

function initChart() {
    const ctx = pianistChart.getContext('2d');
    
    // Détruire le graphique existant s'il existe
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pianistes',
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
                    // Taille du point basée sur le nombre de votes (min 5, max 15)
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
                        text: 'Musicalité',
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
                            return `${point.name} - Technique: ${point.x}, Musicalité: ${point.y}, Votes: ${point.votes}`;
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

// Mettre à jour la liste des pianistes
function updatePianistsList() {
    pianistsList.innerHTML = '';
    
    // Trier les pianistes par nombre de votes (décroissant)
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
        
        // Permettre de cliquer sur un pianiste pour pré-remplir le formulaire
        li.addEventListener('click', () => {
            pianistNameInput.value = pianist.name;
            techniqueRating.value = pianist.technique;
            musicalityRating.value = pianist.musicality;
            techniqueValue.textContent = pianist.technique;
            musicalityValue.textContent = pianist.musicality;
        });
    });
}

// Gérer la soumission du formulaire
votingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = pianistNameInput.value.trim();
    const technique = parseFloat(techniqueRating.value);
    const musicality = parseFloat(musicalityRating.value);
    
    if (name) {
        const existingPianistIndex = pianists.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
        
        if (existingPianistIndex !== -1) {
            // Mettre à jour les valeurs et ajouter un vote pour un pianiste existant
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
            // Ajouter un nouveau pianiste
            pianists.push({
                name,
                technique,
                musicality,
                votes: 1
            });
        }
        
        // Mettre à jour le graphique et la liste
        initChart();
        updatePianistsList();
        
        // Réinitialiser le formulaire
        votingForm.reset();
        techniqueValue.textContent = '5';
        musicalityValue.textContent = '5';
    }
});

// Mettre à jour les valeurs affichées lors du déplacement des curseurs
techniqueRating.addEventListener('input', () => {
    techniqueValue.textContent = techniqueRating.value;
});

musicalityRating.addEventListener('input', () => {
    musicalityValue.textContent = musicalityRating.value;
});

// Fonction pour sauvegarder les données dans le stockage local
function saveData() {
    localStorage.setItem('pianists', JSON.stringify(pianists));
}

// Fonction pour charger les données depuis le stockage local
function loadData() {
    const savedData = localStorage.getItem('pianists');
    if (savedData) {
        pianists = JSON.parse(savedData);
    }
}

// Sauvegarder les données lorsque la page est sur le point d'être fermée
window.addEventListener('beforeunload', saveData);

// Charger les données et initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initChart();
    updatePianistsList();
});