import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProfileManagementRepositoryPort } from '../../domain/ports/user-management.port';
import { ProfileResource, CreateProfileResource } from '../../domain/models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementApiAdapter implements ProfileManagementRepositoryPort {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllProfiles(): Observable<ProfileResource[]> {
    return this.http.get<ProfileResource[]>(`${this.apiUrl}/api/v1/profiles`);
  }

  createProfile(profile: CreateProfileResource): Observable<ProfileResource> {
    return this.http.post<ProfileResource>(`${this.apiUrl}/api/v1/profiles`, profile);
  }

  getProfileById(profileId: number): Observable<ProfileResource> {
    return this.http.get<ProfileResource>(`${this.apiUrl}/api/v1/profiles/${profileId}`);
  }

  assignProfileToUser(userId: number, profile: CreateProfileResource): Observable<ProfileResource> {
    return this.http.post<ProfileResource>(`${this.apiUrl}/api/v1/profiles/assign/${userId}`, profile);
  }
} 