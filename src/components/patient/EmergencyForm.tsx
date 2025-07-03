import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

interface EmergencyFormProps {
  onSuccess?: () => void;
}

export default function EmergencyForm({ onSuccess }: EmergencyFormProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user as any;
  const isDentist = user?.role === 'DENTIST';
  const isPatient = user?.role === 'PATIENT';

  const [form, setForm] = useState({
    name: isPatient ? user?.name || '' : '',
    dni: '',
    phone: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dentists, setDentists] = useState<any[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<string>('ALL');

  // Autocompletar DNI y teléfono si es paciente
  useEffect(() => {
    if (isPatient && session) {
      setForm(f => ({
        ...f,
        name: user?.name || ''
      }));
      fetch('/api/patient/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.patient) {
            setForm(f => ({
              ...f,
              dni: data.patient.dni || '',
              phone: data.patient.phone || ''
            }));
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPatient, session, user?.name]);

  useEffect(() => {
    fetch('/api/dentists?availableForEmergency=1')
      .then(res => res.json())
      .then(data => setDentists(data));
  }, []);

  if (isDentist) return null;

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    if (!form.name.trim() || !form.dni.trim() || !form.description.trim()) {
      setError(t('publicEmergency.errorRequired'));
      setLoading(false);
      return;
    }
    const res = await fetch('/api/emergencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dentistId: selectedDentist }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(true);
      setForm({ name: isPatient ? user?.name || '' : '', dni: isPatient ? form.dni : '', phone: '', description: '' });
      if (onSuccess) onSuccess();
    } else {
      setError(data.error || 'Error al enviar la emergencia.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      {success ? (
        <div className="text-green-700 font-semibold text-center">{t('publicEmergency.success')}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('publicEmergency.name')}</label>
            <Input name="name" value={form.name} onChange={handleChange} required disabled={loading || isPatient} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('publicEmergency.dni')}</label>
            <Input name="dni" value={form.dni} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('publicEmergency.phone')}</label>
            <Input name="phone" value={form.phone} onChange={handleChange} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('publicEmergency.description')}</label>
            <Textarea name="description" value={form.description} onChange={handleChange} required disabled={loading} rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('publicEmergency.chooseDentist')}</label>
            <select
              className="w-full border rounded p-2"
              value={selectedDentist}
              onChange={e => setSelectedDentist(e.target.value)}
              disabled={loading}
              required
            >
              <option value="ALL">{t('publicEmergency.notifyAll')}</option>
              {dentists.map((d: any) => (
                <option key={d.id} value={d.id}>{d.user?.name || d.id}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-600 text-sm font-semibold text-center">{error}</div>}
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-2" disabled={loading}>
            {loading ? t('publicEmergency.sending') : t('publicEmergency.submit')}
          </Button>
        </form>
      )}
    </div>
  );
} 