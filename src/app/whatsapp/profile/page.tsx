'use client';

import { WhatsAppProfileSettings } from '@/components/whatsapp/WhatsAppProfileSettings';
import { WhatsAppSystemBanner } from '@/components/whatsapp/WhatsAppSystemBanner';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WhatsAppProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <WhatsAppSystemBanner />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>

        <WhatsAppProfileSettings />
      </div>
    </div>
  );
}
