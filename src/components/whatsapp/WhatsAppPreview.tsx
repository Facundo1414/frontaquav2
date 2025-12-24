'use client'

/**
 * 📱 WhatsAppPreview
 * Componente que simula la vista de un mensaje de WhatsApp
 * para mostrar cómo se verá el mensaje antes de enviarlo
 */

interface WhatsAppPreviewProps {
  message: string
  clientName?: string
  hasAttachment?: boolean
  attachmentType?: 'pdf' | 'image'
  timestamp?: string
}

export function WhatsAppPreview({ 
  message, 
  clientName = 'Juan Pérez',
  hasAttachment = true,
  attachmentType = 'pdf',
  timestamp = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}: WhatsAppPreviewProps) {
  // Reemplazar placeholder con nombre real
  const formattedMessage = message
    .replace(/\{\{1\}\}/g, clientName)
    .replace(/\$\{clientName\}/g, clientName)

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Phone Frame */}
      <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="bg-[#0B141A] rounded-[2rem] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-[#202C33] px-4 py-3 flex items-center gap-3">
            {/* Back arrow */}
            <svg className="w-5 h-5 text-[#AEBAC1]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#6B7C85] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            {/* Contact info */}
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{clientName}</p>
              <p className="text-[#8696A0] text-xs">en línea</p>
            </div>
            {/* Icons */}
            <div className="flex gap-4 text-[#AEBAC1]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
          </div>

          {/* Chat Background */}
          <div 
            className="min-h-[350px] p-3 space-y-2"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%230b141a'/%3E%3Cpath d='M0 0L50 50M50 0L0 50M50 0L100 50M100 0L50 50M50 50L100 100M50 50L0 100M100 50L50 100' stroke='%23202c33' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundColor: "#0B141A",
            }}
          >
            {/* Message Bubble (outgoing) */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-[#005C4B] rounded-lg rounded-tr-none p-2 shadow-md">
                {/* PDF Attachment */}
                {hasAttachment && (
                  <div className="bg-[#025144] rounded-lg p-2 mb-2 flex items-center gap-2">
                    <div className="bg-red-500 rounded p-1.5">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31Z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">Comprobante_2024.pdf</p>
                      <p className="text-[#8696A0] text-[10px]">PDF • 245 KB</p>
                    </div>
                  </div>
                )}
                
                {/* Message Text */}
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {formattedMessage}
                </p>
                
                {/* Timestamp & Status */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-[#8696A0]">{timestamp}</span>
                  {/* Double check (delivered) */}
                  <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 16 15" fill="currentColor">
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="bg-[#202C33] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2 flex items-center">
              <span className="text-[#8696A0] text-sm">Escribe un mensaje</span>
            </div>
            <div className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Label */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Vista previa del mensaje
      </p>
    </div>
  )
}
