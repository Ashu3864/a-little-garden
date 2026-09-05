/**
 * HousePulse Main Application JavaScript Logic
 */

// ==========================================================================
// 1. Application State & Storage
// ==========================================================================
let state = {
    houses: [],
    students: [],
    events: [],
    disciplineLogs: [],
    activeTab: 'dashboard',
    theme: 'light'
};

// Initialize State from localStorage or Seed Data
function initAppState() {
    const savedData = localStorage.getItem('housepulse_data');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            state.houses = parsed.houses || INITIAL_HOUSES;
            state.students = parsed.students || INITIAL_STUDENTS;
            state.events = parsed.events || INITIAL_EVENTS;
            state.disciplineLogs = parsed.disciplineLogs || INITIAL_DISCIPLINE;
        } catch (e) {
            console.error('Failed to parse saved state, reverting to seed data:', e);
            loadSeedData();
        }
    } else {
        loadSeedData();
    }

    const savedTheme = localStorage.getItem('housepulse_theme') || 'light';
    setTheme(savedTheme);
}

function loadSeedData() {
    state.houses = JSON.parse(JSON.stringify(INITIAL_HOUSES));
    state.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    state.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    state.disciplineLogs = JSON.parse(JSON.stringify(INITIAL_DISCIPLINE));
    saveState();
}

function saveState() {
    const dataToSave = {
        houses: state.houses,
        students: state.students,
        events: state.events,
        disciplineLogs: state.disciplineLogs
    };
    localStorage.setItem('housepulse_data', JSON.stringify(dataToSave));
}

// ==========================================================================
// 2. Calculations Engine (House Points & Leaderboards)
// ==========================================================================
function calculateHouseStats() {
    // Map to hold calculated stats for each house
    const houseMap = {};
    state.houses.forEach(h => {
        houseMap[h.id] = {
            ...h,
            totalPoints: 0,
            sportsPoints: 0,
            meritPoints: 0,
            demeritPoints: 0,
            goldCount: 0,
            silverCount: 0,
            bronzeCount: 0,
            memberCount: 0
        };
    });

    // 1. Calculate Sports Event Points & Medals
    state.events.forEach(evt => {
        if (evt.winners && evt.winners.length > 0) {
            evt.winners.forEach(w => {
                if (houseMap[w.houseId]) {
                    houseMap[w.houseId].sportsPoints += (w.points || 0);
                    houseMap[w.houseId].totalPoints += (w.points || 0);
                    if (w.place === 'Gold') houseMap[w.houseId].goldCount++;
                    if (w.place === 'Silver') houseMap[w.houseId].silverCount++;
                    if (w.place === 'Bronze') houseMap[w.houseId].bronzeCount++;
                }
            });
        }
    });

    // 2. Calculate Discipline & Merit Points
    state.disciplineLogs.forEach(disc => {
        if (houseMap[disc.houseId]) {
            if (disc.type === 'Merit') {
                houseMap[disc.houseId].meritPoints += disc.points;
            } else if (disc.type === 'Demerit') {
                houseMap[disc.houseId].demeritPoints += Math.abs(disc.points);
            }
            houseMap[disc.houseId].totalPoints += disc.points;
        }
    });

    // 3. Count Members
    state.students.forEach(std => {
        if (houseMap[std.houseId]) {
            houseMap[std.houseId].memberCount++;
        }
    });

    // Convert map back to array and sort by totalPoints descending
    const sortedHouses = Object.values(houseMap).sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Assign Ranks (1 to 4)
    sortedHouses.forEach((house, index) => {
        house.rank = index + 1;
    });

    return sortedHouses;
}

// Calculate Individual Student Stats
function getStudentStats(studentId) {
    let sportsPoints = 0;
    let goldMedals = 0;
    let silverMedals = 0;
    let bronzeMedals = 0;
    let meritsCount = 0;
    let demeritsCount = 0;
    let meritPoints = 0;

    // Events won
    state.events.forEach(evt => {
        if (evt.winners) {
            evt.winners.forEach(w => {
                if (w.studentId === studentId) {
                    sportsPoints += w.points;
                    if (w.place === 'Gold') goldMedals++;
                    if (w.place === 'Silver') silverMedals++;
                    if (w.place === 'Bronze') bronzeMedals++;
                }
            });
        }
    });

    // Discipline
    state.disciplineLogs.forEach(d => {
        if (d.studentId === studentId) {
            if (d.type === 'Merit') {
                meritsCount++;
                meritPoints += d.points;
            } else {
                demeritsCount++;
                meritPoints += d.points; // negative
            }
        }
    });

    const totalContribution = sportsPoints + meritPoints;

    return {
        sportsPoints,
        goldMedals,
        silverMedals,
        bronzeMedals,
        meritsCount,
        demeritsCount,
        meritPoints,
        totalContribution
    };
}

