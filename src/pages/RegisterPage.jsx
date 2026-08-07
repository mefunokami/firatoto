import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import AgreementModal from '../components/AgreementModal';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [robotChecked, setRobotChecked] = useState(false);
  const [showAgreement, setShowAgreement] = useState(null); // 'uyelik' veya 'kvkk' veya null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!robotChecked) {
      setError('Lütfen "Ben robot değilim" kutusunu işaretleyin.');
      return;
    }
    setLoading(true);
    try {
      // Telefonu maskesiz ve başında 0 ile gönder
      let phoneRaw = form.phone.replace(/\D/g, '');
      if (phoneRaw.length === 10) phoneRaw = '0' + phoneRaw;
      const res = await fetch('/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: phoneRaw }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Otomatik login
        const loginRes = await fetch('/api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.success) {
          sessionStorage.setItem('is-authenticated', 'true');
          sessionStorage.setItem('user', JSON.stringify(loginData.user));
          if (typeof window.setUser === 'function') window.setUser(loginData.user);
          navigate('/');
        } else {
          setSuccess(true);
          setForm({ first_name: '', last_name: '', phone: '', email: '', password: '' });
        }
      } else {
        setError(data.error || 'Kayıt başarısız.');
      }
    } catch (err) {
      setError('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 min-h-[70vh] flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl bg-card rounded shadow p-10">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-foreground">YENİ ÜYELİK</h2>
        <div className="h-1 w-24 bg-yellow-400 mb-8" />
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Adı</label>
            <input type="text" name="first_name" value={form.first_name} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Soyadı</label>
            <input type="text" name="last_name" value={form.last_name} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Şifre</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring" required />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Cinsiyet</label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2"><input type="radio" name="gender" value="Erkek" className="accent-yellow-500" /> Erkek</label>
              <label className="flex items-center gap-2"><input type="radio" name="gender" value="Kadın" className="accent-yellow-500" /> Kadın</label>
              <label className="flex items-center gap-2"><input type="radio" name="gender" value="Belirtmek istemiyorum" className="accent-yellow-500" /> Belirtmek istemiyorum</label>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-semibold text-gray-800 dark:text-gray-200">Cep Telefonu</label>
            <InputMask
              mask="(599) 999 99 99"
              maskChar={null}
              value={form.phone}
              onChange={handleChange}
            >
              {(inputProps) => (
                <input
                  {...inputProps}
                  type="tel"
                  name="phone"
                  placeholder="(5XX) XXX XX XX"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                  required
                />
              )}
            </InputMask>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2 mt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-yellow-500" /> Aydınlatma Metninde belirtilen ilkeler nezdinde Elektronik Ticaret İletisi almak istiyorum.</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-yellow-500" required /> <span> <button type="button" className="underline text-gray-800 dark:text-gray-200" onClick={() => setShowAgreement('uyelik')}>Üyelik sözleşmesini kabul ediyorum.</button></span></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-yellow-500" required /> <span><button type="button" className="underline text-gray-800 dark:text-gray-200" onClick={() => setShowAgreement('kvkk')}>Kişisel verilerin işlenmesine ilişkin Aydınlatma Metnini okudum.</button></span></label>
          </div>
          <div className="md:col-span-2 mt-2">
            <div className="bg-gray-50 dark:bg-background border rounded p-4 flex items-center gap-4">
              <input type="checkbox" className="w-6 h-6 accent-yellow-500" required checked={robotChecked} onChange={e => setRobotChecked(e.target.checked)} />
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Ben robot değilim</span>
              <div className="ml-auto"><span className="text-xs text-gray-400">reCAPTCHA<br />Gizlilik - Şartlar</span></div>
            </div>
          </div>
          {error && <div className="md:col-span-2 text-red-600 font-semibold mb-2">{error}</div>}
          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button type="button" className="bg-gray-100 text-gray-500 dark:text-gray-400 font-semibold px-8 py-2 rounded" onClick={() => navigate(-1)}>İptal</button>
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-8 py-2 rounded">Kayıt Ol</button>
          </div>
        </form>
      </div>
      {/* Sözleşme Modalı */}
      <AgreementModal
        open={showAgreement === 'uyelik'}
        onClose={() => setShowAgreement(null)}
        title="Üyelik Sözleşmesi"
      >
        <p>Bu üyelik sözleşmesi, web sitemize üye olan kullanıcılar ile site sahibi arasında geçerlidir. Üye olarak aşağıdaki şartları kabul etmiş olursunuz:</p>
        <ul className="list-disc pl-6">
          <li>Üyelik bilgilerinizin doğru ve güncel olduğunu beyan edersiniz.</li>
          <li>Hesabınız size özeldir, başkasına devredilemez veya kullandırılamaz.</li>
          <li>Siteyi yasalara ve genel ahlak kurallarına uygun şekilde kullanacağınızı taahhüt edersiniz.</li>
          <li>Site yönetimi, üyelik koşullarında değişiklik yapma hakkını saklı tutar.</li>
          <li>Üyelikten çıkmak istediğinizde hesabınızı silebilirsiniz.</li>
          <li>Siteye üye olarak, gizlilik politikamızı ve aydınlatma metnimizi de kabul etmiş olursunuz.</li>
        </ul>
        <p className="mt-2">Detaylı bilgi için lütfen bizimle iletişime geçin.</p>
      </AgreementModal>
      <AgreementModal
        open={showAgreement === 'kvkk'}
        onClose={() => setShowAgreement(null)}
        title="Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni"
      >
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında, kişisel verileriniz aşağıda belirtilen amaçlar ve yasal çerçevede işlenmektedir:</p>
        <ul className="list-disc pl-6">
          <li>Üyelik işlemlerinin yürütülmesi ve hizmet sunulması,</li>
          <li>İletişim faaliyetlerinin gerçekleştirilmesi,</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi,</li>
          <li>Güvenliğin sağlanması ve dolandırıcılığın önlenmesi.</li>
        </ul>
        <p className="mt-2">Kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen şartlar kapsamında işlenmekte olup, hiçbir şekilde üçüncü kişilerle paylaşılmaz.</p>
        <p>Haklarınız ve detaylı bilgi için lütfen bizimle iletişime geçin.</p>
      </AgreementModal>
    </div>
  );
};

export default RegisterPage; 