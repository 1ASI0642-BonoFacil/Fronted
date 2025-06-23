import { Provider } from '@angular/core';
import { BonoApiAdapter } from '../../../bonos/infrastructure/adapters/bono.api.adapter';
import { CalculoApiAdapter } from '../../../inversor/infrastructure/adapters/calculo.api.adapter';
import { BONO_REPOSITORY_TOKEN } from '../../../bonos/application/services/bono.service';
import { CALCULO_REPOSITORY_TOKEN } from '../../../inversor/application/services/calculo.service';

export const bonoProviders: Provider[] = [
  {
    provide: BONO_REPOSITORY_TOKEN,
    useClass: BonoApiAdapter
  },
  {
    provide: CALCULO_REPOSITORY_TOKEN,
    useClass: CalculoApiAdapter
  }
]; 