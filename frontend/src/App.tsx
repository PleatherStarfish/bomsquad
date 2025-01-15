import {
  Route,
  Routes,
  useLocation
} from 'react-router-dom';

import Components from "./pages/Components";
import Inventory from "./components/inventory/index";
import InventoryLocationsTree from "./pages/InventoryLocationsTree";
import ModuleDetail from "./pages/ModuleDetail";
import ModulesList from "./components/ModulesLists";
import Projects from "./pages/Projects"
import React from "react";
import SavedLists from "./components/saved_lists/index";
import Settings from "./components/UserSettings";
import ShoppingList from "./components/shopping_list/index";
import UserPage from "./pages/UserPage";
import VersionHistory from "./components/VersionHistory";
import ResistorCalculator from "./pages/ResistorCalculator"

const App: React.FC = () => {

  const RedirectToBackend: React.FC = () => {
    const location = useLocation();
    window.location.href = window.location.origin + location.pathname + location.search;
    return null;
  };

  return (
    <div className="h-fit">
        <Routes>
          <Route element={<Projects />} path="/projects" />
          <Route element={<Components />} path="/components" />
          <Route element={<ModuleDetail />} path="/projects/:slug" />
          <Route element={<Settings />} path={`/user/:username/settings`} />
          <Route
            element={<VersionHistory />}
            path={`/user/:username/inventory/version-history`}
          />
          <Route
            element={<SavedLists />}
            path={`/user/:username/shopping-list/saved-lists`}
          />
          <Route element={<ResistorCalculator />} path="/tools/resistor-calculator" />
          <Route element={<UserPage />} path="/user/:username">
            <Route
              element={
                <ModulesList
                  type="built"
                />
              }
              index
            />
            <Route
              element={
                <ModulesList
                  type="built"
                />
              }
              path={`built`}
            />
            <Route
              element={
                <ModulesList type="want-to-build" />
              }
              path={`want-to-build`}
            />
            <Route element={<InventoryLocationsTree />} path={`inventory/tree`} />
            <Route element={<Inventory />} path={`inventory`} />
            <Route element={<ShoppingList />} path={`shopping-list`} />
            <Route element={<RedirectToBackend />} path="*" />
          </Route>
          <Route element={<RedirectToBackend />} path="*" />
        </Routes>
    </div>
  );
};

export default App;
