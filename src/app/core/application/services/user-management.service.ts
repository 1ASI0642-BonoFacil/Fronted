import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserManagementRepositoryPort } from '../../domain/ports/user-management.port';
import { UserResource } from '../../domain/models/user-management.model';

// Token de inyección para el repositorio de gestión de usuarios
export const USER_MANAGEMENT_REPOSITORY_TOKEN = 'UserManagementRepositoryPort';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(
    @Inject(USER_MANAGEMENT_REPOSITORY_TOKEN) private userRepository: UserManagementRepositoryPort
  ) {}

  getAllUsers(): Observable<UserResource[]> {
    return this.userRepository.getAllUsers();
  }

  getUserById(userId: number): Observable<UserResource> {
    return this.userRepository.getUserById(userId);
  }
} 