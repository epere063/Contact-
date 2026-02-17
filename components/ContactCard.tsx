import React, { useRef, useState, useEffect } from 'react';
import { Contact, PhoneData, EmailData, Property, User, ContactRelationship } from '../types';
import PhoneRow from './PhoneRow';
import { MapPin, Mail, AlertTriangle, ChevronDown, ChevronUp, GripVertical, Clock, Plus, Trash2, Edit2, XCircle, Save, CheckCircle2 } from './Icons';
import { formatDate } from '../utils';

interface ContactCardProps {
  contact: Contact;
  property: Property;
  user: User;
  index: number; 
  onUpdateContact: (updatedContact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  // Parent level drag handlers
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const RELATIONSHIP_TAGS: ContactRelationship[] = [
  'Owner', 
  'Heir', 
  'Petitioner', 
  'Personal Representative', 
  'Tax Payer', 
  'Relative'
];

const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  property, 
  user, 
  index, 
  onUpdateContact,
  onDeleteContact,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<Contact>(contact);

  // Email Selection State for Bulk Delete
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());

  const phoneDragItem = useRef<number | null>(null);
  const [dragOverPhoneIndex, setDragOverPhoneIndex] = useState<number | null>(null);
  
  const emailDragItem = useRef<number | null>(null);
  const [dragOverEmailIndex, setDragOverEmailIndex] = useState<number | null>(null);

  // Reset local state when prop changes, unless we are editing
  useEffect(() => {
    if (!isEditing) {
      setEditState(contact);
    }
  }, [contact, isEditing]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Data Cleanup & Validation
    const validPhones = editState.phones.filter(p => p.number && p.number.trim().length > 0);
    const validEmails = editState.emails.filter(e => e.email && e.email.trim().length > 0);
    const validAge = Math.max(0, editState.age);

    const cleanedContact = {
      ...editState,
      phones: validPhones,
      emails: validEmails,
      age: validAge
    };

    onUpdateContact(cleanedContact);
    setIsEditing(false);
    setSelectedEmailIds(new Set());
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditState(contact);
    setIsEditing(false);
    setSelectedEmailIds(new Set());
  };

