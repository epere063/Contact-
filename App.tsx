import React, { useState, useRef, useMemo } from 'react';
import { Home, MapPin, Phone, Mail, ChevronsUpDown, Calendar, ArrowRight, Layout, MessageSquare, Plus, Clock, Search, UserPlus } from './components/Icons';
import ContactCard from './components/ContactCard';
import NotesSection from './components/NotesSection';
import { MOCK_PROPERTY, MOCK_CONTACTS, MOCK_NOTES, CURRENT_USER } from './constants';
import { Contact, Note, NoteType } from './types';

const App: React.FC = () => {
  const [property] = useState(MOCK_PROPERTY);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [expandAll, setExpandAll] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  // Follow Up Form State
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  // Contact Drag Logic
  const contactDragItem = useRef<number | null>(null);
  const [dragOverContactIndex, setDragOverContactIndex] = useState<number | null>(null);

  const filteredContacts = useMemo(() => {
    if (!contactSearch) return contacts;
    const lower = contactSearch.toLowerCase();
    return contacts.filter(c => 
      c.firstName.toLowerCase().includes(lower) || 
      c.lastName.toLowerCase().includes(lower)
    );
  }, [contacts, contactSearch]);

  const handleContactDragStart = (e: React.DragEvent, index: number) => {
    // Set a specific type for contact dragging
    e.dataTransfer.setData('application/x-contact', 'true');
    e.dataTransfer.effectAllowed = 'move';
    contactDragItem.current = index;
  };

  const handleContactDragOver = (e: React.DragEvent, index: number) => {
    // Only accept drag if it is a contact
    if (!e.dataTransfer.types.includes('application/x-contact')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    if (contactDragItem.current === index) return;
    setDragOverContactIndex(index);
  };

  const handleContactDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Verify type again
    if (!e.dataTransfer.types.includes('application/x-contact')) {
      return;
    }

    const dragIndex = contactDragItem.current;
    
    if (dragIndex === null || dragOverContactIndex === null) {
      setDragOverContactIndex(null);
      return;
    }
    
    const newContacts = [...contacts];
    const draggedItem = newContacts[dragIndex];
    
    newContacts.splice(dragIndex, 1);
    newContacts.splice(dragOverContactIndex, 0, draggedItem);
    
    contactDragItem.current = null;
    setDragOverContactIndex(null);
    setContacts(newContacts);
  };

  const handleContactDragEnd = () => {
    contactDragItem.current = null;
    setDragOverContactIndex(null);
  };

  const handleAddContact = () => {
     const newContact: Contact = {
        id: `ct_${Date.now()}`,
        firstName: 'New',
        lastName: 'Contact',
        age: 0,
        isDeceased: false,
        address: '', // Default empty as requested
        phones: [],
        emails: [],
        relationships: [],
        isExpanded: true
     };
     setContacts(prev => [newContact, ...prev]);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setContacts(prev => prev.filter(c => c.id !== contactId));
    }
  };

  // Sync logic (simulated)
  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  // Note CRUD
  const handleAddNote = (content: string, type: NoteType = 'Note', date?: string) => {
    const newNote: Note = {
      id: `n_${Date.now()}`,
      content,
      type,
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_USER.displayName,
      userId: CURRENT_USER.id,
      followUpDate: date
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const toggleExpandAll = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    setContacts(prev => prev.map(c => ({ ...c, isExpanded: newState })));
  };

  const handleSetFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || !followUpNote.trim()) return;
    
    let finalDateString = followUpDate;
    
    if (followUpTime) {
      // Create a combined ISO string if time is provided
      finalDateString = `${followUpDate}T${followUpTime}:00`;
    } else {
      // If no time is provided, we can either store just the date, or a default time (e.g., 9AM)
      // For consistency with Date objects, let's append a morning default time so it doesn't shift days in local time
      finalDateString = `${followUpDate}T09:00:00`;
    }

    handleAddNote(followUpNote, 'FollowUp', finalDateString);
    setFollowUpNote('');
    setFollowUpDate('');
    setFollowUpTime('');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <Home size={20} />
             </div>
             <div>
               <h1 className="text-lg font-bold text-slate-900 leading-none">ProProspect</h1>
               <span className="text-xs text-slate-500 font-medium">CRM Property Module</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <div className="text-sm font-bold text-slate-800">{CURRENT_USER.displayName}</div>
               <div className="text-xs text-slate-500">{CURRENT_USER.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${CURRENT_USER.displayName}&background=random`} alt="User" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Replacement for Property Header: Follow Up Section & Mini Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Mini Property Context */}
          <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{property.address}</h2>
                <div className="flex items-center gap-2 text-slate-500 mb-4 text-sm">
                    <MapPin size={14} />
                    {property.city}, {property.state} {property.zip}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {property.status}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-2xl font-bold text-slate-700">${property.price.toLocaleString()}</span>
              </div>
          </div>

          {/* Follow Up Action Panel */}
          <div className="md:col-span-2 bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-200 text-white flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-3">
                <Calendar size={20} className="text-indigo-200" />
                <h3 className="font-bold text-lg">Schedule Follow Up</h3>
             </div>
             <form onSubmit={handleSetFollowUp} className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-48">
                   <div>
                     <label className="text-[10px] text-indigo-200 font-medium mb-1 block uppercase">Date</label>
                     <input 
                        type="date" 
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full bg-indigo-700/50 border border-indigo-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder-indigo-300"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] text-indigo-200 font-medium mb-1 block uppercase">Time (Optional)</label>
                     <div className="relative">
                       <input 
                          type="time" 
                          value={followUpTime}
                          onChange={(e) => setFollowUpTime(e.target.value)}
                          className="w-full bg-indigo-700/50 border border-indigo-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder-indigo-300"
                       />
                       <div className="absolute right-3 top-2.5 pointer-events-none text-indigo-300">
                          <Clock size={14} />
                       </div>
                     </div>
                   </div>
                </div>
                <div className="flex-1 flex flex-col">
                   <label className="text-[10px] text-indigo-200 font-medium mb-1 block uppercase">Notes for follow up</label>
                   <textarea 
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      placeholder="e.g. Call back to discuss price reduction..."
                      className="flex-1 w-full bg-indigo-700/50 border border-indigo-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder-indigo-300 resize-none"
                   />
                </div>
                <div className="flex items-end">
                    <button 
                       type="submit" 
                       disabled={!followUpDate || !followUpNote.trim()}
                       className="w-full sm:w-auto px-6 py-4 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-full"
                    >
                       <Plus size={16} /> Set
                    </button>
                </div>
             </form>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left: Contacts (2/3 width) */}
          <div className="xl:col-span-2 space-y-4">
             {/* Section Header with Controls */}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 px-1 gap-4">
                <div className="flex-1">
                   <h3 className="text-lg font-bold text-slate-800">Associated Contacts</h3>
                   <div className="text-xs text-slate-500 mt-0.5">{filteredContacts.length} Records found</div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                   <div className="relative flex-1 sm:flex-initial">
                      <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input 
                         type="text" 
                         value={contactSearch}
                         onChange={(e) => setContactSearch(e.target.value)}
                         placeholder="Search contacts..."
                         className="w-full sm:w-48 pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                   </div>
                   
                   <button 
                     onClick={handleAddContact}
                     className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                     title="Add New Contact"
                   >
                     <UserPlus size={16} />
                   </button>

                   <button 
                     onClick={toggleExpandAll}
                     className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm whitespace-nowrap"
                   >
                      <ChevronsUpDown size={14} />
                      {expandAll ? 'Collapse' : 'Expand'}
                   </button>
                </div>
             </div>
             
             {filteredContacts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                   No contacts found matching "{contactSearch}".
                </div>
             ) : (
                filteredContacts.map((contact, index) => (
                  <div key={contact.id} className="relative transition-all">
                    {/* Visual Drop Line */}
                    {dragOverContactIndex === index && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-black rounded-full z-10 -translate-y-1/2 scale-x-[1.02] shadow-sm" />
                    )}
                    <ContactCard 
                        index={index}
                        contact={contact} 
                        property={property}
                        user={CURRENT_USER}
                        onUpdateContact={handleUpdateContact}
                        onDeleteContact={handleDeleteContact}
                        onDragStart={handleContactDragStart}
                        onDragOver={handleContactDragOver}
                        onDrop={handleContactDrop}
                        onDragEnd={handleContactDragEnd}
                      />
                  </div>
                ))
             )}
          </div>

          {/* Right: Notes (1/3 width) */}
          <div className="xl:col-span-1">
             <div className="xl:sticky xl:top-24 h-[calc(100vh-8rem)]">
                <NotesSection 
                  notes={notes} 
                  currentUser={CURRENT_USER}
                  onAddNote={(content, type) => handleAddNote(content, type)}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;