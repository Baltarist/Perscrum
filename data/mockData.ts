import { Project, TaskStatus, User, VelocityData, TeamMember } from '../types';

interface UserData {
    user: User;
    projects: Project[];
    velocityData: VelocityData[];
}

const getFutureDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

export const MOCK_USER_DATA: { [key: string]: UserData } = {
    'user-1': {
        user: {
            id: 'user-1',
            displayName: 'Alex',
            email: 'alex@example.com',
            subscriptionTier: 'pro',
            aiUsageCount: 0, // Pro users have unlimited usage
            subscriptionEndDate: getFutureDate(30),
            paymentMethod: {
                cardNumber: '**** **** **** 1234',
                expiryDate: '12/26',
                cvc: '***',
                cardHolder: 'Alex Pro'
            },
            badges: ['sprint-warrior', 'planning-guru'],
            checkinHistory: Array.from({ length: 5 }, (_, i) => new Date(`2024-07-${i+1}`).toISOString()),
            settings: {
                sprintDurationWeeks: 1,
                dailyCheckinEnabled: true,
                dailyCheckinTime: '09:00',
                retrospectiveEnabled: true,
                aiCoachName: 'Athena'
            },
            notifications: [
              {
                id: `notif-${Date.now()}`,
                projectId: 'proj-1',
                message: 'Maria, "Uygulamayı Context API ile yeniden düzenle" görevini "Devam Ediyor" olarak değiştirdi.',
                timestamp: new Date().toISOString(),
                isRead: false
              }
            ],
            dailyFocusTaskId: undefined,
        },
        projects: [
          {
            id: 'proj-1',
            title: 'İleri Seviye React Öğren',
            description: 'Hook, context, performans optimizasyonu ve test gibi ileri düzey React konularında uzmanlaş. Bu bir takım projesidir.',
            status: 'active',
            colorTheme: 'blue',
            targetCompletionDate: '2024-09-30',
            estimatedCompletionDate: '2024-10-15',
            totalSprints: 4,
            sprintDurationWeeks: 1,
            teamMembers: [
              { userId: 'user-1', role: 'Lider' },
              { userId: 'user-2', role: 'Geliştirici' }
            ],
            sprints: [
              { 
                id: 'sprint-1-completed-1', sprintNumber: 1, goal: 'Temelleri bitir ve state yönetimi üzerine odaklan.', status: 'completed', velocityPoints: 10,
                startDate: '2024-07-01', endDate: '2024-07-07',
                chatHistory: [],
                tasks:[
                    { id: 'hist-task-1', title: 'useState ve useEffect hook\'larını anla', status: TaskStatus.Done, storyPoints: 5, subtasks: [], completedAt: '2024-07-05T10:00:00Z', createdBy: 'user-1', statusHistory: [], assigneeId: 'user-1' },
                    { id: 'hist-task-2', title: 'Bileşen yaşam döngüsü (lifecycle) üzerine çalış', status: TaskStatus.Done, storyPoints: 5, subtasks: [], completedAt: '2024-07-06T14:00:00Z', createdBy: 'user-2', statusHistory: [], assigneeId: 'user-2' },
                ] 
              },
              { 
                id: 'sprint-1-completed-2', sprintNumber: 2, goal: 'React Router v6 ile routing öğren.', status: 'completed', velocityPoints: 8,
                startDate: '2024-07-08', endDate: '2024-07-14',
                chatHistory: [],
                tasks:[
                    { id: 'hist-task-3', title: 'Temel route yapısını kur', status: TaskStatus.Done, storyPoints: 3, subtasks: [], completedAt: '2024-07-10T11:00:00Z', createdBy: 'user-1', statusHistory: [], assigneeId: 'user-1' },
                    { id: 'hist-task-4', title: 'Nested routes ve URL parametrelerini kullan', status: TaskStatus.Done, storyPoints: 5, subtasks: [], completedAt: '2024-07-12T18:00:00Z', createdBy: 'user-1', isAiAssisted: true, statusHistory: [], assigneeId: 'user-1' },
                ]
              },
              {
                id: 'sprint-1-active',
                sprintNumber: 3,
                goal: 'Özel hook\'ları ve context API\'ını anlama.',
                status: 'active',
                startDate: '2024-07-15', endDate: '2024-07-21',
                chatHistory: [{role: 'user', parts: [{text: "Merhaba"}]}, {role: 'model', parts: [{text: "Merhaba Alex! Dün Context API üzerinde harika bir ilerleme kaydettin. Bugün hangi göreve odaklanmayı düşünüyorsun?"}]}],
                tasks: [
                  { id: 'task-1', title: 'Özel bir useFetch hook\'u oluştur', description: 'Veri çekme için yeniden kullanılabilir bir hook oluştur.', status: TaskStatus.Done, storyPoints: 5, subtasks: [{id: 'sub-1', title: 'Yüklenme durumunu yönet', isCompleted: true, createdBy: 'user-1', assigneeId: 'user-1'}, {id: 'sub-2', title: 'Hata durumunu yönet', isCompleted: true, createdBy: 'user-1', assigneeId: 'user-1'}], notes: ["Bu, örnek verilerden gelen bir nottur."], completedAt: '2024-07-18T09:00:00Z', createdBy: 'user-1', statusHistory: [], assigneeId: 'user-1' },
                  { id: 'task-2', title: 'Uygulamayı Context API ile yeniden düzenle', description: 'Prop drilling olmadan global state yönetimi.', status: TaskStatus.InProgress, storyPoints: 8, subtasks: [{id: 'sub-3', title: 'ThemeContext oluştur', isCompleted: true, createdBy: 'user-2', assigneeId: 'user-2'}, {id: 'sub-4', title: 'ThemeProvider uygula', isCompleted: false, createdBy: 'user-2', isAiAssisted: true, assigneeId: 'user-2'}], aiComments: [{id: 'ai-1', text: 'Harika ilerliyorsun! İç içe provider\'ları nasıl yöneteceğini düşündün mü?', type: 'encouragement'}], notes: [], createdBy: 'user-2', statusHistory: [{ changedBy: 'user-2', from: TaskStatus.Todo, to: TaskStatus.InProgress, timestamp: '2024-07-17T11:00:00Z' }], assigneeId: 'user-2' },
                  { id: 'task-3', title: 'Performans üzerine React dokümanlarını oku', description: 'memo, useMemo ve useCallback konularını incele.', status: TaskStatus.Todo, storyPoints: 3, subtasks: [], notes: [], createdBy: 'user-1', statusHistory: [], assigneeId: 'user-1' },
                ],
              },
               { 
                id: 'sprint-1-future-1', sprintNumber: 4, goal: 'Test kütüphaneleri ile test yazmaya başla.', status: 'planning',
                startDate: '2024-07-22', endDate: '2024-07-28',
                chatHistory: [],
                tasks:[] 
              },
            ],
          },
          {
            id: 'proj-2',
            title: 'Kişisel Fitness Hedefleri',
            description: 'Güç ve kardiyoyu geliştirmek için 3 aylık bir plan.',
            status: 'active',
            colorTheme: 'green',
            targetCompletionDate: '2024-12-31',
            estimatedCompletionDate: '2024-12-20',
            totalSprints: 6,
            sprintDurationWeeks: 2,
            teamMembers: [{ userId: 'user-1', role: 'Lider' }],
            sprints: [
               {
                id: 'sprint-2-active',
                sprintNumber: 1,
                goal: 'İstikrarlı bir egzersiz rutini oluştur.',
                status: 'active',
                startDate: '2024-07-15', endDate: '2024-07-28',
                chatHistory: [],
                tasks: [
                  { id: 'task-5', title: 'Haftada 3 kez koşuya çık', status: TaskStatus.InProgress, storyPoints: 5, subtasks: [], notes: [], createdBy: 'user-1', statusHistory: [], assigneeId: 'user-1' },
                  { id: 'task-6', title: 'Spor salonuna üye ol', status: TaskStatus.Done, storyPoints: 2, subtasks: [], notes: [], completedAt: '2024-07-17T17:00:00Z', createdBy: 'user-1', statusHistory: [], assigneeId: 'user-1' },
                ]
              }
            ]
          },
        ],
        velocityData: [
            { sprint: '1. Sprint', completedPoints: 10 },
            { sprint: '2. Sprint', completedPoints: 8 },
        ]
    },
    'user-2': {
        user: {
            id: 'user-2',
            displayName: 'Maria',
            email: 'maria@example.com',
            subscriptionTier: 'free',
            aiUsageCount: 3, // Free user with some usage
            subscriptionEndDate: undefined,
            badges: [],
            checkinHistory: [],
            settings: {
                sprintDurationWeeks: 2,
                dailyCheckinEnabled: false,
                dailyCheckinTime: '10:00',
                retrospectiveEnabled: false,
                aiCoachName: 'Koç'
            },
            notifications: [],
            dailyFocusTaskId: undefined,
        },
        projects: [
            {
                id: 'proj-3',
                title: 'Yeni Dil Öğren',
                description: '6 ay içinde İspanyolca konuşma pratiği yap.',
                status: 'active',
                colorTheme: 'red',
                targetCompletionDate: '2025-01-15',
                estimatedCompletionDate: '2025-01-15',
                totalSprints: 12,
                sprintDurationWeeks: 1,
                teamMembers: [{ userId: 'user-2', role: 'Lider' }],
                sprints: [
                    {
                        id: 'sprint-3-active',
                        sprintNumber: 1,
                        goal: 'Temel selamlaşmaları ve 50 kelimeyi öğren.',
                        status: 'active',
                        startDate: '2024-07-15', endDate: '2024-07-21',
                        chatHistory: [],
                        tasks: [
                            { id: 'task-8', title: 'Duolingo\'da 5 ders tamamla', status: TaskStatus.Done, storyPoints: 3, subtasks:[], notes: [], completedAt: '2024-07-16T20:00:00Z', createdBy: 'user-2', statusHistory: [], assigneeId: 'user-2' },
                            { id: 'task-9', title: 'Haftalık konuşma partneri bul', status: TaskStatus.Todo, storyPoints: 5, subtasks:[], notes: [], createdBy: 'user-2', statusHistory: [], assigneeId: 'user-2' },
                        ]
                    }
                ]
            }
        ],
        velocityData: [
           { sprint: '1. Sprint', completedPoints: 4 },
        ]
    }
};