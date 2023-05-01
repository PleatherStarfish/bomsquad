import { Route, Routes } from "react-router-dom";

import Components from "./pages/Components";
import Inventory from "./components/Inventory";
import ModuleDetail from "./pages/ModuleDetail";
import ModulesList from "./components/ModulesLists";
import React from "react";
import Settings from "./components/UserSettings";
import ShoppingList from "./components/ShoppingList";
import UserPage from "./pages/UserPage";
import VersionHistory from "./components/VersionHistory";

const App = () => {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/components/" element={<Components />} />
        <Route path="/module/:slug" element={<ModuleDetail />} />
        <Route path={`/user/:username/settings/`} element={<Settings />} />
        <Route
          path={`/user/:username/inventory/version-history/`}
          element={<VersionHistory />}
        />
        <Route path="/user/:username" element={<UserPage />}>
          <Route
            index
            element={
              <ModulesList
                queryName="builtModules"
                url="/api/get-built-modules/"
              />
            }
          />
          <Route
            path={`built/`}
            element={
              <ModulesList
                queryName="builtModules"
                url="/api/get-built-modules/"
              />
            }
          />
          <Route
            path={`want-to-build/`}
            element={
              <ModulesList queryName="wtbModules" url="/api/get-wtb-modules/" />
            }
          />
          <Route path={`inventory/`} element={<Inventory />} />
          <Route path={`shopping-list/`} element={<ShoppingList />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
