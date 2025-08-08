'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

interface ModalEnDesarrolloProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export function ModalEnDesarrollo({ open, onOpenChange }: ModalEnDesarrolloProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>Servicio en desarrollo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/logoWater.png"
            alt="Logo"
            width={200}
            height={200}
            className="mx-auto"
          />
          <p className="text-muted-foreground text-sm">
            Este servicio está actualmente en desarrollo. Pronto estará disponible.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
