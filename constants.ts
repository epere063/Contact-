import { Contact, Note, Property, User } from './types';

export const CURRENT_USER: User = {
  id: 'usr_123',
  displayName: 'Alex Sales',
  email: 'alex@proprospect.com'
};

export const MOCK_PROPERTY: Property = {
  id: 'prop_987',
  address: '123 Maplewood Avenue',
  city: 'Springfield',
  state: 'IL',
  zip: '62704',
  status: 'Active',
  price: 450000,
  imageUrl: 'https://picsum.photos/800/400'
};

// Removed helper functions for padding arrays as we now want dynamic lists

const initialPhones = [
  { id: 'p1', number: '(555) 123-4567', type: 'Mobile' as const, status: 'UNKNOWN' as const, statusChangedDate: null },
  { id: 'p2', number: '(555) 987-6543', type: 'Landline' as const, status: 'UNKNOWN' as const, statusChangedDate: null },
];

const initialEmails = [
  { id: 'e1', email: 'john.doe@example.com' },
  { id: 'e2', email: 'j.doe@workplace.com' },
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'ct_1',
    firstName: 'John',
    lastName: 'Doe',
    age: 45,
    isDeceased: false,
    address: '123 Maplewood Avenue, Springfield, IL 62704',
    phones: initialPhones,
    emails: initialEmails,
    relationships: ['Owner', 'Heir'],
    isExpanded: true
  },
  {
    id: 'ct_2',
    firstName: 'Jane',
    lastName: 'Doe',
    age: 42,
    isDeceased: false,
    address: '123 Maplewood Avenue, Springfield, IL 62704',
    phones: [],
    emails: [],
    relationships: ['Relative'],
    isExpanded: false
  }
];

export const MOCK_NOTES: Note[] = [
  {
    id: 'n_1',
    content: 'Initial prospecting call. No answer, left voicemail.',
    type: 'Call',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    createdBy: 'Sarah Manager',
    userId: 'usr_456'
  },
  {
    id: 'n_2',
    content: 'Sent follow-up email regarding property valuation.',
    type: 'Email',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdBy: 'Alex Sales',
    userId: 'usr_123'
  },
  {
    id: 'n_3',
    content: 'Follow up about the price reduction.',
    type: 'FollowUp',
    createdAt: new Date().toISOString(),
    createdBy: 'Alex Sales',
    userId: 'usr_123',
    followUpDate: new Date(Date.now() + 86400000).toISOString()
  },
  {
    id: 'n_4',
    content: 'Client interested in viewing next Tuesday.',
    type: 'SMS',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    createdBy: 'Alex Sales',
    userId: 'usr_123'
  },
  {
    id: 'n_5',
    content: 'Offer received: $440,000 cash.',
    type: 'Offer',
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    userId: 'sys_1'
  }
];