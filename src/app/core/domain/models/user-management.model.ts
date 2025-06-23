// Modelos para gestión de usuarios y roles
export interface UserResource {
  id: number;
  username: string;
  email?: string;
  roles: RoleResource[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface RoleResource {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

// Modelos para gestión de perfiles
export interface ProfileResource {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: string;
  profileImageUrl?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileResource {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: string;
  profileImageUrl?: string;
}

// Modelos para API general de bonos
export interface BonoGeneralResource {
  id: string;
  nombre: string;
  descripcion: string;
  valorNominal: number;
  tasaCupon: number;
  plazoAnios: number;
  frecuenciaPagos: number;
  fechaEmision: string;
  moneda: string;
  emisor: string;
  estado: 'ACTIVO' | 'VENCIDO' | 'SUSPENDIDO';
  fechaVencimiento: string;
}

export interface CreateBonoGeneralResource {
  nombre: string;
  descripcion: string;
  valorNominal: number;
  tasaCupon: number;
  plazoAnios: number;
  frecuenciaPagos: number;
  fechaEmision: string;
  moneda: string;
  metodoAmortizacion: string;
} 