/**
 * ISO 8601 tarih dizesini (örn: "2024-09-30") yerel ayara uygun, daha okunaklı bir formata dönüştürür.
 * @param dateString - ISO formatında tarih dizesi.
 * @returns Biçimlendirilmiş tarih dizesi (örn: "30 Eyl 2024").
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Kullanıcının saat dilimine göre ayarlama yapmak için UTC'den yerel zamana geçiş yap
  const userTimezoneDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return userTimezoneDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * İki tarih dizesi arasındaki farkı gün olarak hesaplar.
 * @param date1Str - İlk tarih (tahmini tarih).
 * @param date2Str - İkinci tarih (hedef tarih).
 * @returns Gün cinsinden sayısal fark. Pozitifse date1 daha sonradır (gecikme), negatifse daha erkendir.
 */
export const getDateDifference = (date1Str: string, date2Str: string): number => {
    if (!date1Str || !date2Str) return 0;
    const date1 = new Date(date1Str).getTime();
    const date2 = new Date(date2Str).getTime();
    const differenceInMs = date1 - date2;
    // Milisaniyeyi güne çevir
    return Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
};
