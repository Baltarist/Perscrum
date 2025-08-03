import { Badge, User, Project, TaskStatus } from '../types';

// The master list of all possible badges in the application.
export const ALL_BADGES: Badge[] = [
    { id: 'goal-hunter', name: 'Hedef Avcısı', criteria: 'İlk projeni başarıyla tamamla.', icon: '🎯', type: 'achievement' },
    { id: 'sprint-warrior', name: 'Sprint Savaşçısı', criteria: 'Aynı projede 3 sprinti başarıyla tamamla.', icon: '🏃‍♂️', type: 'consistency' },
    { id: 'streak-master-5', name: 'Çalışkanlık Ustası', criteria: '5 farklı günde check-in yap.', icon: '🔥', type: 'streak' },
    { id: 'night-owl', name: 'Gece Kuşu', criteria: 'Gece 22:00\'den sonra bir görev tamamla.', icon: '🦉', type: 'achievement' },
    { id: 'early-bird', name: 'Sabah Kuşu', criteria: 'Sabah 07:00\'den önce bir görev tamamla.', icon: '🐦', type: 'achievement' },
    { id: 'planning-guru', name: 'Planlama Gurusu', criteria: 'Aktif bir sprintin her günü için en az bir görev planla.', icon: '🗓️', type: 'planning' },
];

export const getBadgeById = (id: string): Badge | undefined => {
    return ALL_BADGES.find(b => b.id === id);
};

interface UserDataForBadges {
    user: User;
    projects: Project[];
}

/**
 * Checks if a user has earned any new badges based on their current data.
 * @param data - The user's complete data (user profile and projects).
 * @returns An array of newly earned Badge objects.
 */
export const checkAllBadges = (data: UserDataForBadges): Badge[] => {
    const { user, projects } = data;
    const earnedBadgeIds = new Set(user.badges);
    const newBadges: Badge[] = [];
    const allTasks = projects.flatMap(p => p.sprints.flatMap(s => s.tasks));

    const checkAndAdd = (badge: Badge) => {
        if (!earnedBadgeIds.has(badge.id)) {
            newBadges.push(badge);
            earnedBadgeIds.add(badge.id);
        }
    }

    // Check for "Hedef Avcısı" (Goal Hunter)
    if (projects.some(p => p.status === 'completed')) {
        checkAndAdd(getBadgeById('goal-hunter')!);
    }

    // Check for "Sprint Savaşçısı" (Sprint Warrior)
    if (projects.some(p => p.sprints.filter(s => s.status === 'completed').length >= 3)) {
        checkAndAdd(getBadgeById('sprint-warrior')!);
    }

    // Check for "Çalışkanlık Ustası" (Streak Master - 5 days)
    const uniqueCheckinDays = new Set(user.checkinHistory.map(d => new Date(d).toDateString()));
    if (uniqueCheckinDays.size >= 5) {
        checkAndAdd(getBadgeById('streak-master-5')!);
    }
    
    // Check for "Gece Kuşu" and "Sabah Kuşu"
    const completedTasksWithDate = allTasks.filter(t => t.status === TaskStatus.Done && t.completedAt);
    if(completedTasksWithDate.some(t => new Date(t.completedAt!).getHours() >= 22)) {
        checkAndAdd(getBadgeById('night-owl')!);
    }
    if(completedTasksWithDate.some(t => new Date(t.completedAt!).getHours() < 7)) {
        checkAndAdd(getBadgeById('early-bird')!);
    }

    // Check for "Planlama Gurusu"
    const activeSprints = projects.flatMap(p => p.sprints).filter(s => s.status === 'active');
    for (const sprint of activeSprints) {
        if (sprint.startDate && sprint.endDate) {
            const sprintDays = new Set<string>();
            const start = new Date(sprint.startDate);
            const end = new Date(sprint.endDate);
            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                sprintDays.add(d.toISOString().split('T')[0]);
            }
            
            const plannedDays = new Set(sprint.tasks.map(t => t.plannedDate).filter(Boolean));
            if (sprintDays.size > 0 && Array.from(sprintDays).every(day => plannedDays.has(day))) {
                checkAndAdd(getBadgeById('planning-guru')!);
                break;
            }
        }
    }


    return newBadges;
};