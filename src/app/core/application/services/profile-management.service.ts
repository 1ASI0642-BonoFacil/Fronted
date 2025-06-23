import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileManagementRepositoryPort } from '../../domain/ports/user-management.port';
import { ProfileResource, CreateProfileResource } from '../../domain/models/user-management.model';

// Token de inyección para el repositorio de gestión de perfiles
export const PROFILE_MANAGEMENT_REPOSITORY_TOKEN = 'ProfileManagementRepositoryPort';

@Injectable({
  providedIn: 'root'
})
export class ProfileManagementService {
  constructor(
    @Inject(PROFILE_MANAGEMENT_REPOSITORY_TOKEN) private profileRepository: ProfileManagementRepositoryPort
  ) {}

  getAllProfiles(): Observable<ProfileResource[]> {
    return this.profileRepository.getAllProfiles();
  }

  createProfile(profile: CreateProfileResource): Observable<ProfileResource> {
    return this.profileRepository.createProfile(profile);
  }

  getProfileById(profileId: number): Observable<ProfileResource> {
    return this.profileRepository.getProfileById(profileId);
  }

  assignProfileToUser(userId: number, profile: CreateProfileResource): Observable<ProfileResource> {
    return this.profileRepository.assignProfileToUser(userId, profile);
  }
} 