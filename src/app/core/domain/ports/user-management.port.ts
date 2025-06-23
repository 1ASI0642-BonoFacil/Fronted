import { Observable } from 'rxjs';
import { 
  UserResource, 
  RoleResource, 
  ProfileResource, 
  CreateProfileResource,
  BonoGeneralResource,
  CreateBonoGeneralResource 
} from '../models/user-management.model';

// Puerto para gestión de usuarios
export interface UserManagementRepositoryPort {
  getAllUsers(): Observable<UserResource[]>;
  getUserById(userId: number): Observable<UserResource>;
}

// Puerto para gestión de roles
export interface RoleManagementRepositoryPort {
  getAllRoles(): Observable<RoleResource[]>;
}

// Puerto para gestión de perfiles
export interface ProfileManagementRepositoryPort {
  getAllProfiles(): Observable<ProfileResource[]>;
  createProfile(profile: CreateProfileResource): Observable<ProfileResource>;
  getProfileById(profileId: number): Observable<ProfileResource>;
  assignProfileToUser(userId: number, profile: CreateProfileResource): Observable<ProfileResource>;
}

// Puerto para API general de bonos
export interface BonoGeneralRepositoryPort {
  getAllBonos(): Observable<BonoGeneralResource[]>;
  createBono(bono: CreateBonoGeneralResource): Observable<BonoGeneralResource>;
  getBonoById(id: string): Observable<BonoGeneralResource>;
  updateBono(id: string, bono: CreateBonoGeneralResource): Observable<BonoGeneralResource>;
  deleteBono(id: string): Observable<void>;
  buscarBonosPorNombre(nombre: string): Observable<BonoGeneralResource[]>;
  getBonosPorMoneda(moneda: string): Observable<BonoGeneralResource[]>;
} 