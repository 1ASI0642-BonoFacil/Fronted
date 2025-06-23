import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { UserManagementService } from '../../../core/application/services/user-management.service';
import { RoleManagementService } from '../../../core/application/services/role-management.service';
import { ProfileManagementService } from '../../../core/application/services/profile-management.service';
import { BonoGeneralService } from '../../../core/application/services/bono-general.service';
import { 
  UserResource, 
  RoleResource, 
  ProfileResource, 
  BonoGeneralResource 
} from '../../../core/domain/models/user-management.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  users: UserResource[] = [];
  roles: RoleResource[] = [];
  profiles: ProfileResource[] = [];
  bonosGenerales: BonoGeneralResource[] = [];
  
  loading = false;
  error: string | null = null;
  activeTab = 'users';

  constructor(
    private userService: UserManagementService,
    private roleService: RoleManagementService,
    private profileService: ProfileManagementService,
    private bonoGeneralService: BonoGeneralService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;
    this.error = null;

    forkJoin({
      users: this.userService.getAllUsers(),
      roles: this.roleService.getAllRoles(),
      profiles: this.profileService.getAllProfiles(),
      bonos: this.bonoGeneralService.getAllBonos()
    }).subscribe({
      next: (data) => {
        this.users = data.users;
        this.roles = data.roles;
        this.profiles = data.profiles;
        this.bonosGenerales = data.bonos;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los datos de administración';
        this.loading = false;
        console.error('Error loading admin data:', error);
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  searchBonos(searchTerm: string) {
    if (searchTerm.trim()) {
      this.bonoGeneralService.buscarBonosPorNombre(searchTerm).subscribe({
        next: (bonos) => {
          this.bonosGenerales = bonos;
        },
        error: (error) => {
          console.error('Error searching bonos:', error);
        }
      });
    } else {
      this.loadAllData();
    }
  }
} 