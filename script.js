let players = [];
let currentTeams = [];

// Add a new player to the list
function addPlayer() {
    const playerInput = document.getElementById('playerName');
    const playerName = playerInput.value.trim();
    
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        updatePlayerList();
        playerInput.value = '';
        playerInput.focus();
    } else if (players.includes(playerName)) {
        alert('This player has already been added!');
    }
}

// Update the player list in the UI
function updatePlayerList() {
    const playerList = document.getElementById('players');
    const playerCount = document.querySelector('#playerList h6');
    playerList.innerHTML = '';
    
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const playerName = document.createElement('span');
        playerName.textContent = player;
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-player';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => removePlayer(index);
        
        li.appendChild(playerName);
        li.appendChild(removeBtn);
        playerList.appendChild(li);
    });
    
    playerCount.textContent = `Players (${players.length}):`;
    document.getElementById('teams').style.display = 'none';
}

// Remove a player from the list
function removePlayer(index) {
    players.splice(index, 1);
    updatePlayerList();
}

// Clear all players
function clearPlayers() {
    if (confirm('Are you sure you want to remove all players?')) {
        players = [];
        updatePlayerList();
        document.getElementById('teams').style.display = 'none';
    }
}

// Generate random teams
function generateTeams() {
    if (players.length < 2) {
        alert('You need at least 2 players to generate teams!');
        return;
    }
    
    const playersPerTeam = parseInt(document.getElementById('playersPerTeam').value);
    
    if (players.length < playersPerTeam) {
        alert(`You need at least ${playersPerTeam} players to make teams of ${playersPerTeam}!`);
        return;
    }
    
    // Create a copy of the players array to shuffle
    const shuffledPlayers = [...players];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // Create teams
    const teams = [];
    for (let i = 0; i < shuffledPlayers.length; i += playersPerTeam) {
        teams.push(shuffledPlayers.slice(i, i + playersPerTeam));
    }
    
    // Handle the case where the last team might have fewer players
    if (teams.length > 1 && teams[teams.length - 1].length < playersPerTeam) {
        // Redistribute the last team's players
        const lastTeam = teams.pop();
        lastTeam.forEach((player, i) => {
            teams[i % teams.length].push(player);
        });
    }
    
    currentTeams = teams;
    displayTeams(teams);
    calculatePayouts(players.length);
}

// Display the generated teams
function displayTeams(teams) {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    
    teams.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team-card';
        
        const teamHeader = document.createElement('div');
        teamHeader.className = 'd-flex align-items-center';
        
        const teamNumber = document.createElement('span');
        teamNumber.className = 'team-number';
        teamNumber.textContent = `Team ${index + 1}`;
        
        const teamMembers = document.createElement('div');
        teamMembers.className = 'team-members';
        
        team.forEach(player => {
            const member = document.createElement('div');
            member.textContent = player;
            teamMembers.appendChild(member);
        });
        
        teamHeader.appendChild(teamNumber);
        teamDiv.appendChild(teamHeader);
        teamDiv.appendChild(teamMembers);
        teamList.appendChild(teamDiv);
    });
    
    document.getElementById('teams').style.display = 'block';
}

// Allow adding players by pressing Enter
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        addPlayer();
    }
}

// Initialize the application
function init() {
    document.getElementById('playerName').addEventListener('keypress', handleKeyPress);
    updatePlayerList();
}

// Copy teams to clipboard in the format: player1 & player2
function copyTeamsToClipboard() {
    if (currentTeams.length === 0) {
        alert('No teams to copy! Generate teams first.');
        return;
    }
    
    // Format teams as "player1 & player2" with each team on one line
    const formattedTeams = currentTeams.map(team => team.join(' & ')).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(formattedTeams).then(() => {
        // Show success message
        const successMsg = document.getElementById('copySuccess');
        successMsg.style.display = 'block';
        
        // Hide after 2 seconds
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard: ' + err);
    });
}

// Calculate and display payouts
function calculatePayouts(numPlayers) {
    const signupCost = parseFloat(document.getElementById('signupCost').value) || 0;
    
    if (signupCost <= 0 || numPlayers < 6) {
        document.getElementById('payoutSection').style.display = 'none';
        return;
    }
    
    const prizePool = signupCost * numPlayers;
    
    // Update summary info
    document.getElementById('totalTeams').textContent = currentTeams.length;
    document.getElementById('entryFee').textContent = signupCost.toFixed(2);
    document.getElementById('prizePool').textContent = prizePool.toFixed(2);
    
    // Always use 3 place payout structure
    let payouts = [];
    
    // 3 place payout structure - round to whole dollars
    const thirdPlace = Math.floor(signupCost);
    let firstPlace = Math.floor(prizePool * 0.55);
    let secondPlace = prizePool - firstPlace - thirdPlace;
    
    // Round second place down and add remainder to first place
    const secondPlaceRounded = Math.floor(secondPlace);
    const remainder = secondPlace - secondPlaceRounded;
    firstPlace += Math.floor(remainder);
    secondPlace = secondPlaceRounded;
    
    // Ensure 2nd place is more than 3rd place
    if (secondPlace <= thirdPlace) {
        const diff = thirdPlace - secondPlace + 5;
        secondPlace += diff;
        firstPlace = Math.max(firstPlace - diff, thirdPlace + 10);
    }
    
    payouts = [
        { place: '1st Place', amount: firstPlace, percentage: (firstPlace / prizePool * 100).toFixed(1) },
        { place: '2nd Place', amount: secondPlace, percentage: (secondPlace / prizePool * 100).toFixed(1) },
        { place: '3rd Place', amount: thirdPlace, percentage: (thirdPlace / prizePool * 100).toFixed(1) }
    ];
    
    // Display payout breakdown
    const payoutBreakdown = document.getElementById('payoutBreakdown');
    payoutBreakdown.innerHTML = '<h6 class="mb-3">Payout Breakdown:</h6>';
    
    payouts.forEach((payout, index) => {
        const payoutCard = document.createElement('div');
        payoutCard.className = 'payout-card';
        if (index === 0) payoutCard.classList.add('first-place');
        if (index === 1) payoutCard.classList.add('second-place');
        if (index === 2) payoutCard.classList.add('third-place');
        
        payoutCard.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="payout-place">${payout.place}</span>
                    <span class="payout-percentage">(${payout.percentage}%)</span>
                </div>
                <div class="payout-amount">$${Math.floor(payout.amount)}</div>
            </div>
        `;
        
        payoutBreakdown.appendChild(payoutCard);
    });
    
    document.getElementById('payoutSection').style.display = 'block';
}

// Start the application when the page loads
window.onload = init;
