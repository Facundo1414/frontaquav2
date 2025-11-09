'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Upload, Database, FileSpreadsheet, Users, ArrowLeft, CheckCircle, XCircle, AlertCircle, Search, Filter, Phone, MapPin, DollarSign, Calendar, Edit2, Save, X, Eye, Check, MessageSquare, Loader2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { importPYSEClients, importDeudasClients, getClients, updateClient, previewPYSEImport, previewDeudasImport } from '@/lib/api';
import * as XLSX from 'xlsx';

// 🚀 Lazy load del componente de vista paginada (pesado)
const PaginatedClientsView = dynamic(() => import('./components/PaginatedClientsView').then(mod => ({ default: mod.PaginatedClientsView })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

// Componente para ver la lista de clientes
function ClientsView() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState<string>('all');
  const [editingPhone, setEditingPhone] = useState<{ clientId: string; value: string } | null>(null);
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClients();
      setClients(data.clients);
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
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
      
      // Validar formato de teléfono (básico)
      const phoneValue = editingPhone.value.trim();
      if (phoneValue && !/^\+?[\d\s\-()]+$/.test(phoneValue)) {
        alert('Formato de teléfono inválido. Use solo números, espacios, guiones o paréntesis.');
        return;
      }

      // Actualizar cliente con phone_source='manual'
      await updateClient(clientId, {
        phone: phoneValue || null,
        phone_source: 'manual',
        phone_updated_at: new Date().toISOString(),
      });

      // Actualizar lista local
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, phone: phoneValue, phone_source: 'manual', phone_updated_at: new Date().toISOString() }
          : c
      ));

      setEditingPhone(null);
    } catch (err: any) {
      console.error('Error al actualizar teléfono:', err);
      alert(err.response?.data?.message || 'Error al actualizar el teléfono');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleOpenEditModal = (client: any) => {
    setEditingClient({ ...client });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingClient(null);
    setShowEditModal(false);
  };

  const handleSaveClientChanges = async () => {
    if (!editingClient) return;

    try {
      const updates: any = {
        phone: editingClient.phone?.trim() || null,
        notes: editingClient.notes?.trim() || null,
        status: editingClient.status,
      };

      // Si se editó el teléfono, marcarlo como manual
      if (editingClient.phone !== clients.find(c => c.id === editingClient.id)?.phone) {
        updates.phone_source = 'manual';
        updates.phone_updated_at = new Date().toISOString();
      }

      await updateClient(editingClient.id, updates);

      // Actualizar lista local
      setClients(prev => prev.map(c => 
        c.id === editingClient.id 
          ? { ...c, ...updates }
          : c
      ));

      handleCloseEditModal();
    } catch (err: any) {
      console.error('Error al actualizar cliente:', err);
      alert(err.response?.data?.message || 'Error al actualizar el cliente');
    }
  };

  // Actualizar estado inline desde la tabla
  const handleStatusChange = async (clientId: string, newStatus: 'pending' | 'notified' | 'visited') => {
    try {
      await updateClient(clientId, { status: newStatus });
      
      // Actualizar lista local
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

  const filteredClients = clients.filter(client => {
    // Construir UF completa para búsqueda
    const uf = `${client.unidad || ''}-${client.distrito || ''}-${client.zona || ''}-${client.manzana || ''}-${client.parcela || ''}`;
    
    // Filtro de búsqueda
    const matchesSearch = !searchTerm || 
      client.titular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uf.includes(searchTerm) ||
      client.phone?.includes(searchTerm) ||
      client.calle_inm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.barrio_inm?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de teléfono
    const matchesPhone = phoneFilter === 'all' ||
      (phoneFilter === 'with' && client.phone) ||
      (phoneFilter === 'without' && !client.phone);

    // Filtro de estado
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesPhone && matchesStatus;
  });

  if (loading) {
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
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{clients.length}</p>
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
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Filtrados</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {filteredClients.length}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por titular, cliente, unidad, dirección o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filtro de teléfono */}
        <select
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">Todos los teléfonos</option>
          <option value="with">Con teléfono</option>
          <option value="without">Sin teléfono</option>
        </select>

        {/* Filtro de estado */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-16" title="Número de registro">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Unidad Funcional - Identificador único del cliente en Aguas Cordobesas">
                  UF
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-help" title="Distrito - Zona - Manzana - Parcela (y PH si corresponde)">
                  D-Z-M-P
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Nombre del titular y cliente (si difieren)">
                  Titular / Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Teléfono normalizado - Verde oscuro = manual (no sobrescribir)">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Dirección del inmueble">
                  Dirección
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-help" title="Situación de la cuenta (ej: PT HA HA CS), Usuario asignado (val_atr_12), Tipo de plan y cuotas">
                  Info Cuenta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Número de conexión del cliente">
                  Conexión
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Estado del proceso: Pendiente / Notificado / Visitado">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider" title="Notas internas sobre el cliente">
                  Notas
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm || phoneFilter !== 'all' || statusFilter !== 'all'
                        ? 'No se encontraron clientes con los filtros aplicados'
                        : 'No hay clientes registrados. Importa tu primer archivo Excel.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    </td>
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
                        // Modo edición
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
                        // Modo visualización
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
                          {(client.dat_complem_inm || client.dat_complem_pos) && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {client.dat_complem_inm || client.dat_complem_pos}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-sm">
                        {client.situacion && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Sit:</span>
                            <span className="font-mono text-gray-900 dark:text-white text-xs">
                              {client.situacion}
                            </span>
                          </div>
                        )}
                        {client.val_atr_12 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Usuario:</span>
                            <span className="text-gray-900 dark:text-white text-xs">
                              {client.val_atr_12}
                            </span>
                          </div>
                        )}
                        {client.val_atr_13 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {client.val_atr_13}
                          </div>
                        )}
                        {client.tpo_plan && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-purple-600 dark:text-purple-400">Plan:</span>
                            <span className="font-medium text-purple-700 dark:text-purple-300 text-xs">
                              {client.tpo_plan}
                              {client.cod_mot_gen && ` (${client.cod_mot_gen})`}
                              {client.can_cuo && ` - ${client.can_cuo} cuotas`}
                            </span>
                          </div>
                        )}
                        {!client.situacion && !client.val_atr_12 && !client.tpo_plan && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
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
                          }).catch((err) => {
                            console.error('Error al actualizar tipo de conexión:', err);
                            alert('Error al actualizar el tipo de conexión');
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border-2 cursor-pointer transition-all bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/50"
                        title="Tipo de conexión del cliente"
                      >
                        <option value="">Sin especificar</option>
                        <option value="B">B - Braseto</option>
                        <option value="M">M - Monoblock</option>
                        <option value="SOT">SOT - Soterrada</option>
                        <option value="SC">SC - Sin Conexión</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={client.status || 'pending'}
                        onChange={(e) => handleStatusChange(client.id, e.target.value as 'pending' | 'notified' | 'visited')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 cursor-pointer transition-all ${
                          client.status === 'visited'
                            ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50'
                            : client.status === 'notified'
                            ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                            : 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/50'
                        }`}
                        title="Cambiar estado del cliente"
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="notified">📱 Notificado</option>
                        <option value="visited">✅ Visitado</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      {client.notes ? (
                        <div className="flex items-start gap-2 group">
                          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:line-clamp-none transition-all" title={client.notes}>
                            {client.notes}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin notas</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleOpenEditModal(client)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      {filteredClients.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>
            Mostrando <span className="font-medium text-gray-900 dark:text-white">{filteredClients.length}</span> de{' '}
            <span className="font-medium text-gray-900 dark:text-white">{clients.length}</span> clientes
          </p>
          <button
            onClick={loadClients}
            className="px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </div>
      )}

      {/* Modal de edición completa */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Cliente
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Información básica (solo lectura) */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">UF</label>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    {editingClient.unidad || '-'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Titular</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {editingClient.titular || '-'}
                    </p>
                  </div>
                  {editingClient.cliente && editingClient.cliente !== editingClient.titular && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Cliente</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {editingClient.cliente}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Dirección</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {editingClient.calle_inm && editingClient.numero_inm
                      ? `${editingClient.calle_inm} ${editingClient.numero_inm}${editingClient.barrio_inm ? ` - ${editingClient.barrio_inm}` : ''}`
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Campos editables */}
              <div className="space-y-4">
                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono *
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      (Se marcará como manual)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="+54 9 XXX XXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={editingClient.status || 'pending'}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="notified">Notificado</option>
                    <option value="visited">Visitado</option>
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={editingClient.notes || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                    placeholder="Agregar comentarios o notas sobre el cliente..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClientChanges}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientesDatabasePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'import' | 'view'>('import');
  const [importType, setImportType] = useState<'pyse' | 'deudas'>('pyse');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar que sea un archivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        setError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoadingPreview(true);
    setError(null);
    setPreview(null);

    try {
      const options = {
        updateExisting: true,
        preserveManualPhones: true,
      };

      const data = importType === 'pyse'
        ? await previewPYSEImport(file, options)
        : await previewDeudasImport(file, options);

      setPreview(data);
      setShowPreviewModal(true);
    } catch (err: any) {
      console.error('Error al generar preview:', err);
      setError(err.response?.data?.message || err.message || 'Error al analizar el archivo');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    setShowPreviewModal(false);
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const options = {
        updateExisting: true,
        preserveManualPhones: true, // Siempre preservar teléfonos manuales
      };

      // Mostrar mensaje de progreso con tiempo estimado
      const startTime = Date.now();

      const data = importType === 'pyse'
        ? await importPYSEClients(file, options)
        : await importDeudasClients(file, options);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);

      setResult({ ...data, duration });
      setFile(null);
      setPreview(null);
      
      // Reset el input de archivo
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error('Error al importar:', err);
      setError(err.response?.data?.message || err.message || 'Error al importar el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    // Ahora primero mostramos el preview
    await handlePreview();
  };

  const handleDownloadTemplate = () => {
    // Crear plantilla de ejemplo con formato PYSE
    const templateData = [
      // Headers
      [
        'unidad',         // UF (requerido)
        'distrito',       // Distrito
        'zona',           // Zona
        'manzana',        // Manzana
        'parcela',        // Parcela
        'ph',             // PH (opcional)
        'titular',        // Titular (requerido)
        'te_titular',     // Teléfono titular (Sylanus)
        'cliente',        // Cliente
        'te_cliente',     // Teléfono cliente
        'calle_inm',      // Calle inmueble
        'numero_inm',     // Número inmueble
        'barrio_inm',     // Barrio inmueble
        'situacion',      // Situación cuenta
        'val_atr_12',     // Usuario asignado
        'val_atr_13',     // Info adicional
        'tpo_plan',       // Tipo de plan
        'cod_mot_gen',    // Código motivo
        'can_cuo',        // Cantidad cuotas
        'debt',           // Deuda
        'dat_complem_inm', // Datos complementarios
        'dat_complem_pos', // Datos complementarios pos
      ],
      // Ejemplo 1: Cliente con todos los datos
      [
        '12345',           // unidad
        '1',               // distrito
        '2',               // zona
        '345',             // manzana
        '67',              // parcela
        'A',               // ph
        'PÉREZ JUAN CARLOS', // titular
        '351234567',       // te_titular
        'PÉREZ MARÍA',     // cliente
        '351987654',       // te_cliente
        'AV COLÓN',        // calle_inm
        '1234',            // numero_inm
        'CENTRO',          // barrio_inm
        'PT HA HA CS',     // situacion
        'USUARIO01',       // val_atr_12
        'Info adicional',  // val_atr_13
        'Plan A',          // tpo_plan
        'MOT01',           // cod_mot_gen
        12,                // can_cuo
        15000,             // debt
        'Depto 2do piso',  // dat_complem_inm
        'Torre Norte',     // dat_complem_pos
      ],
      // Ejemplo 2: Cliente con datos mínimos
      [
        '67890',           // unidad
        '2',               // distrito
        '3',               // zona
        '456',             // manzana
        '78',              // parcela
        '',                // ph (vacío)
        'GONZÁLEZ ROBERTO', // titular
        '351111222',       // te_titular
        '',                // cliente (mismo que titular)
        '',                // te_cliente
        'BELGRANO',        // calle_inm
        '567',             // numero_inm
        'NUEVA CÓRDOBA',   // barrio_inm
        'PT HA CS',        // situacion
        '',                // val_atr_12
        '',                // val_atr_13
        '',                // tpo_plan
        '',                // cod_mot_gen
        '',                // can_cuo
        5000,              // debt
        '',                // dat_complem_inm
        '',                // dat_complem_pos
      ],
      // Ejemplo 3: Cliente sin teléfono
      [
        '11111',           // unidad
        '3',               // distrito
        '1',               // zona
        '789',             // manzana
        '12',              // parcela
        '',                // ph
        'RODRÍGUEZ ANA MARÍA', // titular
        '',                // te_titular (sin teléfono)
        '',                // cliente
        '',                // te_cliente
        'SAN MARTÍN',      // calle_inm
        '890',             // numero_inm
        'ALTO ALBERDI',    // barrio_inm
        'PT CS',           // situacion
        'USUARIO02',       // val_atr_12
        '',                // val_atr_13
        'Plan B',          // tpo_plan
        'MOT02',           // cod_mot_gen
        24,                // can_cuo
        25000,             // debt
        '',                // dat_complem_inm
        'Fondo',           // dat_complem_pos
      ],
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 10 },  // unidad
      { wch: 8 },   // distrito
      { wch: 8 },   // zona
      { wch: 10 },  // manzana
      { wch: 10 },  // parcela
      { wch: 5 },   // ph
      { wch: 25 },  // titular
      { wch: 15 },  // te_titular
      { wch: 25 },  // cliente
      { wch: 15 },  // te_cliente
      { wch: 20 },  // calle_inm
      { wch: 10 },  // numero_inm
      { wch: 20 },  // barrio_inm
      { wch: 15 },  // situacion
      { wch: 15 },  // val_atr_12
      { wch: 20 },  // val_atr_13
      { wch: 12 },  // tpo_plan
      { wch: 12 },  // cod_mot_gen
      { wch: 10 },  // can_cuo
      { wch: 10 },  // debt
      { wch: 20 },  // dat_complem_inm
      { wch: 20 },  // dat_complem_pos
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Clientes');

    // Generar archivo y descargar
    XLSX.writeFile(wb, 'plantilla_clientes_pyse.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-teal-500 rounded-2xl shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Base de Datos de Clientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Importa y gestiona tu universo de clientes desde archivos Excel
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'import'
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Excel
              </div>
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-b-2 border-teal-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Ver Clientes
              </div>
            </button>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {activeTab === 'import' && (
              <>
              <div className="space-y-6">
                {/* Botón de descargar plantilla */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        ¿Primera vez importando?
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Descarga nuestra plantilla de ejemplo con el formato correcto y 3 ejemplos de clientes.
                      </p>
                      <button
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Descargar Plantilla de Ejemplo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selector de tipo de importación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de archivo a importar
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setImportType('pyse')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        importType === 'pyse'
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <FileSpreadsheet className={`w-8 h-8 mb-3 ${
                        importType === 'pyse' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'
                      }`} />
                      <h3 className={`font-semibold mb-2 ${
                        importType === 'pyse' ? 'text-teal-900 dark:text-teal-100' : 'text-gray-900 dark:text-white'
                      }`}>
                        PYSE - Universo de Cuentas
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Importa el archivo completo de PYSE con todos los datos de clientes (UF, dirección, teléfonos, etc.)
                      </p>
                      <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                        📅 Importar al inicio del mes
                      </p>
                    </button>

                    <button
                      disabled
                      className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed relative"
                    >
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                        Deshabilitado
                      </div>
                      <FileSpreadsheet className="w-8 h-8 mb-3 text-gray-400" />
                      <h3 className="font-semibold mb-2 text-gray-500 dark:text-gray-400">
                        Planes de pagos Incumplidos
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                        Actualiza deuda y marca clientes con planes de pago vigentes
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                        💳 Temporalmente no disponible
                      </p>
                    </button>
                  </div>
                </div>

                {/* Drag & Drop Zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selecciona el archivo Excel
                  </label>
                  <div className="relative">
                    <input
                      id="file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-input"
                      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        file
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900/50'
                      }`}
                    >
                      {file ? (
                        <>
                          <CheckCircle className="w-16 h-16 text-teal-500 mb-4" />
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                            Click para cambiar el archivo
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-16 h-16 text-gray-400 mb-4" />
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Click para seleccionar archivo
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            o arrastra y suelta aquí
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Formatos aceptados: .xlsx, .xls
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Botón de importar con indicador de progreso mejorado */}
                {uploading || loadingPreview ? (
                  <div className="w-full p-6 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-xl">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-teal-200 dark:border-teal-800 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-1">
                          {loadingPreview ? 'Analizando archivo...' : 'Importando clientes...'}
                        </p>
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                          {loadingPreview 
                            ? 'Validando formato y contando registros'
                            : (importType === 'pyse' 
                              ? 'Procesando Universo de Cuentas PYSE'
                              : 'Procesando Planes de Pago Incumplidos')
                          }
                        </p>
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                          {loadingPreview 
                            ? 'Esto puede tardar unos segundos...'
                            : (preview?.totalRecords 
                              ? `Procesando ${preview.totalRecords} registros...`
                              : 'Esto puede tardar varios segundos...')
                          }
                        </p>
                      </div>
                      <div className="w-full max-w-md">
                        <div className="h-2 bg-teal-200 dark:bg-teal-800 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                      !file
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-teal-500 hover:bg-teal-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" />
                      Importar Clientes
                    </div>
                  </button>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Error al importar</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Resultado exitoso */}
                {result && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 dark:text-green-100">
                          ¡Importación exitosa!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {result.message}
                        </p>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Clientes creados</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                          {result.created || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">Clientes actualizados</p>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                          {result.updated || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Errores</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {result.errors?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Detalles del archivo */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Archivo:</span> {result.fileName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Tamaño:</span> {((result.fileSize || 0) / 1024).toFixed(2)} KB
                      </p>
                      {result.duration && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Tiempo:</span> {result.duration}s
                        </p>
                      )}
                    </div>

                    {/* Errores si hay */}
                    {result.errors && result.errors.length > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            Advertencias durante la importación
                          </p>
                        </div>
                        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300 ml-8">
                          {result.errors.slice(0, 5).map((err: string, idx: number) => (
                            <li key={idx}>• {err}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li className="text-xs italic">... y {result.errors.length - 5} más</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Instrucciones */}
                <div className="mt-8 space-y-4">
                  {/* Flujo de trabajo */}
                  <div className="p-6 bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800 rounded-xl">
                    <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Flujo de trabajo recomendado
                    </h3>
                    <div className="space-y-3 text-sm text-teal-800 dark:text-teal-200">
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-teal-600 dark:text-teal-400 min-w-[120px]">DÍA 1-2:</span>
                        <span>Importar <strong>Universo De Cuentas</strong> → Crea/actualiza base completa de clientes</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-teal-600 dark:text-teal-400 min-w-[120px]">DÍA 3+:</span>
                        <span>Visitar clientes, gestionar teléfonos y actualizar estados manualmente</span>
                      </div>
                    </div>
                  </div>

                  {/* Reglas importantes */}
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Reglas de importación
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>El archivo <strong>Universo De Cuentas</strong> contiene todos los datos de clientes (UF, dirección, titular, teléfonos)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Los teléfonos editados manualmente <strong>nunca se sobrescriben</strong> en nuevas importaciones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Los clientes se identifican por <strong>UF</strong> (Unidad de Facturación)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>Si un cliente ya existe, sus datos se actualizarán con la nueva información del archivo</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal de Preview */}
              {showPreviewModal && preview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Eye className="w-6 h-6 text-teal-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Preview de Importación
                        </h2>
                      </div>
                      <button
                        onClick={() => setShowPreviewModal(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Body - Estadísticas */}
                    <div className="p-6 space-y-6">
                      {/* Archivo */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{preview.fileName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {((preview.fileSize || 0) / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total de registros</p>
                          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{preview.totalRecords || 0}</p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-700 dark:text-green-300 mb-1">A crear</p>
                          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{preview.toCreate || 0}</p>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">A actualizar</p>
                          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{preview.toUpdate || 0}</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">A omitir</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{preview.toSkip || 0}</p>
                        </div>
                      </div>

                      {/* Teléfonos manuales preservados */}
                      {preview.manualPhonesPreserved > 0 && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="font-semibold text-purple-900 dark:text-purple-100">
                                {preview.manualPhonesPreserved} teléfonos manuales preservados
                              </p>
                              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                Estos teléfonos no se sobrescribirán porque fueron ingresados manualmente
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Distribución por origen de teléfono */}
                      {preview.byPhoneSource && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Clientes existentes por origen de teléfono:
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {preview.byPhoneSource.manual > 0 && (
                              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                                <span className="text-sm text-purple-700 dark:text-purple-300">Manual</span>
                                <span className="font-bold text-purple-900 dark:text-purple-100">{preview.byPhoneSource.manual}</span>
                              </div>
                            )}
                            {preview.byPhoneSource.sylanus > 0 && (
                              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                <span className="text-sm text-blue-700 dark:text-blue-300">Sisa</span>
                                <span className="font-bold text-blue-900 dark:text-blue-100">{preview.byPhoneSource.sylanus}</span>
                              </div>
                            )}
                            {preview.byPhoneSource.file > 0 && (
                              <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/10 rounded-lg">
                                <span className="text-sm text-teal-700 dark:text-teal-300">Archivo</span>
                                <span className="font-bold text-teal-900 dark:text-teal-100">{preview.byPhoneSource.file}</span>
                              </div>
                            )}
                            {preview.byPhoneSource.none > 0 && (
                              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/10 rounded-lg">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Sin teléfono</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">{preview.byPhoneSource.none}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer - Acciones */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <button
                        onClick={() => setShowPreviewModal(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        disabled={uploading}
                        className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Confirmar Importación
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}

            {activeTab === 'view' && (
              <PaginatedClientsView />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