  const handleDeleteContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteContact(contact.id);
  };

  // --- Relationship Tag Handlers ---
  const toggleRelationship = (tag: ContactRelationship) => {
    const current = editState.relationships || [];
    let newRelationships;
    if (current.includes(tag)) {
      newRelationships = current.filter(r => r !== tag);
    } else {
      newRelationships = [...current, tag];
    }
    setEditState({ ...editState, relationships: newRelationships });
  };

  // --- Phone Handlers ---
  const handlePhoneUpdate = (idx: number, updatedPhone: PhoneData) => {
    const newPhones = [...editState.phones];
    newPhones[idx] = updatedPhone;
    setEditState({ ...editState, phones: newPhones });
  };

  const handlePhoneDelete = (idx: number) => {
    const newPhones = [...editState.phones];
    newPhones.splice(idx, 1);
    setEditState({ ...editState, phones: newPhones });
  };

  const handleAddPhone = () => {
    const newPhone: PhoneData = {
        id: `ph_${Date.now()}_${Math.random()}`,
        number: '',
        type: 'Mobile',
        status: 'UNKNOWN',
        statusChangedDate: null
    };
    setEditState({ ...editState, phones: [...editState.phones, newPhone] });
  };

  // --- Email Handlers ---
  const handleEmailUpdate = (idx: number, updatedEmail: EmailData) => {
    const newEmails = [...editState.emails];
    newEmails[idx] = updatedEmail;
    setEditState({ ...editState, emails: newEmails });
  };

  const toggleEmailSelection = (id: string) => {
    const newSet = new Set(selectedEmailIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEmailIds(newSet);
  };

  const deleteSelectedEmails = () => {
    if (selectedEmailIds.size === 0) return;
    const newEmails = editState.emails.filter(e => !selectedEmailIds.has(e.id));
    setEditState({ ...editState, emails: newEmails });
    setSelectedEmailIds(new Set());
  };

  const handleAddEmail = () => {
      const newEmail: EmailData = {
          id: `em_${Date.now()}_${Math.random()}`,
          email: ''
      };
      setEditState({ ...editState, emails: [...editState.emails, newEmail] });
  };

  // --- Drag Handlers (Phone - View Mode Only) ---
  const handlePhoneDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation(); 
    e.dataTransfer.setData('application/x-phone', 'true');
    e.dataTransfer.effectAllowed = 'move';
    phoneDragItem.current = idx;
  };

  const handlePhoneDragOver = (e: React.DragEvent, idx: number) => {
    // Isolate: Only allow phone dragging
    if (!e.dataTransfer.types.includes('application/x-phone')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (phoneDragItem.current === idx) return;
    setDragOverPhoneIndex(idx);
  };

  const handlePhoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Isolate: Verify it is a phone
    if (!e.dataTransfer.types.includes('application/x-phone')) {
      return;
    }

    if (phoneDragItem.current === null || dragOverPhoneIndex === null) {
      setDragOverPhoneIndex(null);
      return;
    }
    
    // We modify 'contact' directly since drag is in View Mode
    const newPhones = [...contact.phones];
    const draggedItemContent = newPhones[phoneDragItem.current];
    
    newPhones.splice(phoneDragItem.current, 1);
    newPhones.splice(dragOverPhoneIndex, 0, draggedItemContent);
    
    phoneDragItem.current = null;
    setDragOverPhoneIndex(null);
    
    onUpdateContact({ ...contact, phones: newPhones });
  };

  const handlePhoneDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    phoneDragItem.current = null;
    setDragOverPhoneIndex(null);
  };

  // --- Drag Handlers (Email - View Mode Only) ---
  const handleEmailDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/x-email', 'true');
    e.dataTransfer.effectAllowed = 'move';
    emailDragItem.current = idx;
  };

  const handleEmailDragOver = (e: React.DragEvent, idx: number) => {
    // Isolate: Only allow email dragging
    if (!e.dataTransfer.types.includes('application/x-email')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (emailDragItem.current === idx) return;
    setDragOverEmailIndex(idx);
  };

  const handleEmailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Isolate: Verify it is an email
    if (!e.dataTransfer.types.includes('application/x-email')) {
      return;
    }

    if (emailDragItem.current === null || dragOverEmailIndex === null) {
      setDragOverEmailIndex(null);
      return;
    }

    const newEmails = [...contact.emails];
    const draggedItemContent = newEmails[emailDragItem.current];

    newEmails.splice(emailDragItem.current, 1);
    newEmails.splice(dragOverEmailIndex, 0, draggedItemContent);

    emailDragItem.current = null;
    setDragOverEmailIndex(null);

    onUpdateContact({ ...contact, emails: newEmails });
  };

  const handleEmailDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    emailDragItem.current = null;
    setDragOverEmailIndex(null);
  };

  const toggleExpand = () => {
    if (!isEditing) {
        onUpdateContact({ ...contact, isExpanded: !contact.isExpanded });
    }
  };

  // Stats Logic
  const activePhones = contact.phones.filter(p => p.number.trim().length > 0).length;
  const unattemptedPhones = contact.phones.filter(p => p.number.trim().length > 0 && p.status === 'UNKNOWN').length;
  const activeEmails = contact.emails.filter(e => e.email.trim().length > 0).length;

  const getLastAttempted = () => {
    const dates = contact.phones
      .filter(p => p.statusChangedDate)
      .map(p => new Date(p.statusChangedDate!).getTime());
    
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates));
  };

  const lastAttemptedDate = getLastAttempted();
  const displayContact = isEditing ? editState : contact;

  return (
    <div 
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, index)}
      onDragOver={(e) => !isEditing && onDragOver(e, index)}
      onDrop={(e) => !isEditing && onDrop(e, index)}
      onDragEnd={!isEditing ? onDragEnd : undefined}
      className={`bg-white rounded-xl shadow-sm border overflow-hidden mb-4 transition-all duration-300 ${isEditing ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-slate-200'}`}
    >
      {/* Header */}
      <div 
        onClick={toggleExpand}
        className={`p-4 border-b border-slate-100 bg-white transition-colors flex justify-between items-center group ${!isEditing && 'cursor-pointer hover:bg-slate-50'}`}
      >
        <div className="flex gap-4 items-center flex-1 min-w-0">
          {/* Drag Handle (View Mode Only) */}
          {!isEditing && (
             <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <GripVertical size={18} />
             </div>
          )}

          {/* Avatar REMOVED as requested */}
          
          <div className="flex-1 min-w-0" onClick={(e) => isEditing && e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isEditing ? (
                <>
                  <input 
                    type="text"
                    value={editState.firstName}
                    onChange={(e) => setEditState({...editState, firstName: e.target.value})}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 w-32"
                    placeholder="First Name"
                  />
                  <input 
                    type="text"
                    value={editState.lastName}
                    onChange={(e) => setEditState({...editState, lastName: e.target.value})}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 w-32"
                    placeholder="Last Name"
                  />
                </>
              ) : (
                <h3 className="text-lg font-bold text-slate-800 truncate">
                  {contact.firstName} {contact.lastName}
                </h3>
              )}
              
              {/* Deceased Status Badge */}
              {displayContact.isDeceased && (
                <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                  <AlertTriangle size={10} /> Deceased
                </span>
              )}

              {/* Relationship Tags (View Mode) */}
              {!isEditing && displayContact.relationships && displayContact.relationships.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {displayContact.relationships.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Stats Summary (View Mode Only) */}
            {!isEditing && (
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700 whitespace-nowrap">
                  {activePhones} Phone{activePhones !== 1 && 's'}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className={`font-medium whitespace-nowrap ${unattemptedPhones > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                  {unattemptedPhones} Unattempted
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                <span className="hidden sm:flex items-center gap-1">
                  {activeEmails} Email{activeEmails !== 1 && 's'}
                </span>
                
                {lastAttemptedDate && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block"></span>
                    <span className="hidden sm:flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                       <Clock size={10} />
                       Last Attempt: {formatDate(lastAttemptedDate.toISOString())}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {isEditing ? (
             <>
               <button 
                  onClick={handleDeleteContact}
                  className="mr-2 text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete Contact"
                >
                  <Trash2 size={18} />
               </button>
               <button 
                  onClick={handleCancel}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <XCircle size={20} />
               </button>
               <button 
                  onClick={handleSave}
                  className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  title="Save Changes"
                >
                  <CheckCircle2 size={20} />
               </button>
             </>
           ) : (
             <>
               <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); onUpdateContact({...contact, isExpanded: true}); }}
                  className="text-slate-300 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                  title="Edit Contact"
                >
                  <Edit2 size={16} />
               </button>
               <div className="text-slate-400 px-2">
                  {contact.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
               </div>
             </>
           )}
        </div>
      </div>

      {/* Expanded Content */}
      {(contact.isExpanded || isEditing) && (
        <div className={`p-4 ${isEditing ? 'bg-white' : 'bg-slate-50/50'}`}>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left: Phones (2/3 width) */}
             <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-3 px-1 border-b border-slate-200 pb-2 h-10">
                   <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Numbers</h4>
                        {!isEditing && <span className="text-[10px] text-slate-400 italic font-normal">Drag to reorder</span>}
                        {isEditing && <span className="text-[10px] text-indigo-500 italic font-normal">Edit Mode</span>}
                   </div>
                   
                   {isEditing && (
                     <button 
                       onClick={handleAddPhone}
                       className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1 rounded transition-colors flex items-center gap-1 text-xs font-bold"
                     >
                         <Plus size={14} /> Add Phone
                     </button>
                   )}
                </div>
                
                <div className="space-y-1">
                  {displayContact.phones.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs italic">No phones added.</div>
                  )}
                  {displayContact.phones.map((phone, idx) => (
                    <div key={phone.id} className="relative">
                        {dragOverPhoneIndex === idx && (
                           <div className="absolute top-0 left-0 right-0 h-1 bg-black rounded-full z-10 -translate-y-1/2 scale-x-[1.02] shadow-sm" />
                        )}
                        <PhoneRow 
                          phone={phone}
                          index={idx}
                          isEditing={isEditing}
                          onUpdate={(p) => isEditing ? handlePhoneUpdate(idx, p) : onUpdateContact({ ...contact, phones: contact.phones.map((ph, i) => i === idx ? p : ph) })}
                          onDelete={() => handlePhoneDelete(idx)}
                          onDragStart={handlePhoneDragStart}
                          onDragOver={handlePhoneDragOver}
                          onDrop={handlePhoneDrop}
                          onDragEnd={handlePhoneDragEnd}
                        />
                    </div>
                  ))}
                </div>
             </div>

             {/* Right: Emails & Details (1/3 width) */}
             <div className="lg:col-span-1">
                <div className="flex justify-between items-center mb-3 px-1 border-b border-slate-200 pb-2 h-10">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emails</h4>
                   {!isEditing && <span className="text-[10px] text-slate-400 italic font-normal">Drag to reorder</span>}
                   {isEditing && (
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={deleteSelectedEmails}
                          disabled={selectedEmailIds.size === 0}
                          className={`p-1 rounded transition-colors ${selectedEmailIds.size > 0 ? 'text-red-500 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed'}`}
                          title="Delete Selected Emails"
                        >
                           <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={handleAddEmail}
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1 rounded transition-colors"
                          title="Add Email"
                        >
                            <Plus size={16} />
                        </button>
                     </div>
                   )}
                </div>

                <div className="space-y-2 mb-6">
                  {displayContact.emails.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs italic">No emails added.</div>
                  )}
                  {displayContact.emails.map((email, idx) => (
                    <div key={email.id} className="relative">
                        {dragOverEmailIndex === idx && (
                           <div className="absolute top-0 left-0 right-0 h-1 bg-black rounded-full z-10 -translate-y-1/2 scale-x-[1.02] shadow-sm" />
                        )}
                        <div 
                          draggable={!isEditing}
                          onDragStart={(e) => !isEditing && handleEmailDragStart(e, idx)}
                          onDragOver={(e) => !isEditing && handleEmailDragOver(e, idx)}
                          onDrop={(e) => !isEditing && handleEmailDrop(e)}
                          onDragEnd={!isEditing ? handleEmailDragEnd : undefined}
                          className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white hover:border-slate-300 transition-colors group/email"
                        >
                          {/* Left Icon: Drag Handle or Checkbox */}
                          {!isEditing ? (
                             <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 flex-shrink-0">
                               <GripVertical size={14} />
                             </div>
                          ) : (
                             <div className="flex-shrink-0">
                                <input 
                                  type="checkbox"
                                  checked={selectedEmailIds.has(email.id)}
                                  onChange={() => toggleEmailSelection(email.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                             </div>
                          )}

                          {!isEditing && <div className="text-slate-400"><Mail size={14} /></div>}
                          
                          <div className="flex-1">
                             {isEditing ? (
                               <input 
                                 type="email"
                                 value={email.email}
                                 onChange={(e) => handleEmailUpdate(idx, { ...email, email: e.target.value })}
                                 placeholder="Email Address"
                                 className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
                               />
                             ) : (
                               <div className="text-sm text-slate-700">{email.email || 'No email'}</div>
                             )}
                          </div>
                        </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200">
                   <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                          <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                          {isEditing ? (
                             <input 
                               type="text"
                               value={editState.address}
                               onChange={(e) => setEditState({...editState, address: e.target.value})}
                               placeholder="Address"
                               className="bg-white border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 focus:ring-1 focus:ring-indigo-500 w-full"
                             />
                          ) : (
                             <span>{contact.address || 'No address'}</span>
                          )}
                      </div>
                   </div>
                   <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="font-medium text-slate-400 flex items-center gap-2">
                         Age: 
                         {isEditing ? (
                           <input 
                              type="number"
                              min="0"
                              value={editState.age}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setEditState({...editState, age: isNaN(val) ? 0 : Math.max(0, val)})
                              }}
                              placeholder="0"
                              className="bg-white border border-slate-200 rounded px-2 py-1 text-sm text-slate-600 focus:ring-1 focus:ring-indigo-500 w-16"
                            />
                         ) : (
                            <span>{contact.age}</span>
                         )}
                      </div>
                   </div>
                   
                   {isEditing && (
                     <>
                        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-slate-100/50 border border-slate-200">
                            <span className="text-xs font-medium text-slate-500">Status</span>
                            <button 
                            onClick={() => setEditState({...editState, isDeceased: !editState.isDeceased})}
                            className={`text-xs px-2 py-1 rounded border transition-colors ${editState.isDeceased ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'}`}
                            >
                                {editState.isDeceased ? 'Unmark Deceased' : 'Mark Deceased'}
                            </button>
                        </div>
                        
                        <div className="mt-4">
                           <span className="text-xs font-medium text-slate-500 block mb-2">Relationship to Property</span>
                           <div className="flex flex-wrap gap-1.5">
                              {RELATIONSHIP_TAGS.map(tag => {
                                 const isSelected = editState.relationships?.includes(tag);
                                 return (
                                   <button
                                     key={tag}
                                     onClick={() => toggleRelationship(tag)}
                                     className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
                                       isSelected 
                                         ? 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold' 
                                         : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                     }`}
                                   >
                                     {tag}
                                   </button>
                                 );
                              })}
                           </div>
                        </div>
                     </>
                   )}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ContactCard;