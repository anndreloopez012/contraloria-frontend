
import React from 'react';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import SidebarMenu from './SidebarMenu';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente SidebarDrawer
 * 
 * Drawer que contiene el menú lateral para dispositivos móviles y tablets.
 * Se abre desde la parte inferior de la pantalla.
 */
const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Servicios a usuarios
            </DrawerTitle>
            <DrawerClose asChild>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100/50 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto">
          <SidebarMenu />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SidebarDrawer;
