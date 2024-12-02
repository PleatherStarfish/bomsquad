import React, { useEffect, useState } from "react";

import AddModuleButtons from "./AddModuleButtons";
import Alert from "../ui/Alert";
import Cookies from "js-cookie";
import Modal from "../ui/Modal";
import NoteForm from "./user_notes/NoteForm";
import axios from "axios";
import useAddUserNoteMutation from "../services/useAddUserNoteMutation";
import useDeleteUserNoteMutation from "../services/useDeleteUserNoteMutation";
import useGetAllNotes from "../services/useGetAllNotes";
import useGetUserModulesLists from "../services/useGetUserModulesLists";
import { useQueryClient } from "@tanstack/react-query";
import useUpdateUserNoteMutation from "../services/useUpdateUserNoteMutation";
import { Module } from "../types/modules"

interface Props {
  type: "built" | "want-to-build";
}

const ModulesList: React.FC<Props> = ({ type }) => {
  const csrftoken = Cookies.get("csrftoken") || "";
  const {
    userModulesList,
    userModulesListIsLoading,
    userModulesListIsError,
    userModulesListError,
  } = useGetUserModulesLists(type);
  const {
    notes,
    isLoading: notesLoading,
    isError: notesError,
  } = useGetAllNotes(type);

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [noteFormVisible, setNoteFormVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>(
    {}
  );

  const queryClient = useQueryClient();
  const addNoteMutation = useAddUserNoteMutation(type);
  const updateNoteMutation = useUpdateUserNoteMutation(
    selectedModule?.note_id || 0
  );
  const deleteNoteMutation = useDeleteUserNoteMutation(
    selectedModule?.id || 0,
    type
  );

  useEffect(() => {
    if (selectedModule) {
      const fetchCurrentNote = async () => {
        try {
          const response = await axios.get(
            `/api/user-notes/${type}/${selectedModule.id}/`,
            {
              headers: { "X-CSRFToken": csrftoken },
              withCredentials: true,
            }
          );
          setCurrentNote(response.data.note);
        } catch (error: any) {
          if (error.response?.status === 404) {
            setCurrentNote("");
          } else {
            console.error(
              `Error fetching note for module ${selectedModule.id}:`,
              error
            );
          }
        }
      };
      fetchCurrentNote();
    }
  }, [selectedModule, type, csrftoken]);

  if (userModulesListIsLoading || notesLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  if (userModulesListIsError || notesError) {
    return (
      <div>
        Error: {userModulesListError?.message || "Error fetching notes"}
      </div>
    );
  }

  const handleEditNote = (module: Module) => {
    setSelectedModule(module);
    setNoteFormVisible(true);
  };

  const handleCloseNoteForm = () => {
    setSelectedModule(null);
    setNoteFormVisible(false);
    setCurrentNote("");
  };

  const handleDeleteNote = () => {
    deleteNoteMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["userNotes", type] });
        handleCloseNoteForm();
      },
    });
  };

  const handleSubmit = () => {
    const noteId = selectedModule?.note_id;
    const moduleId = selectedModule?.id;

    if (!currentNote.trim()) {
      handleDeleteNote();
    } else if (noteId) {
      updateNoteMutation.mutate(
        { note: currentNote },
        {
          onError: (error) => console.error("Error updating note:", error),
          onSuccess: () => {
            queryClient.invalidateQueries(["userNotes", type]);
            handleCloseNoteForm();
          },
        }
      );
    } else {
      addNoteMutation.mutate(
        { module_id: moduleId, note: currentNote },
        {
          onError: (error) => console.error("Error adding note:", error),
          onSuccess: () => {
            queryClient.invalidateQueries(["userNotes", type]);
            handleCloseNoteForm();
          },
        }
      );
    }
  };

  const truncateNote = (note: string, maxLength: number) => {
    return note.length > maxLength
      ? `${note.substring(0, maxLength)}...`
      : note;
  };

  const handleToggleExpand = (moduleId: number) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const renderNote = (note: string, moduleId: number) => {
    const maxLength = 100;
    const isTruncated = note.length > maxLength;

    return (
      <div className="text-sm text-center text-gray-600">
        <b>Notes:</b>{" "}
        {expandedNotes[moduleId] ? note : truncateNote(note, maxLength)}
        {isTruncated && (
          <button
            className="ml-2 text-blue-500 underline hover:text-blue-700"
            onClick={() => handleToggleExpand(moduleId)}
          >
            {expandedNotes[moduleId] ? "Hide" : "See all"}
          </button>
        )}
      </div>
    );
  };

  return userModulesList.results.length ? (
    <>
      {noteFormVisible && (
        <Modal
          onSubmit={handleSubmit}
          open={noteFormVisible}
          setOpen={setNoteFormVisible}
          submitButtonText={
            selectedModule?.id !== undefined && notes[selectedModule.id]
              ? "Update Note"
              : "Add Note"
          }
          title={
            selectedModule?.id !== undefined && notes[selectedModule.id]
              ? "Edit Note"
              : "Add Note"
          }
          type="info"
        >
          <NoteForm
            key={selectedModule?.id}
            moduleId={selectedModule?.id}
            moduleType={type}
            note={currentNote}
            noteId={selectedModule?.note_id}
            onClose={handleCloseNoteForm}
            setNote={setCurrentNote}
          />
          {selectedModule?.id !== undefined && notes[selectedModule.id] && (
            <button
              className="mt-2 text-red-500 underline hover:text-red-700"
              onClick={handleDeleteNote}
            >
              {" "}
              Delete Note{" "}
            </button>
          )}
        </Modal>
      )}
      <ul
        className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-col-5"
        role="list"
      >
        {userModulesList.results.map((result: UserModule) => (
          <li
            className="relative text-center bg-white border rounded-lg"
            key={`${type}${result.module.id}`}
          >
            <button
              className="absolute text-xs text-blue-500 top-2 right-2 btn btn-primary hover:text-blue-700"
              onClick={() => handleEditNote(result.module)}
            >
              {notes?.[result.module.id] ? "Edit note" : "Add note"}
            </button>
            <div className="flex flex-col items-center justify-center flex-1 p-8">
              <img
                alt=""
                className="flex-shrink-0 h-32 mx-auto"
                src={result.module.image}
              />
              <a href={`/module/${result.module.slug}/`}>
                <h3 className="mt-6 text-lg font-semibold text-center text-gray-900">
                  {result.module.name}
                </h3>
              </a>
              <p className="text-base text-center text-gray-400">
                {result.module.manufacturer.name}
              </p>
              <AddModuleButtons moduleId={result.module.id} type={type} />
              <div className="mt-6">
                {notes?.[result.module.id] &&
                  renderNote(notes[result.module.id], result.module.id)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  ) : (
    <Alert align="center" variant="transparent">
      There are no modules in your{" "}
      {type === "want-to-build" ? "want-to-build" : "modules"} list.{" "}
      <a className="text-blue-500" href="/">
        Add a module.
      </a>
    </Alert>
  );
};

export default ModulesList;
