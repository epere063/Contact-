export type PhoneStatus = 'UNKNOWN' | 'CORRECT' | 'WRONG' | 'DISCONNECTED' | 'DNC' | 'ATTEMPTED';

export type PhoneType = 'Mobile' | 'Landline' | 'Voip' | 'Other';

export interface PhoneData {
  id: string;
  number: string;
  type: PhoneType;
  status: PhoneStatus;
  statusChangedDate: string | null; // ISO Date string
}

export interface EmailData {
  id: string;
  email: string;
}

export type ContactRelationship = 'Owner' | 'Heir' | 'Petitioner' | 'Personal Representative' | 'Tax Payer' | 'Relative';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  isDeceased: boolean;
  address: string;
  phones: PhoneData[]; // Up to 10
  emails: EmailData[]; // Up to 5
  relationships: ContactRelationship[];
  isExpanded?: boolean; // UI State
}

export type NoteType = 'Note' | 'FollowUp' | 'Call' | 'SMS' | 'Email' | 'AiSent' | 'Lead' | 'Offer';

export interface Note {
  id: string;
  content: string;
  type: NoteType;
  createdAt: string; // ISO Date string
  createdBy: string; // User Display Name
  userId: string;
  followUpDate?: string; // ISO Date string for scheduled follow ups
  metadata?: any; // For storing specific fields like offer amount, etc.
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: 'Active' | 'Pending' | 'Sold' | 'Off Market';
  price: number;
  imageUrl: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
}