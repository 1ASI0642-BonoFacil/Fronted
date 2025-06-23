import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleManagementRepositoryPort } from '../../domain/ports/user-management.port';
import { RoleResource } from '../../domain/models/user-management.model';

// Token de inyección para el repositorio de gestión de roles
export const ROLE_MANAGEMENT_REPOSITORY_TOKEN = 'RoleManagementRepositoryPort';

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  constructor(
    @Inject(ROLE_MANAGEMENT_REPOSITORY_TOKEN) private roleRepository: RoleManagementRepositoryPort
  ) {}

  getAllRoles(): Observable<RoleResource[]> {
    return this.roleRepository.getAllRoles();
  }
} 