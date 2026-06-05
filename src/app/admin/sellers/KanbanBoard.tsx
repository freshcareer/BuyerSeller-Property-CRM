import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Seller, SettingOption } from './types';
import {  MapPin, Building, DollarSign, GitCompare, Pencil, Trash2, Check, Loader2, X, MessageCircle  } from 'lucide-react';
import ImageSlider from '@/app/components/ImageSlider';

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const buildWaLink = (phone: string, message: string) =>
  `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`;

const DEFAULT_SELLER_MSG = (s: any) =>
  `Hello ${s.name}, this is PropConnect, Ahmedabad's premium property matchmakers. 🏢\n\nWe have highly verified buyers actively looking for a ${s.property_type.replace(/_/g, ' ')} property in ${s.area}.\n\nCould we arrange a quick call or visit to close a deal for you? Zero registration fees.\n\n- Team PropConnect`;

interface KanbanProps {
  sellers: any[];
  statuses: SettingOption[];
  onStatusChange: (id: string, newStatus: string) => void;
  onEdit: (seller: any) => void;
  onMatch: (seller: any) => void;
  onDeleteConfirm: (id: string) => void;
  deleteConfirmId: string | null;
  deletingId: string | null;
  onDelete: (id: string) => void;
  actionStatus: { id: string; status: 'success' | 'error' | null };
}

export default function KanbanBoard({
  sellers, statuses, onStatusChange, onEdit, onMatch,
  onDeleteConfirm, deleteConfirmId, deletingId, onDelete, actionStatus
}: KanbanProps) {
  // We need to group sellers by status
  const columns = statuses.map(s => ({
    ...s,
    items: sellers.filter(seller => seller.status === s.value)
  }));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Call the parent state update
    onStatusChange(draggableId, destination.droppableId);
  };

  // Enable rendering only on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[60vh] scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
        {columns.map(col => (
          <div key={col.value} className="bg-slate-50 border border-slate-200 rounded-xl flex-shrink-0 w-80 flex flex-col max-h-[80vh]">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-extrabold text-sm text-slate-800">{col.display_name}</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{col.items.length}</span>
            </div>
            
            <Droppable droppableId={col.value}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`flex-1 p-3 overflow-y-auto space-y-3 ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
                >
                  {col.items.map((seller, index) => (
                    <Draggable key={seller.id} draggableId={seller.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white border rounded-xl shadow-sm transition-shadow ${snapshot.isDragging ? 'shadow-lg border-indigo-400 rotate-2' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
                        >
                          <div className="h-32 mb-3">
                            <ImageSlider urls={seller.image_urls || []} />
                          </div>
                          <div className="p-3 pt-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-sm text-slate-900">{seller.name}</p>
                              <a href={`tel:${seller.phone}`} className="text-xs text-indigo-600 hover:underline font-medium">{seller.phone}</a>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{seller.listing_purpose}</span>
                          </div>
                          
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{seller.area.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{seller.property_type.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 w-fit px-1.5 py-0.5 rounded">
                              <DollarSign className="w-3 h-3" />
                              {seller.price.replace(/_/g, ' ')}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2">
                             <a
                                href={buildWaLink(seller.phone, DEFAULT_SELLER_MSG(seller))}
                                target="_blank" rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => onMatch(seller)} className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all" title="Match Properties">
                                <GitCompare className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => onEdit(seller)} className="p-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all" title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              
                              <div className="ml-auto">
                                {deleteConfirmId === seller.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => onDelete(seller.id)} disabled={deletingId === seller.id} className="p-1 bg-rose-600 text-white rounded">
                                      {deletingId === seller.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    </button>
                                    <button onClick={() => onDeleteConfirm('')} className="p-1 bg-white border border-slate-200 rounded text-slate-600">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => onDeleteConfirm(seller.id)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                          </div>
                          
                          {actionStatus.id === seller.id && (
                            <div className="absolute top-2 right-2">
                              {actionStatus.status === 'success' && <Check className="w-4 h-4 text-emerald-600 bg-white rounded-full" />}
                              {actionStatus.status === 'error' && <span className="text-rose-500 bg-white rounded-full">❌</span>}
                            </div>
                          )}
                        </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
