'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/axiosInstance';
import { useGlobalContext } from '@/app/providers/context/GlobalContext';
import { Phone, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface UserWhatsAppProfile {
  id: string;
  name: string;
  whatsapp_enabled: boolean;
  asesor_nombre: string | null;
  asesor_telefono: string | null;
  asesor_email: string | null;
}

export function WhatsAppProfileSettings() {
  const { userId } = useGlobalContext();
  const [profile, setProfile] = useState<UserWhatsAppProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    whatsapp_enabled: false,
    asesor_nombre: '',
    asesor_telefono: '',
    asesor_email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile/whatsapp');
      
      if (response.data) {
        setProfile(response.data);
        setFormData({
          whatsapp_enabled: response.data.whatsapp_enabled || false,
          asesor_nombre: response.data.asesor_nombre || '',
          asesor_telefono: response.data.asesor_telefono || '',
          asesor_email: response.data.asesor_email || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Validar formato de teléfono
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (formData.asesor_telefono && !phoneRegex.test(formData.asesor_telefono.replace(/\s/g, ''))) {
        setError('Formato de teléfono inválido. Use formato internacional (+54911...)');
        return;
      }

      await api.put('/users/profile/whatsapp', formData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      await loadProfile();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span>Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-green-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Configuración de WhatsApp
            </h2>
            <p className="text-sm text-gray-600">
              Los clientes finales podrán contactarte directamente por WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Información del sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Configuración de Contacto</p>
              <p className="text-blue-700">
                Configurá tus datos personales para que aparezcan en los PDFs y los clientes puedan contactarte directamente por WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN: DATOS PERSONALES */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            👤 Tus Datos de Contacto
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Estos datos aparecerán en el footer de los PDFs y en el botón "Contactar asesor"
          </p>

          {/* Nombre del asesor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre completo
            </label>
            <input
              type="text"
              value={formData.asesor_nombre}
              onChange={(e) => setFormData({ ...formData, asesor_nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Aparecerá como contacto del asesor en PDFs y botones de WhatsApp
            </p>
          </div>

          {/* Teléfono personal del asesor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu teléfono personal (WhatsApp)
            </label>
            <input
              type="tel"
              value={formData.asesor_telefono}
              onChange={(e) => setFormData({ ...formData, asesor_telefono: e.target.value })}
              placeholder="+54 9 11 9876-5432"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Los clientes te contactarán a este número cuando hagan click en "Contactar asesor"
            </p>
          </div>

          {/* Email del asesor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu email (opcional)
            </label>
            <input
              type="email"
              value={formData.asesor_email}
              onChange={(e) => setFormData({ ...formData, asesor_email: e.target.value })}
              placeholder="juan.perez@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Opcional: aparecerá en el footer de los PDFs
            </p>
          </div>
        </div>

        {/* Habilitar contacto */}
        <div className="flex items-start gap-3 border-t border-gray-200 pt-6">
          <input
            type="checkbox"
            id="whatsapp_enabled"
            checked={formData.whatsapp_enabled}
            onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="whatsapp_enabled" className="text-sm text-gray-700">
            <span className="font-medium">Permitir que los clientes me contacten</span>
            <p className="text-gray-500 mt-1">
              Los comprobantes incluirán tus datos de contacto y un botón "Contactar asesor"
            </p>
          </label>
        </div>

        {/* Vista previa */}
        {formData.whatsapp_enabled && formData.asesor_telefono && formData.asesor_nombre && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-3 font-medium">VISTA PREVIA</p>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-3">
                <strong>¿Tenés consultas?</strong><br />
                {formData.asesor_nombre} está disponible para ayudarte.
              </p>
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm opacity-75 cursor-not-allowed"
              >
                <Phone className="h-4 w-4" />
                Contactar por WhatsApp
              </button>
              {formData.asesor_email && (
                <p className="text-xs text-gray-500 mt-3">
                  📧 Email: {formData.asesor_email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Configuración guardada exitosamente</span>
          </div>
        )}

        {/* Botón guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
