import React, { useState, useMemo } from 'react';
import { Note, User, NoteType } from '../types';
import { 
  Edit2, Trash2, Maximize2, XCircle, 
  MessageCircle, Mail, Phone, Bot, DollarSign, UserPlus, Filter, X, Plus, Calendar, History
} from './Icons';
import { formatTimeAgo, formatDate } from '../utils';

interface NotesSectionProps {
  notes: Note[];
  currentUser: User;
  onAddNote: (content: string, type: NoteType) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const ACTIVITY_FILTERS: { type: NoteType | 'All', label: string, color: string, icon?: React.ElementType }[] = [
  { type: 'All', label: 'All', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { type: 'SMS', label: 'SMS', color: 'bg-blue-600 text-white border-blue-600', icon: MessageCircle },
  { type: 'Email', label: 'Email', color: 'bg-emerald-500 text-white border-emerald-500', icon: Mail },
  { type: 'Call', label: 'Calls', color: 'bg-teal-500 text-white border-teal-500', icon: Phone },
  { type: 'AiSent', label: 'AI Sent', color: 'bg-cyan-500 text-white border-cyan-500', icon: Bot },
  { type: 'FollowUp', label: 'Follow Ups', color: 'bg-orange-500 text-white border-orange-500', icon: Calendar },
  { type: 'Note', label: 'Notes', color: 'bg-indigo-500 text-white border-indigo-500', icon: Edit2 },
  { type: 'Lead', label: 'Leads', color: 'bg-orange-600 text-white border-orange-600', icon: UserPlus },
  { type: 'Offer', label: 'Offers', color: 'bg-green-600 text-white border-green-600', icon: DollarSign },
];

const NotesSection: React.FC<NotesSectionProps> = ({ 
  notes, 
  currentUser, 
  onAddNote,
  onUpdateNote,
  onDeleteNote 
}) => {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NoteType | 'All'>('All');

  const filteredNotes = useMemo(() => {
    if (activeFilter === 'All') return notes;
    return notes.filter(n => n.type === activeFilter);
  }, [notes, activeFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    // Default to Note type
    onAddNote(newNote, 'Note');
    setNewNote('');
    
    // Reset filter to see the new note if needed
    if (activeFilter !== 'All' && activeFilter !== 'Note') {
        setActiveFilter('All');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingId) {
      const noteToUpdate = notes.find(n => n.id === editingId);
      if (noteToUpdate) {
        onUpdateNote({ ...noteToUpdate, content: editContent });
      }
      setEditingId(null);
      setEditContent('');
    }
  };

  const getIconForType = (type: NoteType) => {
    switch (type) {
      case 'SMS': return <MessageCircle size={14} />;
      case 'Email': return <Mail size={14} />;
      case 'Call': return <Phone size={14} />;
      case 'AiSent': return <Bot size={14} />;
      case 'FollowUp': return <Calendar size={14} />;
      case 'Lead': return <UserPlus size={14} />;
      case 'Offer': return <DollarSign size={14} />;
      default: return null;
    }
  };

  const getTypeColor = (type: NoteType) => {
    const filter = ACTIVITY_FILTERS.find(f => f.type === type);
    return filter ? filter.color.split(' ')[0] : 'bg-slate-400';
  };

  const containerClasses = isMaximized 
    ? "fixed inset-4 z-[1000] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200" 
    : "bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative transition-all";

  return (
    <>
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[999] backdrop-blur-sm" 
          onClick={() => setIsMaximized(false)} 
        />
      )}
      <div className={containerClasses}>
        
        {/* Header Section */}
        <div className="flex flex-col border-b border-slate-100 bg-slate-50">
          
          {/* Top Row: Title & Window Controls */}
          <div className="p-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History size={18} className="text-slate-500" />
              Activity & Follow Up
            </h3>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className={`p-2 rounded-lg transition-colors ${isMaximized ? 'bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600' : 'hover:bg-slate-200 text-slate-500'}`}
                title={isMaximized ? "Close Expanded View" : "Maximize View"}
              >
                {isMaximized ? <X size={20} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Filter Bar (Visible Only When Maximized) */}
          {isMaximized && (
             <div className="px-4 pb-4 flex flex-wrap gap-2 items-center overflow-x-auto custom-scrollbar">
                {ACTIVITY_FILTERS.map((filter) => (
                  <button
                    key={filter.type}
                    onClick={() => setActiveFilter(filter.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                      activeFilter === filter.type 
                        ? filter.color 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {filter.icon && <filter.icon size={12} />}
                    {filter.label}
                    {filter.type !== 'All' && (
                       <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20`}>
                         {notes.filter(n => n.type === filter.type).length}
                       </span>
                    )}
                  </button>
                ))}
                
                {activeFilter !== 'All' && (
                  <button 
                    onClick={() => setActiveFilter('All')}
                    className="ml-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <XCircle size={14} /> Clear Filter
                  </button>
                )}
             </div>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 max-h-[600px] bg-slate-50/30">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
               <Filter size={24} className="opacity-20" />
               <div className="text-sm">No activity found for this filter.</div>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="flex gap-3 group">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${getTypeColor(note.type)}`}>
                      {getIconForType(note.type) || note.createdBy.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-slate-100 shadow-sm relative">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{note.createdBy}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${getTypeColor(note.type)} bg-opacity-10 text-opacity-90`}>
                           {note.type}
                        </span>
                      </div>
                      
                      {note.type === 'FollowUp' && note.followUpDate && (
                         <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            Follow Up: {formatDate(note.followUpDate)}
                         </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium" title={note.createdAt}>
                        {formatTimeAgo(note.createdAt)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                         <button onClick={() => startEdit(note)} className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
                         <button onClick={() => onDeleteNote(note.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                  
                  {editingId === note.id ? (
                    <div className="mt-2">
                       <textarea 
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-sm border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500"
                          rows={2}
                       />
                       <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
                          <button onClick={saveEdit} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Save</button>
                       </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 pr-12 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20"
            />
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="absolute bottom-3 right-3 p-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NotesSection;