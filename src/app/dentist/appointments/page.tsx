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
import { generateHalfHourSlots } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export default function DentistAppointmentsPage() {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', serviceName: '', notes: '', patientId: '', dentistId: '', status: '', duration: 'SHORT' });
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
  // Obtener usuario actual y tipo
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [approvePopoverId, setApprovePopoverId] = useState<string | null>(null);
  const [approveDuration, setApproveDuration] = useState<number>(30);

  useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(async session => {
      if (session?.user) {
        setCurrentUser(session.user);
        setUserType(session.user.role?.toLowerCase() || '');
        let dentistId = session.user.dentistId;
        if (session.user.role?.toLowerCase() === 'dentist' && !dentistId && session.user.id) {
          // Buscar el perfil Dentist por userId
          const res = await fetch(`/api/dentists`);
          const dentists = await res.json();
          const myDentist = dentists.find((d:any) => d.userId === session.user.id);
          if (myDentist) {
            dentistId = myDentist.id;
            setCurrentUser((u:any) => ({ ...u, dentistId: myDentist.id }));
            // Guardar en localStorage para persistencia
            localStorage.setItem('dentistId', myDentist.id);
          }
        } else if (dentistId) {
          localStorage.setItem('dentistId', dentistId);
        }
      }
    });
  }, []);

  useDentistNotifications({ reloadEmergencies: () => {}, reloadAppointments: () => {
    let dentistId = currentUser?.dentistId || localStorage.getItem('dentistId');
    if (currentUser && userType === 'dentist' && dentistId) {
      setLoadingAppointments(true);
      fetch(`/api/appointments?dentistId=${dentistId}`)
        .then(res => res.json())
        .then(data => {
          setAppointments(data.appointments || []);
          setLoadingAppointments(false);
        })
        .catch(() => { setLoadingAppointments(false); });
    }
  }});

  // Consultar horarios ocupados cuando cambian fecha, hora o dentista en el modal
  useEffect(() => {
    if (editModalOpen && editForm.dentistId && editForm.date) {
      fetch(`/api/appointments/occupied?dentistId=${editForm.dentistId}&date=${editForm.date}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setOccupiedTimes(data.occupiedTimes);
          else setOccupiedTimes([]);
        });
    } else {
      setOccupiedTimes([]);
    }
    setShowOverrideWarning(false);
    setOverrideConfirmed(false);
    setOverrideJustification('');
  }, [editModalOpen, editForm.dentistId, editForm.date]);

  // Al cambiar la hora, si está ocupada, mostrar advertencia
  useEffect(() => {
    if (editForm.time && occupiedTimes.includes(editForm.time)) {
      setShowOverrideWarning(true);
    } else {
      setShowOverrideWarning(false);
      setOverrideConfirmed(false);
      setOverrideJustification('');
    }
  }, [editForm.time, occupiedTimes]);

  // Nuevo: fetch de citas apenas haya dentistId
  useEffect(() => {
    let dentistId = currentUser?.dentistId || localStorage.getItem('dentistId');
    if (userType === 'dentist' && dentistId) {
      setLoadingAppointments(true);
      fetch(`/api/appointments?dentistId=${dentistId}`)
        .then(res => res.json())
        .then(data => {
          setAppointments(data.appointments || []);
          setLoadingAppointments(false);
        })
        .catch(() => { setLoadingAppointments(false); });
    }
  }, [currentUser?.dentistId, userType]);

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

  const handleApprove = async (id: string, durationMinutes: number) => {
    setLoadingId(id + 'SCHEDULED');
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SCHEDULED', durationMinutes })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: t('appointments.statusUpdated'), description: t('appointments.statusUpdatedDesc'), variant: undefined });
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, status: 'SCHEDULED', durationMinutes } : a));
      } else {
        toast({ title: t('profile.error'), description: data.error || t('profile.updateFailed'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('profile.error'), description: t('profile.updateFailed'), variant: 'destructive' });
    }
    setLoadingId(null);
    setApprovePopoverId(null);
    setApproveDuration(30);
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
      duration: app.duration || 'SHORT',
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
    // Si la hora está ocupada y no ha confirmado, no continuar
    if (showOverrideWarning && !overrideConfirmed) return;
    setEditLoading(true);
    try {
      // Si hay override, cancelar la cita anterior
      if (showOverrideWarning && overrideConfirmed) {
        // Buscar la cita a cancelar
        const resOccupied = await fetch(`/api/appointments/occupied?dentistId=${editForm.dentistId}&date=${editForm.date}`);
        const dataOccupied = await resOccupied.json();
        const toCancel = appointments.find(a => a.dentistId === editForm.dentistId && a.date.slice(0,10) === editForm.date && a.time === editForm.time && a.status === 'SCHEDULED');
        if (toCancel) {
          // Cancelar la cita anterior
          await fetch(`/api/appointments/${toCancel.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED', justification: overrideJustification || 'Reemplazada por otra cita' })
          });
        }
      }
      // Guardar la cita editada
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

  // Filtros robustos: si están vacíos o en 'all', no filtran nada
  const filteredAppointments = appointments.filter(app => {
    if (filterDate && app.date.slice(0, 10) !== filterDate) return false;
    if (filterRange.from && filterRange.to) {
      const appDate = parseISO(app.date);
      if (!isWithinInterval(appDate, { start: parseISO(filterRange.from), end: parseISO(filterRange.to) })) return false;
    }
    if (filterStatus && filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (filterPatient && filterPatient !== 'all' && app.patientId !== filterPatient) return false;
    if (filterNotes && filterNotes.trim() && !(app.notes || '').toLowerCase().includes(filterNotes.toLowerCase())) return false;
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

  const availableTimeSlots = generateHalfHourSlots();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('appointments.manageTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 && (
            <div className="pt-6 text-center text-muted-foreground">No hay citas encontradas para este dentista.</div>
          )}
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
              {(filteredAppointments || []).map(app => (
                <TableRow key={app.id}>
                  <TableCell>{app.patient?.user?.name || app.patientId || '-'}</TableCell>
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
                          <Popover open={approvePopoverId === app.id} onOpenChange={v => { setApprovePopoverId(v ? app.id : null); setApproveDuration(30); }}>
                            <PopoverTrigger asChild>
                              <button className="p-1 rounded hover:bg-green-100 focus:outline-none">
                                <Check className="w-5 h-5 text-green-600" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56">
                              <div className="mb-2 font-medium text-sm">{t('appointments.selectDuration')}</div>
                              <Select value={approveDuration.toString()} onValueChange={v => setApproveDuration(Number(v))}>
                                <SelectTrigger><SelectValue placeholder={t('appointments.selectDuration')} /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 min</SelectItem>
                                  <SelectItem value="30">30 min</SelectItem>
                                  <SelectItem value="45">45 min</SelectItem>
                                  <SelectItem value="60">1 hora</SelectItem>
                                  <SelectItem value="90">1h 30min</SelectItem>
                                  <SelectItem value="120">2 horas</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button className="mt-2 w-full" size="sm" onClick={() => handleApprove(app.id, approveDuration)} disabled={loadingId === app.id + 'SCHEDULED'}>
                                {loadingId === app.id + 'SCHEDULED' ? <Loader2 className="animate-spin w-4 h-4" /> : t('appointments.approve')}
                              </Button>
                            </PopoverContent>
                          </Popover>
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
                <Select name="time" value={editForm.time} onValueChange={v => setEditForm(f => ({ ...f, time: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('appointmentForm.selectTime')} /></SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div>
                <label className="block text-sm font-medium">{t('appointments.editDuration')}</label>
                <Select name="duration" value={editForm.duration || editAppointment.duration || 'SHORT'} onValueChange={v => setEditForm(f => ({ ...f, duration: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('appointments.selectDuration')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHORT">{t('appointments.durationShort')}</SelectItem>
                    <SelectItem value="LONG">{t('appointments.durationLong')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {showOverrideWarning && !overrideConfirmed && (
              <div className="col-span-2 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded my-2">
                <div className="font-semibold text-yellow-800 mb-1">{t('appointments.overrideWarning')}</div>
                <div className="text-sm text-yellow-700 mb-2">{t('appointments.overrideWarningDesc')}</div>
                <label className="block text-sm font-medium mb-1">{t('appointments.cancelJustificationLabel')}</label>
                <Input type="text" value={overrideJustification} onChange={e => setOverrideJustification(e.target.value)} placeholder={t('appointments.cancelJustificationPlaceholder')} />
                <Button className="mt-2" size="sm" onClick={() => setOverrideConfirmed(true)} disabled={!overrideJustification || overrideJustification.length < 5}>{t('appointments.overrideConfirm')}</Button>
              </div>
            )}
            {showOverrideWarning && overrideConfirmed && (
              <div className="col-span-2 bg-green-100 border-l-4 border-green-500 p-3 rounded my-2">
                <div className="font-semibold text-green-800">{t('appointments.overrideConfirmed')}</div>
              </div>
            )}
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