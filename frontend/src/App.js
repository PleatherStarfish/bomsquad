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
import React from "react";
import SavedLists from "./components/saved_lists/index";
import Settings from "./components/UserSettings";
import ShoppingList from "./components/shopping_list/index";
import UserPage from "./pages/UserPage";
import VersionHistory from "./components/VersionHistory";

const App = () => {

  const RedirectToBackend = () => {
    const location = useLocation();
    window.location.href = window.location.origin + location.pathname + location.search;
    return null; // You can return null for React components that don't render anything.
  };

  return (
    <div className="h-fit">
        <Routes>
          <Route path="/components" element={<Components />} />
          <Route path="/module/:slug" element={<ModuleDetail />} />
          <Route path={`/user/:username/settings`} element={<Settings />} />
          <Route
            path={`/user/:username/inventory/version-history`}
            element={<VersionHistory />}
          />
          <Route
              path={`/user/:username/shopping-list/saved-lists`}
              element={<SavedLists />}
          />
          <Route path="/user/:username" element={<UserPage />}>
            <Route
              index
              element={
                <ModulesList
                  type="built"
                />
              }
            />
            <Route
              path={`built`}
              element={
                <ModulesList
                  type="built"
                />
              }
            />
            <Route
              path={`want-to-build`}
              element={
                <ModulesList type="want-to-build" />
              }
            />
            <Route path={`inventory/tree`} element={<InventoryLocationsTree />} />
            <Route path={`inventory`} element={<Inventory />} />
            <Route path={`shopping-list`} element={<ShoppingList />} />
            <Route path="*" element={<RedirectToBackend />} />
          </Route>
          <Route path="*" element={<RedirectToBackend />} />
        </Routes>
    </div>
  );
};

export default App;
