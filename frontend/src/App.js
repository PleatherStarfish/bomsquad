import React from "react";
import { Route, Switch } from "wouter";
import ModuleDetail from "./pages/ModuleDetail";
import UserPage from "./pages/UserPage";
import Components from "./pages/Components";

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
