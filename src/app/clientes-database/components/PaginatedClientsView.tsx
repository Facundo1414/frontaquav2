'use client';

import { useState, useEffect, Fragment } from 'react';
import { Users, ChevronLeft, ChevronRight, Loader2, Phone, MapPin, Edit2, Save, X, XCircle, Search, Eye, DollarSign, MessageSquare } from 'lucide-react';
import { getClients, getClientWorks, updateClient, getClientStats } from '@/lib/api';
import { getUserFriendlyError } from '@/utils/errorMessages';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

interface ClientWork {
  id: number;
  work_type: string;
  work_date: string;
  es_apto: boolean;
  motivo_descarte: string;
  total_deuda: number;
  cantidad_comprobantes: number;
  estado: string;
  verificado: boolean;
  notificado: boolean;
  fecha_verificacion: string;
  fecha_notificacion: string;
}

export function PaginatedClientsView() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  
  // Edición de teléfono
  const [editingPhone, setEditingPhone] = useState<{ clientId: string; value: string } | null>(null);
  const [savingPhone, setSavingPhone] = useState(false);
  
  // Edición de notas
  const [editingNotes, setEditingNotes] = useState<{ clientId: string; value: string } | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Expandir trabajos
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientWorks, setClientWorks] = useState<ClientWork[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);

  // Debounce del searchTerm
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 800); // Espera 800ms después de que el usuario deje de escribir

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Recargar clientes cuando cambien filtros o página
  useEffect(() => {
    loadClients();
  }, [currentPage, debouncedSearchTerm, statusFilter, phoneFilter]);

  // Cargar estadísticas al inicio (solo una vez)
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await getClientStats();
      // stats contiene: total, withPhone, withoutPhone, pending, notified, visited, verified, etc.
      setTotalPending(stats.pending || stats.byStatus?.pending || 0);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      // No es crítico, continuar sin estadísticas
    }
  };

  const loadClients = async () => {
    try {
      setError(null);

      // Solo mostrar loading en la primera carga, no en búsquedas
      if (currentPage === 1 && !debouncedSearchTerm && statusFilter === 'all' && phoneFilter === 'all') {
        setLoading(true);
      }

      const params: any = {
        page: currentPage,
        limit: PAGE_SIZE,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (phoneFilter !== 'all') {
        params.hasPhone = phoneFilter === 'with';
      }

      const data = await getClients(params);
      
      console.log('📊 Respuesta getClients:', data);
      console.log('📊 Total count:', data.total);
      console.log('📊 Clientes:', data.clients?.length);
      
      setClients(data.clients);
      setTotalCount(data.total);
      
      console.log('📊 Estado después de setear:', {
        clientsLength: data.clients.length,
        totalCount: data.total,
        totalPages: Math.ceil(data.total / PAGE_SIZE)
      });
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      const friendlyMessage = getUserFriendlyError(err);
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadClientWorks = async (clientId: string) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
      return;
    }

    try {
      setLoadingWorks(true);
      setExpandedClientId(clientId);

      const data = await getClientWorks(clientId);
      setClientWorks(data || []);
    } catch (err: any) {
      console.error('Error cargando trabajos:', err);
      const friendlyMessage = getUserFriendlyError(err);
      toast.error(friendlyMessage);
      setClientWorks([]);
    } finally {
      setLoadingWorks(false);
    }
  };

  const handleEditPhone = (clientId: string, currentPhone: string) => {
    setEditingPhone({ clientId, value: currentPhone || '' });
  };

  const handleCancelEditPhone = () => {
    setEditingPhone(null);
  };

  const handleSavePhone = async (clientId: string) => {
    if (!editingPhone) return;

    try {
      setSavingPhone(true);
      
      const phoneValue = editingPhone.value.trim();
      if (phoneValue && !/^\+?[\d\s\-()]+$/.test(phoneValue)) {
        toast.error('Formato de teléfono inválido. Use solo números, espacios, guiones o paréntesis.');
        return;
      }

      await updateClient(clientId, {
        phone: phoneValue || null,
        phoneSource: 'manual',
      });

      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, phone: phoneValue, phone_source: 'manual', phone_updated_at: new Date().toISOString() }
          : c
      ));

      setEditingPhone(null);
      toast.success('Teléfono actualizado correctamente');
    } catch (err: any) {
      console.error('Error al actualizar teléfono:', err);
      const friendlyMessage = getUserFriendlyError(err);
      toast.error(friendlyMessage);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleEditNotes = (clientId: string, currentNotes: string) => {
    setEditingNotes({ clientId, value: currentNotes || '' });
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
  };

  const handleSaveNotes = async (clientId: string) => {
    if (!editingNotes) return;

    try {
      setSavingNotes(true);

      await updateClient(clientId, {
        notes: editingNotes.value.trim() || null,
      });

      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, notes: editingNotes.value.trim() }
          : c
      ));

      setEditingNotes(null);
      toast.success('Notas actualizadas correctamente');
    } catch (err: any) {
      console.error('Error al actualizar notas:', err);
      const friendlyMessage = getUserFriendlyError(err);
      toast.error(friendlyMessage);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: 'pending' | 'verified' | 'notified' | 'visited') => {
    try {
      await updateClient(clientId, { status: newStatus });
      
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, status: newStatus }
          : c
      ));
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      alert(err.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePhoneFilterChange = (value: string) => {
    setPhoneFilter(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900 dark:text-red-100">Error al cargar clientes</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          <button
            onClick={loadClients}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total de clientes</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalCount}</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-sm text-green-700 dark:text-green-300 mb-1">Con teléfono</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {clients.filter(c => c.phone).length}
          </p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">Sin teléfono</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {clients.filter(c => !c.phone).length}
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {totalPending}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 animate-spin" />
          )}
          <input
            type="text"
            placeholder="Buscar por titular, cliente, unidad, dirección o teléfono..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <select
          value={phoneFilter}
          onChange={(e) => handlePhoneFilterChange(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">Todos los teléfonos</option>
          <option value="with">Con teléfono</option>
          <option value="without">Sin teléfono</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="verified">Verificado</option>
          <option value="notified">Notificado</option>
          <option value="visited">Visitado</option>
        </select>
      </div>

      {/* Tabla de clientes */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-max table-auto">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Unidad Funcional">
                  UF
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Distrito - Zona - Manzana - Parcela">
                  D-Z-M-P
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Nombre del titular y cliente">
                  Titular / Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Teléfono normalizado">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Dirección del inmueble">
                  Dirección
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Número de conexión del cliente">
                  Conexión
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Estado del proceso">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Notas internas">
                  Notas
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Historial de trabajos">
                  Trabajos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12">
                    <EmptyState
                      icon={Users}
                      title={searchTerm || phoneFilter !== 'all' || statusFilter !== 'all'
                        ? 'No se encontraron clientes'
                        : 'No hay clientes registrados'}
                      description={searchTerm || phoneFilter !== 'all' || statusFilter !== 'all'
                        ? 'Intenta ajustar los filtros de búsqueda para ver más resultados'
                        : 'Importa tu universo de cuentas para comenzar a gestionar tus clientes'}
                      action={
                        (searchTerm || phoneFilter !== 'all' || statusFilter !== 'all') ? (
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setPhoneFilter('all');
                              setStatusFilter('all');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Limpiar filtros
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                clients.map((client, index) => (
                  <Fragment key={client.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                          {client.unidad || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {[client.distrito, client.zona, client.manzana, client.parcela]
                            .filter(Boolean)
                            .join('-') || '-'}
                        </div>
                        {client.ph && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PH: {client.ph}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {client.titular || '-'}
                        </div>
                        {client.cliente && client.cliente !== client.titular && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {client.cliente}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingPhone?.clientId === client.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingPhone?.value || ''}
                              onChange={(e) => setEditingPhone(editingPhone ? { ...editingPhone, value: e.target.value } : null)}
                              placeholder="+54 9 XXX XXXXXXX"
                              className="w-40 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                              autoFocus
                              disabled={savingPhone}
                            />
                            <button
                              onClick={() => handleSavePhone(client.id)}
                              disabled={savingPhone}
                              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                              title="Guardar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEditPhone}
                              disabled={savingPhone}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="group flex items-center gap-2">
                            {client.phone ? (
                              <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <Phone className={`w-4 h-4 ${
                                    client.phone_source === 'manual' ? 'text-green-600' : 'text-green-400'
                                  }`} />
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {client.phone}
                                  </span>
                                </div>
                                {client.phone_source && (
                                  <span className={`text-xs ${
                                    client.phone_source === 'manual' 
                                      ? 'text-green-600 dark:text-green-400 font-medium' 
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {client.phone_source === 'manual' ? '✓ Manual' : 
                                     client.phone_source === 'sylanus' ? 'Sisa' : 'Excel'}
                                  </span>
                                )}
                              </div>
                            ) : client.te_titular || client.te_cliente ? (
                              <div className="flex flex-col gap-1 flex-1">
                                <span className="text-sm text-amber-600 dark:text-amber-400">
                                  {client.te_titular || client.te_cliente}
                                </span>
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                  Sin normalizar
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 flex-1">Sin teléfono</span>
                            )}
                            <button
                              onClick={() => handleEditPhone(client.id, client.phone)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                              title="Editar teléfono"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-900 dark:text-white">
                            {client.calle_inm || client.numero_inm
                              ? `${client.calle_inm || ''} ${client.numero_inm || ''}`.trim()
                              : '-'}
                            {client.barrio_inm && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {client.barrio_inm}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={client.connection_type || ''}
                          onChange={(e) => {
                            const newValue = e.target.value as 'B' | 'M' | 'SOT' | 'SC' | '';
                            updateClient(client.id, { 
                              connectionType: newValue || null 
                            }).then(() => {
                              setClients(prev => prev.map(c => 
                                c.id === client.id ? { ...c, connection_type: newValue } : c
                              ));
                            }).catch((err: any) => {
                              console.error('Error al actualizar tipo de conexión:', err);
                              alert('Error al actualizar el tipo de conexión');
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border-2 cursor-pointer transition-all bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/50"
                          title="Tipo de conexión del cliente"
                        >
                          <option value="">Sin especificar</option>
                          <option value="B">B - Brasero</option>
                          <option value="M">M - Monoblock</option>
                          <option value="SOT">SOT - Soterrada</option>
                          <option value="SC">SC - Sin Conexión</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={client.status || 'pending'}
                          onChange={(e) => handleStatusChange(client.id, e.target.value as 'pending' | 'verified' | 'notified' | 'visited')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 cursor-pointer transition-all ${
                            client.status === 'visited'
                              ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50'
                              : client.status === 'notified'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                              : client.status === 'verified'
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
                              : 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/50'
                          }`}
                          title="Cambiar estado del cliente"
                        >
                          <option value="pending">⏳ Pendiente</option>
                          <option value="verified">✓ Verificado</option>
                          <option value="notified">📱 Notificado</option>
                          <option value="visited">✅ Visitado</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div 
                          className="flex items-start gap-2 group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors max-w-[200px]"
                          onClick={() => handleEditNotes(client.id, client.notes)}
                          title={client.notes || "Click para agregar notas"}
                        >
                          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          {client.notes ? (
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                              {client.notes}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin notas</span>
                          )}
                          <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => loadClientWorks(client.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                          title="Ver historial de trabajos"
                        >
                          <Eye className="w-4 h-4" />
                          {expandedClientId === client.id ? 'Ocultar' : 'Ver'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Fila expandida con trabajos */}
                    {expandedClientId === client.id && (
                      <tr>
                        <td colSpan={9} className="px-4 py-4 bg-gray-50 dark:bg-gray-800/50">
                          {loadingWorks ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Cargando trabajos...</span>
                            </div>
                          ) : clientWorks.length === 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center p-4">
                              No hay trabajos registrados para este cliente
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                                Historial de Trabajos ({clientWorks.length})
                              </h4>
                              {clientWorks.map((work) => (
                                <div
                                  key={work.id}
                                  className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {work.work_type === 'pyse_filter' ? '🔍 Filtrado PYSE' : '📤 Envío Notificación'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(work.work_date).toLocaleDateString('es-AR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                                    <span>
                                      {work.es_apto ? (
                                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Apto</span>
                                      ) : (
                                        <span className="text-red-600 dark:text-red-400">❌ No apto: {work.motivo_descarte}</span>
                                      )}
                                    </span>
                                    <span>Deuda: ${work.total_deuda?.toLocaleString('es-AR')}</span>
                                    <span>Comprobantes: {work.cantidad_comprobantes}</span>
                                  </div>
                                  <div className="flex items-center space-x-3 text-xs">
                                    {work.verificado && (
                                      <span className="text-green-600 dark:text-green-400">
                                        ✅ Verificado {work.fecha_verificacion ? `(${new Date(work.fecha_verificacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })})` : ''}
                                      </span>
                                    )}
                                    {work.notificado && (
                                      <span className="text-blue-600 dark:text-blue-400">
                                        📤 Notificado {work.fecha_notificacion ? `(${new Date(work.fecha_notificacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })})` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)} - {Math.min(currentPage * PAGE_SIZE, totalCount)} de {totalCount} clientes
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Botón actualizar */}
      {clients.length > 0 && (
        <div className="flex items-center justify-end">
          <button
            onClick={loadClients}
            className="px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </div>
      )}

      {/* Modal de edición de notas */}
      {editingNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancelEditNotes}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Notas</h3>
              <button
                onClick={handleCancelEditNotes}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={editingNotes?.value ?? ''}
              onChange={(e) => setEditingNotes({ clientId: editingNotes.clientId, value: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="Agregar notas sobre el cliente..."
              disabled={savingNotes}
              autoFocus
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={handleCancelEditNotes}
                disabled={savingNotes}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveNotes(editingNotes.clientId)}
                disabled={savingNotes}
                className="px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingNotes ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
