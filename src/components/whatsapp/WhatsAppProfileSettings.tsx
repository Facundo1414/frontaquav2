'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/axiosInstance';
import { useGlobalContext } from '@/app/providers/context/GlobalContext';
import { Phone, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface UserWhatsAppProfile {
  id: string;
  name: string;
  whatsapp_phone: string | null;
  whatsapp_enabled: boolean;
  business_name: string | null;
}

export function WhatsAppProfileSettings() {
  const { userId } = useGlobalContext();
  const [profile, setProfile] = useState<UserWhatsAppProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    whatsapp_phone: '',
    whatsapp_enabled: false,
    business_name: '',
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
          whatsapp_phone: response.data.whatsapp_phone || '',
          whatsapp_enabled: response.data.whatsapp_enabled || false,
          business_name: response.data.business_name || '',
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
      if (formData.whatsapp_phone && !phoneRegex.test(formData.whatsapp_phone.replace(/\s/g, ''))) {
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
              <p className="font-medium mb-1">Sistema de Mensajería Híbrido</p>
              <p className="text-blue-700">
                • Los comprobantes se envían desde un número centralizado del sistema<br />
                • Tus clientes pueden contactarte directamente a tu WhatsApp personal<br />
                • Configurá tu número para que aparezca en los comprobantes
              </p>
            </div>
          </div>
        </div>

        {/* Nombre del negocio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de tu negocio
          </label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            placeholder="Ej: Ferretería López"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Aparecerá en los mensajes que reciban tus clientes
          </p>
        </div>

        {/* Número de WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu número de WhatsApp
          </label>
          <input
            type="tel"
            value={formData.whatsapp_phone}
            onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
            placeholder="+54 9 11 1234-5678"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Formato internacional (incluí código de país y área)
          </p>
        </div>

        {/* Habilitar contacto */}
        <div className="flex items-start gap-3">
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
              Los comprobantes incluirán un botón "Contactar asesor" con tu WhatsApp
            </p>
          </label>
        </div>

        {/* Vista previa */}
        {formData.whatsapp_enabled && formData.whatsapp_phone && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-3 font-medium">VISTA PREVIA</p>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-3">
                <strong>¿Tenés consultas?</strong><br />
                Nuestro asesor <strong>{profile?.name || 'Asesor'}</strong> de <strong>{formData.business_name || 'tu negocio'}</strong> está disponible para ayudarte.
              </p>
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm opacity-75 cursor-not-allowed"
              >
                <Phone className="h-4 w-4" />
                Contactar por WhatsApp
              </button>
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
