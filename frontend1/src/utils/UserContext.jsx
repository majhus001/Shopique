import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [stateuserId, setUserId] = useState(null); // store user info
  const [stateusername, setUsername] = useState(null); // store user info
  const [Loggedinstatus, setIsLoggedIn] = useState(false);

  const update = (user) => {
    console.log("usecontext update", user);
    setUserId(user._id);
    setUsername(user.username);
    setIsLoggedIn(true);
  };

  const login = (user) => {
    console.log("usecontext login", user);
    setUserId(user._id);
    setUsername(user.username);
    setIsLoggedIn(true);
  };

  const logout = () => {
    console.log("usecontext logout");
    setUserId(null);
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider value={{ stateuserId, stateusername, Loggedinstatus, login, logout, update }}>
      {children}
    </UserContext.Provider>
  );
};
