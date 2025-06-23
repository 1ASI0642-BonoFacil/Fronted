import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RoleManagementRepositoryPort } from '../../domain/ports/user-management.port';
import { RoleResource } from '../../domain/models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class RoleManagementApiAdapter implements RoleManagementRepositoryPort {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<RoleResource[]> {
    return this.http.get<RoleResource[]>(`${this.apiUrl}/api/v1/roles`);
  }
} 