import React from "react";
import { Route, Switch } from "wouter";
import Navbar from "./Navbar";
import ModuleDetail from "./pages/ModuleDetail";
import Footer from "./Footer";
import UserPage from "./pages/UserPage";

const App = () => {
  return (
    <div className="h-full">
      <Switch>
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