// ==========================================================================
// 3. Theme Toggle & Toast Notifications
// ==========================================================================
function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('housepulse_theme', theme);
    
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        refreshIcons();
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconName = type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-triangle' : 'info';
    toast.innerHTML = `
        <i data-lucide="${iconName}" style="color: ${type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'};"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    refreshIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// ==========================================================================
// 4. Render Functions for Views
// ==========================================================================

// --- TAB 1: DASHBOARD / STANDINGS ---
function renderDashboard() {
    const houses = calculateHouseStats();
    const maxScore = Math.max(...houses.map(h => h.totalPoints), 100);

    // 1. Render Hero Leaderboard Cards
    const leaderboardCardsContainer = document.getElementById('heroLeaderboardCards');
    if (leaderboardCardsContainer) {
        leaderboardCardsContainer.innerHTML = houses.map(h => {
            const fillPct = Math.max(Math.min((h.totalPoints / maxScore) * 100, 100), 5);
            const rankIcon = h.rank === 1 ? '👑 #1' : h.rank === 2 ? '🥈 #2' : h.rank === 3 ? '🥉 #3' : '#4';
            
            return `
                <div class="house-standings-card rank-${h.rank}" style="border-left: 5px solid ${h.badgeColor};">
                    <div class="rank-badge rank-${h.rank}">${rankIcon}</div>
                    
                    <div class="house-header-info">
                        <div class="house-icon-large" style="background-color: ${h.lightBg}; border-color: ${h.badgeColor};">
                            ${h.icon}
                        </div>
                        <div>
                            <h3 class="house-name-title">${h.name}</h3>
                            <span class="house-tagline">${h.tagline}</span>
                        </div>
                    </div>

                    <div class="house-score-main">
                        <span class="score-number" style="color: ${h.badgeColor};">${h.totalPoints.toLocaleString()}</span>
                        <span class="score-label">Points</span>
                    </div>

                    <div class="score-progress-bar">
                        <div class="score-progress-fill" style="width: ${fillPct}%; background: ${h.accentGradient};"></div>
                    </div>

                    <div class="house-breakdown-grid">
                        <div>
                            <div class="breakdown-item-val" style="color: var(--accent-gold);">🥇 ${h.goldCount}</div>
                            <div class="breakdown-item-lbl">Golds</div>
                        </div>
                        <div>
                            <div class="breakdown-item-val" style="color: var(--accent-success);">+${h.sportsPoints}</div>
                            <div class="breakdown-item-lbl">Sports Pts</div>
                        </div>
                        <div>
                            <div class="breakdown-item-val" style="color: var(--brand-primary);">${h.memberCount}</div>
                            <div class="breakdown-item-lbl">Students</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Render Recent Activity Feed
    const activityFeedContainer = document.getElementById('activityFeedList');
    if (activityFeedContainer) {
        // Merge recent sports winner entries & discipline entries
        const activities = [];

        state.events.forEach(evt => {
            if (evt.status === 'Completed' && evt.winners) {
                evt.winners.forEach(w => {
                    const student = state.students.find(s => s.id === w.studentId);
                    const house = state.houses.find(h => h.id === w.houseId);
                    activities.push({
                        type: 'Sports Winner',
                        title: `${w.place} Medal - ${evt.title}`,
                        subtitle: `${student ? student.name : 'Student'} (${house ? house.name : ''})`,
                        points: w.points,
                        date: evt.date,
                        icon: w.place === 'Gold' ? '🥇' : w.place === 'Silver' ? '🥈' : '🥉',
                        isPositive: true
                    });
                });
            }
        });

        state.disciplineLogs.forEach(d => {
            const student = state.students.find(s => s.id === d.studentId);
            const house = state.houses.find(h => h.id === d.houseId);
            activities.push({
                type: d.type,
                title: d.title,
                subtitle: `${student ? student.name : 'Student'} • ${d.category} (${house ? house.name : ''})`,
                points: d.points,
                date: d.date,
                icon: d.type === 'Merit' ? '✨' : '⚠️',
                isPositive: d.points >= 0
            });
        });

        // Sort activities by date descending
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivities = activities.slice(0, 7);

        const activityCountTag = document.getElementById('recentActivityCount');
        if (activityCountTag) activityCountTag.textContent = `${activities.length} Total Logs`;

        activityFeedContainer.innerHTML = recentActivities.map(act => `
            <div class="activity-item">
                <div class="activity-left">
                    <div class="activity-icon" style="background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        ${act.icon}
                    </div>
                    <div>
                        <div class="activity-title">${act.title}</div>
                        <div class="activity-meta">${act.subtitle} • ${act.date}</div>
                    </div>
                </div>
                <div class="activity-pts ${act.isPositive ? 'pts-positive' : 'pts-negative'}">
                    ${act.isPositive ? '+' : ''}${act.points} pts
                </div>
            </div>
        `).join('');
    }

    // 3. Render Quick Stats Summary
    const quickStatsContainer = document.getElementById('quickStatsSummary');
    if (quickStatsContainer) {
        const topHouse = houses[0];
        const totalMedals = houses.reduce((sum, h) => sum + h.goldCount + h.silverCount + h.bronzeCount, 0);

        quickStatsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="background: ${topHouse.lightBg}; padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid ${topHouse.badgeColor};">
                    <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: ${topHouse.badgeColor};">Leading House</div>
                    <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; margin-top: 0.2rem;">
                        ${topHouse.icon} ${topHouse.name}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        ${topHouse.totalPoints.toLocaleString()} Points • Captain: ${topHouse.captain}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                    <div style="background-color: var(--bg-base); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                        <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--accent-gold);">${totalMedals}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); uppercase;">Total Medals Awarded</div>
                    </div>
                    <div style="background-color: var(--bg-base); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
                        <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--brand-primary);">${state.students.length}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); uppercase;">Enrolled Students</div>
                    </div>
                </div>
            </div>
        `;
    }

    refreshIcons();
}

// --- TAB 2: STUDENTS DIRECTORY ---
function renderStudents() {
    const searchVal = (document.getElementById('studentSearchInput')?.value || '').toLowerCase().trim();
    const houseVal = document.getElementById('houseFilterSelect')?.value || 'all';
    const gradeVal = document.getElementById('gradeFilterSelect')?.value || 'all';

    const filteredStudents = state.students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchVal) || 
                              s.rollNo.toLowerCase().includes(searchVal) || 
                              s.grade.toLowerCase().includes(searchVal);
        const matchesHouse = houseVal === 'all' || s.houseId === houseVal;
        const matchesGrade = gradeVal === 'all' || s.grade.startsWith(gradeVal);

        return matchesSearch && matchesHouse && matchesGrade;
    });

    const gridContainer = document.getElementById('studentsGridContainer');
    if (!gridContainer) return;

    if (filteredStudents.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i data-lucide="user-x" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 0.5rem;"></i>
                <p style="font-size: 1.1rem; font-weight: 600;">No students found matching filters.</p>
            </div>
        `;
        refreshIcons();
        return;
    }

    gridContainer.innerHTML = filteredStudents.map(std => {
        const house = state.houses.find(h => h.id === std.houseId) || INITIAL_HOUSES[0];
        const stats = getStudentStats(std.id);

        return `
            <div class="student-card">
                <div class="student-card-header">
                    <img src="${std.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}" alt="${std.name}" class="student-avatar">
                    <div>
                        <h3 class="student-name">${std.name}</h3>
                        <div class="student-roll">Roll: ${std.rollNo} • Gr ${std.grade}</div>
                        <div style="margin-top: 0.35rem;">
                            <span class="house-badge-pill" style="background-color: ${house.lightBg}; color: ${house.badgeColor}; border: 1px solid ${house.badgeColor};">
                                ${house.icon} ${house.name}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="student-stats-row">
                    <div>
                        <div class="stat-cell-num" style="color: var(--accent-gold);">🥇 ${stats.goldMedals + stats.silverMedals + stats.bronzeMedals}</div>
                        <div class="stat-cell-lbl">Medals</div>
                    </div>
                    <div>
                        <div class="stat-cell-num" style="color: var(--accent-success);">+${stats.sportsPoints + stats.meritPoints}</div>
                        <div class="stat-cell-lbl">Pts Contrib</div>
                    </div>
                    <div>
                        <div class="stat-cell-num" style="color: var(--brand-primary);">${stats.meritsCount}</div>
                        <div class="stat-cell-lbl">Merits</div>
                    </div>
                </div>

                <div class="student-card-actions">
                    <button class="btn-secondary" style="flex: 1; padding: 0.45rem; font-size: 0.8rem;" onclick="viewStudentProfile('${std.id}')">
                        <i data-lucide="eye"></i> Profile
                    </button>
                    <button class="btn-secondary" style="padding: 0.45rem 0.75rem;" onclick="openEditStudentModal('${std.id}')" title="Edit Student">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-secondary" style="padding: 0.45rem 0.75rem; color: var(--accent-danger);" onclick="deleteStudent('${std.id}')" title="Delete Student">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    refreshIcons();
}

// --- TAB 3: HOUSES DETAILED VIEW ---
function renderHouses() {
    const houses = calculateHouseStats();
    const housesGrid = document.getElementById('housesDetailGrid');
    if (!housesGrid) return;

    housesGrid.innerHTML = houses.map(h => {
        const houseStudents = state.students.filter(s => s.houseId === h.id);

        return `
            <div class="house-detail-card">
                <div class="house-detail-banner" style="background: ${h.accentGradient};">
                    <div class="house-banner-header">
                        <div>
                            <div style="font-size: 2rem;">${h.icon}</div>
                            <h2 class="house-banner-title">${h.name}</h2>
                            <p style="opacity: 0.85; font-size: 0.88rem;">"${h.tagline}"</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.78rem; text-transform: uppercase; opacity: 0.85; font-weight: 700;">Rank #${h.rank}</div>
                            <div class="house-banner-score">${h.totalPoints.toLocaleString()} pts</div>
                        </div>
                    </div>
                </div>

                <div class="house-detail-body">
                    <div class="house-leadership-row">
                        <div>
                            <div class="leader-label">House Master</div>
                            <div class="leader-name">${h.houseMaster}</div>
                        </div>
                        <div>
                            <div class="leader-label">House Captain</div>
                            <div class="leader-name">${h.captain}</div>
                        </div>
                        <div>
                            <div class="leader-label">Vice Captain</div>
                            <div class="leader-name">${h.viceCaptain}</div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                        <h4 style="font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem;">
                            House Roster (${houseStudents.length} Students)
                        </h4>
                        <div style="display: flex; gap: 0.75rem; font-size: 0.85rem; font-weight: 600;">
                            <span style="color: var(--accent-gold);">🥇 ${h.goldCount}</span>
                            <span style="color: var(--accent-silver);">🥈 ${h.silverCount}</span>
                            <span style="color: var(--accent-bronze);">🥉 ${h.bronzeCount}</span>
                        </div>
                    </div>

                    <div class="table-container" style="max-height: 220px; overflow-y: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th>Grade</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${houseStudents.map(s => `
                                    <tr>
                                        <td><strong>${s.rollNo}</strong></td>
                                        <td>${s.name}</td>
                                        <td>Grade ${s.grade}</td>
                                        <td>
                                            <button class="btn-secondary" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="viewStudentProfile('${s.id}')">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    refreshIcons();
}

// --- TAB 4: SPORTS EVENTS ---
let selectedEventCategory = 'all';

function renderEvents() {
    const eventsListContainer = document.getElementById('eventsListContainer');
    if (!eventsListContainer) return;

    const filteredEvents = state.events.filter(evt => {
        return selectedEventCategory === 'all' || evt.category === selectedEventCategory;
    });

    if (filteredEvents.length === 0) {
        eventsListContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-md);">
                <i data-lucide="medal" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 0.5rem;"></i>
                <p style="font-size: 1.1rem; font-weight: 600;">No sports events found under this category.</p>
            </div>
        `;
        refreshIcons();
        return;
    }

    eventsListContainer.innerHTML = filteredEvents.map(evt => {
        const isCompleted = evt.status === 'Completed';

        return `
            <div class="event-card">
                <div class="event-info-main">
                    <h3 class="event-title">${evt.title}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">${evt.description || 'Inter-house sports event competition.'}</p>
                    <div class="event-meta-tags">
                        <span class="badge-tag status-badge ${isCompleted ? 'status-completed' : 'status-upcoming'}">
                            ${isCompleted ? '✓ Completed' : '📅 Upcoming'}
                        </span>
                        <span class="badge-tag"><i data-lucide="tag" style="width:12px;"></i> ${evt.category}</span>
                        <span class="badge-tag"><i data-lucide="calendar" style="width:12px;"></i> ${evt.date}</span>
                        <span class="badge-tag"><i data-lucide="map-pin" style="width:12px;"></i> ${evt.location || 'Academy Field'}</span>
                    </div>
                </div>

                <div class="winners-podium">
                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.2rem;">
                        ${isCompleted ? 'Official Results & Winners' : 'Pending Winners Announcement'}
                    </div>
                    ${isCompleted && evt.winners && evt.winners.length > 0 ? evt.winners.map(w => {
                        const student = state.students.find(s => s.id === w.studentId);
                        const house = state.houses.find(h => h.id === w.houseId);
                        const medalClass = w.place.toLowerCase();

                        return `
                            <div class="podium-item">
                                <span class="podium-medal ${medalClass}">
                                    ${w.place === 'Gold' ? '🥇' : w.place === 'Silver' ? '🥈' : '🥉'} ${w.place}
                                </span>
                                <span style="font-weight: 600; flex: 1;">${student ? student.name : 'Unknown Student'}</span>
                                <span class="house-badge-pill" style="background-color: ${house ? house.lightBg : 'transparent'}; color: ${house ? house.badgeColor : 'inherit'}; font-size: 0.7rem;">
                                    ${house ? house.name : ''} (+${w.points} pts)
                                </span>
                            </div>
                        `;
                    }).join('') : '<div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No winners recorded yet for this event.</div>'}
                </div>

                <div>
                    <button class="btn-primary" onclick="openRecordWinnerModal('${evt.id}')">
                        <i data-lucide="${isCompleted ? 'edit-2' : 'award'}"></i> ${isCompleted ? 'Edit Winners' : 'Record Winners'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    refreshIcons();
}

// --- TAB 5: DISCIPLINE & MERITS ---
function renderDiscipline() {
    const searchVal = (document.getElementById('disciplineSearchInput')?.value || '').toLowerCase().trim();
    const typeVal = document.getElementById('disciplineTypeSelect')?.value || 'all';
    const houseVal = document.getElementById('disciplineHouseSelect')?.value || 'all';

    const filteredLogs = state.disciplineLogs.filter(d => {
        const student = state.students.find(s => s.id === d.studentId);
        const studentName = student ? student.name.toLowerCase() : '';
        const matchesSearch = studentName.includes(searchVal) || 
                              d.title.toLowerCase().includes(searchVal) || 
                              d.issuer.toLowerCase().includes(searchVal);
        const matchesType = typeVal === 'all' || d.type === typeVal;
        const matchesHouse = houseVal === 'all' || d.houseId === houseVal;

        return matchesSearch && matchesType && matchesHouse;
    });

    // Sort by date descending
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tableBody = document.getElementById('disciplineTableBody');
    if (!tableBody) return;

    if (filteredLogs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No discipline or merit records found matching filters.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredLogs.map(d => {
        const student = state.students.find(s => s.id === d.studentId);
        const house = state.houses.find(h => h.id === d.houseId) || INITIAL_HOUSES[0];
        const isMerit = d.type === 'Merit';

        return `
            <tr>
                <td><strong>${d.date}</strong></td>
                <td>
                    <div style="font-weight: 600;">${student ? student.name : 'Student'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${student ? 'Grade ' + student.grade : ''}</div>
                </td>
                <td>
                    <span class="house-badge-pill" style="background-color: ${house.lightBg}; color: ${house.badgeColor}; border: 1px solid ${house.badgeColor}; font-size: 0.72rem;">
                        ${house.icon} ${house.name}
                    </span>
                </td>
                <td>
                    <span class="badge-tag" style="background-color: ${isMerit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; color: ${isMerit ? 'var(--accent-success)' : 'var(--accent-danger)'}; font-weight: 700;">
                        ${d.type}
                    </span>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${d.category}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${d.title}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${d.notes || ''}</div>
                </td>
                <td>${d.issuer || 'System'}</td>
                <td>
                    <span class="activity-pts ${isMerit ? 'pts-positive' : 'pts-negative'}">
                        ${isMerit ? '+' : ''}${d.points} pts
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    refreshIcons();
}

// --- TAB 6: ANALYTICS & SYSTEM ---
function renderAnalytics() {
    // 1. Top 5 Students Individual Leaderboard
    const studentPerformance = state.students.map(s => {
        const stats = getStudentStats(s.id);
        const house = state.houses.find(h => h.id === s.houseId);
        return {
            student: s,
            house,
            stats
        };
    }).sort((a, b) => b.stats.totalContribution - a.stats.totalContribution).slice(0, 5);

    const topListContainer = document.getElementById('topStudentsList');
    if (topListContainer) {
        topListContainer.innerHTML = studentPerformance.map((item, idx) => `
            <div class="top-student-row">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                    <div style="font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; width: 24px; color: ${idx === 0 ? 'var(--accent-gold)' : 'var(--text-muted)'};">
                        #${idx + 1}
                    </div>
                    <img src="${item.student.avatar}" alt="${item.student.name}" class="student-avatar" style="width: 42px; height: 42px;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.95rem;">${item.student.name}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Grade ${item.student.grade} • ${item.house ? item.house.name : ''}</div>
                    </div>
                </div>

                <div style="text-align: right;">
                    <div style="font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; color: var(--accent-success);">
                        +${item.stats.totalContribution} pts
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                        🥇 ${item.stats.goldMedals} Golds • ✨ ${item.stats.meritsCount} Merits
                    </div>
                </div>
            </div>
        `).join('');
    }

    refreshIcons();
}

// ==========================================================================
// 5. Modal Controllers & Action Handlers
// ==========================================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// --- STUDENT MODAL ---
function openAddStudentModal() {
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentIdInput').value = '';
    openModal('addStudentModal');
}

function openEditStudentModal(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('studentModalTitle').textContent = 'Edit Student Profile';
    document.getElementById('studentIdInput').value = student.id;
    document.getElementById('studentNameInput').value = student.name;
    document.getElementById('studentGradeInput').value = student.grade;
    document.getElementById('studentRollInput').value = student.rollNo;
    document.getElementById('studentHouseSelect').value = student.houseId;
    document.getElementById('studentGenderSelect').value = student.gender || 'Male';
    document.getElementById('studentEmailInput').value = student.email || '';
    document.getElementById('studentContactInput').value = student.guardianContact || '';

    openModal('addStudentModal');
}

function saveStudent() {
    const id = document.getElementById('studentIdInput').value;
    const name = document.getElementById('studentNameInput').value.trim();
    const grade = document.getElementById('studentGradeInput').value.trim();
    const rollNo = document.getElementById('studentRollInput').value.trim();
    const houseId = document.getElementById('studentHouseSelect').value;
    const gender = document.getElementById('studentGenderSelect').value;
    const email = document.getElementById('studentEmailInput').value.trim();
    const guardianContact = document.getElementById('studentContactInput').value.trim();

    if (!name || !grade || !rollNo) {
        showToast('Please fill in all required student fields.', 'danger');
        return;
    }

    if (id) {
        // Edit Existing Student
        const index = state.students.findIndex(s => s.id === id);
        if (index !== -1) {
            state.students[index] = {
                ...state.students[index],
                name, grade, rollNo, houseId, gender, email, guardianContact
            };
            showToast(`Updated student profile for ${name}`);
        }
    } else {
        // Add New Student
        const newStudent = {
            id: 'std-' + Date.now(),
            name, grade, rollNo, houseId, gender, email, guardianContact,
            avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random()*1000)}?w=150&auto=format&fit=crop&q=80`,
            joinedYear: new Date().getFullYear()
        };
        state.students.push(newStudent);
        showToast(`Added ${name} to ${state.houses.find(h=>h.id===houseId)?.name}`);
    }

    saveState();
    closeModal('addStudentModal');
    renderStudents();
    renderDashboard();
    renderHouses();
}

function deleteStudent(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
        state.students = state.students.filter(s => s.id !== studentId);
        saveState();
        showToast(`Deleted student ${student.name}`, 'danger');
        renderStudents();
        renderDashboard();
        renderHouses();
    }
}

// --- RECORD WINNERS MODAL ---
function openRecordWinnerModal(eventId) {
    const evt = state.events.find(e => e.id === eventId);
    if (!evt) return;

    document.getElementById('winnerEventIdInput').value = evt.id;
    document.getElementById('winnerEventTitleDisplay').value = evt.title;

    // Populate Student Select dropdowns
    const goldSelect = document.getElementById('goldStudentSelect');
    const silverSelect = document.getElementById('silverStudentSelect');
    const bronzeSelect = document.getElementById('bronzeStudentSelect');

    const optionsHtml = '<option value="">-- Select Winner Student --</option>' + 
        state.students.map(s => {
            const h = state.houses.find(h => h.id === s.houseId);
            return `<option value="${s.id}">${s.name} (${s.rollNo} • ${h ? h.name : ''})</option>`;
        }).join('');

    goldSelect.innerHTML = optionsHtml;
    silverSelect.innerHTML = optionsHtml;
    bronzeSelect.innerHTML = optionsHtml;

    // Pre-select if winners exist
    if (evt.winners && evt.winners.length > 0) {
        const goldWinner = evt.winners.find(w => w.place === 'Gold');
        const silverWinner = evt.winners.find(w => w.place === 'Silver');
        const bronzeWinner = evt.winners.find(w => w.place === 'Bronze');

        if (goldWinner) goldSelect.value = goldWinner.studentId;
        if (silverWinner) silverSelect.value = silverWinner.studentId;
        if (bronzeWinner) bronzeSelect.value = bronzeWinner.studentId;
    }

    openModal('recordWinnerModal');
}

function saveEventWinners() {
    const eventId = document.getElementById('winnerEventIdInput').value;
    const goldStudentId = document.getElementById('goldStudentSelect').value;
    const silverStudentId = document.getElementById('silverStudentSelect').value;
    const bronzeStudentId = document.getElementById('bronzeStudentSelect').value;

    if (!goldStudentId || !silverStudentId || !bronzeStudentId) {
        showToast('Please select Gold, Silver, and Bronze winners.', 'danger');
        return;
    }

    const evtIndex = state.events.findIndex(e => e.id === eventId);
    if (evtIndex === -1) return;

    const goldStudent = state.students.find(s => s.id === goldStudentId);
    const silverStudent = state.students.find(s => s.id === silverStudentId);
    const bronzeStudent = state.students.find(s => s.id === bronzeStudentId);

    state.events[evtIndex].status = 'Completed';
    state.events[evtIndex].winners = [
        { place: 'Gold', studentId: goldStudentId, houseId: goldStudent.houseId, points: 50 },
        { place: 'Silver', studentId: silverStudentId, houseId: silverStudent.houseId, points: 30 },
        { place: 'Bronze', studentId: bronzeStudentId, houseId: bronzeStudent.houseId, points: 15 }
    ];

    saveState();
    closeModal('recordWinnerModal');
    showToast(`Recorded winners for ${state.events[evtIndex].title}! House points updated!`);
    renderEvents();
    renderDashboard();
    renderHouses();
}

// --- DISCIPLINE LOG MODAL ---
function openAddDisciplineModal() {
    const studentSelect = document.getElementById('discStudentSelect');
    studentSelect.innerHTML = '<option value="">-- Select Student --</option>' + 
        state.students.map(s => {
            const h = state.houses.find(h => h.id === s.houseId);
            return `<option value="${s.id}">${s.name} (${s.rollNo} • ${h ? h.name : ''})</option>`;
        }).join('');

    document.getElementById('disciplineForm').reset();
    document.getElementById('discPointsInput').value = 15;
    openModal('addDisciplineModal');
}

function saveDiscipline() {
    const studentId = document.getElementById('discStudentSelect').value;
    const type = document.getElementById('discTypeSelect').value;
    let points = parseInt(document.getElementById('discPointsInput').value, 10);
    const category = document.getElementById('discCategorySelect').value;
    const title = document.getElementById('discTitleInput').value.trim();
    const issuer = document.getElementById('discIssuerInput').value.trim() || 'Academy Officer';
    const notes = document.getElementById('discNotesInput').value.trim();

    if (!studentId || !title || isNaN(points)) {
        showToast('Please fill in required discipline log fields.', 'danger');
        return;
    }

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    if (type === 'Demerit' && points > 0) points = -points;
    if (type === 'Merit' && points < 0) points = Math.abs(points);

    const newLog = {
        id: 'disc-' + Date.now(),
        studentId,
        houseId: student.houseId,
        type,
        category,
        title,
        points,
        date: new Date().toISOString().split('T')[0],
        issuer,
        notes
    };

    state.disciplineLogs.push(newLog);
    saveState();
    closeModal('addDisciplineModal');
    showToast(`Logged ${type} entry for ${student.name} (${points > 0 ? '+' : ''}${points} pts)`);
    renderDiscipline();
    renderDashboard();
    renderHouses();
}

// --- CREATE EVENT MODAL ---
function openAddEventModal() {
    document.getElementById('eventForm').reset();
    document.getElementById('eventDateInput').value = new Date().toISOString().split('T')[0];
    openModal('addEventModal');
}

function saveEvent() {
    const title = document.getElementById('eventTitleInput').value.trim();
    const category = document.getElementById('eventCategorySelect').value;
    const date = document.getElementById('eventDateInput').value;
    const ageGroup = document.getElementById('eventAgeInput').value.trim() || 'Open';
    const location = document.getElementById('eventLocationInput').value.trim() || 'Main Field';
    const description = document.getElementById('eventDescInput').value.trim();

    if (!title || !date) {
        showToast('Please enter title and date for the event.', 'danger');
        return;
    }

    const newEvent = {
        id: 'evt-' + Date.now(),
        title, category, date, status: 'Upcoming', ageGroup, location, description, winners: []
    };

    state.events.push(newEvent);
    saveState();
    closeModal('addEventModal');
    showToast(`Created event "${title}"!`);
    renderEvents();
}

// --- VIEW STUDENT PROFILE MODAL ---
function viewStudentProfile(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    const house = state.houses.find(h => h.id === student.houseId) || INITIAL_HOUSES[0];
    const stats = getStudentStats(student.id);

    const modalBody = document.getElementById('studentDetailModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="${student.avatar}" alt="${student.name}" class="student-avatar" style="width: 80px; height: 80px; margin: 0 auto 0.75rem auto;">
            <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800;">${student.name}</h2>
            <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem;">Roll: ${student.rollNo} • Class ${student.grade}</div>
            <span class="house-badge-pill" style="background-color: ${house.lightBg}; color: ${house.badgeColor}; border: 1px solid ${house.badgeColor}; font-size: 0.85rem;">
                ${house.icon} ${house.name}
            </span>
        </div>

        <div class="student-stats-row" style="margin-bottom: 1.5rem;">
            <div>
                <div class="stat-cell-num" style="color: var(--accent-gold);">🥇 ${stats.goldMedals} G / 🥈 ${stats.silverMedals} S</div>
                <div class="stat-cell-lbl">Medal Tally</div>
            </div>
            <div>
                <div class="stat-cell-num" style="color: var(--accent-success);">+${stats.totalContribution}</div>
                <div class="stat-cell-lbl">House Pts Contributed</div>
            </div>
            <div>
                <div class="stat-cell-num" style="color: var(--brand-primary);">${stats.meritsCount} Merits</div>
                <div class="stat-cell-lbl">Conduct Record</div>
            </div>
        </div>

        <div style="background-color: var(--bg-base); padding: 1rem; border-radius: var(--radius-md); font-size: 0.88rem;">
            <div style="font-weight: 700; margin-bottom: 0.5rem; color: var(--text-secondary);">Contact Information</div>
            <div>📧 <strong>Email:</strong> ${student.email || 'N/A'}</div>
            <div style="margin-top: 0.25rem;">📞 <strong>Guardian:</strong> ${student.guardianContact || 'N/A'}</div>
        </div>
    `;

    openModal('studentDetailModal');
}

// --- IMPORT / EXPORT / RESET UTILITIES ---
function exportJsonData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `housepulse_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported backup data to JSON!');
}

function exportCsvStudents() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Grade,RollNo,House,Gender,Email\n";

    state.students.forEach(s => {
        const house = state.houses.find(h => h.id === s.houseId);
        csvContent += `"${s.id}","${s.name}","${s.grade}","${s.rollNo}","${house ? house.name : s.houseId}","${s.gender}","${s.email}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `housepulse_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Exported student directory to CSV!');
}

function importJsonData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.houses && parsed.students && parsed.events) {
                state.houses = parsed.houses;
                state.students = parsed.students;
                state.events = parsed.events;
                state.disciplineLogs = parsed.disciplineLogs || [];
                saveState();
                showToast('Successfully imported database!');
                renderCurrentTab();
            } else {
                showToast('Invalid backup file format.', 'danger');
            }
        } catch (err) {
            showToast('Failed to parse JSON file.', 'danger');
        }
    };
    reader.readAsText(file);
}

