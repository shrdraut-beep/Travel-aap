import { safeStorage } from './storage';
import { MasterContact } from '../types';

const CONTACTS_STORAGE_KEY = 'pw_master_contacts';



export function getMasterContacts(): MasterContact[] {
  try {
    const data = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading master contacts:', e);
  }
  // Fallback to default contacts and save them
  return [];
}

export function saveMasterContacts(contacts: MasterContact[]): void {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error('Error saving master contacts:', e);
  }
}

export function addMasterContact(contact: Omit<MasterContact, 'id'>): MasterContact {
  const contacts = getMasterContacts();
  const newContact: MasterContact = {
    ...contact,
    id: 'mc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
  };
  contacts.push(newContact);
  saveMasterContacts(contacts);
  return newContact;
}

export function updateMasterContact(id: string, updated: Partial<MasterContact>): MasterContact[] {
  const contacts = getMasterContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updated };
    saveMasterContacts(contacts);
  }
  return contacts;
}

export function deleteMasterContact(id: string): MasterContact[] {
  const contacts = getMasterContacts().filter(c => c.id !== id);
  saveMasterContacts(contacts);
  return contacts;
}
