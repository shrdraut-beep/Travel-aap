import React from 'react';
import { 
  PassengerDetailsWizard, 
  PassengerFormData, 
  ContactFormData, 
  PassengerDetailsWizardProps 
} from './PassengerDetailsWizard';

export type { PassengerFormData, ContactFormData };
export { PassengerDetailsWizard };
export const BillingForm: React.FC<PassengerDetailsWizardProps> = (props) => {
  return <PassengerDetailsWizard {...props} />;
};

export default BillingForm;
