import { Provider } from '@angular/core';
import { UserManagementApiAdapter } from '../adapters/user-management.api.adapter';
import { RoleManagementApiAdapter } from '../adapters/role-management.api.adapter';
import { ProfileManagementApiAdapter } from '../adapters/profile-management.api.adapter';
import { BonoGeneralApiAdapter } from '../adapters/bono-general.api.adapter';
import { USER_MANAGEMENT_REPOSITORY_TOKEN } from '../../application/services/user-management.service';
import { ROLE_MANAGEMENT_REPOSITORY_TOKEN } from '../../application/services/role-management.service';
import { PROFILE_MANAGEMENT_REPOSITORY_TOKEN } from '../../application/services/profile-management.service';
import { BONO_GENERAL_REPOSITORY_TOKEN } from '../../application/services/bono-general.service';

export const managementProviders: Provider[] = [
  {
    provide: USER_MANAGEMENT_REPOSITORY_TOKEN,
    useClass: UserManagementApiAdapter
  },
  {
    provide: ROLE_MANAGEMENT_REPOSITORY_TOKEN,
    useClass: RoleManagementApiAdapter
  },
  {
    provide: PROFILE_MANAGEMENT_REPOSITORY_TOKEN,
    useClass: ProfileManagementApiAdapter
  },
  {
    provide: BONO_GENERAL_REPOSITORY_TOKEN,
    useClass: BonoGeneralApiAdapter
  }
]; 