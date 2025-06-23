import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserManagementRepositoryPort } from '../../domain/ports/user-management.port';
import { UserResource } from '../../domain/models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementApiAdapter implements UserManagementRepositoryPort {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserResource[]> {
    return this.http.get<UserResource[]>(`${this.apiUrl}/api/v1/users`);
  }

  getUserById(userId: number): Observable<UserResource> {
    return this.http.get<UserResource>(`${this.apiUrl}/api/v1/users/${userId}`);
  }
} 