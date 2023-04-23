import { Route, Switch } from "wouter";

import Components from "./pages/Components";
import ModuleDetail from "./pages/ModuleDetail";
import React from "react";
import UserPage from "./pages/UserPage";

const App = () => {
  return (
    <div className="h-full">
      <Switch>
        <Route path="/components/">
          {() => <Components />}
        </Route>
        <Route path="/module/:slug">
          {(params) => <ModuleDetail slug={params.slug} />}
        </Route>
        <Route path="/user/:username">
          {(params) => <UserPage username={params.username} />}
        </Route>
      </Switch>
    </div>
  );
};

export default App;
