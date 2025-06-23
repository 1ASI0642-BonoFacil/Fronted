// Modelo de dominio User - Entidad principal del contexto IAM
export interface User {
  id: number;
  username: string;
  token?: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: RoleName;
}

export enum RoleName {
  EMISOR = 'ROLE_EMISOR',
  INVERSIONISTA = 'ROLE_INVERSIONISTA',
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