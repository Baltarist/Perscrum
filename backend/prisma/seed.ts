import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Sprint Warrior',
        criteria: 'Complete 5 sprints successfully',
        icon: '⚔️',
        type: 'achievement'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Planning Guru',
        criteria: 'Create detailed project plans',
        icon: '📋',
        type: 'planning'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Consistency Champion',
        criteria: 'Daily check-in for 7 days straight',
        icon: '🏆',
        type: 'consistency'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Task Master',
        criteria: 'Complete 100 tasks',
        icon: '✅',
        type: 'achievement'
      }
    })
  ]);

  console.log('✅ Badges created:', badges.length);

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const alex = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com',
      passwordHash: hashedPassword,
      displayName: 'Alex',
      subscriptionTier: 'pro',
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      settings: {
        create: {
          sprintDurationWeeks: 1,
          dailyCheckinEnabled: true,
          dailyCheckinTime: '09:00',
          retrospectiveEnabled: true,
          aiCoachName: 'Athena'
        }
      }
    },
    include: { settings: true }
  });

  const maria = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      passwordHash: hashedPassword,
      displayName: 'Maria',
      subscriptionTier: 'free',
      aiUsageCount: 3,
      settings: {
        create: {
          sprintDurationWeeks: 2,
          dailyCheckinEnabled: false,
          dailyCheckinTime: '10:00',
          retrospectiveEnabled: false,
          aiCoachName: 'Koç'
        }
      }
    },
    include: { settings: true }
  });

  console.log('✅ Users created:', [alex.displayName, maria.displayName]);

  // Award some badges to Alex
  await prisma.userBadge.createMany({
    data: [
      { userId: alex.id, badgeId: badges[0].id }, // Sprint Warrior
      { userId: alex.id, badgeId: badges[1].id }  // Planning Guru
    ]
  });

  // Create sample projects
  const reactProject = await prisma.project.create({
    data: {
      title: 'İleri Seviye React Öğren',
      description: 'Hook, context, performans optimizasyonu ve test gibi ileri düzey React konularında uzmanlaş. Bu bir takım projesidir.',
      status: 'active',
      colorTheme: 'blue',
      targetCompletionDate: new Date('2024-09-30'),
      estimatedCompletionDate: new Date('2024-10-15'),
      totalSprints: 4,
      sprintDurationWeeks: 1,
      ownerId: alex.id,
      teamMembers: {
        create: [
          { userId: alex.id, role: 'leader' },
          { userId: maria.id, role: 'developer' }
        ]
      }
    }
  });

  const fitnessProject = await prisma.project.create({
    data: {
      title: 'Kişisel Fitness Hedefleri',
      description: 'Güç ve kardiyoyu geliştirmek için 3 aylık bir plan.',
      status: 'active',
      colorTheme: 'green',
      targetCompletionDate: new Date('2024-12-31'),
      estimatedCompletionDate: new Date('2024-12-20'),
      totalSprints: 6,
      sprintDurationWeeks: 2,
      ownerId: alex.id,
      teamMembers: {
        create: [
          { userId: alex.id, role: 'leader' }
        ]
      }
    }
  });

  const languageProject = await prisma.project.create({
    data: {
      title: 'Yeni Dil Öğren',
      description: '6 ay içinde İspanyolca konuşma pratiği yap.',
      status: 'active',
      colorTheme: 'red',
      targetCompletionDate: new Date('2025-01-15'),
      estimatedCompletionDate: new Date('2025-01-15'),
      totalSprints: 12,
      sprintDurationWeeks: 1,
      ownerId: maria.id,
      teamMembers: {
        create: [
          { userId: maria.id, role: 'leader' }
        ]
      }
    }
  });

  console.log('✅ Projects created:', [reactProject.title, fitnessProject.title, languageProject.title]);

  // Create sprints for React project
  const completedSprint1 = await prisma.sprint.create({
    data: {
      projectId: reactProject.id,
      sprintNumber: 1,
      goal: 'Temelleri bitir ve state yönetimi üzerine odaklan.',
      status: 'completed',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-07'),
      velocityPoints: 10,
      retrospectiveGood: 'Takım uyumu iyiydi, planlanan görevler tamamlandı',
      retrospectiveImprove: 'Daha detaylı task breakdown yapmalıyız'
    }
  });

  const completedSprint2 = await prisma.sprint.create({
    data: {
      projectId: reactProject.id,
      sprintNumber: 2,
      goal: 'React Router v6 ile routing öğren.',
      status: 'completed',
      startDate: new Date('2024-07-08'),
      endDate: new Date('2024-07-14'),
      velocityPoints: 8,
      retrospectiveGood: 'Routing konusunda iyi ilerleme kaydettik',
      retrospectiveImprove: 'Test yazma konusunda daha çok çalışmamız gerekiyor'
    }
  });

  const activeSprint = await prisma.sprint.create({
    data: {
      projectId: reactProject.id,
      sprintNumber: 3,
      goal: 'Özel hook\'ları ve context API\'ını anlama.',
      status: 'active',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-21')
    }
  });

  const planningSprint = await prisma.sprint.create({
    data: {
      projectId: reactProject.id,
      sprintNumber: 4,
      goal: 'Test kütüphaneleri ile test yazmaya başla.',
      status: 'planning',
      startDate: new Date('2024-07-22'),
      endDate: new Date('2024-07-28')
    }
  });

  // Create sprint for fitness project
  const fitnessSprint = await prisma.sprint.create({
    data: {
      projectId: fitnessProject.id,
      sprintNumber: 1,
      goal: 'İstikrarlı bir egzersiz rutini oluştur.',
      status: 'active',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-28')
    }
  });

  // Create sprint for language project
  const languageSprint = await prisma.sprint.create({
    data: {
      projectId: languageProject.id,
      sprintNumber: 1,
      goal: 'Temel selamlaşmaları ve 50 kelimeyi öğren.',
      status: 'active',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-21')
    }
  });

  console.log('✅ Sprints created for all projects');

  // Create tasks for completed sprints
  await prisma.task.createMany({
    data: [
      {
        sprintId: completedSprint1.id,
        title: 'useState ve useEffect hook\'larını anla',
        status: 'done',
        storyPoints: 5,
        completedAt: new Date('2024-07-05T10:00:00Z'),
        createdById: alex.id,
        assigneeId: alex.id
      },
      {
        sprintId: completedSprint1.id,
        title: 'Bileşen yaşam döngüsü (lifecycle) üzerine çalış',
        status: 'done',
        storyPoints: 5,
        completedAt: new Date('2024-07-06T14:00:00Z'),
        createdById: alex.id,
        assigneeId: maria.id
      },
      {
        sprintId: completedSprint2.id,
        title: 'Temel route yapısını kur',
        status: 'done',
        storyPoints: 3,
        completedAt: new Date('2024-07-10T11:00:00Z'),
        createdById: alex.id,
        assigneeId: alex.id
      },
      {
        sprintId: completedSprint2.id,
        title: 'Nested routes ve URL parametrelerini kullan',
        status: 'done',
        storyPoints: 5,
        completedAt: new Date('2024-07-12T18:00:00Z'),
        createdById: alex.id,
        assigneeId: alex.id,
        isAiAssisted: true
      }
    ]
  });

  // Create tasks for active sprint
  const activeTask1 = await prisma.task.create({
    data: {
      sprintId: activeSprint.id,
      title: 'Özel bir useFetch hook\'u oluştur',
      description: 'Veri çekme için yeniden kullanılabilir bir hook oluştur.',
      status: 'done',
      storyPoints: 5,
      completedAt: new Date('2024-07-18T09:00:00Z'),
      createdById: alex.id,
      assigneeId: alex.id,
      notes: 'Bu, örnek verilerden gelen bir nottur.'
    }
  });

  const activeTask2 = await prisma.task.create({
    data: {
      sprintId: activeSprint.id,
      title: 'Uygulamayı Context API ile yeniden düzenle',
      description: 'Prop drilling olmadan global state yönetimi.',
      status: 'in_progress',
      storyPoints: 8,
      createdById: alex.id,
      assigneeId: maria.id
    }
  });

  const activeTask3 = await prisma.task.create({
    data: {
      sprintId: activeSprint.id,
      title: 'Performans üzerine React dokümanlarını oku',
      description: 'memo, useMemo ve useCallback konularını incele.',
      status: 'todo',
      storyPoints: 3,
      createdById: alex.id,
      assigneeId: alex.id
    }
  });

  // Create subtasks
  await prisma.subtask.createMany({
    data: [
      {
        taskId: activeTask1.id,
        title: 'Yüklenme durumunu yönet',
        isCompleted: true,
        createdById: alex.id,
        assigneeId: alex.id
      },
      {
        taskId: activeTask1.id,
        title: 'Hata durumunu yönet',
        isCompleted: true,
        createdById: alex.id,
        assigneeId: alex.id
      },
      {
        taskId: activeTask2.id,
        title: 'ThemeContext oluştur',
        isCompleted: true,
        createdById: maria.id,
        assigneeId: maria.id
      },
      {
        taskId: activeTask2.id,
        title: 'ThemeProvider uygula',
        isCompleted: false,
        createdById: maria.id,
        assigneeId: maria.id,
        isAiAssisted: true
      }
    ]
  });

  // Create AI comments
  await prisma.aIComment.create({
    data: {
      taskId: activeTask2.id,
      text: 'Harika ilerliyorsun! İç içe provider\'ları nasıl yöneteceğini düşündün mü?',
      type: 'encouragement'
    }
  });

  // Create fitness tasks
  await prisma.task.createMany({
    data: [
      {
        sprintId: fitnessSprint.id,
        title: 'Haftada 3 kez koşuya çık',
        status: 'in_progress',
        storyPoints: 5,
        createdById: alex.id,
        assigneeId: alex.id
      },
      {
        sprintId: fitnessSprint.id,
        title: 'Spor salonuna üye ol',
        status: 'done',
        storyPoints: 2,
        completedAt: new Date('2024-07-17T17:00:00Z'),
        createdById: alex.id,
        assigneeId: alex.id
      }
    ]
  });

  // Create language learning tasks
  await prisma.task.createMany({
    data: [
      {
        sprintId: languageSprint.id,
        title: 'Duolingo\'da 5 ders tamamla',
        status: 'done',
        storyPoints: 3,
        completedAt: new Date('2024-07-16T20:00:00Z'),
        createdById: maria.id,
        assigneeId: maria.id
      },
      {
        sprintId: languageSprint.id,
        title: 'Haftalık konuşma partneri bul',
        status: 'todo',
        storyPoints: 5,
        createdById: maria.id,
        assigneeId: maria.id
      }
    ]
  });

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        projectId: reactProject.id,
        type: 'task_assigned',
        message: 'Maria, "Uygulamayı Context API ile yeniden düzenle" görevini "Devam Ediyor" olarak değiştirdi.',
        isRead: false
      },
      {
        userId: maria.id,
        projectId: reactProject.id,
        type: 'project_updated',
        message: 'React projesinde yeni sprint başladı.',
        isRead: true
      }
    ]
  });

  // Create some daily check-ins
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const checkInDate = new Date(today);
    checkInDate.setDate(checkInDate.getDate() - i);
    
    await prisma.dailyCheckin.create({
      data: {
        userId: alex.id,
        date: checkInDate,
        mood: 'productive',
        notes: `Güzel bir gün geçirdim, ${i + 1}. gün`
      }
    });
  }

  // Create chat messages for active sprint
  await prisma.chatMessage.createMany({
    data: [
      {
        sprintId: activeSprint.id,
        role: 'user',
        content: 'Merhaba'
      },
      {
        sprintId: activeSprint.id,
        role: 'model',
        content: 'Merhaba Alex! Dün Context API üzerinde harika bir ilerleme kaydettin. Bugün hangi göreve odaklanmayı düşünüyorsun?'
      }
    ]
  });

  console.log('✅ Sample data seeding completed!');
  console.log(`
📊 Summary:
- 👥 Users: 2 (Alex: Pro, Maria: Free)
- 🎯 Projects: 3
- 🏃‍♂️ Sprints: 6 total (2 completed, 3 active, 1 planning)
- ✅ Tasks: Multiple tasks with different statuses
- 🏆 Badges: 4 types created
- 📱 Notifications: Sample notifications
- 💬 Chat: Sample AI chat messages

🔐 Login credentials:
- Email: alex@example.com | Password: password123
- Email: maria@example.com | Password: password123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });