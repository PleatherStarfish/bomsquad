import { Route, Routes, useLocation } from "react-router-dom";

import Components from "./pages/Components";
import Inventory from "./components/inventory/index";
import InventoryLocationsTree from "./pages/InventoryLocationsTree";
import ProjectDetail from "./pages/ProjectDetail";
import ModulesList from "./components/ModulesLists";
import Projects from "./pages/Projects";
import React from "react";
import SavedLists from "./components/saved_lists/index";
import Settings from "./components/UserSettings";
import ShoppingList from "./components/shopping_list/index";
import UserPage from "./pages/UserPage";
import VersionHistory from "./components/VersionHistory";
import ResistorCalculator from "./pages/ResistorCalculator";
import ErrorBoundary from "./utils/ErrorBoundary";

const App: React.FC = () => {
  const RedirectToBackend: React.FC = () => {
    const location = useLocation();
    window.location.href =
      window.location.origin + location.pathname + location.search;
    return null;
  };

  return (
    <div className="h-fit">
      <Routes>
        <Route
          element={
            <ErrorBoundary>
              <Projects />
            </ErrorBoundary>
          }
          path="/projects"
        />
        <Route
          element={
            <ErrorBoundary>
              <Components />
            </ErrorBoundary>
          }
          path="/components"
        />
        <Route
          element={
            <ErrorBoundary>
              <ProjectDetail />
            </ErrorBoundary>
          }
          path="/projects/:slug"
        />
        <Route
          element={
            <ErrorBoundary>
              <VersionHistory />
            </ErrorBoundary>
          }
          path={`/user/:username/inventory/version-history`}
        />
        <Route
          element={
            <ErrorBoundary>
              <ResistorCalculator />
            </ErrorBoundary>
          }
          path="/tools/resistor-calculator"
        />
        <Route
          element={
            <ErrorBoundary>
              <UserPage />
            </ErrorBoundary>
          }
          path="/user/:username"
        >
          <Route element={<Settings />} path={`settings`} />
          <Route
            element={
              <ErrorBoundary>
                <VersionHistory />
              </ErrorBoundary>
            }
            path={`inventory/version-history`}
          />
          <Route
            element={
              <ErrorBoundary>
                <SavedLists />
              </ErrorBoundary>
            }
            path={`shopping-list/saved-lists`}
          />
          <Route
            element={
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            }
            path={`settings`}
          />
          <Route
            element={
              <ErrorBoundary>
                <ModulesList type="built" />
              </ErrorBoundary>
            }
            index
          />
          <Route
            element={
              <ErrorBoundary>
                <ModulesList type="built" />
              </ErrorBoundary>
            }
            path={`built`}
          />
          <Route
            element={
              <ErrorBoundary>
                <ModulesList type="want-to-build" />
              </ErrorBoundary>
            }
            path={`want-to-build`}
          />
          <Route
            element={
              <ErrorBoundary>
                <InventoryLocationsTree />
              </ErrorBoundary>
            }
            path={`inventory/tree`}
          />
          <Route
            element={
              <ErrorBoundary>
                <Inventory />
              </ErrorBoundary>
            }
            path={`inventory`}
          />
          <Route
            element={
              <ErrorBoundary>
                <ShoppingList />
              </ErrorBoundary>
            }
            path={`shopping-list`}
          />
          <Route
            element={
              <ErrorBoundary>
                <RedirectToBackend />
              </ErrorBoundary>
            }
            path="*"
          />
        </Route>
        <Route
          element={
            <ErrorBoundary>
              <RedirectToBackend />
            </ErrorBoundary>
          }
          path="*"
        />
      </Routes>
    </div>
  );
};

export default App;