function resetData() {
    if (confirm('Are you sure you want to reset all data back to original demo state?')) {
        loadSeedData();
        showToast('Reset all data to default demo state!');
        renderCurrentTab();
    }
}

// ==========================================================================
// 6. Navigation & Event Listeners Binding
// ==========================================================================
function renderCurrentTab() {
    switch (state.activeTab) {
        case 'dashboard': renderDashboard(); break;
        case 'students': renderStudents(); break;
        case 'houses': renderHouses(); break;
        case 'events': renderEvents(); break;
        case 'discipline': renderDiscipline(); break;
        case 'analytics': renderAnalytics(); break;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAppState();

    // Navigation Tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetTab = tab.getAttribute('data-tab');
            state.activeTab = targetTab;

            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(`tab-${targetTab}`);
            if (targetPane) targetPane.classList.add('active');

            renderCurrentTab();
        });
    });

    // Theme Toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    });

    // Quick Action Buttons
    document.getElementById('openAddStudentBtn')?.addEventListener('click', openAddStudentModal);
    document.getElementById('quickLogMeritBtn')?.addEventListener('click', openAddDisciplineModal);
    document.getElementById('openAddDisciplineBtn')?.addEventListener('click', openAddDisciplineModal);
    document.getElementById('openAddEventBtn')?.addEventListener('click', openAddEventModal);
    document.getElementById('quickRecordWinnerBtn')?.addEventListener('click', () => {
        // Open first uncompleted or last event
        const pendingEvt = state.events.find(e => e.status === 'Upcoming') || state.events[0];
        if (pendingEvt) openRecordWinnerModal(pendingEvt.id);
    });

    // Modal Close Buttons
    document.querySelectorAll('.closeModalBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const overlay = e.target.closest('.modal-overlay');
            if (overlay) overlay.classList.remove('active');
        });
    });

    // Save Handlers
    document.getElementById('saveStudentBtn')?.addEventListener('click', saveStudent);
    document.getElementById('saveWinnersBtn')?.addEventListener('click', saveEventWinners);
    document.getElementById('saveDisciplineBtn')?.addEventListener('click', saveDiscipline);
    document.getElementById('saveEventBtn')?.addEventListener('click', saveEvent);

    // Filters and Search
    document.getElementById('studentSearchInput')?.addEventListener('input', renderStudents);
    document.getElementById('houseFilterSelect')?.addEventListener('change', renderStudents);
    document.getElementById('gradeFilterSelect')?.addEventListener('change', renderStudents);

    document.getElementById('disciplineSearchInput')?.addEventListener('input', renderDiscipline);
    document.getElementById('disciplineTypeSelect')?.addEventListener('change', renderDiscipline);
    document.getElementById('disciplineHouseSelect')?.addEventListener('change', renderDiscipline);

    // Category Tabs in Events
    document.querySelectorAll('#eventCategoryFilters button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#eventCategoryFilters button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedEventCategory = btn.getAttribute('data-category');
            renderEvents();
        });
    });

    // Export / Import / Reset Handlers
    document.getElementById('exportJsonBtn')?.addEventListener('click', exportJsonData);
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportCsvStudents);
    document.getElementById('resetDataBtn')?.addEventListener('click', resetData);
    document.getElementById('importJsonInput')?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            importJsonData(e.target.files[0]);
        }
    });

    // Initial View Render
    renderDashboard();
});
