import { Project, User, Task } from '../types';

/**
 * Bir JavaScript Date nesnesini ICS formatında bir tarih-saat dizesine dönüştürür (YYYYMMDDTHHMMSSZ).
 * @param date - Dönüştürülecek tarih nesnesi.
 * @returns Biçimlendirilmiş UTC tarih-saat dizesi.
 */
const formatDateToICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Bir JavaScript Date nesnesini ICS formatında bir tam gün olay dizesine dönüştürür (YYYYMMDD).
 * @param date - Dönüştürülecek tarih nesnesi.
 * @returns Biçimlendirilmiş tarih dizesi.
 */
const formatDateToICSDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
};


/**
 * Bir etkinlik için VEVENT bloğu oluşturur.
 * @param event - Etkinlik detaylarını içeren bir nesne.
 * @returns ICS formatında VEVENT dizesi.
 */
const createVEvent = (event: {
  uid: string;
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
}): string => {
  const now = new Date();
  const start = event.isAllDay ? `DTSTART;VALUE=DATE:${formatDateToICSDate(event.startDate)}` : `DTSTART:${formatDateToICS(event.startDate)}`;
  
  // Tam gün olaylar için bitiş tarihi bir sonraki gün olmalıdır.
  const endEvent = new Date(event.endDate);
  if(event.isAllDay) {
    endEvent.setUTCDate(endEvent.getUTCDate() + 1);
  }
  const end = event.isAllDay ? `DTEND;VALUE=DATE:${formatDateToICSDate(endEvent)}` : `DTEND:${formatDateToICS(endEvent)}`;

  return [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `DTSTAMP:${formatDateToICS(now)}`,
    start,
    end,
    'END:VEVENT'
  ].join('\r\n');
};

/**
 * Bir kullanıcının projelerinden ve ayarlarından bir .ics takvim dosyası içeriği oluşturur.
 * @param projects - Kullanıcının tüm projeleri.
 * @param user - Mevcut kullanıcı nesnesi.
 * @returns .ics formatında tam bir takvim dizesi.
 */
export const generateICS = (projects: Project[], user: User): string => {
  const events: string[] = [];

  // 1. Planlanmış Görevleri Ekle (Tam Gün Olaylar)
  projects.forEach(project => {
    project.sprints.forEach(sprint => {
      sprint.tasks.forEach(task => {
        if (task.plannedDate) {
          const plannedDate = new Date(task.plannedDate);
          events.push(createVEvent({
            uid: `task-${task.id}@scrum-coach.ai`,
            summary: task.title,
            description: `Proje: ${project.title}\nSprint: ${sprint.sprintNumber}`,
            startDate: plannedDate,
            endDate: plannedDate,
            isAllDay: true,
          }));
        }
      });
    });
  });

  // 2. Günlük Check-in Toplantılarını Ekle
  if (user.settings.dailyCheckinEnabled) {
    const [hours, minutes] = user.settings.dailyCheckinTime.split(':').map(Number);
    // Geniş bir aralıkta, örneğin geçmiş ve gelecek 3 ay için oluştur
    const today = new Date();
    for (let i = -90; i <= 90; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      // Sadece hafta içi günler
      if (day.getDay() >= 1 && day.getDay() <= 5) {
        const startDate = new Date(day);
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMinutes(startDate.getMinutes() + 15); // 15 dakikalık bir etkinlik

        events.push(createVEvent({
          uid: `checkin-${day.toISOString().split('T')[0]}@scrum-coach.ai`,
          summary: 'Günlük AI Check-in',
          description: 'Kişisel Scrum Koçu ile günlük ilerlemeni kontrol et.',
          startDate,
          endDate,
          isAllDay: false,
        }));
      }
    }
  }

  // 3. Retrospektif Toplantılarını Ekle
  if (user.settings.retrospectiveEnabled) {
    projects.forEach(project => {
      project.sprints.forEach(sprint => {
        if (sprint.endDate) {
          const endDate = new Date(sprint.endDate);
          endDate.setHours(17, 0, 0, 0); // Sprint sonu saat 17:00'de
          const startDate = new Date(endDate);
          startDate.setMinutes(startDate.getMinutes() - 30); // 30 dakikalık bir etkinlik

          events.push(createVEvent({
            uid: `retrospective-${sprint.id}@scrum-coach.ai`,
            summary: `Retrospektif: ${project.title} - Sprint ${sprint.sprintNumber}`,
            description: 'Sprinti değerlendir ve gelecek için dersler çıkar.',
            startDate,
            endDate,
            isAllDay: false,
          }));
        }
      });
    });
  }


  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KisiselScrumKocuAI//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'NAME:Kişisel Scrum Koçu Takvimi',
    'X-WR-CALNAME:Kişisel Scrum Koçu Takvimi',
    'DESCRIPTION:Kişisel Scrum Koçu uygulamasındaki planlanmış görevleriniz ve toplantılarınız.',
    'X-WR-CALDESC:Kişisel Scrum Koçu uygulamasındaki planlanmış görevleriniz ve toplantılarınız.',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};