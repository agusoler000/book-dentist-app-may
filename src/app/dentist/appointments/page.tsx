"use client";
import { useEffect, useState, useRef } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getAllDentists } from '@/app/actions/auth/get-all-dentists';
import { getAllPatients } from '@/app/actions/auth/get-all-patients';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { useDentistNotifications } from '@/hooks/use-dentist-notifications';

export default function DentistAppointmentsPage() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', serviceName: '', notes: '', patientId: '', dentistId: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterRange, setFilterRange] = useState<{ from: string, to: string }>({ from: '', to: '' });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPatient, setFilterPatient] = useState<string>('all');
  const [filterNotes, setFilterNotes] = useState<string>('');
  const [dniSearch, setDniSearch] = useState('');
  const [dniPatient, setDniPatient] = useState<any | null>(null);
  const [dniNotFound, setDniNotFound] = useState(false);
  const dniInputRef = useRef<HTMLInputElement>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelJustification, setCancelJustification] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelingId, setCancelingId] = useState<string|null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    // Verificar sesión y rol
    fetch('/api/auth/session').then(res => res.json()).then(session => {
      if (!session?.user || session.user.role !== 'DENTIST') {
        router.replace('/login');
        return;
      }
      if (session.user.dentistId) {
        fetch(`/api/appointments?dentistId=${session.user.dentistId}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAppointments(data.appointments);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  useDentistNotifications({ reloadEmergencies: () => {}, reloadAppointments: () => {
    if (currentUser && userType === 'dentist') {
      setLoadingAppointments(true);
      fetch(`/api/appointments?dentistId=${currentUser.dentistId}`)
        .then(res => res.json())
        .then(data => {
          setAppointments(data.appointments || []);
          setLoadingAppointments(false);
        })
        .catch(() => setLoadingAppointments(false));
    }
  }});

  const handleStatus = async (id: string, status: 'SCHEDULED' | 'CANCELLED') => {
    setLoadingId(id + status);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: t('appointments.statusUpdated'), description: t('appointments.statusUpdatedDesc'), variant: undefined });
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, status } : a));
      } else {
        toast({ title: t('profile.error'), description: data.error || t('profile.updateFailed'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('profile.error'), description: t('profile.updateFailed'), variant: 'destructive' });
    }
    setLoadingId(null);
  };

  const openEditModal = async (app: any) => {
    setEditAppointment(app);
    setEditForm({
      date: app.date ? app.date.slice(0, 10) : '',
      time: app.time || '',
      serviceName: app.serviceName || '',
      notes: app.notes || '',
      patientId: app.patientId,
      dentistId: app.dentistId,
      status: app.status,
    });
    setEditModalOpen(true);
    // Obtener pacientes y dentistas
    setPatients(await getAllPatients());
    setDentists(await getAllDentists());
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditAppointment(null);
  };

  const handleEditChange = (e: any) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEditSave = async () => {
    if (!editAppointment) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/appointments/${editAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: t('profile.updated'), description: t('appointments.statusUpdatedDesc'), variant: undefined });
        setAppointments(apps => apps.map(a => a.id === editAppointment.id ? { ...a, ...editForm } : a));
        closeEditModal();
      } else {
        toast({ title: t('profile.error'), description: data.error || t('profile.updateFailed'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('profile.error'), description: t('profile.updateFailed'), variant: 'destructive' });
    }
    setEditLoading(false);
  };

  const statusLabels: Record<string, string> = {
    PENDING: t('appointmentStatus.pending'),
    SCHEDULED: t('appointmentStatus.scheduled'),
    CANCELLED: t('appointmentStatus.cancelled'),
    COMPLETED: t('appointmentStatus.completed'),
  };

  const filteredAppointments = appointments.filter(app => {
    // Filtrar por fecha única
    if (filterDate && app.date.slice(0, 10) !== filterDate) return false;
    // Filtrar por rango de fechas
    if (filterRange.from && filterRange.to) {
      const appDate = parseISO(app.date);
      if (!isWithinInterval(appDate, { start: parseISO(filterRange.from), end: parseISO(filterRange.to) })) return false;
    }
    // Filtrar por estado
    if (filterStatus && filterStatus !== 'all' && app.status !== filterStatus) return false;
    // Filtrar por paciente
    if (filterPatient && filterPatient !== 'all' && app.patientId !== filterPatient) return false;
    // Filtrar por notas
    if (filterNotes && !app.notes?.toLowerCase().includes(filterNotes.toLowerCase())) return false;
    return true;
  });

  const handleCancel = (app: any) => {
    if (app.status === 'SCHEDULED') {
      setCancelingId(app.id);
      setCancelModalOpen(true);
      setCancelJustification("");
      setCancelError("");
    } else {
      handleStatus(app.id, 'CANCELLED');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('appointments.manageTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1">{t('appointments.editDate')}</label>
              <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t('appointments.editDate')} (rango)</label>
              <div className="flex gap-2">
                <Input type="date" value={filterRange.from} onChange={e => setFilterRange(r => ({ ...r, from: e.target.value }))} placeholder={t('appointments.editDate') + ' (from)'} />
                <Input type="date" value={filterRange.to} onChange={e => setFilterRange(r => ({ ...r, to: e.target.value }))} placeholder={t('appointments.editDate') + ' (to)'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t('appointments.editStatus')}</label>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
                <SelectTrigger className="min-w-[120px]"><SelectValue placeholder={t('appointments.selectStatus')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('appointments.selectStatus')}</SelectItem>
                  <SelectItem value="PENDING">{t('appointmentStatus.pending')}</SelectItem>
                  <SelectItem value="SCHEDULED">{t('appointmentStatus.scheduled')}</SelectItem>
                  <SelectItem value="CANCELLED">{t('appointmentStatus.cancelled')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('appointmentStatus.completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Buscar por DNI</label>
              <div className="flex gap-2">
                <Input ref={dniInputRef} type="text" value={dniSearch} onChange={e => { setDniSearch(e.target.value); setDniNotFound(false); }} placeholder="DNI" />
                <Button type="button" size="sm" onClick={async () => {
                  if (!dniSearch.trim()) return;
                  let data = null;
                  try {
                    const res = await fetch(`/api/patient/profile?dni=${dniSearch.trim()}`);
                    if (res.ok) {
                      data = await res.json();
                    }
                  } catch (e) {
                    data = null;
                  }
                  if (data && data.patient) {
                    setDniPatient(data.patient);
                    setFilterPatient(data.patient.id);
                    setDniNotFound(false);
                  } else {
                    setDniPatient(null);
                    setFilterPatient('all');
                    setDniNotFound(true);
                  }
                }}>{t('appointments.search')}</Button>
              </div>
              {dniPatient && (
                <div className="text-xs text-green-700 mt-1">{dniPatient.user?.name} ({dniPatient.dni})</div>
              )}
              {dniNotFound && (
                <div className="text-xs text-red-600 mt-1">{t('appointments.dniNotFound')}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t('appointments.editNotes')}</label>
              <Input type="text" value={filterNotes} onChange={e => setFilterNotes(e.target.value)} placeholder={t('appointments.editNotes')} />
            </div>
            <div className="flex justify-end items-end">
              <Button variant="outline" size="sm" onClick={() => { setFilterDate(''); setFilterRange({ from: '', to: '' }); setFilterStatus('all'); setFilterPatient('all'); setFilterNotes(''); }}>{t('appointments.clearFilters')}</Button>
            </div>
          </div>
          {/* Tabla */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('appointments.patient')}</TableHead>
                <TableHead>{t('appointments.service')}</TableHead>
                <TableHead>{t('appointments.date')}</TableHead>
                <TableHead>{t('appointments.time')}</TableHead>
                <TableHead>{t('appointments.status')}</TableHead>
                <TableHead>{t('appointments.notes')}</TableHead>
                <TableHead>{t('appointments.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{app.patient?.user?.name || '-'}</TableCell>
                  <TableCell>{app.serviceName}</TableCell>
                  <TableCell>{format(parseISO(app.date), 'PPP', { locale: typeof locale === 'object' ? locale : undefined })}</TableCell>
                  <TableCell>{app.time}</TableCell>
                  <TableCell>{statusLabels[app.status] || app.status}</TableCell>
                  <TableCell>{app.notes || ''}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => openEditModal(app)} className="p-1 rounded hover:bg-accent/10 focus:outline-none">
                              <Pencil className="w-5 h-5 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{t('appointments.edit')}</TooltipContent>
                        </Tooltip>
                        {app.status === 'PENDING' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleStatus(app.id, 'SCHEDULED')} className="p-1 rounded hover:bg-green-100 focus:outline-none">
                                <Check className="w-5 h-5 text-green-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('appointments.approve')}</TooltipContent>
                          </Tooltip>
                        )}
                        {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handleCancel(app)} className="p-1 rounded hover:bg-red-100 focus:outline-none">
                                <X className="w-5 h-5 text-red-600" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('appointments.cancel')}</TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editModalOpen && editAppointment && (
        <Dialog open={editModalOpen} onOpenChange={v => { if (!v) closeEditModal(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('appointments.editTitle')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <label className="block text-sm font-medium">{t('appointments.editDate')}</label>
                <Input type="date" name="date" value={editForm.date} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium">{t('appointments.editTime')}</label>
                <Input type="text" name="time" value={editForm.time} onChange={handleEditChange} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">{t('appointments.editService')}</label>
                <Input type="text" name="serviceName" value={editForm.serviceName} onChange={handleEditChange} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">{t('appointments.editNotes')}</label>
                <Input type="text" name="notes" value={editForm.notes} onChange={handleEditChange} />
              </div>
              <div>
                <label className="block text-sm font-medium">{t('appointments.editPatient')}</label>
                <Select name="patientId" value={editForm.patientId} onValueChange={v => setEditForm(f => ({ ...f, patientId: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('appointments.selectPatient')} /></SelectTrigger>
                  <SelectContent>
                    {dniPatient && (
                      <SelectItem key={dniPatient.id} value={dniPatient.id}>{dniPatient.user?.name || dniPatient.dni}</SelectItem>
                    )}
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.user?.name || p.dni || p.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium">{t('appointments.editDentist')}</label>
                <Select name="dentistId" value={editForm.dentistId} onValueChange={v => setEditForm(f => ({ ...f, dentistId: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('appointments.selectDentist')} /></SelectTrigger>
                  <SelectContent>
                    {dentists.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.user?.name || d.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium">{t('appointments.editStatus')}</label>
                <Select name="status" value={editForm.status || editAppointment.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('appointments.selectStatus')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">{t('appointmentStatus.pending')}</SelectItem>
                    <SelectItem value="SCHEDULED">{t('appointmentStatus.scheduled')}</SelectItem>
                    <SelectItem value="CANCELLED">{t('appointmentStatus.cancelled')}</SelectItem>
                    <SelectItem value="COMPLETED">{t('appointmentStatus.completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditSave} disabled={editLoading}>{editLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t('appointments.save')}</Button>
              <Button variant="outline" onClick={closeEditModal}>{t('appointments.cancel')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Modal de justificación de cancelación */}
      <Dialog open={cancelModalOpen} onOpenChange={v => { setCancelModalOpen(v); if (!v) setCancelError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('appointments.cancelJustificationTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block text-sm font-medium">{t('appointments.cancelJustificationLabel')}</label>
            <Input
              type="text"
              value={cancelJustification}
              onChange={e => setCancelJustification(e.target.value)}
              placeholder={t('appointments.cancelJustificationPlaceholder')}
              autoFocus
            />
            {cancelError && <div className="text-xs text-red-600">{cancelError}</div>}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (cancelJustification.trim().length < 5) {
                  setCancelError(t('appointments.cancelJustificationRequired'));
                  return;
                }
                setCancelError("");
                setLoadingId(cancelingId + 'CANCELLED');
                try {
                  const res = await fetch(`/api/appointments/${cancelingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'CANCELLED', justification: cancelJustification })
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast({ title: t('appointments.statusUpdated'), description: t('appointments.statusUpdatedDesc'), variant: undefined });
                    setAppointments(apps => apps.map(a => a.id === cancelingId ? { ...a, status: 'CANCELLED', notes: (a.notes || '') + '\n[Cancelación justificada]: ' + cancelJustification } : a));
                    setCancelModalOpen(false);
                  } else {
                    setCancelError(data.error || t('profile.updateFailed'));
                  }
                } catch {
                  setCancelError(t('profile.updateFailed'));
                }
                setLoadingId(null);
              }}
              disabled={loadingId === cancelingId + 'CANCELLED'}
            >
              {loadingId === cancelingId + 'CANCELLED' ? <Loader2 className="animate-spin w-4 h-4" /> : t('appointments.cancelJustificationButton')}
            </Button>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>{t('profile.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 