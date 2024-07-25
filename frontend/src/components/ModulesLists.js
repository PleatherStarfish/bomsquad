import React, { useEffect, useState } from "react";

import AddModuleButtons from "../components/AddModuleButtons";
import Alert from "../ui/Alert";
import Cookies from 'js-cookie';
import Modal from "../ui/Modal";
import NoteForm from "./user_notes/NoteForm";
import axios from 'axios';
import useAddUserNoteMutation from '../services/useAddUserNoteMutation';
import useGetUserModulesLists from "../services/useGetUserModulesLists";
import useGetUserNote from '../services/useGetUserNote';
import useUpdateUserNoteMutation from '../services/useUpdateUserNoteMutation';

const ModulesList = ({ type }) => {
  const csrftoken = Cookies.get('csrftoken');
  const { userModulesList, userModulesListIsLoading, userModulesListIsError, userModulesListError } = useGetUserModulesLists(type);
  const [selectedModule, setSelectedModule] = useState(null);
  const [noteFormVisible, setNoteFormVisible] = useState(false);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');

  const addNoteMutation = useAddUserNoteMutation(type);
  const updateNoteMutation = useUpdateUserNoteMutation(selectedModule?.note_id);
  console.log(notes)

  useEffect(() => {
    const fetchNotes = async () => {
      if (userModulesList && userModulesList.results) {
        const notesData = {};
        for (const module of userModulesList.results) {
          try {
            const response = await axios.get(`/api/user-notes/${type}/${module.id}/`, {
              headers: {
                'X-CSRFToken': csrftoken,
              },
              withCredentials: true,
            });
            console.log("TEST", response.data)
            notesData[module.id] = response.data.note;
          } catch (error) {
            if (error.response && error.response.status === 404) {
              notesData[module.id] = '';
            } else {
              console.error(`Error fetching note for module ${module.id}:`, error);
            }
          }
        }
        setNotes(notesData);
      }
    };
    fetchNotes();
  }, [userModulesList, type, csrftoken]);

  const { data: selectedModuleNote, error: selectedModuleNoteError, isLoading: selectedModuleNoteLoading } = useGetUserNote(selectedModule?.id, type === "want-to-build" ? "want-to-build" : "built");

  useEffect(() => {
    if (selectedModuleNote) {
      setCurrentNote(selectedModuleNote.note);
    } else if (selectedModuleNoteError && selectedModuleNoteError.response && selectedModuleNoteError.response.status === 404) {
      setCurrentNote('');
    }
  }, [selectedModuleNote, selectedModuleNoteError]);

  if (userModulesListIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  if (userModulesListIsError) {
    return <div>Error: {userModulesListError.message}</div>;
  }

  const handleEditNote = (module) => {
    setSelectedModule(module);
    setNoteFormVisible(true);
  };

  const handleCloseNoteForm = () => {
    setSelectedModule(null);
    setNoteFormVisible(false);
    setCurrentNote('');
  };

  const handleSubmit = async () => {
    const noteId = selectedModule?.note_id;
    const moduleId = selectedModule?.id;

    if (noteId) {
      updateNoteMutation.mutate({ note: currentNote }, {
        onSuccess: () => {
          setNotes((prevNotes) => ({
            ...prevNotes,
            [moduleId]: currentNote
          }));
          handleCloseNoteForm();
        },
        onError: (error) => console.error("Error updating note:", error)
      });
    } else {
      addNoteMutation.mutate({ note: currentNote, module_id: moduleId }, {
        onSuccess: () => {
          setNotes((prevNotes) => ({
            ...prevNotes,
            [moduleId]: currentNote
          }));
          handleCloseNoteForm();
        },
        onError: (error) => console.error("Error adding note:", error)
      });
    }
  };

  const truncateNote = (note, maxLength) => {
    if (note.length <= maxLength) return note;
    return `${note.substring(0, maxLength)}...`;
  };

  return !!userModulesList.results.length ? (
    <>
      {noteFormVisible && (
        <Modal
          open={noteFormVisible}
          setOpen={setNoteFormVisible}
          title={notes[selectedModule?.id] ? "Edit Note" : "Add Note"}
          submitButtonText={notes[selectedModule?.id] ? "Update Note" : "Add Note"}
          onSubmit={handleSubmit}
          type="info"
        >
          {selectedModuleNoteLoading ? (
            <div>Loading...</div>
          ) : (
            <NoteForm
              key={selectedModule.id} // Ensure NoteForm re-renders when selectedModule changes
              noteId={selectedModule.note_id}
              moduleId={selectedModule.id}
              moduleType={type === "want-to-build" ? "want-to-build" : "built"}
              note={currentNote}
              setNote={setCurrentNote}
              onClose={handleCloseNoteForm}
            />
          )}
        </Modal>
      )}
      <ul
        role="list"
        className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col-5"
      >
        {userModulesList.results.map((result) => (
          <li key={`${type}${result.module.id}`} className="relative text-center bg-white border rounded-lg">
            <button
              onClick={() => handleEditNote(result.module)}
              className="absolute top-2 right-2 btn btn-primary"
            >
              {notes[result.module.id] ? 'Edit note' : 'Add note'}
            </button>
            <div className="flex flex-col items-center justify-center flex-1 p-8">
              <img
                className="flex-shrink-0 h-32 mx-auto"
                src={`${result.module.image}`}
                alt=""
              />
              <a href={`/module/${result.module.slug}/`}>
                <h3 className="mt-6 text-lg font-semibold text-center text-gray-900">
                  {result.module.name}
                </h3>
              </a>
              <p className="text-base text-center text-gray-400">
                {result.module.manufacturer.name}
              </p>
              {notes[result.module.id] && (
                <p className="mt-2 text-sm text-center text-gray-600">
                  {truncateNote(notes[result.module.id], 100)}
                </p>
              )}
              <AddModuleButtons moduleId={result.module.id} type={type} />
            </div>
          </li>
        ))}
      </ul>
    </>
  ) : (
    <Alert variant="transparent" centered>
      There are no modules in your{" "}
      {type === "want-to-build" ? "want-to-build" : "modules"} list.{" "}
      <a className="text-blue-500" href="/">
        Add a module.
      </a>
    </Alert>
  );
};

export default ModulesList;
