import React from 'react';
import { useParams, Link } from 'react-router-dom';

const legalContent = {
    kvkk: {
        title: "Kişisel Verilerin Korunması ve İşlenmesi Politikası (KVKK)",
        content: `
            <p class="mb-4">Bu politika, Kişisel Scrum Koçu AI ("Uygulama") tarafından toplanan, işlenen ve saklanan kişisel verilerinize ilişkin aydınlatma metnini içerir. Amacımız, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca sizleri bilgilendirmektir.</p>
            <h3 class="text-xl font-semibold mt-6 mb-2">1. Veri Sorumlusu</h3>
            <p>Veri sorumlusu, [Şirket Adı], [Adres] adresinde mukim [Şirket Unvanı]'dır.</p>
            <h3 class="text-xl font-semibold mt-6 mb-2">2. İşlenen Kişisel Veriler</h3>
            <p>Uygulamayı kullanmanız sırasında aşağıdaki kişisel verileriniz işlenebilir:
            <ul class="list-disc list-inside ml-4 mt-2">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad.</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi.</li>
                <li><strong>Kullanıcı Verileri:</strong> Proje başlıkları, görevler, notlar, sprint verileri, AI ile yapılan sohbetlerin içeriği.</li>
                <li><strong>Finansal Bilgiler (Ücretli Aboneliklerde):</strong> Kredi kartı bilgileri (son dört hane, son kullanma tarihi), fatura bilgileri.</li>
            </ul>
            </p>
            <h3 class="text-xl font-semibold mt-6 mb-2">3. Kişisel Verilerin İşlenme Amaçları</h3>
            <p>Kişisel verileriniz, hizmetlerimizi sunmak, kullanıcı deneyimini iyileştirmek, AI özelliklerini kişiselleştirmek, faturalandırma işlemlerini gerçekleştirmek ve yasal yükümlülüklerimizi yerine getirmek amacıyla işlenir.</p>
            <p class="mt-4">... [Metnin geri kalanı buraya eklenecektir.] ...</p>
        `
    },
    iade: {
        title: "İade Politikası",
        content: `
            <p class="mb-4">Kişisel Scrum Koçu AI abonelik hizmetleri için iade politikamız aşağıda belirtilmiştir. Hizmetlerimizden en iyi şekilde yararlanmanızı sağlamak bizim için önemlidir.</p>
            <h3 class="text-xl font-semibold mt-6 mb-2">1. Abonelik İptali</h3>
            <p>Aylık veya yıllık aboneliğinizi dilediğiniz zaman "Ayarlar > Aboneliği Yönet" sayfasından iptal edebilirsiniz. İptal işlemi, mevcut fatura döneminizin sonunda yürürlüğe girer. Bu tarihe kadar hizmetlerimizden yararlanmaya devam edebilirsiniz.</p>
            <h3 class="text-xl font-semibold mt-6 mb-2">2. İade Koşulları</h3>
            <p>Dijital hizmetlerimizin doğası gereği, genellikle para iadesi yapılmamaktadır. Aboneliğiniz, ödemesi yapılmış olan sürenin sonuna kadar aktif kalacaktır. Ancak, aşağıdaki durumlarda istisnalar değerlendirilebilir:</p>
            <ul class="list-disc list-inside ml-4 mt-2">
                <li>Teknik bir arıza nedeniyle hizmete erişim sağlayamamanız.</li>
                <li>Yanlışlıkla yinelenen bir ödeme yapılması.</li>
            </ul>
            <p class="mt-4">İade talepleriniz için lütfen [destek e-posta adresi] üzerinden bizimle iletişime geçin. Her talep ayrı ayrı incelenecektir.</p>
            <h3 class="text-xl font-semibold mt-6 mb-2">3. Plan Değişiklikleri</h3>
            <p>Daha üst bir plana geçtiğinizde, aradaki fiyat farkı hesaplanır ve mevcut kullanım süreniz dikkate alınarak bir sonraki fatura döneminize yansıtılır. Daha alt bir plana geçtiğinizde ise, değişiklik bir sonraki fatura döneminizin başında geçerli olur.</p>
        `
    }
};

const LegalPage: React.FC = () => {
    const { topic } = useParams<{ topic: 'kvkk' | 'iade' }>();

    if (!topic || !legalContent[topic]) {
        return <div className="p-6">İstenen sayfa bulunamadı.</div>;
    }

    const { title, content } = legalContent[topic];

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
            <Link to="/settings" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">&larr; Ayarlara Geri Dön</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{title}</h1>
            <div
                className="prose dark:prose-invert mt-6 text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default LegalPage;