/**
 ** This file is automatically imported by Jest, and is responsible for
 **  bootstrapping the runtime for every test file.
 */

import { setupForcedMultitenancyOverride } from '@-xun/mongo-schema/multitenant';

// ? jest-extended will always come from @-xun/symbiote (i.e. transitively)
// {@symbiote/notInvalid jest-extended}

// ? https://github.com/jest-community/jest-extended#typescript
import 'jest-extended';
import 'jest-extended/all';

setupForcedMultitenancyOverride('multitenant');
