import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LanguageContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { handleFileInputChange, FILE_ACCEPT_IMAGE } from '../../utils/fileUpload';
import { ARAB_CURRENCIES, CENTER_ACTIVITY_TYPES } from '../../utils/constants';
import CountrySelector from '../ui/CountrySelector';
import { GLOBAL_CURRENCIES } from '../../data/countriesData';

const PRESET_COLORS = ['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];
const CURRENCIES = GLOBAL_CURRENCIES.map(c => ({ v: c.code, l: c.label }));
const CENTER_TYPES_AR = ['تربية خاصة','تأهيل','تخاطب','توحد','صعوبات تعلم','متعدد التخصصات'];
const CENTER_TYPES_EN = ['Special education','Rehabilitation','Speech','Autism','Learning difficulties','Multi-specialty'];

export default function SetupWizard() {
  const { currentUser, updateCenterData, setScreen, toast } = useApp();
  const { t, lang, setLang: setLangCtx } = useLang();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const logoRef = useRef();

  const [form, setForm] = useState({
    name: '',
    nameEn: '',
    type: '',
    logo: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    socialWhatsapp: '',
    socialInstagram: '',
    socialWebsite: '',
    currency: 'SAR',
    morningFrom: '07:00',
    morningTo: '12:00',
    eveningFrom: '16:00',
    eveningTo: '20:00',
    color: '#1a56db',
    fontSize: localStorage.getItem('scs_fontsize') || '15',
    fontWeight: localStorage.getItem('scs_fontweight') || '600',
    platformLang: lang,
  });

  const fld = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const types = lang === 'en' ? CENTER_TYPES_EN : CENTER_TYPES_AR;

  async function onLogo(e) {
    try {
      const res = await handleFileInputChange(e, { imagesOnly: true });
      if (res) setForm(f => ({ ...f, logo: res.data }));
    } catch (ex) {
      toast('⚠️ ' + t(ex.i18nKey || 'file.invalidType'), 'er');
    }
  }

  function applyFontPreview() {
    document.documentElement.style.setProperty('--fs', `${form.fontSize}px`);
    document.documentElement.style.setProperty('--fw', form.fontWeight);
  }

  function nextStep() {
    if (step === 1 && !form.name.trim()) {
      setErr(t('setup.errName'));
      return;
    }
    setErr('');
    setStep(s => Math.min(3, s + 1));
  }

  async function finish() {
    if (!form.name.trim() || !form.nameEn.trim()) { setErr(t('setup.errName')); setStep(1); return; }
    setSaving(true);
    setErr('');
    try {
      const centerId = currentUser?.uid || currentUser?.centerId;
      if (!centerId) throw new Error('User not found');

      setLangCtx(form.platformLang);
      localStorage.setItem('scs_fontsize', String(form.fontSize));
      localStorage.setItem('scs_fontweight', String(form.fontWeight));
      applyFontPreview();

      const payload = {
        centerId,
        centerName: form.name.trim(),
        name: form.name.trim(),
        nameEn: form.nameEn.trim(),
        phoneCode: form.phoneCode || '+966',
        type: form.type,
        logo: form.logo,
        logoUrl: form.logo,
        ownerEmail: form.email || currentUser?.email,
        email: form.email,
        phone: form.phone,
        address: form.address,
        socialLinks: {
          whatsapp: form.socialWhatsapp,
          instagram: form.socialInstagram,
          website: form.socialWebsite,
        },
        currency: form.currency,
        shifts: {
          morning: { from: form.morningFrom, to: form.morningTo },
          evening: { from: form.eveningFrom, to: form.eveningTo },
        },
        color: form.color,
        fontSize: Number(form.fontSize),
        fontWeight: form.fontWeight,
        platformLang: form.platformLang,
        workingDays: ['Sunday','Monday','Tuesday','Wednesday','Thursday'],
        status: 'active',
        setupCompleted: true,
        isSetup: true,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'centers', centerId), payload);

      if (form.logo) localStorage.setItem('scs_center_logo', form.logo);
      localStorage.setItem('scs_center_name', form.name.trim());

      updateCenterData({
        name: form.name.trim(),
        nameEn: form.nameEn.trim(),
        type: form.type,
        phone: form.phone,
        email: form.email,
        address: form.address,
        logo: form.logo,
        color: form.color,
        currency: form.currency,
        configured: true,
        status: 'active',
        setupCompleted: true,
      });

      toast('✅ ' + (lang === 'en' ? 'Center setup complete!' : 'تم إعداد المركز بنجاح!'), 'ok');
      setScreen('app');
    } catch (e) {
      console.error(e);
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const steps = [t('setup.step1'), t('setup.step2'), t('setup.step3')];

  return (
    <div className="setup-wrap">
      <div className="setup-card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>🏥</div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900 }}>{t('setup.title')}</h1>
          <p style={{ margin: '8px 0 0', fontSize: '.85rem', color: 'var(--g5)' }}>
            {t('setup.welcome')} {currentUser?.name} — {t('setup.complete')}
          </p>
        </div>

        <div className="setup-steps">
          {steps.map((label, i) => (
            <div key={label} className={`setup-step ${step === i + 1 ? 'on' : step > i + 1 ? 'done' : ''}`}>
              <span className="setup-step-n">{i + 1}</span>
              <span className="setup-step-l">{label}</span>
            </div>
          ))}
        </div>

        {err && <div className="login-err" style={{ marginBottom: 14 }}>⚠️ {err}</div>}

        <div className="modal-body-scroll setup-form-scroll">
          {step === 1 && (
            <div className="fg" style={{ gap: 12 }}>
              <div className="fl full">
                <CountrySelector
                  value={form.countryCode || form.country || 'SA'}
                  onChange={countryObj => {
                    setForm(f => ({
                      ...f,
                      country: countryObj.code,
                      countryCode: countryObj.code,
                      countryNameAr: countryObj.nameAr,
                      countryNameEn: countryObj.nameEn,
                      phoneCode: countryObj.phoneCode,
                      currency: countryObj.currency,
                      address: f.address ? f.address : `${countryObj.nameAr} - ${countryObj.defaultCity}`,
                    }));
                  }}
                  label="دولة / بلد المركز المعتمد"
                />
              </div>
              <div className="fl full">
                <label>{t('setup.lang')}</label>
                <select value={form.platformLang} onChange={e => { setForm(f => ({ ...f, platformLang: e.target.value })); setLangCtx(e.target.value); }}>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="fl"><label>{t('setup.centerName')} (عربي) <span className="req">*</span></label>
                <input value={form.name} onChange={fld('name')} placeholder="مركز الأمل للتربية الخاصة"/>
              </div>
              <div className="fl"><label>{t('setup.centerName')} (English) <span className="req">*</span></label>
                <input value={form.nameEn} onChange={fld('nameEn')} dir="ltr" placeholder="Hope Special Education Center"/>
              </div>
              <div className="fl full">
                <label>{t('setup.centerType')}</label>
                <select value={form.type} onChange={fld('type')}>
                  <option value="">{lang === 'en' ? 'Select Center Type / Activity' : '— اختر نوع ونشاط المركز —'}</option>
                  {CENTER_ACTIVITY_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div className="fl full">
                <label>{t('setup.logo')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {form.logo
                    ? <img src={form.logo} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }}/>
                    : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🏥</div>}
                  <button type="button" className="btn btn-g" onClick={() => logoRef.current?.click()}>{t('setup.uploadLogo')}</button>
                  {form.logo && <button type="button" className="btn btn-d" onClick={() => setForm(f => ({ ...f, logo: '' }))}>🗑️</button>}
                  <input ref={logoRef} type="file" accept={FILE_ACCEPT_IMAGE} style={{ display: 'none' }} onChange={onLogo}/>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fg" style={{ gap: 12 }}>
              <div className="fl full">
                <label>{t('setup.email')}</label>
                <input type="email" value={form.email} onChange={fld('email')} dir="ltr"/>
              </div>
              <div className="fl full">
                <label>{t('setup.phone')}</label>
                <input type="tel" value={form.phone} onChange={fld('phone')} dir="ltr"/>
              </div>
              <div className="fl full">
                <label>{t('setup.address')}</label>
                <textarea value={form.address} onChange={fld('address')} rows={2}/>
              </div>
              <div className="fl full">
                <label>{t('setup.currency')}</label>
                <select value={form.currency} onChange={fld('currency')}>
                  {CURRENCIES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
              <div className="fl full"><label>{t('setup.social')}</label></div>
              <div className="fl"><label>WhatsApp</label><input value={form.socialWhatsapp} onChange={fld('socialWhatsapp')} dir="ltr" placeholder="+966..."/></div>
              <div className="fl"><label>Instagram</label><input value={form.socialInstagram} onChange={fld('socialInstagram')} dir="ltr"/></div>
              <div className="fl full"><label>Website</label><input value={form.socialWebsite} onChange={fld('socialWebsite')} dir="ltr" placeholder="https://"/></div>
            </div>
          )}

          {step === 3 && (
            <div className="fg" style={{ gap: 12 }}>
              <div className="fl full"><label>{t('setup.morningShift')}</label></div>
              <div className="fl"><label>{t('setup.from')}</label><input type="time" value={form.morningFrom} onChange={fld('morningFrom')}/></div>
              <div className="fl"><label>{t('setup.to')}</label><input type="time" value={form.morningTo} onChange={fld('morningTo')}/></div>
              <div className="fl full"><label>{t('setup.eveningShift')}</label></div>
              <div className="fl"><label>{t('setup.from')}</label><input type="time" value={form.eveningFrom} onChange={fld('eveningFrom')}/></div>
              <div className="fl"><label>{t('setup.to')}</label><input type="time" value={form.eveningTo} onChange={fld('eveningTo')}/></div>

              <div className="fl full" style={{ marginTop: 8 }}>
                <label>{lang === 'en' ? 'Center color' : 'لون المركز'}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                      outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: 2,
                    }}/>
                  ))}
                </div>
              </div>

              <div className="fl full"><label>{t('setup.fontAppearance')}</label></div>
              <div className="fl">
                <label>{t('settings.fontSize')}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" className="btn btn-g btn-sm" onClick={() => { const n = Math.max(12, Number(form.fontSize) - 1); setForm(f => ({ ...f, fontSize: n })); applyFontPreview(); }}>A−</button>
                  <span style={{ fontSize: '.85rem', minWidth: 36, textAlign: 'center' }}>{form.fontSize}px</span>
                  <button type="button" className="btn btn-g btn-sm" onClick={() => { const n = Math.min(22, Number(form.fontSize) + 1); setForm(f => ({ ...f, fontSize: n })); applyFontPreview(); }}>A+</button>
                </div>
              </div>
              <div className="fl">
                <label>{t('settings.fontWeight')}</label>
                <select value={form.fontWeight} onChange={e => { setForm(f => ({ ...f, fontWeight: e.target.value })); document.documentElement.style.setProperty('--fw', e.target.value); }}>
                  <option value="400">{t('settings.fontNormal')}</option>
                  <option value="600">{lang === 'en' ? 'Medium' : 'متوسط'}</option>
                  <option value="700">{t('settings.fontBold')}</option>
                  <option value="900">{lang === 'en' ? 'Extra bold' : 'عريض جداً'}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="fa" style={{ borderRadius: '0 0 16px 16px' }}>
          {step > 1 && <button type="button" className="btn btn-g" onClick={() => setStep(s => s - 1)}>{t('setup.prev')}</button>}
          <div style={{ flex: 1 }}/>
          {step < 3
            ? <button type="button" className="btn btn-p" onClick={nextStep}>{t('setup.next')} →</button>
            : <button type="button" className="btn btn-p" onClick={finish} disabled={saving} style={{ background: form.color }}>
                {saving ? t('setup.saving') : t('setup.finish')}
              </button>}
        </div>
      </div>
    </div>
  );
}
