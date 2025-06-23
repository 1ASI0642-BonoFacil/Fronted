// Modelo de dominio User - Entidad principal del contexto IAM
export interface User {
  id: number;
  username: string;
  token?: string;
  roles: (Role | string)[];  // Puede ser objetos Role o strings directamente
}

export interface Role {
  id: number;
  name: RoleName;
}

export enum RoleName {
  EMISOR = 'ROLE_EMISOR',
  INVERSOR = 'ROLE_INVERSOR',
  ADMIN = 'ROLE_ADMIN'
}

// Value Objects
export interface Credentials {
  username: string;
  password: string;
}

export interface SignUpData extends Credentials {
  roles: string[];
}

export interface AuthToken {
  token: string;
  expiresIn: number;
} 