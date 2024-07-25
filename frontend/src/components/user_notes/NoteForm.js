import React, { useEffect } from 'react';

import useAddUserNoteMutation from '../../services/useAddUserNoteMutation';
import useGetUserNote from '../../services/useGetUserNote';
import useUpdateUserNoteMutation from '../../services/useUpdateUserNoteMutation';

const NoteForm = ({ noteId, moduleId, moduleType, note, setNote, onClose }) => {
  const { data: existingNote, isLoading, isError, error } = useGetUserNote(moduleId, moduleType);
  const addNoteMutation = useAddUserNoteMutation(moduleType);
  const updateNoteMutation = useUpdateUserNoteMutation(noteId);

  useEffect(() => {
    if (existingNote) {
      setNote(existingNote.note);
    } else if (isError && error.response && error.response.status === 404) {
      setNote('');
    }
  }, [existingNote, isError, error, setNote]);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {isError && error.response.status !== 404 && <div>Error loading note.</div>}
      {!(isLoading || (isError && error.response.status !== 404)) && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note here"
          rows={4}
          className="w-full p-2 border rounded-md"
          disabled={isLoading || addNoteMutation.isLoading || updateNoteMutation.isLoading}
        />
      )}
    </>
  );
};

export default NoteForm;
