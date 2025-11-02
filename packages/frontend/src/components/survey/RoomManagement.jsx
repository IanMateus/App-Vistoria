import React, { useState } from 'react';
import { surveyAppService } from '../../services/surveyApp';
import RoomCard from './RoomCard';
import RoomForm from './RoomForm';

const RoomManagement = ({ 
  surveyId, 
  rooms, 
  issues, 
  onRoomAdded, 
  onRoomUpdated, 
  onRoomDeleted, 
  onIssueAdded, 
  onIssueUpdated, 
  onIssueDeleted 
}) => {
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const handleAddRoom = async (roomData) => {
    try {
      const newRoom = await surveyAppService.createRoom({
        ...roomData,
        surveyId: parseInt(surveyId)
      });
      onRoomAdded(newRoom);
      setShowRoomForm(false);
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Erro ao adicionar cômodo: ' + error.message);
    }
  };

  const handleUpdateRoom = async (roomData) => {
    try {
      const updatedRoom = await surveyAppService.updateRoom(editingRoom.id, roomData);
      onRoomUpdated(updatedRoom);
      setEditingRoom(null);
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Erro ao atualizar cômodo: ' + error.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cômodo? Todos os problemas associados também serão excluídos.')) {
      return;
    }

    try {
      await surveyAppService.deleteRoom(roomId);
      onRoomDeleted(roomId);
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Erro ao excluir cômodo: ' + error.message);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  return (
    <div className="room-management-section">
      {/* Header with Add Button */}
      <div className="section-header">
        <div className="header-title">
          <h3>🚪 Gerenciar Cômodos</h3>
          <span className="room-count">{rooms.length} cômodos</span>
        </div>
        <button 
          onClick={() => {
            setEditingRoom(null);
            setShowRoomForm(true);
          }}
          className="btn-primary"
        >
          ➕ Adicionar Cômodo
        </button>
      </div>

      {/* Room Form Modal */}
      {showRoomForm && (
        <RoomForm
          room={editingRoom}
          onSave={editingRoom ? handleUpdateRoom : handleAddRoom}
          onCancel={() => {
            setShowRoomForm(false);
            setEditingRoom(null);
          }}
        />
      )}

      {/* Rooms List */}
      <div className="rooms-list-container">
        {rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚪</div>
            <h3>Nenhum cômodo adicionado</h3>
            <p>Adicione os cômodos que serão inspecionados nesta vistoria.</p>
            <button 
              onClick={() => setShowRoomForm(true)}
              className="btn-primary"
            >
              ➕ Adicionar Primeiro Cômodo
            </button>
          </div>
        ) : (
          <div className="rooms-stack">
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                issues={issues.filter(issue => issue.roomId === room.id)}
                onEdit={() => handleEditRoom(room)}
                onDelete={() => handleDeleteRoom(room.id)}
                onRoomUpdated={onRoomUpdated}
                onIssueAdded={onIssueAdded}
                onIssueUpdated={onIssueUpdated}
                onIssueDeleted={onIssueDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;